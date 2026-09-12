#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { stat } from 'node:fs/promises'

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'inherit'] })
    let output = ''
    child.stdout.setEncoding('utf8').on('data', text => { output += text })
    child.once('error', reject)
    child.once('exit', code => code === 0 ? resolve(output) : reject(new Error(`${command} exited ${code}`)))
  })
}

const original = 'public/images/slides/main-02.mp4'
const output = 'public/images/slides/main-02-optimized.mp4'
await run('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y', '-i', original,
  '-map', '0:v:0', '-c:v', 'libx264', '-preset', 'veryslow',
  '-crf', '28', '-pix_fmt', 'yuv420p', '-video_track_timescale', '90000',
  '-movie_timescale', '90000', '-movflags', '+faststart', output,
])
const inspect = async path => JSON.parse(await run('ffprobe', [
  '-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=codec_name,width,height,r_frame_rate,duration,nb_frames',
  '-of', 'json', path,
])).streams[0]
const before = await inspect(original)
const after = await inspect(output)
assert.deepEqual(after, before, 'Keep the original codec, dimensions, duration and frame count')
console.log(JSON.stringify({
  originalBytes: (await stat(original)).size,
  optimizedBytes: (await stat(output)).size,
  stream: after,
}))
