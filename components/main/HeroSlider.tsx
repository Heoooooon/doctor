'use client'

import { useEffect, useId, useRef, useState } from 'react'
import HeroForeground from './HeroForeground'
import { HeroSlideMedia } from './HeroSlideMedia'
import { HeroSliderIndicators } from './HeroSliderIndicators'
import { isMobileHeroViewport, scrollHeroToNextLayout } from './heroScroll'
import {
  IMAGE_INTERVAL,
  LAST_SLIDE_SCROLL_DELAY,
  MOBILE_SLIDES,
  WEB_SLIDES,
  getVideoPlaybackRate,
  type HeroSlide,
} from './heroSlides'

export default function HeroSlider() {
  const [current,  setCurrent]  = useState(0)
  const [progress, setProgress] = useState(0)

  const [isMobile, setIsMobile] = useState(false)
  const heroDomId = useId()

  const startTimeRef     = useRef<number>(Date.now())
  const rafRef           = useRef<number | null>(null)
  const isPausedRef      = useRef(false)
  const currentRef       = useRef(0)
  const videoRef         = useRef<HTMLVideoElement | null>(null)
  const sectionRef       = useRef<HTMLElement | null>(null)
  const videoAdvancedRef = useRef(false)
  const nextSectionTimerRef = useRef<number | null>(null)
  const nextSectionScrollRef = useRef(false)

  const slidesRef = useRef<readonly HeroSlide[]>(WEB_SLIDES)

  const advanceFrom = (from: number) => {
    const next = (from + 1) % slidesRef.current.length
    setCurrent(next)
    currentRef.current = next
    setProgress(0)
    startTimeRef.current = Date.now()
    videoAdvancedRef.current = false
    nextSectionScrollRef.current = false
  }

  const goTo = (index: number) => {
    isPausedRef.current = false
    setCurrent(index)
    currentRef.current = index
    setProgress(0)
    startTimeRef.current = Date.now()
    videoAdvancedRef.current = false
    nextSectionScrollRef.current = false
    const targetSlide = slidesRef.current[index]
    if (targetSlide?.isVideo) {
      window.requestAnimationFrame(() => {
        const video = videoRef.current
        if (!video) return
        video.currentTime = 0
        video.playbackRate = getVideoPlaybackRate(targetSlide)
        void video.play().catch(() => undefined)
      })
    }
  }

  const openConsult = () => {
    window.dispatchEvent(new Event('egun:open-consult'))
  }

  const scrollPastLastSlide = () => {
    if (isMobileHeroViewport()) {
      advanceFrom(currentRef.current)
      return
    }

    if (nextSectionScrollRef.current) return
    nextSectionScrollRef.current = true
    isPausedRef.current = true
    setProgress(1)
    const hero = sectionRef.current
    if (hero) scrollHeroToNextLayout(hero)
  }

  // 스크롤/스와이프 핸들러가 최신 goTo를 참조하도록 ref로 보관
  const goToRef = useRef(goTo)
  goToRef.current = goTo

  const handleVideoEnded = () => {
    if (videoAdvancedRef.current) return
    videoAdvancedRef.current = true
    const last = slidesRef.current.length - 1
    if (currentRef.current >= last) {
      scrollPastLastSlide()
      return
    }
    advanceFrom(currentRef.current)
  }

  useEffect(() => {
    const resetHero = () => goTo(0)
    window.addEventListener('egun:hero-reset', resetHero)
    return () => window.removeEventListener('egun:hero-reset', resetHero)
  }, [])

  // 모바일 감지
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // 플랫폼 전환 시 슬라이드 셋 교체 + 첫 슬라이드로 리셋
  useEffect(() => {
    slidesRef.current = isMobile ? MOBILE_SLIDES : WEB_SLIDES
    setCurrent(0)
    currentRef.current = 0
    setProgress(0)
    startTimeRef.current = Date.now()
    videoAdvancedRef.current = false
    nextSectionScrollRef.current = false
  }, [isMobile])

  useEffect(() => {
    if (nextSectionTimerRef.current !== null) {
      window.clearTimeout(nextSectionTimerRef.current)
      nextSectionTimerRef.current = null
    }

    const last = slidesRef.current.length - 1
    const activeSlide = slidesRef.current[current]
    if (current !== last) {
      nextSectionScrollRef.current = false
      return undefined
    }

    if (activeSlide?.isVideo) {
      return undefined
    }

    nextSectionTimerRef.current = window.setTimeout(() => {
      if (currentRef.current !== last || nextSectionScrollRef.current) return
      scrollPastLastSlide()
    }, LAST_SLIDE_SCROLL_DELAY)

    return () => {
      if (nextSectionTimerRef.current !== null) {
        window.clearTimeout(nextSectionTimerRef.current)
        nextSectionTimerRef.current = null
      }
    }
  }, [current, isMobile])

  // 슬라이드 진행 루프
  useEffect(() => {
    const tick = () => {
      if (!isPausedRef.current) {
        const activeSlide = slidesRef.current[currentRef.current]
        if (activeSlide?.isVideo) {
          const vid = videoRef.current
          if (vid && vid.duration > 0) {
            setProgress(vid.currentTime / vid.duration)
          }
        } else {
          const slideInterval = slidesRef.current[currentRef.current]?.interval ?? IMAGE_INTERVAL
          const elapsed = Date.now() - startTimeRef.current
          const p = Math.min(elapsed / slideInterval, 1)
          setProgress(p)

          if (p >= 1) {
            const last = slidesRef.current.length - 1
            if (currentRef.current >= last) {
              scrollPastLastSlide()
            } else {
              const next = currentRef.current + 1
              setCurrent(next)
              currentRef.current = next
              setProgress(0)
              startTimeRef.current = Date.now()
              nextSectionScrollRef.current = false
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    const desktop = document.getElementById('home-desktop')
    let resumeTimer: number | undefined

    const pauseAuto = () => {
      isPausedRef.current = true
      if (resumeTimer) window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => {
        isPausedRef.current = false
        startTimeRef.current = Date.now()
      }, 1600)
    }

    // 경계가 아니면 가로채야 하는지 판정
    const shouldHijack = (dir: number) => {
      const last = slidesRef.current.length - 1
      const cur = currentRef.current
      if (dir > 0 && cur >= last) return false // 마지막 → 다음 섹션
      if (dir < 0 && cur <= 0) return false    // 첫 슬라이드 위로 → 그대로
      return true
    }

    // 데스크탑: wheel
    let wheelLock = false
    const onWheel = (e: WheelEvent) => {
      if (!desktop || desktop.scrollTop > 8) return
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0
      if (dir === 0) return
      if (!shouldHijack(dir)) {
        const last = slidesRef.current.length - 1
        if (dir > 0 && currentRef.current >= last) {
          e.preventDefault()
          if (wheelLock || Math.abs(e.deltaY) < 6) return
          wheelLock = true
          scrollPastLastSlide()
          window.setTimeout(() => { wheelLock = false }, 720)
        }
        return
      }
      e.preventDefault()
      if (wheelLock || Math.abs(e.deltaY) < 6) return
      wheelLock = true
      pauseAuto()
      goToRef.current(currentRef.current + dir)
      window.setTimeout(() => { wheelLock = false }, 720)
    }

    desktop?.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      desktop?.removeEventListener('wheel', onWheel)
      window.removeEventListener('wheel', onWheel)
      if (resumeTimer) window.clearTimeout(resumeTimer)
    }
  }, [isMobile])

  const slides = isMobile ? MOBILE_SLIDES : WEB_SLIDES
  const slide  = slides[current] ?? slides[0]

  return (
    <section
      id={`main-hero-${heroDomId.replace(/:/g, '')}`}
      ref={sectionRef}
      className={`relative h-dvh md:h-screen w-full overflow-hidden ${slide.isVideo ? 'bg-black' : 'bg-white'}`}
    >
      <HeroSlideMedia
        slides={slides}
        slide={slide}
        current={current}
        isMobile={isMobile}
        videoRef={videoRef}
        onVideoEnded={handleVideoEnded}
      />

      <HeroForeground
        current={current}
        onConsultClick={openConsult}
      />

      <HeroSliderIndicators
        slides={slides}
        current={current}
        progress={progress}
        onGoTo={goTo}
      />

    </section>
  )
}
