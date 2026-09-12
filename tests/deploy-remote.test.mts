import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { appendFile, mkdir, mkdtemp, readdir, readFile, readlink, realpath, rename, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test, { type TestContext } from 'node:test'
import { acquireLock, armReady, assertDiskSpace, atomicJSON, deploy, fingerprint, runCommand, startPreview } from '../scripts/deploy-remote.mjs'

const OLD = '1'.repeat(40)
const NEW = '2'.repeat(40)
const VERIFY = 'google-site-verification: googlec8eaf265de8ba751.html'
const verification = 'public/googlec8eaf265de8ba751.html'

async function fixture(t: TestContext) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'deploy-remote-')))
  t.after(() => rm(root, { recursive: true, force: true }))
  const paths = {
    legacy: path.join(root, 'legacy'), releases: path.join(root, 'releases'),
    shared: path.join(root, 'shared'), state: path.join(root, 'state/state.json'),
    lock: path.join(root, 'deploy.lock'), incoming: path.join(root, 'incoming'),
    domains: ['https://one.invalid', 'https://two.invalid'],
  }
  const upload = path.join(paths.incoming, 'upload.test')
  const source = path.join(root, 'source')
  for (const dir of [upload, source, paths.legacy]) await mkdir(dir, { recursive: true })
  async function put(base: string, file: string, value: string) {
    await mkdir(path.dirname(path.join(base, file)), { recursive: true })
    await writeFile(path.join(base, file), value)
  }
  for (const base of [source, paths.legacy]) {
    await put(base, verification, VERIFY)
    await put(base, 'package.json', '{}')
    await put(base, 'pnpm-lock.yaml', 'lockfileVersion: 9')
    await put(base, 'public/uploads/existing.txt', base === source ? 'committed' : 'live-upload')
    await put(base, 'data/local-popups.json', base === source ? '["seed"]' : '["live"]')
  }
  await put(source, 'public/uploads/new.txt', 'new-committed')
  await put(paths.legacy, '.env.local', 'PRIVATE=do-not-print')
  await put(paths.legacy, '.next/BUILD_ID', 'legacy-build')
  await put(paths.legacy, '.next/static/old.js', 'old-build')
  const outputLog = path.join(paths.legacy, '.pm2/logs/seoulegundc-out.log')
  await put(paths.legacy, '.pm2/logs/seoulegundc-out.log', 'historical Ready in 1ms\n')
  await put(paths.legacy, '.bash_history', 'legacy interactive shell history\n')
  await symlink(path.join(root, 'absent-agent-cache'), path.join(paths.legacy, '.codegraph'))
  const events: string[] = []
  let active = {
    name: 'seoulegundc', cwd: paths.legacy,
    script: path.join(paths.legacy, 'node_modules/next/dist/bin/next'),
    args: ['start', '-H', '127.0.0.1', '-p', '3000'], interpreter: '/usr/bin/node',
  }
  let activePresent = true
  let fail = ''
  let expectedCandidate = NEW
  let emitReady = true
  let locked = false
  let hold: (() => Promise<void>) | undefined
  const deps = {
    async acquireLock() {
      events.push('lock')
      if (locked) throw new Error('deployment lock unavailable')
      locked = true
      return async () => { events.push('unlock'); locked = false }
    },
    async processCwd() { return active.cwd },
    async armReady(logFile: string, options: { signal?: AbortSignal } = {}) {
      events.push('arm-ready')
      assert.equal(logFile, outputLog)
      const observer = await armReady(logFile, { ...options, timeout: 3000 })
      const ready = observer.ready.then(() => { events.push('ready') })
      ready.catch(() => {}) // switchProcess awaits this after the PM2 command.
      return { ready, close: async () => { await observer.close(); events.push('disarm-ready') } }
    },
    async statfs() {
      events.push('space')
      const low = fail === 'disk-backup' || fail === 'disk-build' && events.includes('install')
      return { bavail: low ? 1n : 10n ** 15n, bsize: 1n }
    },
    async run(command: string, args: string[], options: { cwd?: string; signal?: AbortSignal } = {}) {
      if (command === 'runuser') {
        const split = args.indexOf('--')
        const envArgs = args.slice(split + 2)
        const index = envArgs.findIndex(arg => !arg.includes('='))
        const tool = envArgs[index]
        const rest = envArgs.slice(index + 1)
        if (tool === 'pm2' && rest[0] === 'jlist') {
          events.push('runtime')
          if (hold) await hold()
          return JSON.stringify(activePresent ? [{ name: active.name, pid: 123, pm2_env: {
            name: active.name, pm_cwd: active.cwd, pm_exec_path: active.script,
            args: active.args, exec_interpreter: active.interpreter, status: 'online', pm_out_log_path: outputLog,
          } }] : [])
        }
        if (tool === 'pnpm') {
          const step = rest[0] === 'install' ? 'install' : 'build'
          events.push(step)
          assert.notEqual(options.cwd, paths.legacy)
          assert.ok(options.cwd?.startsWith(`${paths.releases}/`))
          if (step === 'install') assert.deepEqual(rest, ['install', '--frozen-lockfile', '--prod=false'])
          if (step === 'build') {
            assert.ok(envArgs.includes('NODE_OPTIONS=--max-old-space-size=1536'))
            assert.equal(JSON.parse(await readFile(path.join(options.cwd, 'public/__release.txt'), 'utf8')).commit, expectedCandidate)
          }
          if (fail === step) throw new Error(`${step} failed`)
          if (step === 'build') {
            await put(options.cwd, '.next/BUILD_ID', 'candidate-build')
            await put(options.cwd, '.next/static/chunk.js', 'candidate-static')
          }
          return ''
        }
        if (tool === 'pm2' && rest[0] === 'delete') {
          assert.deepEqual(rest, ['delete', 'seoulegundc'])
          assert.ok(activePresent)
          events.push('delete')
          activePresent = false
          return ''
        }
        if (tool === 'pm2' && rest[0] === 'startOrReload') {
          const config = JSON.parse((await readFile(rest[1], 'utf8')).replace(/^module.exports = /, '').replace(/;\n$/, ''))
          const next = config.apps[0]
          const rollback = next.cwd === paths.legacy
          events.push(rollback ? 'rollback' : 'activate')
          assert.deepEqual(rest.slice(2), ['--only', 'seoulegundc', '--update-env'])
          if (!rollback && fail === 'start') throw new Error('start failed')
          // Match real PM2 6.0.14: reloading an existing name retains resolved
          // cwd/script. Only starting an absent entry adopts both new paths.
          active = activePresent ? { ...next, cwd: active.cwd, script: active.script } : next
          activePresent = true
          if ((!rollback && fail === 'activate') || (rollback && fail === 'rollback')) throw new Error('activation failed')
          if (emitReady) await appendFile(outputLog, 'Ready in 1ms\n')
          return ''
        }
        if (tool === 'pm2' && rest[0] === 'save') { events.push('save'); return '' }
        throw new Error(`unexpected app command: ${tool} ${rest.join(' ')}`)
      }
      if (command === 'chown') { events.push('chown'); return '' }
      if (command === 'tar' && args.includes('-czf')) {
        events.push('backup')
        if (fail === 'backup') throw new Error('backup failed')
      }
      if (command === 'gzip') {
        events.push('gzip')
        if (fail === 'gzip') throw new Error('gzip failed')
      }
      if (command === 'tar' && args.includes('-xzf')) events.push('extract')
      return runCommand(command, args, options)
    },
    async preview(release: string) {
      events.push('preview')
      assert.equal(await readFile(path.join(release, verification), 'utf8'), VERIFY)
      if (fail === 'preview') throw new Error('preview failed')
      return { base: 'http://127.0.0.1:45678', stop: async () => { events.push('stop-preview') } }
    },
    async smoke(base: string, options: { expectedCommit?: string }) {
      const preview = base.endsWith(':45678')
      events.push(preview ? 'smoke-preview' : active.cwd === paths.legacy ? 'smoke-rollback' : 'smoke-active')
      assert.equal(await readFile(path.join(paths.legacy, '.next/static/old.js'), 'utf8'), 'old-build')
      await assert.rejects(readFile(paths.state), { code: 'ENOENT' })
      if ((fail === 'smoke-preview' && preview) || (fail === 'smoke-active' && !preview && active.cwd !== paths.legacy) || fail === 'rollback') throw new Error('smoke failed')
      if (active.cwd !== paths.legacy || preview) assert.equal(options.expectedCommit, expectedCandidate)
      return { ok: true }
    },
  }
  async function archive(commit = NEW, ancestors = [NEW, OLD]) {
    expectedCandidate = commit
    await runCommand('tar', ['-czf', path.join(upload, 'source.tar.gz'), '-C', source, '.'])
    const bytes = await readFile(path.join(upload, 'source.tar.gz'))
    await writeFile(path.join(upload, 'manifest.json'), JSON.stringify({
      schemaVersion: 1, repository: 'Heoooooon/doctor', commit, tree: '3'.repeat(40), ancestors,
      archiveSha256: createHash('sha256').update(bytes).digest('hex'), archiveBytes: bytes.length,
    }))
  }
  await archive()
  return { paths, upload, source, outputLog, events, deps, archive, put,
    setEmitReady(value: boolean) { emitReady = value },
    setFail(value: string) { fail = value }, setHold(value: () => Promise<void>) { hold = value },
    get active() { return active },
    go(bootstrap = true, signal?: AbortSignal) { return deploy({ upload, bootstrap, paths, deps, signal }) },
  }
}

test('missing state requires explicit bootstrap and does not mutate legacy', async t => {
  const f = await fixture(t)
  await assert.rejects(f.go(false), /bootstrap/)
  assert.deepEqual(f.events, ['lock', 'unlock'])
  assert.equal(await readFile(path.join(f.paths.legacy, '.env.local'), 'utf8'), 'PRIVATE=do-not-print')
})

test('artifact hash and size are verified before backup or extraction', async t => {
  const f = await fixture(t)
  await writeFile(path.join(f.upload, 'source.tar.gz'), 'corrupt')
  await assert.rejects(f.go(), /artifact/)
  await f.archive()
  const manifestFile = path.join(f.upload, 'manifest.json')
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'))
  await writeFile(manifestFile, JSON.stringify({ ...manifest, archiveSha256: '0'.repeat(64) }))
  await assert.rejects(f.go(), /artifact/)
  assert.ok(!f.events.includes('backup'))
  assert.ok(!f.events.includes('extract'))
})

for (const failure of ['backup', 'gzip', 'install', 'build', 'preview', 'smoke-preview']) {
  test(`${failure} failure cannot activate or mutate the active release`, async t => {
    const f = await fixture(t)
    const before = await fingerprint(f.paths.legacy)
    f.setFail(failure)
    await assert.rejects(f.go(), new RegExp(failure === 'smoke-preview' ? 'smoke failed' : `${failure} failed`))
    assert.ok(!f.events.includes('activate'))
    assert.deepEqual(await fingerprint(f.paths.legacy), before)
    assert.equal(f.events.at(-1), 'unlock')
    await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
    if (failure === 'smoke-preview') assert.ok(f.events.includes('stop-preview'))
    if (failure === 'backup' || failure === 'gzip') await assert.rejects(readFile(path.join(f.paths.shared, '.env.local')), { code: 'ENOENT' })
  })
}

test('success preserves verification and mutable data, backs up first, and writes state last', async t => {
  const f = await fixture(t)
  const before = await fingerprint(f.paths.legacy)
  const result = await f.go()
  const state = JSON.parse(await readFile(f.paths.state, 'utf8'))
  assert.equal(result.status, 'deployed')
  assert.equal(state.current.commit, NEW)
  assert.equal(state.current.release, f.active.cwd)
  assert.equal(state.previous.release, f.paths.legacy)
  assert.equal(state.previous.commit, null)
  assert.equal(state.current.buildId, 'candidate-build')
  await runCommand('gzip', ['-t', state.backup])
  const backupListing = await runCommand('tar', ['-tzf', state.backup])
  assert.ok(backupListing.includes('.next/BUILD_ID'))
  assert.ok(backupListing.includes('.env.local'))
  assert.ok(backupListing.includes('public/uploads/existing.txt'))
  assert.ok(!backupListing.includes('.codegraph'))
  assert.ok(!backupListing.includes('.bash_history'))
  assert.deepEqual(await fingerprint(f.paths.legacy), before)
  assert.equal(await readFile(path.join(f.active.cwd, verification), 'utf8'), VERIFY)
  assert.equal(await readlink(path.join(f.active.cwd, '.env.local')), path.join(f.paths.shared, '.env.local'))
  assert.equal(await readFile(path.join(f.active.cwd, 'public/uploads/existing.txt'), 'utf8'), 'live-upload')
  assert.equal(await readFile(path.join(f.active.cwd, 'public/uploads/new.txt'), 'utf8'), 'new-committed')
  assert.equal(await readFile(path.join(f.active.cwd, 'data/local-popups.json'), 'utf8'), '["live"]')
  assert.ok(f.events.indexOf('gzip') < f.events.indexOf('extract'))
  assert.ok(f.events.indexOf('stop-preview') < f.events.indexOf('arm-ready'))
  assert.ok(f.events.indexOf('arm-ready') < f.events.indexOf('delete'))
  assert.ok(f.events.indexOf('delete') < f.events.indexOf('activate'))
  assert.equal(f.events.filter(event => event === 'delete').length, 1)
  assert.ok(f.events.indexOf('activate') < f.events.indexOf('ready'))
  assert.ok(f.events.indexOf('ready') < f.events.indexOf('smoke-active'))
  assert.equal(f.events.filter(e => e === 'smoke-active').length, 3)
  assert.deepEqual(f.events.slice(-2), ['save', 'unlock'])
})

for (const failure of ['activate', 'smoke-active', 'start']) {
  test(`${failure} failure restores captured legacy PM2 config and verifies rollback`, async t => {
    const f = await fixture(t)
    const original = f.active
    f.setFail(failure)
    await assert.rejects(f.go(), /rolled back/)
    assert.deepEqual(f.active, original)
    assert.ok(f.events.includes('rollback'))
    assert.equal(f.events.filter(event => event === 'delete').length, failure === 'start' ? 1 : 2)
    assert.ok(f.events.lastIndexOf('arm-ready') < f.events.indexOf('rollback'))
    assert.ok(f.events.indexOf('rollback') < f.events.lastIndexOf('ready'))
    assert.ok(f.events.lastIndexOf('ready') < f.events.indexOf('smoke-rollback'))
    assert.equal(f.events.filter(e => e === 'smoke-rollback').length, 3)
    await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
  })
}

test('rollback failure is explicit and cannot write success state', async t => {
  const f = await fixture(t)
  f.setFail('rollback')
  // Trigger only the post-activation check; preview must still complete.
  const smoke = f.deps.smoke
  f.deps.smoke = async (base, options) => base.endsWith(':45678') ? { ok: true } : smoke(base, options)
  await assert.rejects(f.go(), /ROLLBACK FAILED/)
  await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
  assert.equal(f.events.at(-1), 'unlock')
})

test('private failure diagnostics retain activation phase without PM2 output, environment, or nested raw causes', async t => {
  const f = await fixture(t)
  f.deps.processCwd = async () => f.paths.legacy
  const originalSmoke = f.deps.smoke
  f.deps.smoke = async (base, options) => {
    if (!base.endsWith(':45678') && f.active.cwd === f.paths.legacy) {
      throw new Error('PRIVATE=do-not-print pm2_env raw output', { cause: new Error('nested raw command output') })
    }
    return originalSmoke(base, options)
  }
  await assert.rejects(f.go(), /ROLLBACK FAILED/)
  const file = path.join(f.upload, 'error.json')
  const text = await readFile(file, 'utf8')
  const report = JSON.parse(text)
  assert.deepEqual(report.failure, { phase: 'verify-activation', message: 'active runtime cwd drift' })
  assert.deepEqual(report.rollback, { phase: 'rollback-smoke', message: 'operation failed (details withheld)' })
  assert.equal((await stat(file)).mode & 0o777, 0o600)
  for (const secret of ['PRIVATE', 'pm2_env', 'raw output', 'nested raw']) assert.ok(!text.includes(secret))
  await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
})

for (const [name, message, retained] of [
  ['marker forbidden', 'HTTP 403, expected 200: /__release.txt', true],
  ['missing Google proof', 'HTTP 404, expected 200: /googlec8eaf265de8ba751.html', true],
  ['homepage redirect', 'HTTP 302 redirect refused: /', true],
  ['private API exposed', 'HTTP 200, expected 401: /api/columns', true],
  ['response body suffix', 'HTTP 403, expected 200: /__release.txt DO_NOT_LOG', false],
  ['environment suffix', 'HTTP 403, expected 200: /__release.txt\nPRIVATE=DO_NOT_LOG', false],
  ['query string', 'HTTP 403, expected 200: /__release.txt?secret=DO_NOT_LOG', false],
  ['unknown asset path', 'HTTP 403, expected 200: /uploads/DO_NOT_LOG.webp', false],
  ['unknown exception', 'DO_NOT_LOG unknown exception', false],
] as const) {
  test(`private smoke failure diagnostics: ${name}`, async t => {
    const f = await fixture(t)
    const originalSmoke = f.deps.smoke
    f.deps.smoke = async (base, options) => {
      if (base.endsWith(':45678')) return originalSmoke(base, options)
      throw new Error(message, { cause: new Error('DO_NOT_LOG nested cause') })
    }
    await assert.rejects(f.go(), AggregateError)
    const text = await readFile(path.join(f.upload, 'error.json'), 'utf8')
    const report = JSON.parse(text)
    assert.equal(report.failure.phase, 'smoke-activation')
    assert.equal(report.rollback.phase, 'rollback-smoke')
    for (const detail of [report.failure, report.rollback]) {
      if (retained) assert.equal(detail.message, message)
      else assert.notEqual(detail.message, message)
    }
    assert.ok(!text.includes('DO_NOT_LOG'))
    assert.ok(!text.includes('PRIVATE'))
    await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
  })
}

test('persisted state enforces ancestry, runtime cwd, source/static checksums, and verified same-commit no-op', async t => {
  const f = await fixture(t)
  await f.go()
  f.deps.smoke = async () => ({ ok: true })
  f.events.length = 0
  const result = await f.go(false)
  assert.equal(result.status, 'noop')
  assert.ok(!f.events.includes('backup'))
  await f.archive('4'.repeat(40), ['4'.repeat(40)])
  await assert.rejects(f.go(false), /descendant/)
  await f.archive()
  const state = JSON.parse(await readFile(f.paths.state, 'utf8'))
  f.deps.processCwd = async () => f.paths.legacy
  await assert.rejects(f.go(false), /cwd|drift/)
  f.deps.processCwd = async () => state.current.release
  await f.put(state.current.release, 'package.json', '{"drift":true}')
  await assert.rejects(f.go(false), /drift/)
  await f.put(state.current.release, 'package.json', '{}')
  await f.put(state.current.release, '.next/static/chunk.js', 'drift')
  await assert.rejects(f.go(false), /drift/)
  await f.put(state.current.release, '.next/static/chunk.js', 'candidate-static')
  await f.put(state.current.release, '.next/BUILD_ID', 'drift')
  await assert.rejects(f.go(false), /drift/)
})

test('missing or changed verification file is rejected before build/activation', async t => {
  const f = await fixture(t)
  await f.put(f.source, verification, 'wrong verification')
  await f.archive()
  await assert.rejects(f.go(), /verification/)
  await rm(path.join(f.source, verification))
  await f.archive()
  await assert.rejects(f.go(), { code: 'ENOENT' })
  assert.ok(!f.events.includes('build'))
  assert.ok(!f.events.includes('activate'))
})

test('second concurrent transaction fails closed without entering the operation', { timeout: 10000 }, async t => {
  const f = await fixture(t)
  const entered = Promise.withResolvers<void>()
  const proceed = Promise.withResolvers<void>()
  f.setHold(async () => { entered.resolve(); await proceed.promise })
  const first = f.go()
  await entered.promise
  try {
    await assert.rejects(f.go(), /lock unavailable/)
    assert.ok(!f.events.includes('unlock'))
  } finally { proceed.resolve() }
  await first
  assert.equal(f.events.filter(e => e === 'backup').length, 1)
  assert.equal(f.events.filter(e => e === 'unlock').length, 1)
})

test('ISR regeneration is not drift; an immutable static chunk change is drift', async t => {
  const f = await fixture(t)
  await f.go()
  f.deps.smoke = async () => ({ ok: true })
  const before = await fingerprint(f.active.cwd)
  await f.put(f.active.cwd, '.next/server/app/index.html', 'regenerated HTML')
  await f.put(f.active.cwd, '.next/server/app/index.rsc', 'regenerated RSC')
  await f.put(f.active.cwd, '.next/server/app/index.meta', '{"regenerated":true}')
  assert.deepEqual(await fingerprint(f.active.cwd), before)
  assert.equal((await f.go(false)).status, 'noop')
  await f.put(f.active.cwd, '.next/static/chunk.js', 'overwritten immutable chunk')
  await assert.rejects(f.go(false), /drift/)
})

for (const phase of ['backup', 'build']) {
  test(`insufficient disk space before ${phase} fails closed`, async t => {
    const f = await fixture(t)
    const before = await fingerprint(f.paths.legacy)
    f.setFail(`disk-${phase}`)
    await assert.rejects(f.go(), /insufficient deployment disk space/)
    assert.ok(!f.events.includes(phase))
    assert.ok(!f.events.includes('activate'))
    assert.deepEqual(await fingerprint(f.paths.legacy), before)
    await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
    assert.equal(f.events.at(-1), 'unlock')
  })
}

test('disk budget includes 8 GiB minimum, archive expansion multiplier, and full backup size', async t => {
  const f = await fixture(t)
  const plenty = async () => ({ bavail: 10n ** 15n, bsize: 1n })
  assert.equal(await assertDiskSpace(f.paths, 100, 123n, plenty), 8n * 1024n ** 3n + 123n)
  assert.equal(await assertDiskSpace(f.paths, 2 * 1024 ** 3, 123n, plenty), 16n * 1024n ** 3n + 123n)
  await assert.rejects(assertDiskSpace(f.paths, 100, 0n, async () => ({ bavail: 8n * 1024n ** 3n - 1n, bsize: 1n })), /disk space/)
})

for (const failure of ['build', 'preview']) {
  test(`a later ${failure} failure cannot seed or overwrite shared storage of the active release`, async t => {
    const f = await fixture(t)
    await f.go()
    const active = f.active.cwd
    const before = await fingerprint(active)
    const stateBefore = await readFile(f.paths.state, 'utf8')
    await f.put(f.source, 'public/uploads/later.txt', 'later committed upload')
    await f.archive('4'.repeat(40), ['4'.repeat(40), NEW])
    f.events.length = 0
    f.setFail(failure)
    await assert.rejects(f.go(false), new RegExp(`${failure} failed`))
    assert.equal(f.active.cwd, active)
    assert.deepEqual(await fingerprint(active), before)
    assert.equal(await readFile(f.paths.state, 'utf8'), stateBefore)
    assert.equal(await readFile(path.join(active, 'public/uploads/existing.txt'), 'utf8'), 'live-upload')
    await assert.rejects(readFile(path.join(f.paths.shared, 'public/uploads/later.txt')), { code: 'ENOENT' })
    assert.ok(!f.events.includes('activate'))
  })
}

for (const phase of ['preview', 'active']) {
  test(`interruption during ${phase} smoke cleans preview/lock and rolls back only when activated`, async t => {
    const f = await fixture(t)
    const controller = new AbortController()
    const originalSmoke = f.deps.smoke
    f.deps.smoke = async (base, options) => {
      const result = await originalSmoke(base, options)
      if ((phase === 'preview' && base.endsWith(':45678')) || (phase === 'active' && !base.endsWith(':45678') && f.active.cwd !== f.paths.legacy)) controller.abort(new Error('interrupted'))
      return result
    }
    await assert.rejects(f.go(true, controller.signal), phase === 'preview' ? /interrupted/ : /rolled back/)
    assert.ok(f.events.includes('stop-preview'))
    assert.equal(f.events.includes('rollback'), phase === 'active')
    assert.equal(f.events.at(-1), 'unlock')
    await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
  })
}

test('archive links cannot escape staging and are rejected before backup', async t => {
  const f = await fixture(t)
  await symlink(f.paths.legacy, path.join(f.source, 'escape'))
  await f.archive()
  await assert.rejects(f.go(), /archive links/)
  assert.ok(!f.events.includes('backup'))
  assert.ok(!f.events.includes('extract'))
})

test('explicit bootstrap can replace legacy missing Google proof', async t => {
  const f = await fixture(t)
  await rm(path.join(f.paths.legacy, verification))
  assert.equal((await f.go()).status, 'deployed')
  assert.equal(await readFile(path.join(f.active.cwd, verification), 'utf8'), VERIFY)
  await assert.rejects(readFile(path.join(f.paths.legacy, verification)), { code: 'ENOENT' })
})

test('restoring a regressed legacy configuration is not a successful rollback smoke', async t => {
  const f = await fixture(t)
  await rm(path.join(f.paths.legacy, verification))
  f.setFail('smoke-active')
  const originalSmoke = f.deps.smoke
  f.deps.smoke = async (base, options) => {
    if (!base.endsWith(':45678') && f.active.cwd === f.paths.legacy) await readFile(path.join(f.paths.legacy, verification))
    return originalSmoke(base, options)
  }
  await assert.rejects(f.go(), /ROLLBACK FAILED/)
  assert.equal(f.active.cwd, f.paths.legacy)
  await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
})

test('activation waits for a NEW Ready line after PM2 returns, never historical output', { timeout: 10000 }, async t => {
  const f = await fixture(t)
  f.setEmitReady(false)
  const waiting = Promise.withResolvers<void>()
  const originalArm = f.deps.armReady
  f.deps.armReady = async (file, options) => {
    const observer = await originalArm(file, options)
    return { close: observer.close, get ready() { waiting.resolve(); return observer.ready } }
  }
  const deployment = f.go()
  await waiting.promise
  try {
    assert.ok(f.events.includes('activate'))
    assert.ok(!f.events.includes('ready'))
    assert.ok(!f.events.includes('smoke-active'))
    await assert.rejects(readFile(f.paths.state), { code: 'ENOENT' })
  } finally { await appendFile(f.outputLog, 'Ready in 20ms\n') }
  assert.equal((await deployment).status, 'deployed')
})

test('log readiness follows a new split line and closes cleanly on abort', { timeout: 10000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'deploy-ready-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const file = path.join(root, 'out.log')
  await writeFile(file, 'Ready in 1ms\n')
  const observer = await armReady(file, { timeout: 3000 })
  t.after(() => observer.close())
  await appendFile(file, 'Ready ')
  await appendFile(file, 'in 2ms\n')
  await observer.ready
  await observer.close()
  const controller = new AbortController()
  const interrupted = await armReady(file, { signal: controller.signal, timeout: 3000 })
  const rejected = assert.rejects(interrupted.ready, /log interrupted/)
  controller.abort(new Error('log interrupted'))
  await rejected
  await interrupted.close()
})

for (const operation of ['rotated', 'truncated']) {
  test(`readiness fails closed when its watched log is ${operation}`, { timeout: 10000 }, async t => {
    const root = await mkdtemp(path.join(tmpdir(), 'deploy-ready-change-'))
    t.after(() => rm(root, { recursive: true, force: true }))
    const file = path.join(root, 'out.log')
    const replacement = path.join(root, 'replacement.log')
    await writeFile(file, 'historical Ready in 1ms\n')
    await writeFile(replacement, 'Ready in 2ms\n')
    const observer = await armReady(file, { timeout: 3000 })
    const expected = new RegExp(`log ${operation} during readiness`)
    const rejected = assert.rejects(observer.ready, expected)
    try {
      if (operation === 'rotated') await rename(replacement, file)
      else await writeFile(file, '')
      await rejected
    } finally {
      // A queued read can independently detect the same invalidated inode/size;
      // close waits for that read and must not hide an unrelated cleanup error.
      await observer.close().catch(error => assert.match(error.message, expected))
    }
  })
}

test('per-file readiness survives concurrent split appends and sibling rename traffic', { timeout: 10000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'deploy-ready-burst-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const files = Array.from({ length: 18 }, (_, index) => path.join(root, `out.${index}.log`))
  await Promise.all(files.map(file => writeFile(file, 'historical Ready in 1ms\n')))
  const observers = await Promise.all(files.map(file => armReady(file, { timeout: 3000 })))
  t.after(() => Promise.all(observers.map(observer => observer.close())))
  // Every subscription is armed before any append/rename. This stresses the
  // directory coalescing failure without sleeps, polling, or timing assertions.
  const writes = files.map(async (file, index) => {
    const sibling = path.join(root, `noise.${index}`)
    await writeFile(sibling, 'unrelated log traffic')
    await appendFile(file, 'Ready ')
    await rename(sibling, `${sibling}.renamed`)
    await appendFile(file, 'in 2ms\n')
  })
  await Promise.all([...writes, ...observers.map(observer => observer.ready)])
})

test('atomic state replacement produces complete JSON and leaves no temporary files', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'deploy-state-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const file = path.join(root, 'state.json')
  await atomicJSON(file, { current: OLD })
  await atomicJSON(file, { current: NEW })
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), { current: NEW })
  assert.deepEqual(await readdir(root), ['state.json'])
})

if (process.platform === 'linux') {
  test('real flock rejects a second holder and releases deterministically', async t => {
    const root = await mkdtemp(path.join(tmpdir(), 'deploy-lock-'))
    t.after(() => rm(root, { recursive: true, force: true }))
    const file = path.join(root, 'deploy.lock')
    const release = await acquireLock(file)
    try { await assert.rejects(acquireLock(file), /lock/) } finally { await release() }
    const again = await acquireLock(file)
    await again()
  })
}

test('preview waits for actual Ready stdout, serves loopback, and is reaped on stop', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'deploy-preview-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const script = path.join(root, 'preview.cjs')
  await writeFile(script, `const http = require('node:http'); const port = Number(process.argv.at(-1)); http.createServer((req,res) => res.end('preview')).listen(port,'127.0.0.1', () => console.log('✓ Ready in 1ms'));`)
  const preview = await startPreview(root, {
    command: process.execPath, args: port => [script, String(port)], timeout: 3000,
  })
  t.after(() => preview.stop())
  assert.equal(await (await fetch(preview.base, { signal: AbortSignal.timeout(3000) })).text(), 'preview')
  await preview.stop()
  await assert.rejects(fetch(preview.base, { signal: AbortSignal.timeout(3000) }))
})
