import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execute = promisify(execFile)
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const server = 'root@172.237.29.96'
const repository = 'Heoooooon/doctor'
const proof = 'public/googlec8eaf265de8ba751.html'
const sha = /^[a-f0-9]{40}$/
const sshOptions = ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15']

async function run(command, args, cwd = root) {
  const result = await execute(command, args, { cwd, maxBuffer: 32 * 1024 * 1024 })
  return result.stdout.trim()
}

function requireCheck(condition, message) {
  if (!condition) throw new Error(message)
}

async function assertCheckoutUnchanged(commit, command) {
  const status = await command('git', ['status', '--porcelain=v1', '--untracked-files=all'])
  const branch = await command('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'])
  const head = await command('git', ['rev-parse', 'HEAD'])
  requireCheck(!status && branch === 'main' && head === commit,
    '배포 준비 중 작업본·브랜치·HEAD가 바뀌었습니다. 서버 연결 전에 중단합니다.')
}

/** Read-only gates; no build, upload, or SSH is allowed before these succeed. */
export async function preflight(command = run) {
  const status = await command('git', ['status', '--porcelain=v1', '--untracked-files=all'])
  requireCheck(!status, `미커밋 변경이 있어 배포를 중단합니다. 검증 변경을 먼저 보존·검토·커밋하세요.\n${status}`)
  const origin = await command('git', ['remote', 'get-url', 'origin'])
  requireCheck([
    'https://github.com/Heoooooon/doctor.git',
    'git@github.com:Heoooooon/doctor.git',
    'ssh://git@github.com/Heoooooon/doctor.git',
  ].includes(origin), '운영 저장소 Heoooooon/doctor가 아닙니다.')
  const branch = await command('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'])
  requireCheck(branch === 'main', '배포는 main 브랜치에서만 가능합니다.')
  const commit = await command('git', ['rev-parse', 'HEAD'])
  const tree = await command('git', ['rev-parse', 'HEAD^{tree}'])
  requireCheck(sha.test(commit) && sha.test(tree), '유효한 Git 커밋·트리를 확인하지 못했습니다.')
  // Fetch must succeed, even when a cached origin/main happens to match.
  await command('git', ['fetch', 'origin', 'refs/heads/main:refs/remotes/origin/main'])
  const published = await command('git', ['rev-parse', 'refs/remotes/origin/main'])
  requireCheck(commit === published, 'HEAD가 최신 origin/main과 다릅니다. 오래되거나 미푸시된 버전은 배포하지 않습니다.')
  const paths = (await command('git', ['ls-tree', '-r', '--name-only', commit])).split('\n')
  for (const required of [
    proof, 'pnpm-lock.yaml', 'scripts/deploy-vps.sh', 'scripts/deploy-vps.mjs',
    'scripts/deploy-remote.mjs', 'scripts/deploy-smoke.mjs',
  ]) requireCheck(paths.includes(required), `배포 커밋에 필수 파일이 없습니다: ${required}`)
  requireCheck(!paths.some(path => /(^|\/)\.env(?:\.|$)/.test(path) && !path.endsWith('.example')),
    '환경설정 파일이 Git에 포함돼 있습니다. 비밀값은 배포 아카이브에 넣지 않습니다.')
  const token = await command('git', ['show', `${commit}:${proof}`])
  requireCheck(token.trim() === 'google-site-verification: googlec8eaf265de8ba751.html',
    'Google 소유권 확인 파일이 변경되었거나 누락됐습니다.')
  await assertCheckoutUnchanged(commit, command)
  return { commit, tree }
}

export function parseOptions(args) {
  requireCheck(args.every(arg => ['--check', '--bootstrap', '--help'].includes(arg)),
    '사용법: ./scripts/deploy-vps.sh [--check | --bootstrap | --help]')
  requireCheck(new Set(args).size === args.length && args.length <= 1,
    '옵션은 하나만 사용하세요. --check는 서버를 변경하지 않습니다.')
  return { check: args.includes('--check'), bootstrap: args.includes('--bootstrap'), help: args.includes('--help') }
}

async function deploy(args) {
  const options = parseOptions(args)
  if (options.help) {
    console.log('사용법: ./scripts/deploy-vps.sh [--check | --bootstrap]\n--check: 작업본·origin/main 확인만 수행\n--bootstrap: 운영 기준이 없는 서버의 첫 전환(별도 승인 후)\n상세 절차: docs/ops-handoff.md')
    return
  }
  const revision = await preflight()
  console.log(`배포 대상: ${repository} main ${revision.commit}`)
  if (options.check) {
    console.log('배포 사전 조건 통과. 빌드·서버 검사·업로드는 실행하지 않았습니다.')
    return
  }
  console.log('로컬 테스트·빌드 검증 중')
  const tests = (await readdir(join(root, 'tests'))).filter(file => file.endsWith('.test.mts')).sort()
  requireCheck(tests.length > 0, '배포 전 테스트 파일을 찾지 못했습니다.')
  console.log(await run(process.execPath, ['--test', ...tests.map(file => `tests/${file}`)]))
  console.log(await run('pnpm', ['build']))
  const after = await preflight()
  requireCheck(after.commit === revision.commit, '검증 중 HEAD가 바뀌었습니다. 배포를 중단합니다.')

  const staging = await mkdtemp(join(tmpdir(), 'seoulegundc-deploy-'))
  try {
    const archive = join(staging, 'source.tar.gz')
    // Never upload the working tree, ignored files, node_modules, or the Mac build.
    await run('git', ['archive', '--format=tar.gz', `--output=${archive}`, revision.commit])
    const hash = createHash('sha256')
    let archiveBytes = 0
    for await (const chunk of createReadStream(archive)) {
      hash.update(chunk)
      archiveBytes += chunk.length
    }
    const manifest = {
      schemaVersion: 1, repository, ...revision,
      ancestors: (await run('git', ['rev-list', revision.commit])).split('\n'),
      archiveSha256: hash.digest('hex'),
      archiveBytes,
    }
    await writeFile(join(staging, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 })
    for (const file of ['deploy-remote.mjs', 'deploy-smoke.mjs']) {
      // Read the pinned commit, not a file another local editor can change mid-run.
      await writeFile(join(staging, file), `${await run('git', ['show', `${revision.commit}:scripts/${file}`])}\n`, { mode: 0o600 })
    }
    // Editors do not honor a deployment lock. Recheck at the transport boundary;
    // the pinned Git archive remains immutable even if an editor acts afterwards.
    await assertCheckoutUnchanged(revision.commit, run)
    const incoming = await run('ssh', [...sshOptions, server,
      'umask 077; mkdir -p /var/lib/seoulegundc-deploy/incoming && mktemp -d /var/lib/seoulegundc-deploy/incoming/upload.XXXXXXXX'])
    requireCheck(/^\/var\/lib\/seoulegundc-deploy\/incoming\/upload\.[a-zA-Z0-9]+$/.test(incoming),
      '서버 업로드 경로를 확인하지 못했습니다.')
    console.log(`격리된 업로드: ${incoming}`)
    await run('scp', [...sshOptions, archive, ...['manifest.json', 'deploy-remote.mjs', 'deploy-smoke.mjs'].map(file => join(staging, file)), `${server}:${incoming}/`])
    console.log(await run('ssh', [...sshOptions, server,
      `/usr/bin/node ${incoming}/deploy-remote.mjs ${incoming}${options.bootstrap ? ' --bootstrap' : ''}`]))
    console.log(`배포 완료: ${revision.commit}`)
  } finally {
    await rm(staging, { recursive: true, force: true })
  }
}

if (import.meta.main) {
  try {
    await deploy(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
