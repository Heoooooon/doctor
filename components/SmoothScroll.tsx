'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * 데스크탑 하위 페이지에 부드러운 관성 스크롤(Lenis)을 적용하고
 * GSAP ScrollTrigger와 동기화한다.
 *
 * - 홈(/)·소개(/about)는 자체 스크롤 하이재킹(HeroSlider 휠 / AboutScrollSnap)이 있어
 *   SiteShell에서 마운트를 제외한다.
 * - 터치 기기(hover:none)·모션 최소화 선호 시에는 네이티브 스크롤을 유지한다.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // 앵커/모달이 Lenis를 막아야 할 때 data-lenis-prevent 로 예외 처리 가능
    })

    // ScrollTrigger를 Lenis 스크롤에 맞춰 갱신
    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    // Lenis를 GSAP 틱에 연결 (rAF 단일화)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [])

  return null
}
