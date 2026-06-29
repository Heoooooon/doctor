'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const CARDS = [
  {
    id: 'resin',
    title: '원데이 레진빌드업',
    description: '치아색 레진으로 당일 복원.\n삭제 최소화, 자연치아 보존.',
    image: '/images/treatments/natural-tooth/resin-buildup-treat.jpg',
  },
  {
    id: 'vpt',
    title: 'VPT 신경보존술',
    description: '신경을 살리면서 치아를 지키는\n치수보존술로 수명을 연장합니다.',
    image: '/images/treatments/natural-tooth/vpt-treat.jpg',
  },
  {
    id: 'onlay',
    title: '최소삭제 온레이',
    description: '크라운 대신 삭제를 최소화한\n온레이 보철로 치질을 보존합니다.',
    image: '/images/treatments/natural-tooth/onlay-treat.jpg',
  },
]

export default function NaturalSolution() {
  const [hovered, setHovered] = useState<string | null>(null)
  const router = useRouter()
  const { ref, isVisible } = useScrollReveal(0.2)

  return (
    <section className="h-screen w-full flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #1a1f3a 0%, #0f142b 100%)' }}>
      {/* 가운데 이미지 쪽 그라디언트 글로우 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(60% 55% at 50% 65%, rgba(79,195,247,0.13) 0%, transparent 70%)',
      }} />

      <div ref={ref} className="text-center mb-8 md:mb-12">
        <p className={`text-xs tracking-[0.35em] uppercase mb-3 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={{ color: 'var(--e-accent)' }}>
          Natural Tooth Solution
        </p>
        <h2 className={`text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-1 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={{ color: '#F8F7F9', ...(isVisible ? { animationDelay: '0.12s' } : {}) }}>
          자연치 보존 솔루션
        </h2>
        <p className={`text-sm md:text-base ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={{ color: 'var(--e-accent)', ...(isVisible ? { animationDelay: '0.24s' } : {}) }}>
          최소 삭제, 최대 보존
        </p>
        <div className={`mt-4 w-10 h-0.5 mx-auto ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={{ backgroundColor: 'var(--e-primary)', ...(isVisible ? { animationDelay: '0.3s' } : {}) }} />
      </div>

      {/* 카드 - 원본 비율 유지, 호버 시 확대 + 내용 표시 */}
      <div className="flex flex-row gap-3 md:gap-6 w-full max-w-5xl items-center justify-center">
        {CARDS.map((card, i) => {
          const isHovered = hovered === card.id
          return (
            <div
              key={card.id}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${isVisible ? 'scroll-reveal-scale' : 'scroll-hidden'}`}
              style={{
                flex: isHovered ? '2' : '1',
                ...(isVisible ? { animationDelay: `${0.3 + i * 0.12}s` } : {}),
              }}
              onMouseEnter={() => setHovered(card.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => router.push('/natural-tooth')}
            >
              <Image
                src={card.image}
                alt={card.title}
                width={1080}
                height={1080}
                className="w-full h-auto rounded-2xl transition-transform duration-500"
              />
              {/* 호버 오버레이 */}
              <div className={`absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center px-4 text-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-sm md:text-lg font-bold text-white mb-2">{card.title}</p>
                <p className="text-xs md:text-sm text-white/85 leading-relaxed whitespace-pre-line">{card.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-white/70">
                  자세히 보기 <ArrowRight size={12} aria-hidden="true" />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={() => router.push('/natural-tooth')}
        className={`mt-8 md:mt-10 inline-flex items-center gap-2 text-sm font-medium group transition-colors duration-200 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
        style={{ color: 'var(--e-accent)', ...(isVisible ? { animationDelay: '0.7s' } : {}) }}>
        자연치 보존치료 전체 보기
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
      </button>
    </section>
  )
}
