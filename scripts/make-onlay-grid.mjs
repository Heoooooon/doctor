import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const treatDir = path.join(__dirname, '..', 'public', 'images', 'treatments')

const inputs = [
  path.join(treatDir, 'preserve_treat (1).jpg'),
  path.join(treatDir, 'preserve_treat (3).jpg'),
  path.join(treatDir, 'preserve_treat (4).jpg'),
  path.join(treatDir, 'preserve_treat (6).jpg'),
]

const CELL_W = 960
const CELL_H = 540

async function resizeCell(filePath) {
  return sharp(filePath)
    .resize(CELL_W, CELL_H, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
    .toBuffer()
}

const [tl, tr, bl, br] = await Promise.all(inputs.map(resizeCell))

const topRow = await sharp({
  create: { width: CELL_W * 2, height: CELL_H, channels: 3, background: { r: 255, g: 255, b: 255 } },
})
  .composite([
    { input: tl, left: 0, top: 0 },
    { input: tr, left: CELL_W, top: 0 },
  ])
  .jpeg({ quality: 88 })
  .toBuffer()

const bottomRow = await sharp({
  create: { width: CELL_W * 2, height: CELL_H, channels: 3, background: { r: 255, g: 255, b: 255 } },
})
  .composite([
    { input: bl, left: 0, top: 0 },
    { input: br, left: CELL_W, top: 0 },
  ])
  .jpeg({ quality: 88 })
  .toBuffer()

const out = path.join(treatDir, 'onlay-grid.jpg')
await sharp({
  create: { width: CELL_W * 2, height: CELL_H * 2, channels: 3, background: { r: 255, g: 255, b: 255 } },
})
  .composite([
    { input: topRow, left: 0, top: 0 },
    { input: bottomRow, left: 0, top: CELL_H },
  ])
  .jpeg({ quality: 88 })
  .toFile(out)

console.log('Created:', out)
