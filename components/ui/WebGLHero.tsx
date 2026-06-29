'use client'

import { useEffect, useRef } from 'react'

// ── Vertex shader ──────────────────────────────────────────────────────────
const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

// ── Fragment shader ────────────────────────────────────────────────────────
const FRAG = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float     u_t;           // slide transition 0 → 1
uniform vec2      u_mouse;       // normalized 0..1 (y already flipped)
uniform float     u_hover;       // 0..1 eased strength
uniform float     u_time;
uniform float     u_from_aspect; // image intrinsic width/height
uniform float     u_to_aspect;
uniform float     u_canvas_aspect; // canvas width/height

varying vec2 v_uv;

// object-fit: cover in UV space
vec2 coverUV(vec2 uv, float imgAspect, float canvasAspect) {
  vec2 c = uv - 0.5;
  if (canvasAspect > imgAspect) {
    c.y *= imgAspect / canvasAspect;
  } else {
    c.x *= canvasAspect / imgAspect;
  }
  return c + 0.5;
}

void main() {
  vec2 uv = v_uv;

  // ── cover-fit UV per image ────────────────────────────────
  vec2 fromUV = coverUV(uv, u_from_aspect, u_canvas_aspect);
  vec2 toUV   = coverUV(uv, u_to_aspect,   u_canvas_aspect);

  vec4 c0 = texture2D(u_from, fromUV);
  vec4 c1 = texture2D(u_to,   toUV);
  gl_FragColor = mix(c0, c1, smoothstep(0.0, 1.0, u_t));
}
`

// ── helpers ────────────────────────────────────────────────────────────────
function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return sh
}

function makeProgram(gl: WebGLRenderingContext) {
  const prog = gl.createProgram()!
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  return prog
}

interface TexEntry { tex: WebGLTexture; aspect: number }

function loadTexture(gl: WebGLRenderingContext, src: string): Promise<TexEntry> {
  return new Promise((resolve) => {
    const tex = gl.createTexture()!
    const img = new Image()
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      resolve({ tex, aspect: img.naturalWidth / img.naturalHeight })
    }
    img.src = src
  })
}

// ── component ──────────────────────────────────────────────────────────────
export interface WebGLHeroProps {
  images: string[]
  fromIndex: number
  toIndex: number
  transitionProgress: number // 0..1
}

export default function WebGLHero({ images, fromIndex, toIndex, transitionProgress }: WebGLHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // GL objects
  const glRef   = useRef<WebGLRenderingContext | null>(null)
  const progRef = useRef<WebGLProgram | null>(null)
  const texRef  = useRef<TexEntry[]>([])
  const canvasAspectRef = useRef(16 / 9)

  // cached uniform locations
  const uRef = useRef<Record<string, WebGLUniformLocation | null>>({})

  // live animation values (refs = no re-render)
  const mouse   = useRef({ x: 0.5, y: 0.5 })
  const targetM = useRef({ x: 0.5, y: 0.5 })
  const hover   = useRef(0)
  const targetH = useRef(0)
  const timeRef = useRef(0)
  const prevTS  = useRef(0)
  const rafRef  = useRef(0)

  // keep latest props inside render loop
  const propsRef = useRef({ fromIndex, toIndex, transitionProgress })
  useEffect(() => {
    propsRef.current = { fromIndex, toIndex, transitionProgress }
  }, [fromIndex, toIndex, transitionProgress])

  // ── WebGL init (runs once) ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' })
    if (!gl) return
    glRef.current = gl

    const prog = makeProgram(gl)
    gl.useProgram(prog)
    progRef.current = prog

    // full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )
    const posLoc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // bind sampler uniforms
    gl.uniform1i(gl.getUniformLocation(prog, 'u_from'), 0)
    gl.uniform1i(gl.getUniformLocation(prog, 'u_to'),   1)

    // cache the rest
    uRef.current = {
      t:            gl.getUniformLocation(prog, 'u_t'),
      mouse:        gl.getUniformLocation(prog, 'u_mouse'),
      hover:        gl.getUniformLocation(prog, 'u_hover'),
      time:         gl.getUniformLocation(prog, 'u_time'),
      fromAspect:   gl.getUniformLocation(prog, 'u_from_aspect'),
      toAspect:     gl.getUniformLocation(prog, 'u_to_aspect'),
      canvasAspect: gl.getUniformLocation(prog, 'u_canvas_aspect'),
    }

    // load all slide images as textures
    Promise.all(images.map((src) => loadTexture(gl, src))).then((txs) => {
      texRef.current = txs
    })

    // canvas resize → match CSS size × DPR
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = Math.round(canvas.clientWidth  * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      canvasAspectRef.current = canvas.clientWidth / (canvas.clientHeight || 1)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => ro.disconnect()
  // images won't change between mounts; intentional single-run
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // ── render loop (runs once; reads from refs) ──────────────────────────
  useEffect(() => {
    const loop = (ts: number) => {
      const dt = Math.min((ts - (prevTS.current || ts)) / 1000, 0.05)
      prevTS.current  = ts
      timeRef.current += dt


      const gl   = glRef.current
      const prog = progRef.current
      const txs  = texRef.current
      const u    = uRef.current

      if (gl && prog && txs.length === images.length) {
        const { fromIndex: fi, toIndex: ti, transitionProgress: tp } = propsRef.current
        const from = txs[fi] ?? txs[0]
        const to   = txs[ti] ?? txs[0]

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, from.tex)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, to.tex)

        gl.uniform1f(u.t!,            tp)
        gl.uniform2f(u.mouse!,        mouse.current.x, mouse.current.y)
        gl.uniform1f(u.hover!,        hover.current)
        gl.uniform1f(u.time!,         timeRef.current)
        gl.uniform1f(u.fromAspect!,   from.aspect)
        gl.uniform1f(u.toAspect!,     to.aspect)
        gl.uniform1f(u.canvasAspect!, canvasAspectRef.current)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
}
