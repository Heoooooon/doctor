#!/usr/bin/env node
// Standalone Node 24 remote engine. CLI paths are fixed; dependency/path injection is
// available only to imported offline tests. Root commands outside this lock remain
// outside our control; drift checks detect, but cannot prevent, that interference.
import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, watch } from 'node:fs'
import { chmod, constants, copyFile, lstat, mkdir, mkdtemp, open, readFile, readdir, readlink, realpath, rename, rm, stat, statfs, symlink } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const PRODUCTION = Object.freeze({
  legacy: '/opt/seoulegundc', releases: '/opt/seoulegundc-releases',
  shared: '/opt/seoulegundc-shared', state: '/var/lib/seoulegundc-deploy/state.json',
  incoming: '/var/lib/seoulegundc-deploy/incoming',
  lock: '/var/lock/seoulegundc-deploy.lock',
  domains: ['https://egundc.com', 'https://jsdentad.mycafe24.com'],
})
const NAME = 'seoulegundc'
const REPOSITORY = 'Heoooooon/doctor'
const VERIFY_FILE = 'public/googlec8eaf265de8ba751.html'
const VERIFY_TEXT = 'google-site-verification: googlec8eaf265de8ba751.html'
const LOCAL_DATA = /^local-.*\.json$/
const HEX40 = /^[a-f0-9]{40}$/
const HEX64 = /^[a-f0-9]{64}$/
const HOME_STATE = ['.pm2', '.cache', '.npm', '.local', '.config', '.pnpm-store', '.ssh', '.codegraph', '.gstack', '.claude', '.omo', '.gjc', '.bash_history', '.zsh_history', '.lesshst', '.viminfo', '.node_repl_history', '.wget-hsts']

async function exists(file) {
  try { await lstat(file); return true } catch (error) { if (error.code === 'ENOENT') return false; throw error }
}
function checkSignal(signal) { signal?.throwIfAborted() }
function killGroup(child, signal) {
  if (!child.pid) return
  try { process.kill(-child.pid, signal) } catch (error) { if (error.code !== 'ESRCH') throw error }
}

// Subscribe immediately after spawn, before the event loop can deliver output/exit.
// Commands never use a shell and their output is never included in errors (secrets).
function childProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd, env: options.env ?? process.env,
    detached: true, stdio: ['pipe', 'pipe', 'pipe'],
  })
  const closed = new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('close', (code, signal) => resolve({ code, signal }))
  })
  // A caller may still be waiting for readiness when a spawn error arrives.
  closed.catch(() => {})
  let stopping
  const stop = () => stopping ??= (async () => {
    if (child.exitCode !== null || child.signalCode !== null) { await closed; return }
    killGroup(child, 'SIGTERM')
    const timer = setTimeout(() => killGroup(child, 'SIGKILL'), 5000)
    try { await closed } finally { clearTimeout(timer) }
  })()
  return { child, closed, stop }
}

export async function runCommand(command, args, options = {}) {
  checkSignal(options.signal)
  const managed = childProcess(command, args, options)
  let stdout = ''
  let failure
  const abort = () => { failure = options.signal.reason; void managed.stop().catch(error => { failure = error }) }
  const timer = setTimeout(() => {
    failure = new Error(`${command} timed out`)
    void managed.stop().catch(error => { failure = error })
  }, options.timeout ?? 30 * 60 * 1000)
  options.signal?.addEventListener('abort', abort, { once: true })
  managed.child.stdout.on('data', data => {
    stdout += data
    if (stdout.length > 32 * 1024 * 1024) {
      failure = new Error(`${command} output exceeded limit`)
      void managed.stop().catch(error => { failure = error })
    }
  })
  managed.child.stderr.resume()
  managed.child.stdin.end()
  try {
    const result = await managed.closed
    if (failure) throw failure
    if (result.code !== 0) throw new Error(`${command} failed (exit ${result.code ?? result.signal})`)
    return stdout
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', abort)
    await managed.stop()
  }
}

function readySignal(managed, pattern, timeout, signal) {
  return new Promise((resolve, reject) => {
    let text = ''
    const finish = error => {
      clearTimeout(timer)
      managed.child.stdout.off('data', output)
      signal?.removeEventListener('abort', abort)
      if (error) reject(error); else resolve()
    }
    const output = data => {
      text = (text + data).slice(-8192)
      if (pattern.test(text)) finish()
    }
    const abort = () => finish(signal.reason)
    const timer = setTimeout(() => finish(new Error('process readiness timed out')), timeout)
    managed.child.stdout.on('data', output)
    managed.child.stderr.resume()
    managed.closed.then(() => finish(new Error('process exited before readiness')), finish)
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) abort()
  })
}

export async function acquireLock(file, { signal, onLost = () => {} } = {}) {
  checkSignal(signal)
  // flock remains the owning process until the stdin-driven holder exits. No
  // polling, lock-file deletion, advisory PID checks, or environment bypass.
  const managed = childProcess('flock', ['-n', file, '/usr/bin/node', '-e',
    "process.stdout.write('LOCKED\\n'); process.stdin.resume(); process.stdin.on('end', () => process.exit(0));"])
  let releasing = false
  try { await readySignal(managed, /^LOCKED\n/m, 10000, signal) }
  catch (error) { await managed.stop(); throw new Error('deployment lock unavailable', { cause: error }) }
  managed.closed.then(() => { if (!releasing) onLost(new Error('deployment lock lost')) }, error => { if (!releasing) onLost(error) })
  return async () => {
    releasing = true
    managed.child.stdin.end()
    const timer = setTimeout(() => killGroup(managed.child, 'SIGKILL'), 5000)
    try {
      const result = await managed.closed
      if (result.code !== 0) throw new Error('deployment lock holder failed during release')
    } finally { clearTimeout(timer) }
  }
}

async function freePort() {
  const server = net.createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const port = server.address().port
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  return port
}

export async function startPreview(release, options = {}) {
  checkSignal(options.signal)
  const port = await freePort()
  const managed = childProcess(options.command ?? '/usr/bin/node', options.args
    ? options.args(port)
    : [path.join(release, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)],
  { cwd: release, env: options.env })
  try {
    await readySignal(managed, /\bReady in\b/, options.timeout ?? 120000, options.signal)
    // A bind race is an error, never a reason to retry on a different port.
    return { base: `http://127.0.0.1:${port}`, stop: managed.stop }
  } catch (error) { await managed.stop(); throw error }
}

// Arm against the current byte offset, not historical PM2 output. fs.watch is
// installed before the caller can run startOrReload; every read is event-driven.
// PM2's log path is used transiently, never added to the saved process config.
export async function armReady(logFile, { signal, timeout = 120000 } = {}) {
  checkSignal(signal)
  if (typeof logFile !== 'string' || !path.isAbsolute(logFile)) throw new Error('PM2 stdout log path unavailable for readiness')
  const initial = await stat(logFile)
  if (!initial.isFile()) throw new Error('PM2 stdout log is not a regular file')
  let offset = initial.size
  let text = ''
  let settled = false
  let closed = false
  let reads = Promise.resolve()
  const pending = Promise.withResolvers()
  // Commands can reject before callers reach await ready; the rejection is still
  // retained by pending.promise and observed by the switch transaction.
  pending.promise.catch(() => {})
  // Watch the file itself: on Darwin this uses kqueue rather than directory
  // FSEvents, whose coalescing can lose the only append notification under load.
  // A file watcher follows an inode, not its replacement. Rotation must fail
  // closed; do not pretend that resetting the read offset rearms the watcher.
  const watcher = watch(logFile)
  const dispose = () => {
    if (closed) return
    closed = true
    watcher.close()
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
  const finish = error => {
    if (settled) return
    settled = true
    dispose()
    if (error) pending.reject(error); else pending.resolve()
  }
  const abort = () => finish(signal.reason)
  const timer = setTimeout(() => finish(new Error('Next activation readiness timed out')), timeout)
  async function readNewLines() {
    if (closed) return
    const handle = await open(logFile, 'r')
    try {
      const info = await handle.stat()
      if (info.ino !== initial.ino || info.dev !== initial.dev) throw new Error('PM2 stdout log rotated during readiness')
      if (info.size < offset) throw new Error('PM2 stdout log truncated during readiness')
      const buffer = Buffer.alloc(64 * 1024)
      while (!closed && offset < info.size) {
        const { bytesRead } = await handle.read(buffer, 0, Math.min(buffer.length, info.size - offset), offset)
        if (!bytesRead) break
        offset += bytesRead
        text += buffer.toString('utf8', 0, bytesRead)
        if (/(?:^|\n)[^\n]*\bReady in\b[^\n]*\n/.test(text)) finish()
        text = text.slice(-8192)
      }
    } finally { await handle.close() }
  }
  const changed = event => {
    if (closed) return
    if (event === 'rename') { finish(new Error('PM2 stdout log rotated during readiness')); return }
    reads = reads.then(readNewLines)
    reads.catch(finish)
  }
  watcher.on('change', changed)
  watcher.on('error', finish)
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) abort()
  // Cover writes between the initial stat and installing the watcher, without
  // polling or an interval. Subsequent reads only follow filesystem events.
  changed('change')
  return { ready: pending.promise, close: async () => { dispose(); await reads } }
}

export function validateManifest(value) {
  if (!value || value.schemaVersion !== 1 || value.repository !== REPOSITORY ||
      !HEX40.test(value.commit) || !HEX40.test(value.tree) ||
      !Array.isArray(value.ancestors) || !value.ancestors.every(item => typeof item === 'string' && HEX40.test(item)) ||
      !value.ancestors.includes(value.commit) || !HEX64.test(value.archiveSha256) ||
      !Number.isSafeInteger(value.archiveBytes) || value.archiveBytes <= 0) throw new Error('invalid deployment manifest')
  return value
}

async function sha256(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

async function treeHash(root, excluded = () => false) {
  const hash = createHash('sha256')
  async function walk(relative) {
    if (excluded(relative)) return
    const file = path.join(root, relative)
    const info = await lstat(file)
    hash.update(JSON.stringify([relative, info.isDirectory() ? 'd' : info.isSymbolicLink() ? 'l' : 'f']) + '\n')
    if (info.isDirectory()) {
      for (const name of (await readdir(file)).sort()) await walk(relative ? `${relative}/${name}` : name)
    } else if (info.isSymbolicLink()) {
      // Dependency links live under excluded node_modules; unexpected source
      // links fail closed rather than hiding external contents from the hash.
      throw new Error(`unexpected immutable symlink: ${relative}`)
    } else if (info.isFile()) hash.update(await sha256(file))
    else throw new Error(`unsupported release file: ${relative}`)
  }
  await walk('')
  return hash.digest('hex')
}
function mutable(relative) {
  return relative === '.env.local' || relative === 'public/uploads' ||
    (relative.startsWith('data/') && LOCAL_DATA.test(relative.slice(5)))
}
export async function fingerprint(release) {
  const sourceSha256 = await treeHash(release, relative =>
    ['node_modules', '.next', '.git', ...HOME_STATE].includes(relative) || mutable(relative))
  // ISR legitimately rewrites .next/server/app HTML/RSC/meta. Only immutable
  // browser assets and BUILD_ID participate in the build drift contract.
  const staticSha256 = await treeHash(path.join(release, '.next/static'))
  const buildId = (await readFile(path.join(release, '.next/BUILD_ID'), 'utf8')).trim()
  if (!buildId) throw new Error('missing build ID')
  return { sourceSha256, staticSha256, buildId }
}

export async function atomicJSON(file, value) {
  await mkdir(path.dirname(file), { recursive: true })
  const temporary = `${file}.tmp.${randomUUID()}`
  const handle = await open(temporary, 'wx', 0o600)
  try {
    await handle.writeFile(JSON.stringify(value, null, 2) + '\n')
    await handle.sync()
  } finally { await handle.close() }
  await rename(temporary, file)
  const directory = await open(path.dirname(file), 'r')
  try { await directory.sync() } finally { await directory.close() }
}

function processConfig(entry) {
  const env = entry.pm2_env
  const config = { name: entry.name, cwd: env?.pm_cwd, script: env?.pm_exec_path,
    args: env?.args ?? [], interpreter: env?.exec_interpreter ?? 'node' }
  if (config.name !== NAME || !path.isAbsolute(config.cwd ?? '') || !path.isAbsolute(config.script ?? '') ||
      !(typeof config.args === 'string' || Array.isArray(config.args) && config.args.every(arg => typeof arg === 'string')) ||
      typeof config.interpreter !== 'string' || env.status !== 'online' || !Number.isInteger(entry.pid) || entry.pid <= 0) {
    throw new Error('invalid or offline active PM2 process')
  }
  return config
}
function sameConfig(a, b) {
  return ['name', 'cwd', 'script', 'args', 'interpreter'].every(key => JSON.stringify(a[key]) === JSON.stringify(b[key]))
}
function appArguments(paths, command, args, extra = []) {
  return ['-u', 'appuser', '--', 'env', `HOME=${paths.legacy}`, `PM2_HOME=${paths.legacy}/.pm2`,
    `PATH=${paths.legacy}/.local/share/pnpm:${paths.legacy}/.local/bin:/usr/local/bin:/usr/bin:/bin`, ...extra, command, ...args]
}

async function verifyGoogle(release) {
  const value = await readFile(path.join(release, VERIFY_FILE), 'utf8')
  if (value.trim() !== VERIFY_TEXT) throw new Error('Google verification file mismatch')
}
async function copyMissing(source, target) {
  if (!await exists(source)) return
  const info = await lstat(source)
  if (info.isSymbolicLink()) throw new Error('unexpected symlink in mutable storage')
  if (info.isDirectory()) {
    await mkdir(target, { recursive: true })
    for (const name of (await readdir(source)).sort()) await copyMissing(path.join(source, name), path.join(target, name))
  } else if (info.isFile()) {
    await mkdir(path.dirname(target), { recursive: true })
    try { await copyFile(source, target, constants.COPYFILE_EXCL) }
    catch (error) { if (error.code !== 'EEXIST') throw error }
  } else throw new Error('unsupported mutable storage file')
}
async function localFiles(root) {
  if (!await exists(root)) return []
  return (await readdir(root)).filter(name => LOCAL_DATA.test(name)).sort()
}

async function stageMutable(release, origins) {
  // Candidate preview uses private copies. Failed install/build/preview cannot
  // seed or edit storage that the current release serves. Existing shared data
  // takes precedence even when a failed bootstrap left a partial shared tree.
  for (const origin of origins) await copyMissing(path.join(origin, '.env.local'), path.join(release, '.env.local'))
  if (!await exists(path.join(release, '.env.local'))) throw new Error('production .env.local missing')
  const committedUploads = path.join(release, 'public/uploads')
  const saved = path.join(release, '.uploads-seed')
  if (await exists(committedUploads)) await rename(committedUploads, saved)
  for (const origin of origins) await copyMissing(path.join(origin, 'public/uploads'), committedUploads)
  await copyMissing(saved, committedUploads)
  await mkdir(committedUploads, { recursive: true })
  await rm(saved, { recursive: true, force: true })
  for (const origin of [...origins].reverse()) {
    for (const name of await localFiles(path.join(origin, 'data'))) {
      await mkdir(path.join(release, 'data'), { recursive: true })
      await copyFile(path.join(origin, 'data', name), path.join(release, 'data', name))
    }
  }
}
async function connectShared(release, origin, shared) {
  await mkdir(shared, { recursive: true })
  if (origin !== shared) {
    await copyMissing(path.join(origin, '.env.local'), path.join(shared, '.env.local'))
    await copyMissing(path.join(origin, 'public/uploads'), path.join(shared, 'public/uploads'))
    for (const name of await localFiles(path.join(origin, 'data'))) await copyMissing(path.join(origin, 'data', name), path.join(shared, 'data', name))
  }
  await chmod(path.join(shared, '.env.local'), 0o600)
  await copyMissing(path.join(release, 'public/uploads'), path.join(shared, 'public/uploads'))
  for (const name of await localFiles(path.join(release, 'data'))) await copyMissing(path.join(release, 'data', name), path.join(shared, 'data', name))
  const links = ['.env.local', 'public/uploads', ...(await localFiles(path.join(shared, 'data'))).map(name => `data/${name}`)]
  for (const relative of links) {
    const file = path.join(release, relative)
    await mkdir(path.dirname(file), { recursive: true })
    await rm(file, { recursive: true, force: true })
    await symlink(path.join(shared, relative), file)
  }
}
async function verifySharedLinks(release, shared) {
  const links = ['.env.local', 'public/uploads', ...(await localFiles(path.join(release, 'data'))).map(name => `data/${name}`)]
  for (const relative of links) {
    if (await readlink(path.join(release, relative)) !== path.join(shared, relative) || !await exists(path.join(shared, relative))) throw new Error('active shared link drift')
  }
}

async function validateArchive(archive, run) {
  const listing = await run('tar', ['-tzf', archive])
  for (const raw of listing.split('\n').filter(Boolean)) {
    const name = raw.replace(/^\.\//, '').replace(/\/$/, '')
    if (!name || name === '.') continue
    if (name.startsWith('/') || name.split('/').includes('..') || /[\\\x00-\x1f\x7f]/.test(name) ||
        ['node_modules', '.next', '.git', '.env.local', '.uploads-seed'].includes(name.split('/')[0])) throw new Error('unsafe source archive path')
  }
  const verbose = await run('tar', ['-tvzf', archive])
  if (verbose.split('\n').filter(Boolean).some(line => !/^[-d]/.test(line))) throw new Error('source archive links or special files are forbidden')
}

export async function assertDiskSpace(paths, archiveBytes, backupBytes = 0n, filesystem = statfs) {
  // Reserve both a full uncompressed backup and conservative staging/build room.
  // Check each storage location: /opt and /var need not share a filesystem.
  const staging = BigInt(archiveBytes) * 8n
  const required = (staging > 8n * 1024n ** 3n ? staging : 8n * 1024n ** 3n) + backupBytes
  for (const location of [paths.releases, paths.shared, path.dirname(paths.state)]) {
    let anchor = location
    while (!await exists(anchor)) anchor = path.dirname(anchor)
    const space = await filesystem(anchor, { bigint: true })
    if (space.bavail * space.bsize < required) throw new Error(`insufficient deployment disk space at ${location}; need ${required} bytes free`)
  }
  return required
}

async function loadState(file, bootstrap, paths) {
  if (!await exists(file)) {
    if (!bootstrap) throw new Error('deployment state missing; explicit --bootstrap required')
    return null
  }
  const state = JSON.parse(await readFile(file, 'utf8'))
  const current = state.current
  if (state.schemaVersion !== 1 || state.repository !== REPOSITORY || !current ||
      !HEX40.test(current.commit) || !HEX40.test(current.tree) || !HEX64.test(current.sourceSha256) ||
      !HEX64.test(current.staticSha256) || typeof current.buildId !== 'string' || !current.buildId ||
      typeof current.release !== 'string' || path.dirname(current.release) !== paths.releases || !current.process ||
      current.process.cwd !== current.release || current.process.name !== NAME ||
      current.process.script !== path.join(current.release, 'node_modules/next/dist/bin/next')) throw new Error('invalid deployment state')
  if (await realpath(current.release) !== current.release) throw new Error('active release path drift')
  return state
}

function failureDetail(error, phase) {
  // Never persist arbitrary exception text: JSON parse errors, assertion errors,
  // or nested command causes can contain captured output or environment values.
  const known = /^(?:active (?:PM2 configuration|runtime cwd|source\/static\/build ID) drift|ambiguous PM2 process name|Next activation readiness timed out|PM2 stdout log (?:rotated|truncated) during readiness|(?:runuser|tar|gzip|du|chown) failed \(exit (?:\d+|SIG[A-Z]+)\))$/
  const message = known.test(error?.message ?? '') ? error.message
    : typeof error?.code === 'string' && /^[A-Z][A-Z0-9_]{0,40}$/.test(error.code) ? `operation failed (${error.code})`
      : 'operation failed (details withheld)'
  return { phase, message }
}

/** State v1: {schemaVersion,repository,current:{commit,tree,release,sourceSha256,
 * staticSha256,buildId,process:{name,cwd,script,args,interpreter}},previous,backup}.
 * Bootstrap previous has commit/tree null and a fingerprint of the untouched
 * legacy release. Only this function's successful final atomic write changes state.
 */
export async function deploy({ upload, bootstrap = false, paths = PRODUCTION, deps = {}, signal }) {
  const controller = new AbortController()
  const forward = () => controller.abort(signal.reason)
  signal?.addEventListener('abort', forward, { once: true })
  if (signal?.aborted) forward()
  const runImpl = deps.run ?? runCommand
  const run = (command, args, options = {}) => runImpl(command, args, { ...options, signal: controller.signal })
  const app = (command, args, options = {}, extra = []) => run('runuser', appArguments(paths, command, args, extra), options)
  const rollbackApp = (command, args) => runImpl('runuser', appArguments(paths, command, args))
  const smoke = deps.smoke ?? (await import('./deploy-smoke.mjs')).smoke
  let releaseLock
  let preview
  let activated = false
  let previous
  let candidate
  let rollbackFile
  let activeLog
  let initialState
  let stateWriteStarted = false
  let failure
  let result
  let phase = 'preflight'
  let validUpload = false
  const stateDirectory = path.dirname(paths.state)
  async function runtime(appRun = app) {
    const processes = JSON.parse(await appRun('pm2', ['jlist']))
    const matches = processes.filter(entry => entry.name === NAME)
    if (matches.length !== 1) throw new Error('expected exactly one seoulegundc PM2 process')
    const config = processConfig(matches[0])
    activeLog = matches[0].pm2_env.pm_out_log_path
    const cwd = await (deps.processCwd ?? (pid => realpath(`/proc/${pid}/cwd`)))(matches[0].pid)
    if (cwd !== config.cwd || await realpath(config.cwd) !== config.cwd) throw new Error('active runtime cwd drift')
    return config
  }
  async function checkActive(record, appRun = app) {
    if (!sameConfig(await runtime(appRun), record.process)) throw new Error('active PM2 configuration drift')
    const actual = await fingerprint(record.release)
    if (Object.keys(actual).some(key => actual[key] !== record[key])) throw new Error('active source/static/build ID drift')
  }
  async function switchProcess(file, appRun = app) {
    const entries = JSON.parse(await appRun('pm2', ['jlist'])).filter(entry => entry.name === NAME)
    if (entries.length > 1) throw new Error('ambiguous PM2 process name')
    const observer = await (deps.armReady ?? armReady)(activeLog, {
      signal: appRun === app ? controller.signal : undefined,
    })
    try {
      // PM2 6.0.14 startOrReload keeps an existing entry's resolved pm_cwd and
      // pm_exec_path, even when ecosystem cwd/script change. Remove ONLY this
      // named entry so the fresh-start path resolves the immutable config.
      // Mark activation before deletion: a failed start must still roll back.
      if (appRun === app) activated = true
      if (entries.length === 1) await appRun('pm2', ['delete', NAME])
      // Rollback also uses this path; after a failed start the entry may be absent.
      await appRun('pm2', ['startOrReload', file, '--only', NAME, '--update-env'])
      await observer.ready
    } finally { await observer.close() }
  }
  async function smokeAll(commit) {
    for (const base of ['http://127.0.0.1:3000', ...paths.domains]) await smoke(base, { expectedCommit: commit ?? undefined })
  }
  async function configFile(label, config) {
    // Upload/state parents are deliberately root-only (orchestrator umask 077).
    // PM2 must read these sanitized configs as appuser, outside that parent and
    // outside any immutable release's fingerprint.
    const directory = path.join(paths.releases, '.pm2-configs')
    await mkdir(directory, { recursive: true, mode: 0o755 })
    await chmod(paths.releases, 0o755)
    await chmod(directory, 0o755)
    const file = path.join(directory, `${label}.${randomUUID()}.config.cjs`)
    const handle = await open(file, 'wx', 0o644)
    try { await handle.writeFile(`module.exports = ${JSON.stringify({ apps: [config] })};\n`) }
    finally { await handle.close() }
    await chmod(file, 0o644)
    return file
  }
  try {
    releaseLock = await (deps.acquireLock ?? acquireLock)(paths.lock, {
      signal: controller.signal, onLost: error => controller.abort(error),
    })
    checkSignal(controller.signal)
    if (path.dirname(upload) !== paths.incoming || !/^upload\.[A-Za-z0-9_-]+$/.test(path.basename(upload)) || await realpath(upload) !== upload) throw new Error('invalid upload directory')
    validUpload = true
    phase = 'state-validation'
    const state = await loadState(paths.state, bootstrap, paths)
    initialState = state
    phase = 'artifact-validation'
    const manifest = validateManifest(JSON.parse(await readFile(path.join(upload, 'manifest.json'), 'utf8')))
    if (state && !manifest.ancestors.includes(state.current.commit)) throw new Error('candidate is not a descendant of active revision')
    const archive = path.join(upload, 'source.tar.gz')
    if ((await stat(archive)).size !== manifest.archiveBytes || await sha256(archive) !== manifest.archiveSha256) throw new Error('source artifact checksum/size mismatch')
    phase = 'verify-previous'
    if (state) {
      previous = state.current
      await checkActive(previous)
      await verifySharedLinks(previous.release, paths.shared)
      await verifyGoogle(previous.release)
      if (manifest.commit === previous.commit) {
        if (manifest.tree !== previous.tree) throw new Error('same-commit tree drift')
        await smokeAll(previous.commit)
        await checkActive(previous)
        checkSignal(controller.signal)
        result = { status: 'noop', current: previous }
      }
    } else {
      const config = await runtime()
      if (config.cwd !== paths.legacy || !config.script.startsWith(`${paths.legacy}/`)) throw new Error('bootstrap requires explicit legacy PM2 cwd/script')
      previous = { commit: null, tree: null, release: paths.legacy, ...await fingerprint(paths.legacy), process: config }
      // Explicit bootstrap is also recovery from a regressed legacy tree. Only
      // the candidate must contain Google proof; restored legacy still gets the
      // full rollback smoke and may honestly fail it.
    }
    if (!result) {
      phase = 'backup'
      await validateArchive(archive, run)
      const targets = [previous.release]
      if (await exists(paths.shared)) targets.push(paths.shared)
      const usage = await run('du', ['-sk', ...targets])
      const usageLines = usage.trim().split('\n')
      if (usageLines.length !== targets.length || usageLines.some(line => !/^\d+\s/.test(line))) throw new Error('invalid backup disk usage result')
      const backupBytes = usageLines.reduce((sum, line) => sum + BigInt(line.split(/\s/)[0]) * 1024n, 0n)
      await assertDiskSpace(paths, manifest.archiveBytes, backupBytes, deps.statfs)
      const backupDirectory = path.join(stateDirectory, 'backups')
      await mkdir(backupDirectory, { recursive: true, mode: 0o700 })
      await chmod(backupDirectory, 0o700)
      const backup = path.join(backupDirectory, `${Date.now()}.${randomUUID()}.tar.gz`)
      // Include code, .next build, env, uploads and local data; exclude only
      // dependencies and known volatile caches/PM2 home. Tar warnings are fatal.
      const excludes = ['node_modules', '.next/cache', ...HOME_STATE]
        .map(item => `--exclude=${previous.release.slice(1)}/${item}`)
      await run('tar', [...excludes, '-czf', backup, '-C', '/', ...targets.map(target => target.slice(1))])
      await run('gzip', ['-t', backup])
      await checkActive(previous)
      rollbackFile = await configFile('rollback', previous.process)
      await mkdir(paths.releases, { recursive: true })
      phase = 'stage'
      candidate = await mkdtemp(path.join(paths.releases, `${manifest.commit}.`))
      await run('tar', ['-xzf', archive, '--no-same-owner', '--no-same-permissions', '-C', candidate])
      await verifyGoogle(candidate)
      const origin = state ? paths.shared : paths.legacy
      await stageMutable(candidate, state ? [paths.shared] : [paths.shared, paths.legacy])
      await atomicJSON(path.join(candidate, 'public/__release.json'), { commit: manifest.commit })
      await run('chown', ['-R', 'appuser:appuser', candidate])
      await assertDiskSpace(paths, manifest.archiveBytes, 0n, deps.statfs)
      phase = 'install'
      await app('pnpm', ['install', '--frozen-lockfile', '--prod=false'], { cwd: candidate })
      await assertDiskSpace(paths, manifest.archiveBytes, 0n, deps.statfs)
      phase = 'build'
      await app('pnpm', ['build'], { cwd: candidate }, ['NODE_OPTIONS=--max-old-space-size=1536'])
      await verifyGoogle(candidate)
      const built = await fingerprint(candidate)
      phase = 'preview'
      preview = await (deps.preview ?? (release => startPreview(release, {
        command: 'runuser', args: port => appArguments(paths, '/usr/bin/node',
          [path.join(release, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)]),
        signal: controller.signal,
      })))(candidate)
      await smoke(preview.base, { expectedCommit: manifest.commit })
      await preview.stop()
      preview = null
      checkSignal(controller.signal)
      await checkActive(previous)
      await connectShared(candidate, origin, paths.shared)
      await run('chown', ['-R', 'appuser:appuser', paths.shared, candidate])
      if (JSON.stringify(await fingerprint(candidate)) !== JSON.stringify(built)) throw new Error('candidate changed during preview')
      const config = { name: NAME, cwd: candidate, script: path.join(candidate, 'node_modules/next/dist/bin/next'),
        args: ['start', '-H', '127.0.0.1', '-p', '3000'], interpreter: '/usr/bin/node' }
      const current = { commit: manifest.commit, tree: manifest.tree, release: candidate, ...built, process: config }
      const activateFile = await configFile('activate', config)
      checkSignal(controller.signal)
      phase = 'activate'
      await switchProcess(activateFile)
      phase = 'verify-activation'
      await checkActive(current)
      phase = 'smoke-activation'
      await smokeAll(manifest.commit)
      phase = 'verify-activation'
      await checkActive(current)
      await verifySharedLinks(candidate, paths.shared)
      checkSignal(controller.signal)
      phase = 'persist-state'
      await app('pm2', ['save'])
      checkSignal(controller.signal)
      const nextState = { schemaVersion: 1, repository: REPOSITORY, current, previous, backup }
      stateWriteStarted = true
      await atomicJSON(paths.state, nextState)
      activated = false
      result = { status: 'deployed', ...nextState }
    }
  } catch (error) {
    failure = error
    const report = { schemaVersion: 1, failure: failureDetail(error, phase), rollback: null }
    if (activated) {
      try {
        phase = 'rollback-activate'
        await switchProcess(rollbackFile, rollbackApp)
        phase = 'rollback-verify'
        await checkActive(previous, rollbackApp)
        phase = 'rollback-smoke'
        await smokeAll(previous.commit)
        phase = 'rollback-persist'
        await rollbackApp('pm2', ['save'])
        // rename may have succeeded before a directory fsync failed. Never leave
        // a candidate state pointing at a process that we just rolled back.
        if (stateWriteStarted) {
          if (initialState) await atomicJSON(paths.state, initialState)
          else await rm(paths.state, { force: true })
        }
        report.rollback = { phase: 'rollback-complete', message: 'previous process restored and smoke-verified' }
        failure = new Error('deployment failed; previous process restored and smoke-verified (rolled back)', { cause: error })
      } catch (rollbackError) {
        report.rollback = failureDetail(rollbackError, phase)
        failure = new AggregateError([error, rollbackError], 'deployment failed; ROLLBACK FAILED; manual recovery required')
      }
    }
    if (validUpload) {
      try { await atomicJSON(path.join(upload, 'error.json'), report) }
      catch (reportError) {
        failure = new AggregateError([failure, reportError], `${failure.message}; private diagnostic persistence failed`)
      }
    }
  } finally {
    try { if (preview) await preview.stop() }
    catch (error) { failure = new AggregateError([failure, error].filter(Boolean), 'preview cleanup failed') }
    try { if (releaseLock) await releaseLock() }
    catch (error) { failure = new AggregateError([failure, error].filter(Boolean), 'deployment lock cleanup failed') }
    signal?.removeEventListener('abort', forward)
  }
  if (failure) throw failure
  return result
}

async function main(args) {
  if (args.length < 1 || args.length > 2 || (args[1] && args[1] !== '--bootstrap')) throw new Error('usage: deploy-remote.mjs <upload-directory> [--bootstrap]')
  if (process.platform !== 'linux' || process.getuid?.() !== 0 || Number(process.versions.node.split('.')[0]) !== 24) throw new Error('remote deployment requires Linux root and Node 24')
  const controller = new AbortController()
  const interrupt = signal => controller.abort(new Error(`deployment interrupted: ${signal}`))
  const int = () => interrupt('SIGINT')
  const term = () => interrupt('SIGTERM')
  const hup = () => interrupt('SIGHUP')
  process.on('SIGINT', int)
  process.on('SIGTERM', term)
  process.on('SIGHUP', hup)
  try {
    const result = await deploy({ upload: args[0], bootstrap: args[1] === '--bootstrap', signal: controller.signal })
    console.log(JSON.stringify(result))
  } finally {
    process.off('SIGINT', int)
    process.off('SIGTERM', term)
    process.off('SIGHUP', hup)
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => {
    // Do not serialize captured PM2 output, environment, or nested command errors.
    console.error(error.message)
    process.exitCode = 1
  })
}
