// Explicit integration target, intentionally outside *.test.mts: run with Node 24
// in an isolated Linux container with PM2 6.0.14, runuser, flock and appuser.
// Container root needs SYS_PTRACE to inspect appuser's /proc/<pid>/cwd, just as
// host root does. Mount scripts/ and tests/ read-only; no production paths/network.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { chmod, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import test, { type TestContext } from 'node:test'
import { armReady, deploy, runCommand } from '../scripts/deploy-remote.mjs'

const COMMIT = '2'.repeat(40)
const OLD = '1'.repeat(40)
const args = ['start', '-H', '127.0.0.1', '-p', '3000']
const server = `const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const port = Number(process.argv[process.argv.indexOf('-p') + 1]);
const marker = JSON.parse(fs.readFileSync(path.join(process.cwd(),'public/__release.txt'),'utf8'));
http.createServer((req,res) => {
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({commit:marker.commit,cwd:process.cwd(),script:__filename,uid:process.getuid(),args:process.argv.slice(2)}));
}).listen(port,'127.0.0.1',()=>console.log('Ready in 1ms'));
`
const pnpm = `#!/usr/bin/node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
assert.notEqual(process.getuid(),0);
if (process.argv[2] === 'install') {
  assert.deepEqual(process.argv.slice(2),['install','--frozen-lockfile','--prod=false']);
  fs.mkdirSync('node_modules/next/dist/bin',{recursive:true});
  fs.copyFileSync('fixture-server.cjs','node_modules/next/dist/bin/next');
} else {
  assert.deepEqual(process.argv.slice(2),['build']);
  assert.equal(process.env.NODE_OPTIONS,'--max-old-space-size=1536');
  fs.mkdirSync('.next/static',{recursive:true});
  fs.writeFileSync('.next/static/chunk.js','immutable fixture chunk');
  fs.writeFileSync('.next/BUILD_ID','fixture-build');
}
`

type Record = {
  pid: number
  name: string
  pm2_env: { pm_cwd: string; pm_exec_path: string; args: string[]; exec_interpreter: string; status: string }
}

async function fixture(t: TestContext) {
  assert.equal(process.platform, 'linux', 'use an isolated Linux container')
  assert.equal(process.getuid?.(), 0)
  assert.equal(process.versions.node.split('.')[0], '24')
  const root = await mkdtemp('/tmp/deploy-real-pm2-')
  await chmod(root, 0o755)
  const paths = {
    legacy: path.join(root, 'legacy'), releases: path.join(root, 'releases'), shared: path.join(root, 'shared'),
    incoming: path.join(root, 'incoming'), state: path.join(root, 'state/state.json'), lock: path.join(root, 'deploy.lock'),
    domains: ['http://127.0.0.1:3000/public-one', 'http://127.0.0.1:3000/public-two'],
  }
  const upload = path.join(paths.incoming, 'upload.fixture')
  const source = path.join(root, 'source')
  const events: string[] = []
  const app = (commands: string[]) => runCommand('runuser', ['-u', 'appuser', '--', 'env',
    `HOME=${paths.legacy}`, `PM2_HOME=${paths.legacy}/.pm2`, 'PATH=/usr/local/bin:/usr/bin:/bin', 'pm2', ...commands])
  t.after(async () => {
    try { await app(['kill']) } finally { await rm(root, { recursive: true, force: true }) }
  })
  async function put(base: string, file: string, value: string) {
    await mkdir(path.dirname(path.join(base, file)), { recursive: true })
    await writeFile(path.join(base, file), value)
  }
  await mkdir(upload, { recursive: true })
  for (const base of [source, paths.legacy]) {
    await put(base, 'package.json', '{}')
    await put(base, 'pnpm-lock.yaml', 'lockfileVersion: 9')
    await put(base, 'fixture-server.cjs', server)
    await put(base, 'public/googlec8eaf265de8ba751.html', 'google-site-verification: googlec8eaf265de8ba751.html')
    await put(base, 'public/uploads/existing.txt', base === source ? 'committed' : 'live')
    await put(base, 'data/local-popups.json', '[]')
  }
  await put(paths.legacy, '.env.local', 'PRIVATE=fixture-secret-never-log')
  await chmod(path.join(paths.legacy, '.env.local'), 0o600)
  await put(paths.legacy, 'public/__release.txt', JSON.stringify({ commit: OLD }))
  await put(paths.legacy, '.next/BUILD_ID', 'old-build')
  await put(paths.legacy, '.next/static/old.js', 'old chunk')
  await put(paths.legacy, '.local/bin/pnpm', pnpm)
  await chmod(path.join(paths.legacy, '.local/bin/pnpm'), 0o755)
  await put(paths.legacy, 'node_modules/next/dist/bin/next', server)
  const outputLog = path.join(paths.legacy, '.pm2/logs/seoulegundc-out.log')
  await put(paths.legacy, '.pm2/logs/seoulegundc-out.log', '')
  await runCommand('chown', ['-R', 'appuser:appuser', paths.legacy])
  const config = { name: 'seoulegundc', cwd: paths.legacy,
    script: path.join(paths.legacy, 'node_modules/next/dist/bin/next'), args, interpreter: '/usr/bin/node' }
  const initialConfig = path.join(root, 'initial.config.cjs')
  await writeFile(initialConfig, `module.exports = ${JSON.stringify({ apps: [config,
    { ...config, name: 'untouched', args: ['start', '-H', '127.0.0.1', '-p', '3102'] }] })};`)
  const observer = await armReady(outputLog, { timeout: 10000 })
  try {
    await app(['start', initialConfig, '--only', 'seoulegundc,untouched'])
    await observer.ready
  } finally { await observer.close() }
  assert.equal((await app(['--version'])).trim(), '6.0.14')
  const records = (): Promise<Record[]> => app(['jlist']).then(JSON.parse)
  const unrelated = (await records()).find(record => record.name === 'untouched')
  assert.ok(unrelated)
  await runCommand('tar', ['-czf', path.join(upload, 'source.tar.gz'), '-C', source, '.'])
  const artifact = await readFile(path.join(upload, 'source.tar.gz'))
  await writeFile(path.join(upload, 'manifest.json'), JSON.stringify({ schemaVersion: 1,
    repository: 'Heoooooon/doctor', commit: COMMIT, tree: '3'.repeat(40), ancestors: [COMMIT, OLD],
    archiveBytes: artifact.length, archiveSha256: createHash('sha256').update(artifact).digest('hex') }))
  let fail = ''
  let startFailed = false
  const deps = {
    async run(command: string, commandArgs: string[], options = {}) {
      const index = commandArgs.indexOf('pm2')
      if (command === 'runuser' && index >= 0) {
        const operation = commandArgs[index + 1]
        events.push(operation)
        if (operation === 'delete') assert.equal(commandArgs[index + 2], 'seoulegundc')
        if (operation === 'startOrReload' && fail === 'start' && !startFailed) {
          startFailed = true
          throw new Error('injected start failure after deletion')
        }
      }
      // PM2, process cwd, flock, tar/gzip, appuser install/build and preview all
      // remain real. Only a transport failure can be injected at this boundary.
      return runCommand(command, commandArgs, options)
    },
    async smoke(base: string, { expectedCommit }: { expectedCommit?: string }) {
      const response = await fetch(base, { signal: AbortSignal.timeout(3000) })
      assert.equal(response.status, 200)
      const body = await response.json()
      assert.equal(body.commit, expectedCommit ?? OLD)
      assert.notEqual(body.uid, 0)
      const preview = new URL(base).port !== '3000'
      if (!preview) {
        assert.deepEqual(body.args, args)
        if (expectedCommit) {
          assert.equal(path.dirname(body.cwd), paths.releases)
          assert.equal(body.script, path.join(body.cwd, 'node_modules/next/dist/bin/next'))
          if (fail === 'smoke') throw new Error('injected activated smoke failure')
        } else assert.equal(body.cwd, paths.legacy)
      }
      events.push(preview ? 'smoke-preview' : expectedCommit ? 'smoke-candidate' : 'smoke-rollback')
      return body
    },
  }
  return { paths, deps, events, records, unrelated, config,
    setFail(value: string) { fail = value },
    go() { return deploy({ upload, paths, bootstrap: true, deps }) },
  }
}

test('real PM2 6.0.14 activation uses candidate cwd/script, serves its commit, and leaves unrelated apps alone', { timeout: 60000 }, async t => {
  const f = await fixture(t)
  const result = await f.go()
  assert.equal(result.status, 'deployed')
  const state = JSON.parse(await readFile(f.paths.state, 'utf8'))
  const records = await f.records()
  const active = records.find(record => record.name === 'seoulegundc')
  assert.ok(active)
  assert.equal(active.pm2_env.pm_cwd, state.current.release)
  assert.equal(active.pm2_env.pm_exec_path, state.current.process.script)
  assert.equal(await realpath(`/proc/${active.pid}/cwd`), state.current.release)
  assert.equal(records.find(record => record.name === 'untouched')?.pid, f.unrelated.pid)
  assert.equal(f.events.filter(event => event === 'smoke-candidate').length, 3)
  assert.equal(f.events.filter(event => event === 'delete').length, 1)
})

for (const failure of ['smoke', 'start']) {
  test(`real PM2 rollback restores legacy after ${failure} failure, including a missing process entry`, { timeout: 60000 }, async t => {
    const f = await fixture(t)
    f.setFail(failure)
    await assert.rejects(f.go(), /rolled back/)
    const records = await f.records()
    const active = records.find(record => record.name === 'seoulegundc')
    assert.ok(active)
    assert.equal(active.pm2_env.pm_cwd, f.config.cwd)
    assert.equal(active.pm2_env.pm_exec_path, f.config.script)
    assert.deepEqual(active.pm2_env.args, f.config.args)
    assert.equal(active.pm2_env.exec_interpreter, f.config.interpreter)
    assert.equal(await realpath(`/proc/${active.pid}/cwd`), f.paths.legacy)
    assert.equal(records.find(record => record.name === 'untouched')?.pid, f.unrelated.pid)
    assert.equal(f.events.filter(event => event === 'smoke-rollback').length, 3)
    assert.equal(f.events.filter(event => event === 'delete').length, failure === 'start' ? 1 : 2)
    await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
  })
}
