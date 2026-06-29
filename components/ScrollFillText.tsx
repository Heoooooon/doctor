'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

interface ScrollFillTextProps {
  children: ReactNode
  className?: string
  /** 시작(흐린) 색 */
  from?: string
  /** 채워지는(또렷한) 색 */
  to?: string
  /** 렌더 태그 (기본 p) */
  as?: ElementType
}

/**
 * 스크롤에 따라 텍스트가 단어 단위로 색이 차오르는 효과 (aventuradentalarts.com 의 fill-by-scroll).
 * - GSAP SplitText + ScrollTrigger(scrub) 기반.
 * - 모션 최소화 선호 시 즉시 to 색으로 고정.
 * - 폰트(Pretendard) 로드 후 분할해 레이아웃 흔들림 방지.
 */
export default function ScrollFillText({
  children,
  className,
  from = '#cbd5e1',
  to = '#2B2D42',
  as: Tag = 'p',
}: ScrollFillTextProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.style.color = to
        return
      }

      let split: SplitText | null = null

      const run = () => {
        split = new SplitText(el, { type: 'words' })
        gsap.set(split.words, { color: from })
        gsap.to(split.words, {
          color: to,
          ease: 'none',
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 60%',
            scrub: true,
          },
        })
        ScrollTrigger.refresh()
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
