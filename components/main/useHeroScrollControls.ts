'use client'

import { useEffect, useRef, type RefObject } from 'react'
import type { HeroSlide } from './heroSlides'

const HERO_TOP_TOLERANCE = 8
const WHEEL_STEP_THRESHOLD = 6
const INPUT_LOCK_MS = 720
const RESUME_AUTO_MS = 1600

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

function getMobileSlideIndex(hero: HTMLElement, total: number): number {
  const viewportHeight = window.innerHeight || hero.clientHeight
  const scrollableDistance = Math.max(1, hero.offsetHeight - viewportHeight)
  const offset = Math.min(Math.max(-hero.getBoundingClientRect().top, 0), scrollableDistance)
  const progress = offset / scrollableDistance
  return Math.min(total - 1, Math.max(0, Math.round(progress * (total - 1))))
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
    const desktop = document.getElementById('home-desktop')
    const hero = sectionRef.current
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
      if (isMobile) return
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

    let mobileScrollRaf = 0
    const syncMobileSlide = () => {
      mobileScrollRaf = 0
      if (!isMobile || !hero) return

      const rect = hero.getBoundingClientRect()
      const isInHeroRange = rect.bottom > window.innerHeight && rect.top <= 0
      isPausedRef.current = isInHeroRange
      if (!isInHeroRange) return

      const next = getMobileSlideIndex(hero, slidesRef.current.length)
      if (next !== currentRef.current) actionsRef.current.goTo(next)
      isPausedRef.current = true
    }

    const onMobileScroll = () => {
      if (!isMobile || mobileScrollRaf) return
      mobileScrollRaf = window.requestAnimationFrame(syncMobileSlide)
    }

    desktop?.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onMobileScroll, { passive: true })
    window.addEventListener('resize', onMobileScroll, { passive: true })
    syncMobileSlide()

    return () => {
      desktop?.removeEventListener('wheel', onWheel)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onMobileScroll)
      window.removeEventListener('resize', onMobileScroll)
      if (mobileScrollRaf) window.cancelAnimationFrame(mobileScrollRaf)
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
