'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -100, y: -100 })
  const targetRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(false) // 클릭 압축 효과

  useEffect(() => {
    // 터치 기기에서는 커서 비활성화
    if (typeof window === 'undefined') return
    if (window.matchMedia('(hover: none)').matches) return

    setVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseDown = () => setActive(true)
    const handleMouseUp = () => setActive(false)

    const handleMouseEnter = () => setVisible(true)
    const handleMouseLeave = () => setVisible(false)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    document.documentElement.addEventListener('mouseenter', handleMouseEnter)

    // requestAnimationFrame 기반 부드러운 이동 (lerp)
    const LERP = 0.18

    const loop = () => {
      const cur = posRef.current
      const tgt = targetRef.current

      cur.x += (tgt.x - cur.x) * LERP
      cur.y += (tgt.y - cur.y) * LERP

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cur.x}px, ${cur.y}px) translate(-50%, -50%)`
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
      style={{ transition: 'opacity 0.2s' }}
    >
      <img
        src="/images/logo/snu-logo.png"
        alt=""
        className={`w-8 h-8 opacity-50 transition-transform duration-150 ${
          active ? 'scale-75' : 'scale-100'
        }`}
      />
    </div>
  )
}
