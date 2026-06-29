'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const TREATMENTS = [
  {
    id: 0,
    title: '임플란트',
    sub: '네비게이션 정밀 식립',
    image: '/images/slides/slide-4.jpg',
    href: '/implant',
    color: '#2563A8',
  },
  {
    id: 1,
    title: '교정치과',
    sub: '가지런한 치아, 건강한 교합',
    image: '/images/slides/slide-5.png',
    href: '/orthodontics',
    color: '#3B7DD8',
  },
  {
    id: 2,
    title: '소아치과',
    sub: '아이의 첫 치과, 편안하게',
    image: '/images/treatments/pediatric/kids-2.png',
    href: '/pediatric',
    color: '#4A9FE0',
  },
  {
    id: 3,
    title: '자연치아보존',
    sub: '최소삭제 보존치료',
    image: '/images/slides/slide-3.jpg',
    href: '/natural-tooth',
    color: '#2563A8',
  },
  {
    id: 4,
    title: '심미치료',
    sub: '아름다운 미소 디자인',
    image: '/images/slides/slide-2.png',
    href: '/cosmetic',
    color: '#3B7DD8',
  },
]

export default function TreatmentCarousel() {
  const [active, setActive] = useState(2)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartActive = useRef(0)

  const prev = () => setActive((a) => Math.max(0, a - 1))
  const next = () => setActive((a) => Math.min(TREATMENTS.length - 1, a + 1))

  // 드래그/스와이프 처리
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(false)
    dragStartX.current = e.clientX
    dragStartActive.current = active
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const diff = dragStartX.current - e.clientX
    if (Math.abs(diff) > 50) {
      setIsDragging(true)
      if (diff > 0) next()
      else prev()
    }
  }

  // 키보드 접근성
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const getCardStyle = (index: number) => {
    const offset = index - active
    const absOffset = Math.abs(offset)

    if (absOffset > 2) return { display: 'none' }

    const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.82 : 0.68
    const translateX = offset * 260
    const translateZ = absOffset === 0 ? 0 : absOffset === 1 ? -80 : -160
    const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.45
    const zIndex = 10 - absOffset
    const rotateY = offset * -8

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
      transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  }

  return (
    <section className="relative w-full bg-[#f8f9fb] py-20 overflow-hidden">
      {/* 섹션 헤딩 */}
      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-blue-500 mb-2 font-medium">
          Treatment
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          진료 분야
        </h2>
        <p className="mt-3 text-gray-400 text-sm">
          클릭하면 해당 진료 안내 페이지로 이동합니다
        </p>
      </div>

      {/* 캐러셀 */}
      <div
        className="relative flex items-center justify-center h-[420px] md:h-[500px]"
        style={{ perspective: '1200px' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {TREATMENTS.map((item, index) => {
          const style = getCardStyle(index)
          if (style.display === 'none') return null
          const isActive = index === active

          return (
            <div
              key={item.id}
              className="absolute"
              style={style}
            >
              <Link
                href={item.href}
                onClick={(e) => isDragging && e.preventDefault()}
                className="block group"
              >
                <div
                  className="relative overflow-hidden"
                  style={{
                    width: isActive ? '280px' : '220px',
                    height: isActive ? '380px' : '300px',
                    borderRadius: '24px',
                    boxShadow: isActive
                      ? '0 30px 80px rgba(0,0,0,0.25)'
                      : '0 10px 40px rgba(0,0,0,0.12)',
                    transition: 'width 0.5s ease, height 0.5s ease, box-shadow 0.5s ease',
                  }}
                >
                  {/* 이미지 */}
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="280px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    draggable={false}
                  />

                  {/* 그라데이션 오버레이 */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                    }}
                  />

                  {/* 텍스트 */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    {isActive && (
                      <p className="text-xs tracking-widest uppercase mb-1 opacity-70">
                        Seoul Egun
                      </p>
                    )}
                    <h3
                      className="font-bold"
                      style={{ fontSize: isActive ? '1.4rem' : '1.1rem' }}
                    >
                      {item.title}
                    </h3>
                    {isActive && (
                      <p className="text-sm text-white/70 mt-1">{item.sub}</p>
                    )}
                    {isActive && (
                      <div
                        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      >
                        자세히 보기
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6h8M7 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 활성 테두리 */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-[24px] pointer-events-none"
                      style={{
                        border: `2px solid ${item.color}`,
                        opacity: 0.6,
                      }}
                    />
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* 하단 컨트롤 */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={prev}
          disabled={active === 0}
          aria-label="이전"
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-blue-400 hover:text-blue-500 transition-all disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 인디케이터 */}
        <div className="flex gap-2">
          {TREATMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`${i + 1}번째 항목으로 이동`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === active ? '28px' : '8px',
                height: '8px',
                backgroundColor: i === active ? '#2563A8' : '#d1d5db',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={active === TREATMENTS.length - 1}
          aria-label="다음"
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-blue-400 hover:text-blue-500 transition-all disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </section>
  )
}
