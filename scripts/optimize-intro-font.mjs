#!/usr/bin/env node
// Rebuild the intro-only font after changing SplitText copy.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = new URL('../', import.meta.url)
const source = await readFile(new URL('components/IntroScreen.tsx', root), 'utf8')
const text = [...source.matchAll(/<SplitText\s+text="([^"]+)"/g)].map(match => match[1]).join('')
assert.ok(text.length > 0, 'No intro copy found for the font subset')
const temporary = await mkdtemp(join(tmpdir(), 'egun-intro-font-'))
const output = new URL('public/fonts/egun-intro.woff2', root)

try {
  const response = await fetch('https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-9Black.woff2', {
    signal: AbortSignal.timeout(30_000),
  })
  assert.equal(response.status, 200)
  const original = join(temporary, 'Paperlogy-9Black.woff2')
  await writeFile(original, new Uint8Array(await response.arrayBuffer()))
  await mkdir(new URL('public/fonts/', root), { recursive: true })
  const args = [
    '--with', 'brotli', '--from', 'fonttools', 'pyftsubset', original,
    `--text=${text}`, '--flavor=woff2', `--output-file=${output.pathname}`,
    '--layout-features=*', '--name-IDs=*', '--name-languages=*', '--notdef-glyph',
  ]
  await new Promise((resolve, reject) => {
    const child = spawn('uvx', args, { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`pyftsubset exit ${code}`)))
  })
  console.log(JSON.stringify({
    output: output.pathname,
    originalBytes: (await stat(original)).size,
    subsetBytes: (await stat(output)).size,
    uniqueCharacters: [...new Set(text)].length,
  }))
} finally {
  await rm(temporary, { recursive: true, force: true })
}
