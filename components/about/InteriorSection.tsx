'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const MAIN_IMAGES = [
  '/images/clinic/interior-annex%20(1).jpeg',
  '/images/clinic/interior-annex%20(1).jpg',
  '/images/clinic/interior-annex%20(2).jpg',
  '/images/clinic/interior-annex%20(3).jpg',
  '/images/clinic/interior-annex%20(4).jpg',
  '/images/clinic/interior-annex%20(5).jpg',
  '/images/clinic/interior-annex%20(6).jpg',
  '/images/clinic/interior-annex%20(7).jpg',
  '/images/clinic/interior-annex%20(8).jpg',
  '/images/clinic/interior-annex%20(9).jpg',
]

const ANNEX_IMAGES = [
  '/images/clinic/cliic2-interior%20(1).jpg',
  '/images/clinic/cliic2-interior%20(4).jpg',
  '/images/clinic/cliic2-interior%20(5).jpg',
  '/images/clinic/cliic2-interior%20(6).jpg',
  '/images/clinic/cliic2-interior%20(7).jpg',
  '/images/clinic/cliic2-interior%20(8).jpg',
]

const AUTO_INTERVAL = 4000

function Carousel3D({ images, altPrefix }: { images: string[]; altPrefix: string }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const total = images.length
  const touchStart = useRef<number | null>(null)

  const goTo = useCallback(
    (index: number) => setCurrent(((index % total) + total) % total),
    [total],
  )

  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), AUTO_INTERVAL)
    return () => clearInterval(timer)
  }, [current, goTo])

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

  return (
    <>
      <div
        className="relative w-full overflow-hidden"
        style={{ perspective: '1800px', height: '448px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {images.map((src, i) => (
            <div
              key={i}
              className={`absolute w-[calc(100vw-40px)] max-w-[300px] sm:max-w-none sm:w-[400px] lg:w-[504px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ease-in-out${i === current ? ' cursor-pointer' : ''}`}
              style={{ ...getCardStyle(i), transformStyle: 'preserve-3d' }}
              onClick={() => i === current && setLightbox(src)}
            >
              <img src={src} alt={`${altPrefix} ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
              {i !== current && <div className="absolute inset-0 bg-black/20 rounded-2xl" />}
            </div>
          ))}
        </div>

        {/* 화살표: 중앙 이미지 양쪽 가장자리에 고정 */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative w-[calc(100vw-40px)] max-w-[300px] sm:max-w-none sm:w-[400px] lg:w-[504px] h-full flex items-center">
            <button onClick={() => goTo(current - 1)}
              className="pointer-events-auto absolute -left-6 z-30 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              aria-label="이전 사진">
              <ChevronLeft size={22} />
            </button>
            <button onClick={() => goTo(current + 1)}
              className="pointer-events-auto absolute -right-6 z-30 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              aria-label="다음 사진">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-6">
        {images.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-[#0080C8]' : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'}`}
            aria-label={`사진 ${i + 1}번으로 이동`} />
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
    </>
  )
}

export default function InteriorSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.15)
  const { ref: annexRef, isVisible: annexVisible } = useScrollReveal(0.15)

  return (
    <section id="interior" className="py-20 sm:py-28 bg-gray-900 scroll-mt-36" aria-labelledby="interior-heading">
      <div ref={headerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className={`text-xs font-semibold tracking-[0.25em] uppercase text-[#0080C8] mb-4 ${headerVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}>
          Interior
        </p>
        <h2 id="interior-heading"
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 ${headerVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={headerVisible ? { animationDelay: '0.1s' } : undefined}>
          내부전경
        </h2>
        <p className={`text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed mb-12 ${headerVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={headerVisible ? { animationDelay: '0.2s' } : undefined}>
          쾌적하고 편안한 환경에서 치료받으실 수 있도록 공간을 세심하게 구성하였습니다.
        </p>

        {/* 본관 라벨 */}
        <div className="flex items-center gap-4 mb-10">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">본관</h3>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
      </div>

      {/* 본관 3D 캐러셀 */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <Carousel3D images={MAIN_IMAGES} altPrefix="서울이건치과 본관 내부" />
      </div>

      {/* 별관 */}
      <div
        ref={annexRef}
        id="interior-annex"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 scroll-mt-36"
      >
        <div className={`flex items-center gap-4 mb-4 ${annexVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">별관</h3>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        <p className={`text-sm sm:text-base text-gray-400 mb-10 ${annexVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
          소아치과치료 / 교정치료 / 소아교정
        </p>
      </div>

      {/* 별관 3D 캐러셀 */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <Carousel3D images={ANNEX_IMAGES} altPrefix="서울이건치과 별관 내부" />
      </div>
    </section>
  )
}
