'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function ImplantSection() {
  const { ref, isVisible } = useScrollReveal(0.2)

  return (
    <section
      ref={ref}
      className="h-dvh md:h-screen w-full relative overflow-hidden flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#000' }}
    >
      {/* 배경 이미지 — 수평 마퀴 슬라이드 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="all-on-marquee-track flex h-full">
          {[1,2,3,4,5,6,7,1,2,3,4,5,6,7].map((n, i) => (
            <Image
              key={i}
              src={`/images/treatments/allon/all-on (${n}).jpg`}
              alt=""
              aria-hidden="true"
              width={1440}
              height={1080}
              className="h-full w-auto flex-shrink-0 object-cover"
            />
          ))}
        </div>
      </div>
      {/* 다크 오버레이 — 텍스트 가독성 */}
      <div className="absolute inset-0 bg-black/80 pointer-events-none" />

      {/* ── 콘텐츠 ───────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <p className={`tracking-[0.26em] uppercase text-stone-500 mb-2 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`} style={{ fontSize: '14px' }}>
          Implant Solution
        </p>
        <h2
          className={`text-stone-300 font-light text-center mb-1 leading-tight ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={{ fontSize: 'clamp(18px, 2vw, 26px)', ...(isVisible ? { animationDelay: '0.12s' } : {}) }}
        >
          상실된 치아, 완벽한 복원
        </h2>
        <p
          className={`text-stone-500 mb-4 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={{ fontSize: '18px', ...(isVisible ? { animationDelay: '0.2s' } : {}) }}
        >
          디지털 정밀 진단 기반 임플란트
        </p>

        {/* 올온임플란트 대형 타이틀 */}
        <div
          className={`mb-5 md:mb-6 ${isVisible ? 'scroll-reveal-scale' : 'scroll-hidden'}`}
          style={isVisible ? { animationDelay: '0.3s' } : undefined}
        >
          <span
            className="font-black tracking-tight select-none"
            style={{
              fontSize: 'clamp(36px, 7vw, 96px)',
              color: '#0080C8',
              textShadow: '0 5px 0 rgba(0,0,0,0.55), 0 14px 30px rgba(0,0,0,0.72), 0 0 28px rgba(0,128,200,0.45)',
            }}
          >
            올온 임플란트
          </span>
          <p className="text-stone-500 tracking-widest mt-1 uppercase" style={{ fontSize: '18px' }}>Full-Arch Rehabilitation</p>
        </div>

        {/* 특징 카드 */}
        <div
          className={`mb-6 w-full max-w-xs border border-stone-600/70 rounded-xl px-6 py-4 flex flex-col gap-3 text-center backdrop-blur-sm ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={isVisible ? { animationDelay: '0.45s', background: 'rgba(255,255,255,0.04)' } : { background: 'rgba(255,255,255,0.04)' }}
        >
          {[
            { label: '당일 임시치아', desc: '수술 당일 식사 가능' },
            { label: '디지털 가이드', desc: '오차 ±0.1mm 정밀 식립' },
            { label: '의식하 진정', desc: '공포 없는 수술 환경' },
          ].map((feat) => (
            <div key={feat.label} className="flex flex-col items-center">
              <p className="font-bold mb-0.5" style={{ fontSize: '18px', color: 'var(--e-accent)' }}>{feat.label}</p>
              <p style={{ fontSize: '18px', color: 'rgb(214 211 209)' }}>{feat.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/implant"
          className={`inline-flex min-h-[44px] items-center gap-2 px-5 py-3 text-[18px] font-medium text-stone-300 rounded-full border border-stone-600 hover:border-stone-400 hover:text-white transition-all duration-300 group ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={isVisible ? { animationDelay: '0.8s' } : undefined}
        >
          자세히 보기
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
        </Link>
      </div>

    </section>
  )
}
