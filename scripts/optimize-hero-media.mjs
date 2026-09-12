#!/usr/bin/env node
// Run: node scripts/optimize-hero-media.mjs
// Use Next's already-installed sharp; never overwrite the original photographs.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next/package.json'))('sharp')
const directory = new URL('../public/images/slides/', import.meta.url)
const originals = ['slide-3.jpg', 'slide-4.webp', 'slide-5.png', 'slide-6.jpg']
const results = await Promise.all(originals.map(async original => {
  const input = fileURLToPath(new URL(original, directory))
  const metadata = await sharp(input).metadata()
  const variants = []
  for (const width of [960, Math.min(1920, metadata.width)]) {
    const name = `${original.replace(/\.[^.]+$/, '')}-hero-${width}.webp`
    const output = fileURLToPath(new URL(name, directory))
    // Width only: retain the complete frame and aspect ratio, with no upscale/crop.
    const info = await sharp(input).rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(output)
    variants.push({ name, width: info.width, height: info.height, bytes: info.size })
  }
  return { original, width: metadata.width, height: metadata.height, bytes: (await stat(input)).size, variants }
}))
const desktopBytes = results.reduce((sum, result) => sum + result.variants.at(-1).bytes, 0)
const smallBytes = results.reduce((sum, result) => sum + result.variants[0].bytes, 0)
assert.ok(desktopBytes < 600_000, `Hero still budget exceeded: ${desktopBytes} bytes`)
console.log(JSON.stringify({ results, desktopBytes, smallBytes }, null, 2))
