'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 국소 힌트 커서 (aventuradentalarts.com 의 data-cursor-place 를 보수적으로 차용).
 * - 전역 마우스 커서는 건드리지 않는다.
 * - `data-cursor-hint="라벨"` 요소 위에 올렸을 때만 라벨 알약이 커서를 따라온다.
 * - 터치 기기·모션 최소화 선호 시 완전 비활성.
 */
export default function HoverHintCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const pos = { x: -100, y: -100 }
    const tgt = { x: -100, y: -100 }
    let raf = 0

    const onMove = (e: MouseEvent) => {
      tgt.x = e.clientX
      tgt.y = e.clientY
      const hinted = (e.target as HTMLElement | null)?.closest('[data-cursor-hint]') as HTMLElement | null
      setLabel(hinted?.getAttribute('data-cursor-hint') ?? null)
    }

    const loop = () => {
      pos.x += (tgt.x - pos.x) * 0.2
      pos.y += (tgt.y - pos.y) * 0.2
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9998] hidden md:block transition-opacity duration-200"
      style={{ opacity: label ? 1 : 0 }}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-[#0080C8] text-white text-[13px] font-semibold px-4 h-10 shadow-[0_8px_24px_rgba(0,128,200,0.45)]">
        {label}
      </span>
    </div>
  )
}
