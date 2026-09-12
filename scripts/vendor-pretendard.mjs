#!/usr/bin/env node
// Download the pinned, OFL-licensed upstream subsets. CSS stays source-controlled.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2-dynamic-subset/'
const directory = new URL('../public/fonts/pretendard-v1.3.9/', import.meta.url)
await mkdir(directory, { recursive: true })
let next = 0
let bytes = 0
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next < 92) {
    const index = next++
    const name = `PretendardVariable.subset.${index}.woff2`
    const response = await fetch(base + name, { signal: AbortSignal.timeout(30_000) })
    assert.equal(response.status, 200, name)
    const buffer = Buffer.from(await response.arrayBuffer())
    assert.equal(buffer.subarray(0, 4).toString(), 'wOF2', name)
    await writeFile(new URL(name, directory), buffer)
    bytes += buffer.length
  }
}))
console.log(JSON.stringify({ subsets: next, bytes, directory: directory.pathname }))
