'use client'

import { useEffect, useRef, useState } from 'react'

type Slide = {
  id: number
  image: string
  isVideo?: boolean
  interval?: number   // 이미지 슬라이드 유지(ms) — 없으면 IMAGE_INTERVAL
}

// 웹(데스크탑): 폴더 숫자순 6개 — 첫 슬라이드는 영상(0.7배속)
const WEB_SLIDES: Slide[] = [
  { id: 1, image: '/images/slides/slide-1.mp4', isVideo: true },
  { id: 2, image: '/images/slides/slide-2.gif', interval: 3200 },
  { id: 3, image: '/images/slides/slide-3.jpg', interval: 3000 },
  { id: 4, image: '/images/slides/slide-4.webp', interval: 3000 },
  { id: 5, image: '/images/slides/slide-5.png', interval: 3000 },
  { id: 6, image: '/images/slides/slide-6.jpg', interval: 3000 },
]

// 모바일: 경량 영상(0.7배속) → slide-2 → slide-3
const MOBILE_SLIDES: Slide[] = [
  { id: 1, image: '/images/slides/slide-4-mobile.mp4', isVideo: true },
  { id: 2, image: '/images/slides/slide-2.gif', interval: 3200 },
  { id: 3, image: '/images/slides/slide-3.jpg', interval: 3000 },
  { id: 4, image: '/images/slides/slide-4.webp', interval: 3000 },
  { id: 5, image: '/images/slides/slide-5.png', interval: 3000 },
]

// 영상은 양쪽 모두 첫 슬라이드(index 0). 영상은 자체 길이만큼 재생.
const VIDEO_INDEX    = 0
const IMAGE_INTERVAL = 4700   // 이미지 슬라이드 1장 유지(ms)

const RADIUS        = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// 중앙 카피 4세트 (3줄씩) — 무한 반복
const HERO_TEXT_SETS: string[][] = [
  ['정성은 기본이 아니라', '진료의 시작이라고 믿습니다', '환자를 먼저 생각합니다'],
  ['치료 전 충분한 설명', '원장이 직접 전하는 안내', '이해에서 시작되는 진료'],
  ['자연스럽게 바뀌는 치열', '조금 더 편안한 일상', '조금 더 환한 웃음'],
  ['익숙함에 머무르지 않고', '계속 배우고 깊이 고민하며', '더 좋은 진료를 만들어갑니다'],
]

export default function HeroSlider() {
  const [current,  setCurrent]  = useState(0)
  const [progress, setProgress] = useState(0)

  // 중앙 카피 로테이션 (슬라이드와 독립적으로 무한 반복)
  const [textSet,  setTextSet]  = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const startTimeRef     = useRef<number>(Date.now())
  const rafRef           = useRef<number | null>(null)
  const isPausedRef      = useRef(false)
  const currentRef       = useRef(0)
  const videoRef         = useRef<HTMLVideoElement | null>(null)
  const videoAdvancedRef = useRef(false)

  // 활성 슬라이드 셋(플랫폼별) — rAF 루프에서 참조하도록 ref로 보관
  const slidesRef = useRef<Slide[]>(WEB_SLIDES)

  const advanceFrom = (from: number) => {
    const next = (from + 1) % slidesRef.current.length
    setCurrent(next)
    currentRef.current = next
    setProgress(0)
    startTimeRef.current = Date.now()
    videoAdvancedRef.current = false
  }

  const goTo = (index: number) => {
    setCurrent(index)
    currentRef.current = index
    setProgress(0)
    startTimeRef.current = Date.now()
    videoAdvancedRef.current = false
    if (index === VIDEO_INDEX && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.playbackRate = 0.7
      videoRef.current.play().catch(() => {})
    }
  }

  const handleVideoEnded = () => {
    if (videoAdvancedRef.current) return
    videoAdvancedRef.current = true
    advanceFrom(VIDEO_INDEX)
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
  }, [isMobile])

  // 중앙 카피: 문구 무한 로테이션 — 문구가 바뀔 때마다 hero-text-rise로 등장
  // 한 문구 유지 주기: 데스크탑 6.6초 / 모바일 10초 (이전보다 1초 더 스테이)
  useEffect(() => {
    const PERIOD = isMobile ? 10000 : 6600
    const timer = setInterval(() => {
      setTextSet((i) => (i + 1) % HERO_TEXT_SETS.length)
    }, PERIOD)
    return () => clearInterval(timer)
  }, [isMobile])

  // 슬라이드 진행 루프
  useEffect(() => {
    const tick = () => {
      if (!isPausedRef.current) {
        if (currentRef.current === VIDEO_INDEX) {
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
            const next = (currentRef.current + 1) % slidesRef.current.length
            setCurrent(next)
            currentRef.current = next
            setProgress(0)
            startTimeRef.current = Date.now()
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [])

  const slides = isMobile ? MOBILE_SLIDES : WEB_SLIDES
  const slide  = slides[current] ?? slides[0]

  return (
    <section
      id="main-hero"
      className={`relative h-dvh md:h-screen w-full overflow-hidden ${slide.isVideo ? 'bg-black' : 'bg-white'}`}
    >
      {/* ── 배경 이미지 (데스크탑) — 크로스페이드 + Ken Burns, GIF 재생 가능 ── */}
      <div className="hidden md:block absolute inset-0">
        {slides.map((s, i) =>
          s.isVideo ? null : (
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
      {slide.isVideo && (
        <video
          key="hero-video"
          className="hidden md:block absolute inset-0 w-full h-full object-contain"
          src="/images/slides/slide-1.mp4"
          poster="/images/slides/slide-1-poster.webp"
          preload="auto"
          autoPlay
          muted
          playsInline
          onCanPlay={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.7 }}
          onEnded={handleVideoEnded}
        />
      )}

      {/* ── 모바일 이미지/동영상 레이어 ─────────────────────────── */}
      <div className="md:hidden absolute inset-0">
        {slide.isVideo ? (
          <video
            ref={videoRef}
            key="hero-video-m"
            className="absolute inset-0 w-full h-full object-cover"
            src="/images/slides/slide-4-mobile.mp4"
            poster="/images/slides/slide-4-poster.webp"
            preload="auto"
            autoPlay
            muted
            playsInline
            onCanPlay={(e) => { (e.target as HTMLVideoElement).playbackRate = 0.7 }}
            onEnded={handleVideoEnded}
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

      {/* ── 히어로 카피: 상단 고정 영문 + 중앙 3줄 교체(무한) ── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none">
        <div className="text-center text-white" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}>
          {/* 고정 영문 타이틀 (모바일 9px·한 줄) */}
          <p className="text-[9px] sm:text-[13px] font-semibold tracking-[0.3em] sm:tracking-[0.35em] whitespace-nowrap text-white/75 mb-8 sm:mb-10">
            <span className="text-[#0080C8]">SEOUL EGUN</span> DENTAL CLINIC
          </p>
          {/* 교체되는 중앙 3줄 — 문구마다 0.5s 후 아래→위 30px + 페이드 인 (1.5s ease-in-out) */}
          <div key={textSet} className="hero-text-rise">
            {HERO_TEXT_SETS[textSet].map((line, i) => (
              <p key={i} className="text-[19px] sm:text-[28px] font-bold leading-[1.55]">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── 모바일 슬라이드 인디케이터 (하단 도트) ── */}
      <div className="md:hidden absolute bottom-10 inset-x-0 flex justify-center items-center gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`슬라이드 ${i + 1}로 이동`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-white scale-125'
                : 'bg-white/45 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* ── 왼쪽 인디케이터 (데스크탑 세로) ───────────────────────────────── */}
      <div className="hidden md:flex absolute left-6 md:left-10 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`슬라이드 ${i + 1}로 이동`}
            className="relative flex items-center justify-center w-10 h-10"
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
      <div className="hidden md:block absolute bottom-20 right-6 md:right-10 text-white/50 text-xs tracking-widest font-mono">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

    </section>
  )
}
