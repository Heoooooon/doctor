import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { promisify } from 'node:util'
import { parseOptions, preflight } from '../scripts/deploy-vps.mjs'

const execute = promisify(execFile)
const commit = 'a'.repeat(40)
const tree = 'b'.repeat(40)
const proof = 'public/googlec8eaf265de8ba751.html'
const trackedFiles = [
  proof, 'pnpm-lock.yaml', 'scripts/deploy-vps.sh', 'scripts/deploy-vps.mjs',
  'scripts/deploy-remote.mjs', 'scripts/deploy-smoke.mjs',
].join('\n')

function gitFixture(overrides: Record<string, string | Error> = {}) {
  const responses: Record<string, string | Error> = {
    'status --porcelain=v1 --untracked-files=all': '',
    'remote get-url origin': 'https://github.com/Heoooooon/doctor.git',
    'symbolic-ref --quiet --short HEAD': 'main',
    'rev-parse HEAD': commit,
    'rev-parse HEAD^{tree}': tree,
    'fetch origin refs/heads/main:refs/remotes/origin/main': '',
    'rev-parse refs/remotes/origin/main': commit,
    [`ls-tree -r --name-only ${commit}`]: trackedFiles,
    [`show ${commit}:${proof}`]: 'google-site-verification: googlec8eaf265de8ba751.html\n',
    ...overrides,
  }
  const calls: string[] = []
  const run = async (command: string, args: string[]) => {
    assert.equal(command, 'git', 'preflight must not build, upload, or contact the VPS')
    const key = args.join(' ')
    calls.push(key)
    assert.ok(Object.hasOwn(responses, key), `unexpected command: ${key}`)
    const response = responses[key]
    if (response instanceof Error) throw response
    return response
  }
  return { run, calls }
}

test('only a clean commit exactly matching freshly fetched origin/main passes', async () => {
  const git = gitFixture()
  assert.deepEqual(await preflight(git.run), { commit, tree })
  assert.ok(git.calls.indexOf('fetch origin refs/heads/main:refs/remotes/origin/main') <
    git.calls.indexOf('rev-parse refs/remotes/origin/main'))
})

for (const [command, changed] of [
  ['status --porcelain=v1 --untracked-files=all', ' M app/page.tsx'],
  ['symbolic-ref --quiet --short HEAD', 'feature/members'],
  ['rev-parse HEAD', 'c'.repeat(40)],
] as const) {
  test(`preflight rejects a concurrent change to ${command} during fetch`, async () => {
    const git = gitFixture()
    let fetched = false
    await assert.rejects(preflight(async (binary: string, args: string[]) => {
      const key = args.join(' ')
      const value = await git.run(binary, args)
      if (fetched && key === command) return changed
      if (args[0] === 'fetch') fetched = true
      return value
    }))
  })
}

for (const [name, overrides] of [
  ['wrong repository', { 'remote get-url origin': 'https://github.com/Heoooooon/dental-solution.git' }],
  ['other branch', { 'symbolic-ref --quiet --short HEAD': 'feature/members' }],
  ['older or unpushed commit', { 'rev-parse refs/remotes/origin/main': 'c'.repeat(40) }],
  ['failed remote fetch', { 'fetch origin refs/heads/main:refs/remotes/origin/main': new Error('offline') }],
  ['missing verification file', { [`ls-tree -r --name-only ${commit}`]: trackedFiles.replace(`${proof}\n`, '') }],
  ['changed verification token', { [`show ${commit}:${proof}`]: 'wrong token' }],
  ['tracked secret file', { [`ls-tree -r --name-only ${commit}`]: `${trackedFiles}\n.env.local` }],
  ['untracked work', { 'status --porcelain=v1 --untracked-files=all': '?? lib/columns.ts' }],
] as const) {
  test(`preflight rejects ${name}`, async () => {
    const git = gitFixture(overrides)
    await assert.rejects(preflight(git.run))
  })
}

test('no force/dirty bypass and no ambiguous bootstrap/check options exist', () => {
  for (const args of [['--force'], ['--allow-dirty'], ['--check', '--bootstrap'], ['--check', '--check']]) {
    assert.throws(() => parseOptions(args))
  }
  assert.equal(parseOptions(['--check']).check, true)
  assert.equal(parseOptions(['--bootstrap']).bootstrap, true)
})

test('a dirty checkout is refused before any deployment command or SSH connection', async t => {
  // Isolated command boundaries: this regression must never contact the VPS.
  const root = await mkdtemp(join(tmpdir(), 'egun-deploy-preflight-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'scripts'))
  await mkdir(join(root, 'bin'))
  await copyFile(new URL('../scripts/deploy-vps.sh', import.meta.url), join(root, 'scripts/deploy-vps.sh'))
  await copyFile(new URL('../scripts/deploy-vps.mjs', import.meta.url), join(root, 'scripts/deploy-vps.mjs'))
  const log = join(root, 'commands.log')
  for (const command of ['git', 'npm', 'pnpm', 'ssh', 'scp', 'rsync', 'curl', 'sleep']) {
    await writeFile(join(root, 'bin', command), `#!/bin/sh
printf '%s\\n' '${command}' >> "$DEPLOY_COMMAND_LOG"
if [ '${command}' = git ]; then
  case "$*" in
    "status --porcelain=v1 --untracked-files=all") printf ' M app/page.tsx\\n' ;;
  esac
fi
`, { mode: 0o755 })
  }
  let exitCode = 0
  try {
    await execute('/bin/bash', [join(root, 'scripts/deploy-vps.sh'), '--check'], {
      cwd: root,
      env: {
        ...process.env,
        PATH: `${join(root, 'bin')}:${dirname(process.execPath)}:/usr/bin:/bin`,
        DEPLOY_COMMAND_LOG: log,
      },
    })
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || typeof error.code !== 'number') throw error
    exitCode = error.code
  }
  assert.notEqual(exitCode, 0, 'dirty working tree must not be deployed')
  const calls = (await readFile(log, 'utf8')).trim().split('\n')
  assert.ok(calls.includes('git'))
  assert.ok(!calls.some(command => ['ssh', 'scp', 'rsync', 'npm', 'pnpm'].includes(command)),
    `dirty checkout reached deployment: ${calls.join(', ')}`)
})

test('a checkout changed while archiving is rejected before the first SSH connection', async t => {
  const root = await mkdtemp(join(tmpdir(), 'egun-deploy-late-change-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  for (const directory of ['scripts', 'bin', 'tests']) await mkdir(join(root, directory))
  for (const file of ['deploy-vps.sh', 'deploy-vps.mjs']) {
    await copyFile(new URL(`../scripts/${file}`, import.meta.url), join(root, 'scripts', file))
  }
  await writeFile(join(root, 'tests/fixture.test.mts'), "import test from 'node:test'; test('fixture', () => {})\n")
  const log = join(root, 'commands.log')
  const changed = join(root, 'changed')
  await writeFile(join(root, 'bin/git'), `#!${process.execPath}
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(log)}, 'git ' + args.join(' ') + '\\n');
const replies = ${JSON.stringify({
    'status --porcelain=v1 --untracked-files=all': '',
    'remote get-url origin': 'https://github.com/Heoooooon/doctor.git',
    'symbolic-ref --quiet --short HEAD': 'main',
    'rev-parse HEAD': commit,
    'rev-parse HEAD^{tree}': tree,
    'rev-parse refs/remotes/origin/main': commit,
    [`ls-tree -r --name-only ${commit}`]: trackedFiles,
    [`show ${commit}:${proof}`]: 'google-site-verification: googlec8eaf265de8ba751.html',
    [`rev-list ${commit}`]: commit,
  })};
if (args[0] === 'archive') {
  fs.writeFileSync(args.find(arg => arg.startsWith('--output=')).slice(9), 'archive fixture');
  fs.writeFileSync(${JSON.stringify(changed)}, 'changed after validation');
} else if (args[0] === 'status' && fs.existsSync(${JSON.stringify(changed)})) {
  process.stdout.write(' M app/page.tsx\\n');
} else process.stdout.write((replies[args.join(' ')] || '') + '\\n');
`, { mode: 0o755 })
  for (const command of ['pnpm', 'ssh', 'scp']) {
    await writeFile(join(root, 'bin', command),
      `#!/bin/sh\nprintf '%s\\n' '${command}' >> '${log}'\n`, { mode: 0o755 })
  }
  await assert.rejects(execute('/bin/bash', [join(root, 'scripts/deploy-vps.sh')], {
    cwd: root,
    env: { ...process.env, PATH: `${join(root, 'bin')}:${dirname(process.execPath)}:/usr/bin:/bin` },
  }))
  const calls = (await readFile(log, 'utf8')).trim().split('\n')
  assert.ok(calls.some(call => call.startsWith('git archive ')), 'fixture must reach archive creation')
  assert.ok(!calls.some(call => call === 'ssh' || call === 'scp'), 'late dirty checkout reached the VPS')
})
