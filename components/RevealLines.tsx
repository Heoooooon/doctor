'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

interface RevealLinesProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

/**
 * 제목을 줄 단위로 마스크 + 아래→위 슬라이드 등장 (aventuradentalarts.com 의 text-by-lines).
 * 진입 시 1회 실행. 모션 최소화 선호 시 즉시 표시.
 */
export default function RevealLines({ children, className, as: Tag = 'h2' }: RevealLinesProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      let split: SplitText | null = null

      const run = () => {
        split = new SplitText(el, { type: 'lines', mask: 'lines' })
        gsap.from(split.lines, {
          yPercent: 120,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      }

      if (document.fonts?.ready) {
        document.fonts.ready.then(run)
      } else {
        run()
      }

      return () => split?.revert()
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
