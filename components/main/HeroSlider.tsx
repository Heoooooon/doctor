'use client'

import { useEffect, useId, useRef, useState } from 'react'
import HeroForeground from './HeroForeground'
import { HeroSlideMedia } from './HeroSlideMedia'
import { HeroSliderIndicators } from './HeroSliderIndicators'
import { scrollHeroToNextLayout } from './heroScroll'
import {
  HERO_SLIDES,
  INTRO_SLIDE,
  LAST_SLIDE_SCROLL_DELAY,
  getSlideInterval,
  getVideoPlaybackRate,
  type HeroPhase,
  type HeroSlide,
} from './heroSlides'
import { useHeroScrollControls } from './useHeroScrollControls'
import { useLockedMobileVh } from '@/hooks/useLockedMobileVh'

// 모바일 영상 슬라이드 자동재생이 막힌 인앱 브라우저 대비 강제 전환 한계 시간
const VIDEO_FALLBACK_MS = 14000

export default function HeroSlider() {
  // intro: 로고 클릭/새로고침 후 재생되는 프리슬라이드(main-02) — 넘버링 캐러셀에 미포함
  // slides: 실제 넘버링 캐러셀 (HERO_SLIDES[0]이 진짜 1번)
  const [phase, setPhase] = useState<HeroPhase>('intro')
  const [current,  setCurrent]  = useState(0)
  const [progress, setProgress] = useState(0)

  const [isMobile, setIsMobile] = useState(false)
  const [heroInView, setHeroInView] = useState(true)
  const mobileVh = useLockedMobileVh()
  const heroDomId = useId()

  const phaseRef         = useRef<HeroPhase>('intro')
  const startTimeRef     = useRef<number>(Date.now())
  const rafRef           = useRef<number | null>(null)
  const isPausedRef      = useRef(false)
  const currentRef       = useRef(0)
  const videoRef         = useRef<HTMLVideoElement | null>(null)
  const sectionRef       = useRef<HTMLElement | null>(null)
  const videoAdvancedRef = useRef(false)
  const nextSectionTimerRef = useRef<number | null>(null)
  const nextSectionScrollRef = useRef(false)
  const prevRef          = useRef(-1)
  const lastCurrentRef   = useRef(0)

  const slidesRef = useRef<readonly HeroSlide[]>(HERO_SLIDES)

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
    // 캐러셀로 점프 시 대상 이미지 팬을 처음(오른쪽)부터 다시 시작
    if (isMobile) {
      window.requestAnimationFrame(() => {
        const el = sectionRef.current?.querySelector<HTMLElement>('.mobile-pan-' + index)
        if (!el) return
        el.style.animation = 'none'
        void el.offsetHeight
        el.style.animation = ''
      })
    }
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

  // 인트로 종료(영상 ended / 스와이프 / 폴백 타이머) → 진짜 1번 슬라이드로 진입.
  // 모든 타이머 기준값을 여기서 리셋해 2번으로 건너뛰는 race를 차단한다.
  const enterSlides = () => {
    if (phaseRef.current === 'slides') return
    phaseRef.current = 'slides'
    setPhase('slides')
    setCurrent(0)
    currentRef.current = 0
    setProgress(0)
    startTimeRef.current = Date.now()
    videoAdvancedRef.current = false
    nextSectionScrollRef.current = false
    isPausedRef.current = false
  }

  // 새로고침과 동일한 상태로 복귀 (로고 클릭 등) — 항상 인트로부터
  const resetToIntro = () => {
    phaseRef.current = 'intro'
    setPhase('intro')
    setCurrent(0)
    currentRef.current = 0
    setProgress(0)
    startTimeRef.current = Date.now()
    videoAdvancedRef.current = false
    nextSectionScrollRef.current = false
    isPausedRef.current = false
    window.requestAnimationFrame(() => {
      const video = videoRef.current
      if (!video) return
      video.currentTime = 0
      void video.play().catch(() => undefined)
    })
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
    if (phaseRef.current === 'intro') {
      enterSlides()
      return
    }
    if (videoAdvancedRef.current) return
    videoAdvancedRef.current = true
    const last = slidesRef.current.length - 1
    // 데스크탑은 마지막 슬라이드 영상 종료 후 다음 섹션으로, 모바일은 처음으로 순환
    if (!isMobile && currentRef.current >= last) {
      scrollPastLastSlide()
      return
    }
    const idx = currentRef.current
    const hold = slidesRef.current[idx]?.endHoldMs ?? 0
    if (isMobile && hold > 0) {
      window.setTimeout(() => {
        if (currentRef.current === idx) advanceFrom(idx)
      }, hold)
      return
    }
    advanceFrom(idx)
  }

  useEffect(() => {
    const resetHero = () => resetToIntro()
    window.addEventListener('egun:hero-reset', resetHero)
    return () => window.removeEventListener('egun:hero-reset', resetHero)
  }, [])

  // 인트로 폴백: 영상 자동재생이 막힌 환경에서도 일정 시간 후 슬라이드로 진입
  useEffect(() => {
    if (phase !== 'intro') return undefined
    const id = window.setTimeout(() => enterSlides(), VIDEO_FALLBACK_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  // 모바일 감지
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // 데스크탑: 마지막 이미지 슬라이드 후 일정 시간 뒤 다음 섹션으로 스크롤
  useEffect(() => {
    if (nextSectionTimerRef.current !== null) {
      window.clearTimeout(nextSectionTimerRef.current)
      nextSectionTimerRef.current = null
    }

    if (isMobile || phase !== 'slides') return undefined

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
  }, [current, isMobile, phase])

  // 데스크탑 슬라이드 진행 루프 (인디케이터 프로그레스 링 + 자동 전환)
  useEffect(() => {
    if (isMobile) return
    const tick = () => {
      if (!isPausedRef.current && phaseRef.current === 'slides') {
        const activeSlide = slidesRef.current[currentRef.current]
        if (activeSlide?.isVideo) {
          const vid = videoRef.current
          if (vid && vid.duration > 0) {
            setProgress(vid.currentTime / vid.duration)
          }
        } else {
          const active = slidesRef.current[currentRef.current]
          const slideInterval = active ? getSlideInterval(active, false) : 0
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

  // 모바일: 자동재생. 이미지=인터벌, 영상=onEnded(자동재생 차단 인앱 브라우저 대비 폴백 타이머).
  // window 스크롤과 무관하며, 히어로가 화면 밖이면 일시정지.
  useEffect(() => {
    if (!isMobile || !heroInView || phase !== 'slides') return undefined
    const activeSlide = slidesRef.current[current]
    if (!activeSlide) return undefined
    const duration = activeSlide.isVideo
      ? VIDEO_FALLBACK_MS
      : getSlideInterval(activeSlide, true)
    const id = window.setTimeout(() => {
      advanceFrom(currentRef.current)
    }, duration)
    return () => window.clearTimeout(id)
  }, [current, isMobile, heroInView, phase])

  // 모바일: 히어로 가시성 추적 (화면 밖이면 자동재생 정지)
  useEffect(() => {
    if (!isMobile) return undefined
    const hero = sectionRef.current
    if (!hero) return undefined
    const io = new IntersectionObserver(
      ([entry]) => setHeroInView(entry?.isIntersecting ?? true),
      { threshold: 0.35 },
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [isMobile])

  // 슬라이드 변경 시 활성 영상 재생 (영상 슬라이드를 항상 마운트하므로 명시적 재생 필요)
  useEffect(() => {
    if (phase !== 'slides') return
    const activeSlide = slidesRef.current[current]
    const video = videoRef.current
    if (!activeSlide?.isVideo || !video) return
    video.currentTime = 0
    video.playbackRate = getVideoPlaybackRate(activeSlide)
    void video.play().catch(() => undefined)
  }, [current, phase])

  useHeroScrollControls({
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
  })

  const isIntro = phase === 'intro'
  const slides = HERO_SLIDES
  const slide  = isIntro ? INTRO_SLIDE : (slides[current] ?? slides[0])

  // 직전 슬라이드 인덱스를 렌더 중 동기적으로 추적 (크로스페이드 시 배경 노출 방지용)
  if (lastCurrentRef.current !== current) {
    prevRef.current = lastCurrentRef.current
    lastCurrentRef.current = current
  }
  const prev = prevRef.current

  return (
    <section
      id={`main-hero-${heroDomId.replace(/:/g, '')}`}
      ref={sectionRef}
      className={`relative w-full overflow-hidden h-svh md:h-screen ${slide.isVideo ? 'bg-black' : 'bg-white'}`}
      style={{
        ...(isMobile && mobileVh ? { height: `${mobileVh}px` } : undefined),
        // 인트로 중·마지막 슬라이드 전까지는 세로 네이티브 스크롤을 차단해 스와이프로 슬라이드 전환.
        // 브라우저가 스크롤을 먼저 시작하면 preventDefault가 무시되므로 CSS로 원천 차단해야 함.
        ...(isMobile
          ? { touchAction: isIntro || current < slides.length - 1 ? 'pan-x' : 'auto' }
          : undefined),
      }}
    >
      <HeroSlideMedia
        slides={slides}
        slide={slide}
        current={isIntro ? -1 : current}
        prev={prev}
        isIntro={isIntro}
        isMobile={isMobile}
        videoRef={videoRef}
        onVideoEnded={handleVideoEnded}
      />

      {/* 텍스트 카피: 인트로=HERO_COPY[0], 슬라이드 N=HERO_COPY[N+1] */}
      <HeroForeground
        current={isIntro ? 0 : current + 1}
        onConsultClick={openConsult}
      />

      {/* 넘버링 인디케이터는 인트로에서 숨기고 실제 슬라이드 진입 후 01부터 표시 */}
      {!isIntro && (
        <HeroSliderIndicators
          slides={slides}
          current={current}
          progress={progress}
          onGoTo={goTo}
        />
      )}
    </section>
  )
}
