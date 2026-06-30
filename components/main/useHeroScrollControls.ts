'use client'

import { useEffect, useRef, type RefObject } from 'react'
import type { HeroSlide } from './heroSlides'

const HERO_TOP_TOLERANCE = 8
const WHEEL_STEP_THRESHOLD = 6
const INPUT_LOCK_MS = 460
const RESUME_AUTO_MS = 1600
const SWIPE_THRESHOLD = 40

type HeroScrollState = {
  readonly currentRef: RefObject<number>
  readonly isMobile: boolean
  readonly isPausedRef: RefObject<boolean>
  readonly sectionRef: RefObject<HTMLElement | null>
  readonly slidesRef: RefObject<readonly HeroSlide[]>
  readonly startTimeRef: RefObject<number>
}

type HeroScrollActions = {
  readonly goTo: (index: number) => void
  readonly scrollPastLastSlide: () => void
}

type HeroScrollControlsOptions = HeroScrollState & HeroScrollActions

function getDirection(value: number): -1 | 0 | 1 {
  if (value > 0) return 1
  if (value < 0) return -1
  return 0
}

function canControlSlide(direction: -1 | 1, current: number, total: number): boolean {
  const last = total - 1
  if (direction > 0 && current >= last) return false
  if (direction < 0 && current <= 0) return false
  return true
}

export function useHeroScrollControls({
  currentRef,
  goTo,
  isMobile,
  isPausedRef,
  scrollPastLastSlide,
  sectionRef,
  slidesRef,
  startTimeRef,
}: HeroScrollControlsOptions): void {
  const actionsRef = useRef<HeroScrollActions>({
    goTo,
    scrollPastLastSlide,
  })
  actionsRef.current = {
    goTo,
    scrollPastLastSlide,
  }

  useEffect(() => {
    const hero = sectionRef.current

    // ── 모바일: 가로 스와이프로만 슬라이드 전환 (세로 스크롤은 페이지에 그대로 위임) ──
    // window 스크롤값을 전혀 읽지 않으므로 주소창/하단바 출몰로 스크롤이 튀어도 영향 없음.
    if (isMobile) {
      if (!hero) return

      let startX: number | null = null
      let startY: number | null = null
      let swiped = false

      const onTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0]
        if (!touch) return
        startX = touch.clientX
        startY = touch.clientY
        swiped = false
      }

      const onTouchMove = (event: TouchEvent) => {
        if (startX === null || startY === null || swiped) return
        const touch = event.touches[0]
        if (!touch) return
        const dx = touch.clientX - startX
        const dy = touch.clientY - startY
        // 가로 이동이 충분하고 세로보다 우세할 때만 슬라이드 전환
        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return
        swiped = true
        const total = slidesRef.current.length
        const direction = dx < 0 ? 1 : -1 // 왼쪽으로 밀면 다음
        const nextIndex = (currentRef.current + direction + total) % total
        actionsRef.current.goTo(nextIndex)
      }

      const onTouchEnd = () => {
        startX = null
        startY = null
        swiped = false
      }

      hero.addEventListener('touchstart', onTouchStart, { passive: true })
      hero.addEventListener('touchmove', onTouchMove, { passive: true })
      hero.addEventListener('touchend', onTouchEnd, { passive: true })
      hero.addEventListener('touchcancel', onTouchEnd, { passive: true })

      return () => {
        hero.removeEventListener('touchstart', onTouchStart)
        hero.removeEventListener('touchmove', onTouchMove)
        hero.removeEventListener('touchend', onTouchEnd)
        hero.removeEventListener('touchcancel', onTouchEnd)
      }
    }

    // ── 데스크탑: 휠로 슬라이드 전환, 마지막 슬라이드 이후 다음 섹션으로 스크롤 ──
    const desktop = document.getElementById('home-desktop')
    let resumeTimer: number | undefined

    const pauseAuto = () => {
      isPausedRef.current = true
      if (resumeTimer) window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => {
        isPausedRef.current = false
        startTimeRef.current = Date.now()
      }, RESUME_AUTO_MS)
    }

    let wheelLock = false
    const lockWheel = () => {
      wheelLock = true
      window.setTimeout(() => {
        wheelLock = false
      }, INPUT_LOCK_MS)
    }

    const moveSlide = (direction: -1 | 1) => {
      actionsRef.current.goTo(currentRef.current + direction)
      pauseAuto()
    }

    const onWheel = (event: WheelEvent) => {
      if (!desktop || desktop.scrollTop > HERO_TOP_TOLERANCE) return
      const direction = getDirection(event.deltaY)
      if (direction === 0) return

      const current = currentRef.current
      const total = slidesRef.current.length
      if (!canControlSlide(direction, current, total)) {
        if (direction > 0 && current >= total - 1) {
          event.preventDefault()
          if (wheelLock || Math.abs(event.deltaY) < WHEEL_STEP_THRESHOLD) return
          lockWheel()
          actionsRef.current.scrollPastLastSlide()
        }
        return
      }

      event.preventDefault()
      if (wheelLock || Math.abs(event.deltaY) < WHEEL_STEP_THRESHOLD) return
      lockWheel()
      moveSlide(direction)
    }

    desktop?.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      desktop?.removeEventListener('wheel', onWheel)
      window.removeEventListener('wheel', onWheel)
      if (resumeTimer) window.clearTimeout(resumeTimer)
    }
  }, [
    currentRef,
    isMobile,
    isPausedRef,
    sectionRef,
    slidesRef,
    startTimeRef,
  ])
}
