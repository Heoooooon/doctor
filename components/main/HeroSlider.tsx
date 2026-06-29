'use client'

import { useEffect, useId, useRef, useState } from 'react'
import HeroForeground from './HeroForeground'

type Slide = {
  readonly id: number
  readonly image: string
  readonly isVideo?: boolean
  readonly loopVideo?: boolean
  readonly interval?: number
}

const WEB_SLIDES: Slide[] = [
  { id: 2, image: '/images/slides/main-02.mp4', isVideo: true },
  { id: 3, image: '/images/slides/slide-3.jpg', interval: 3000 },
  { id: 4, image: '/images/slides/slide-4.webp', interval: 3000 },
  { id: 5, image: '/images/slides/slide-5.png', interval: 3000 },
  { id: 6, image: '/images/slides/slide-6.jpg', interval: 3000 },
  { id: 1, image: '/images/slides/slide-1.mp4', isVideo: true },
]

const MOBILE_SLIDES: Slide[] = [
  { id: 2, image: '/images/slides/main-02.mp4', isVideo: true },
  { id: 3, image: '/images/slides/slide-3.jpg', interval: 3000 },
  { id: 4, image: '/images/slides/slide-4.webp', interval: 3000 },
  { id: 5, image: '/images/slides/slide-5.png', interval: 3000 },
  { id: 6, image: '/images/slides/slide-6.jpg', interval: 3000 },
  { id: 1, image: '/images/slides/slide-4-mobile.mp4', isVideo: true },
]

const IMAGE_INTERVAL = 4700   // 이미지 슬라이드 1장 유지(ms)
const LAST_SLIDE_SCROLL_DELAY = 3000

const RADIUS        = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getVideoPoster(slide: Slide): string | undefined {
  if (slide.image.includes('slide-1.mp4')) return '/images/slides/slide-1-poster.webp'
  if (slide.image.includes('slide-4-mobile.mp4')) return '/images/slides/slide-4-poster.webp'
  return undefined
}

function getVideoPlaybackRate(slide: Slide): number {
  return slide.id === 1 ? 0.7 : 1
}

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

  // 활성 슬라이드 셋(플랫폼별) — rAF 루프에서 참조하도록 ref로 보관
  const slidesRef = useRef<Slide[]>(WEB_SLIDES)

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

  const scrollToNextLayout = () => {
    const hero = sectionRef.current
    const rect = hero?.getBoundingClientRect()
    if (!hero || !rect || rect.width === 0 || rect.height === 0) return

    const desktop = document.getElementById('home-desktop')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'

    if (desktop && window.matchMedia('(min-width: 768px)').matches) {
      const wrapper = hero?.parentElement
      const target = wrapper?.nextElementSibling
      const top = target instanceof HTMLElement ? target.offsetTop : desktop.clientHeight
      desktop.scrollTo({ top, behavior })
      return
    }

    const target = hero?.nextElementSibling
    const top = target instanceof HTMLElement
      ? target.getBoundingClientRect().top + window.scrollY
      : window.innerHeight
    window.scrollTo({ top, behavior })
  }

  const scrollPastLastSlide = () => {
    if (nextSectionScrollRef.current) return
    nextSectionScrollRef.current = true
    isPausedRef.current = true
    setProgress(1)
    scrollToNextLayout()
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

  // ── 스크롤/스와이프로 히어로 캐러셀 제어(스크롤잭) ──────────────────
  // 히어로가 화면에 있을 때: 아래로 스크롤 = 다음 슬라이드, 위로 = 이전 슬라이드.
  // 마지막(또는 첫) 슬라이드 경계에서는 가로채지 않아 자연스럽게 다음/이전 섹션으로 이동.
  // 데스크탑은 #home-desktop 내부 스크롤(wheel), 모바일은 #main-hero 세로 스와이프(touch).
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

    // 모바일: 세로 스와이프
    let touchStartY = 0
    let touchLock = false
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
      touchLock = false
    }
    const onTouchMove = (e: TouchEvent) => {
      if ((window.scrollY || 0) > 8) return
      const dy = touchStartY - (e.touches[0]?.clientY ?? 0) // +면 위로 스와이프(다음)
      const dir = dy > 0 ? 1 : -1
      if (Math.abs(dy) < 8) return
      if (!shouldHijack(dir)) {
        const last = slidesRef.current.length - 1
        if (dir > 0 && currentRef.current >= last) {
          e.preventDefault()
          if (touchLock || Math.abs(dy) < 42) return
          touchLock = true
          scrollPastLastSlide()
        }
        return
      }
      e.preventDefault()
      if (touchLock || Math.abs(dy) < 42) return
      touchLock = true
      pauseAuto()
      goToRef.current(currentRef.current + dir)
    }

    desktop?.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('wheel', onWheel, { passive: false })
    hero?.addEventListener('touchstart', onTouchStart, { passive: true })
    hero?.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      desktop?.removeEventListener('wheel', onWheel)
      window.removeEventListener('wheel', onWheel)
      hero?.removeEventListener('touchstart', onTouchStart)
      hero?.removeEventListener('touchmove', onTouchMove)
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
      {/* ── 배경 이미지 (데스크탑) — 크로스페이드 + Ken Burns, GIF 재생 가능 ── */}
      <div className="hidden md:block absolute inset-0">
        {slides.map((s, i) =>
          s.isVideo ? null : s.loopVideo ? (
            <video
              key={s.id}
              src={s.image}
              muted
              loop
              autoPlay
              playsInline
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2500ms] ease-in-out"
              style={{ opacity: i === current ? 1 : 0 }}
            />
          ) : (
            <img
              key={s.id}
              src={s.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover hero-kenburns transition-opacity duration-[2500ms] ease-in-out"
              style={{ opacity: i === current ? 1 : 0 }}
            />
          )
        )}
      </div>

      {/* ── 동영상 레이어 (데스크탑) ── */}
      {!isMobile && slide.isVideo && (
        <video
          ref={videoRef}
          key={`hero-video-${slide.id}`}
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          src={slide.image}
          poster={getVideoPoster(slide)}
          preload="auto"
          autoPlay
          muted
          playsInline
          onCanPlay={(event) => {
            event.currentTarget.playbackRate = getVideoPlaybackRate(slide)
          }}
          onEnded={handleVideoEnded}
        />
      )}

      {/* ── 모바일 이미지/동영상 레이어 ─────────────────────────── */}
      <div className="md:hidden absolute inset-0">
        {slide.isVideo ? (
          isMobile ? (
            <video
              ref={videoRef}
              key={`hero-video-m-${slide.id}`}
              className="absolute inset-0 w-full h-full object-cover"
              src={slide.image}
              poster={getVideoPoster(slide)}
              preload="auto"
              autoPlay
              muted
              playsInline
              onCanPlay={(event) => {
                event.currentTarget.playbackRate = getVideoPlaybackRate(slide)
              }}
              onEnded={handleVideoEnded}
            />
          ) : null
        ) : slide.loopVideo ? (
          <video
            key={`m-${current}`}
            src={slide.image}
            muted
            loop
            autoPlay
            playsInline
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            key={current}
            src={slide.image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover mobile-pan-${current}`}
          />
        )}
      </div>

      {/* ── 반투명 그라데이션 오버레이 (데스크탑) ── */}
      <div
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* ── 하단 페이드 오버레이 (데스크탑) ─────────────────────── */}
      <div
        className="hidden md:block absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
        }}
      />

      {/* ── 하단 페이드 오버레이 (모바일) ────────────────────────── */}
      <div
        className="md:hidden absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: 'calc(var(--mobile-bottom-bar-height) + 160px)',
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      />

      <HeroForeground
        current={current}
        onConsultClick={openConsult}
      />

      {/* ── 모바일 슬라이드 인디케이터 (하단 도트) ── */}
      <div className="md:hidden absolute bottom-10 inset-x-0 flex justify-center items-center gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`슬라이드 ${i + 1}로 이동`}
            className="group flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300"
          >
            <span
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-white scale-125'
                  : 'bg-white/45 group-hover:bg-white/70'
              }`}
            />
          </button>
        ))}
      </div>

      {/* ── 왼쪽 인디케이터 (데스크탑 세로) ───────────────────────────────── */}
      <div className="hidden md:flex absolute left-6 md:left-10 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`슬라이드 ${i + 1}로 이동`}
            className="relative flex items-center justify-center w-11 h-11"
          >
            {i === current ? (
              <>
                <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                  <circle
                    cx="20" cy="20" r={RADIUS}
                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
                  />
                  <circle
                    cx="20" cy="20" r={RADIUS}
                    fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                  />
                </svg>
                <span className="absolute w-2 h-2 rounded-full bg-white" />
              </>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/70 transition-colors" />
            )}
          </button>
        ))}
      </div>

      {/* ── 슬라이드 카운터 (데스크탑) ──────────────────────────────────────── */}
      <div className="hidden md:block absolute bottom-20 right-6 md:right-10 text-white/50 text-[18px] tracking-widest font-mono">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

    </section>
  )
}
