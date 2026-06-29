'use client'

import { useEffect, useRef, useState } from 'react'

/** ref에서 위로 올라가며 실제 스크롤되는 조상(데스크탑 #home-desktop 등)을 찾는다. 없으면 뷰포트. */
function findScrollRoot(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null
  while (node) {
    const oy = getComputedStyle(node).overflowY
    if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return null
}

/**
 * 스크롤 진입 시 페이드인(+살짝 상승). 위/아래 양방향 모두 매끄럽게 토글된다.
 * `threshold`(0~1)가 클수록 더 깊이 들어와야 드러난다.
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 모션 최소화 선호 시 즉시 표시(애니메이션 없음)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }

    const root = findScrollRoot(el)
    const margin = Math.round(Math.min(Math.max(threshold, 0), 0.4) * 100)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setIsVisible(entry.isIntersecting)
      },
      {
        root,
        // 하단을 threshold만큼 끌어올려 요소가 그 선을 넘어야 드러나게 한다.
        rootMargin: `0px 0px -${margin}% 0px`,
        threshold: 0,
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
