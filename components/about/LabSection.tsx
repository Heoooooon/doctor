'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const LAB_FEATURES = [
  {
    title: '정밀 디지털 스캔',
    description: '3D 구강 스캐너로\n0.01mm 단위의 정밀 채득',
  },
  {
    title: '당일 제작 가능',
    description: '인하우스 기공소 운영으로\n임시 보철물 당일 제작 가능',
  },
  {
    title: '품질 직접 관리',
    description: '원장과 기공사가 직접 협의하여\n최적의 결과물을 제작',
  },
]

const LAB_IMAGES = [
  '/images/ddlab/ddlab%20(1).jpg',
  '/images/ddlab/ddlab%20(2).jpg',
  '/images/ddlab/ddlab%20(3).jpg',
  '/images/ddlab/ddlab%20(7).jpg',
  '/images/ddlab/ddlab%20(10).jpg',
  '/images/ddlab/ddlab%20(11).jpg',
  '/images/ddlab/ddlab%20(12).jpg',
  '/images/ddlab/ddlab%20(13).jpg',
  '/images/ddlab/ddlab%20(14).jpg',
  '/images/ddlab/ddlab%20(15).jpg',
  '/images/ddlab/ddlab%20(16).jpg',
  '/images/ddlab/ddlab%20(17).jpg',
]

const AUTO_INTERVAL = 4000

export default function LabSection() {
  const videoRef = useRef<HTMLDivElement>(null)
  const [videoVisible, setVideoVisible] = useState(false)
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)
  const { ref: contentRef, isVisible: contentVisible } = useScrollReveal(0.15)

  // 3D 캐러셀 state
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const total = LAB_IMAGES.length
  const touchStart = useRef<number | null>(null)

  const goTo = useCallback(
    (index: number) => setCurrent(((index % total) + total) % total),
    [total],
  )

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1)
    }
    touchStart.current = null
  }, [current, goTo])

  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), AUTO_INTERVAL)
    return () => clearInterval(timer)
  }, [current, goTo])

  const getCardStyle = (index: number): React.CSSProperties => {
    let diff = index - current
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    const absD = Math.abs(diff)

    if (absD > 2) {
      return { transform: 'translateX(0) scale(0.7)', opacity: 0, zIndex: 0, pointerEvents: 'none' }
    }

    if (diff === 0) {
      return {
        transform: 'translateX(0) scale(1.0) translateZ(60px)',
        opacity: 1,
        zIndex: 20,
        pointerEvents: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }
    }

    return {
      transform: `translateX(${diff * 336}px) scale(${1 - absD * 0.15}) rotateY(${diff * -8}deg)`,
      opacity: 1 - absD * 0.35,
      zIndex: 10 - absD,
      pointerEvents: 'none',
    }
  }

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVideoVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="lab"
      className="py-12 sm:py-28 bg-gray-900 scroll-mt-36"
      aria-labelledby="lab-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div ref={headerRef}>
          <p className={`text-xs font-semibold tracking-[0.25em] uppercase text-[#0080C8] mb-3 ${headerVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}>
            In-house Lab
          </p>
          <h2
            id="lab-heading"
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 ${headerVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={headerVisible ? { animationDelay: '0.1s' } : undefined}
          >
            디지털 기공소
          </h2>
          <p className={`text-base sm:text-lg text-[#0080C8] font-medium mb-3 ${headerVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={headerVisible ? { animationDelay: '0.2s' } : undefined}
          >
            인하우스 기공소, 더욱 정교하게
          </p>
          <p className={`text-sm text-gray-400 max-w-2xl leading-relaxed mb-10 ${headerVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={headerVisible ? { animationDelay: '0.3s' } : undefined}
          >
            원내 디지털 기공소를 운영합니다.<br />
            원장과 기공사가 직접 협업하여<br />
            정밀하고 빠른 보철물을 제작합니다.
          </p>
        </div>

        {/* 메인 콘텐츠: 영상 + 특징 */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* 유튜브 영상 */}
          <div ref={videoRef} className={`aspect-video rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 ${contentVisible ? 'scroll-reveal-scale' : 'scroll-hidden'}`}>
            {videoVisible ? (
              <iframe
                src="https://www.youtube.com/embed/vu6J8cy5Gnc?autoplay=1&mute=1&loop=1&playlist=vu6J8cy5Gnc&controls=1&modestbranding=1"
                title="서울이건치과 디지털 기공소 소개"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: 'url(https://img.youtube.com/vi/vu6J8cy5Gnc/maxresdefault.jpg)' }}>
                <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-gray-800 ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* 특징 리스트 */}
          <div className="flex flex-col gap-4">
            {LAB_FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`flex gap-4 p-4 rounded-2xl bg-gray-800 border border-gray-700 hover:border-[#0080C8]/50 transition-colors ${contentVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
                style={contentVisible ? { animationDelay: `${0.15 + i * 0.1}s` } : undefined}
              >
                <div className="w-8 h-8 rounded-full bg-[#0080C8]/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#0080C8]">
                    0{i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 기공소 시설 라벨 */}
        <div id="lab-facilities" className="flex items-center gap-4 mb-10 scroll-mt-36">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">기공소 시설</h3>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
      </div>

      {/* 3D 캐러셀 */}
      <div
        className="relative w-full overflow-hidden h-[260px] sm:h-[360px] lg:h-[448px]"
        style={{ perspective: '1800px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {LAB_IMAGES.map((src, i) => {
            const style = getCardStyle(i)
            return (
              <div
                key={i}
                className={`absolute w-[calc(100vw-40px)] max-w-[300px] sm:max-w-none sm:w-[400px] lg:w-[504px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ease-in-out${i === current ? ' cursor-pointer' : ''}`}
                style={{ ...style, transformStyle: 'preserve-3d' }}
                onClick={() => i === current && setLightbox(src)}
              >
                <img src={src} alt={`서울이건치과 기공소 ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                {i !== current && <div className="absolute inset-0 bg-black/20 rounded-2xl" />}
              </div>
            )
          })}
        </div>

        {/* 화살표: 중앙 이미지 양쪽 가장자리에 고정 */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative w-[calc(100vw-40px)] max-w-[300px] sm:max-w-none sm:w-[400px] lg:w-[504px] h-full flex items-center">
            <button
              onClick={() => goTo(current - 1)}
              className="pointer-events-auto absolute -left-6 z-30 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              aria-label="이전 사진"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => goTo(current + 1)}
              className="pointer-events-auto absolute -right-6 z-30 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              aria-label="다음 사진"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* 인디케이터 */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {LAB_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-[#0080C8]' : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'}`}
            aria-label={`사진 ${i + 1}번으로 이동`}
          />
        ))}
      </div>

      {/* 라이트박스 모달 */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="닫기"
          >
            <X size={28} />
          </button>
          <img
            src={lightbox}
            alt="확대 사진"
            className="max-w-5xl max-h-[90vh] w-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}
    </section>
  )
}
