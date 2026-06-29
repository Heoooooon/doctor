'use client'

import { useEffect, useRef } from 'react'

// 스냅할 챕터 순서 (섹션 id 기준)
const SECTION_IDS = [
  'philosophy',
  'doctor-intro',
  'doctors',
  'lee-jaesung',
  'jung-chaeyun',
  'yoo-suhyun',
  'park-jiwon',
  'baek-seola',
  'schedule',
  'interior',
  'lab',
  'access',
]

const THRESHOLD = 0.6   // 60% 이상 지나면 다음 챕터로 스냅
const DEBOUNCE_MS = 180 // 스크롤 멈춘 후 판단까지 대기 (ms)
const COOLDOWN_MS = 700 // 스냅 애니메이션 중 재진입 방지

export default function AboutScrollSnap() {
  const snappingRef = useRef(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const getOffset = () => {
      const header = document.querySelector('header') as HTMLElement | null
      const anchorNav = document.querySelector('nav[aria-label="페이지 내 이동"]') as HTMLElement | null
      return (header?.offsetHeight ?? 64) + (anchorNav?.offsetHeight ?? 44)
    }

    const getSections = () =>
      SECTION_IDS
        .map(id => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)

    const snapTo = (y: number) => {
      snappingRef.current = true
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
      setTimeout(() => { snappingRef.current = false }, COOLDOWN_MS)
    }

    const checkAndSnap = () => {
      if (snappingRef.current) return

      const offset = getOffset()
      // 실제로 사용자에게 보이는 콘텐츠 상단 위치
      const viewportTop = window.scrollY + offset
      const sections = getSections()

      for (let i = 0; i < sections.length; i++) {
        const s = sections[i]
        const sTop = s.offsetTop
        const sHeight = s.offsetHeight

        if (viewportTop >= sTop && viewportTop < sTop + sHeight) {
          const progress = (viewportTop - sTop) / sHeight

          if (progress >= THRESHOLD && i < sections.length - 1) {
            // 60% 초과 → 다음 챕터 상단으로 스냅
            snapTo(sections[i + 1].offsetTop - offset)
          }
          break
        }
      }
    }

    const handleScroll = () => {
      if (snappingRef.current) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(checkAndSnap, DEBOUNCE_MS)
    }

    // AnchorNav 클릭 시 스냅 일시 비활성화
    const handleAnchorClick = () => {
      snappingRef.current = true
      setTimeout(() => { snappingRef.current = false }, 1500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('about-anchor-scroll', handleAnchorClick)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('about-anchor-scroll', handleAnchorClick)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return null
}
