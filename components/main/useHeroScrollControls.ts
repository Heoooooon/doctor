'use client'

import { useEffect, useRef, type RefObject } from 'react'
import type { HeroPhase, HeroSlide } from './heroSlides'

const HERO_TOP_TOLERANCE = 8
const WHEEL_STEP_THRESHOLD = 6
const INPUT_LOCK_MS = 460
const RESUME_AUTO_MS = 1600
const SWIPE_THRESHOLD = 40

type HeroScrollState = {
  readonly currentRef: RefObject<number>
  readonly isMobile: boolean
  readonly isPausedRef: RefObject<boolean>
  readonly phaseRef: RefObject<HeroPhase>
  readonly sectionRef: RefObject<HTMLElement | null>
  readonly slidesRef: RefObject<readonly HeroSlide[]>
  readonly startTimeRef: RefObject<number>
}

type HeroScrollActions = {
  readonly enterSlides: () => void
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
  enterSlides,
  goTo,
  isMobile,
  isPausedRef,
  phaseRef,
  scrollPastLastSlide,
  sectionRef,
  slidesRef,
  startTimeRef,
}: HeroScrollControlsOptions): void {
  const actionsRef = useRef<HeroScrollActions>({
    enterSlides,
    goTo,
    scrollPastLastSlide,
  })
  actionsRef.current = {
    enterSlides,
    goTo,
    scrollPastLastSlide,
  }

  useEffect(() => {
    const hero = sectionRef.current

    // ── 모바일: 터치 제스처로 슬라이드 전환 ──
    // 가로 스와이프 = 좌우 순환, 세로(위로 밀기) 스와이프 = 다음 슬라이드.
    // window 스크롤값을 전혀 읽지 않으므로(제스처만 사용) 카톡 인앱 브라우저의
    // 주소창/하단바 출몰로 스크롤이 튀어도 영향 없음. 마지막 슬라이드에서 위로
    // 밀면 소비하지 않고 페이지 스크롤에 그대로 위임한다.
    if (isMobile) {
      if (!hero) return

      let startX: number | null = null
      let startY: number | null = null
      let swiped = false
      let consumingScroll = false

      const onTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0]
        if (!touch) return
        startX = touch.clientX
        startY = touch.clientY
        swiped = false
        consumingScroll = false
      }

      const onTouchMove = (event: TouchEvent) => {
        if (startX === null || startY === null) return
        // 이번 제스처에서 이미 슬라이드를 넘겼으면 남은 드래그 동안 페이지 스크롤만 막음
        if (swiped) {
          if (consumingScroll && event.cancelable) event.preventDefault()
          return
        }
        const touch = event.touches[0]
        if (!touch) return
        const dx = touch.clientX - startX
        const dy = touch.clientY - startY

        // 가로 이동이 충분하고 세로보다 우세하면 좌우 순환 전환
        if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          swiped = true
          if (phaseRef.current === 'intro') {
            actionsRef.current.enterSlides()
            return
          }
          const total = slidesRef.current.length
          const direction = dx < 0 ? 1 : -1 // 왼쪽으로 밀면 다음
          const nextIndex = (currentRef.current + direction + total) % total
          actionsRef.current.goTo(nextIndex)
          return
        }

        // 세로 이동이 충분하고 가로보다 우세하면 위로 밀기 = 다음 슬라이드
        if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) <= Math.abs(dx)) return
        // 히어로가 화면 상단에 있을 때만 개입 (아래 섹션에서 되돌아오는 중이면 통과)
        if (hero.getBoundingClientRect().top < -HERO_TOP_TOLERANCE) return
        const direction = dy < 0 ? 1 : -1 // 위로 밀면 다음
        // 인트로 중 위로 스와이프 → 진짜 1번 슬라이드로 진입
        if (phaseRef.current === 'intro') {
          if (direction < 0) return
          swiped = true
          consumingScroll = true
          if (event.cancelable) event.preventDefault()
          actionsRef.current.enterSlides()
          return
        }
        if (!canControlSlide(direction, currentRef.current, slidesRef.current.length)) return
        swiped = true
        consumingScroll = true
        if (event.cancelable) event.preventDefault()
        actionsRef.current.goTo(currentRef.current + direction)
      }

      const onTouchEnd = () => {
        startX = null
        startY = null
        swiped = false
        consumingScroll = false
      }

      hero.addEventListener('touchstart', onTouchStart, { passive: true })
      hero.addEventListener('touchmove', onTouchMove, { passive: false })
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

      // 인트로 중 아래로 휠 → 진짜 1번 슬라이드로 진입
      if (phaseRef.current === 'intro') {
        event.preventDefault()
        if (direction < 0 || wheelLock || Math.abs(event.deltaY) < WHEEL_STEP_THRESHOLD) return
        lockWheel()
        actionsRef.current.enterSlides()
        pauseAuto()
        return
      }

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
