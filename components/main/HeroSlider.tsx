'use client'

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import HeroForeground from './HeroForeground'
import { HeroSlideMedia } from './HeroSlideMedia'
import { HeroSliderIndicators } from './HeroSliderIndicators'
import { scrollHeroToNextLayout } from './heroScroll'
import {
  IMAGE_INTERVAL,
  LAST_SLIDE_SCROLL_DELAY,
  MOBILE_SLIDES,
  WEB_SLIDES,
  getVideoPlaybackRate,
  type HeroSlide,
} from './heroSlides'
import { useHeroScrollControls } from './useHeroScrollControls'

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

  const scrollToMobileSlide = (index: number) => {
    const hero = sectionRef.current
    if (!isMobile || !hero) return

    const viewportHeight = window.innerHeight || hero.clientHeight
    const scrollableDistance = Math.max(0, hero.offsetHeight - viewportHeight)
    const segment = scrollableDistance / Math.max(1, slidesRef.current.length - 1)
    const top = hero.getBoundingClientRect().top + window.scrollY + segment * index
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const goToFromIndicator = (index: number) => {
    goTo(index)
    scrollToMobileSlide(index)
  }

  const scrollPastLastSlide = () => {
    if (nextSectionScrollRef.current) return
    nextSectionScrollRef.current = true
    isPausedRef.current = true
    setProgress(1)
    const hero = sectionRef.current
    if (hero) scrollHeroToNextLayout(hero)
  }

  const handleVideoEnded = () => {
    if (videoAdvancedRef.current) return
    videoAdvancedRef.current = true
    const last = slidesRef.current.length - 1
    if (currentRef.current >= last) {
      if (isMobile) return
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

  // 슬라이드 진행 루프 (모바일은 스크롤 위치로 슬라이드를 구동하므로 불필요)
  useEffect(() => {
    if (isMobile) return
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
  }, [isMobile])

  useHeroScrollControls({
    currentRef,
    goTo,
    isMobile,
    isPausedRef,
    scrollPastLastSlide,
    sectionRef,
    slidesRef,
    startTimeRef,
  })

  const slides = isMobile ? MOBILE_SLIDES : WEB_SLIDES
  const slide  = slides[current] ?? slides[0]
  const mobileScrollStyle: CSSProperties | undefined = isMobile
    ? { height: `${slides.length * 100}dvh` }
    : undefined
  const mobileViewportStyle: CSSProperties | undefined = isMobile
    ? { height: '100dvh' }
    : undefined

  return (
    <section
      id={`main-hero-${heroDomId.replace(/:/g, '')}`}
      ref={sectionRef}
      className="relative h-screen md:h-screen"
      style={mobileScrollStyle}
    >
      <div
        className={`sticky top-0 h-screen w-full overflow-hidden md:static md:h-full relative ${slide.isVideo ? 'bg-black' : 'bg-white'}`}
        style={mobileViewportStyle}
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
          onGoTo={goToFromIndicator}
        />
      </div>
    </section>
  )
}
