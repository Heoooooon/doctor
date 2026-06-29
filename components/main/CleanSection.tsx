'use client'

import Image from 'next/image'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function CleanSection() {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section
      ref={ref}
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#F8F7F9' }}
    >
      {/* ── 모바일: 배경 풀스크린 이미지 ─────────────────────── */}
      <div className="md:hidden absolute inset-0">
        <Image
          src="/images/clinic/clean.jpg"
          alt="멸균 소독 과정"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 65%)' }}
        />
      </div>

      {/* ── 데스크탑: 2-column 레이아웃 ──────────────────────── */}
      <div className="relative z-10 h-full max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-9 items-start md:items-center pt-[140px] md:py-24 pb-8">

        {/* 텍스트 영역 */}
        <div>
          <h2
            className={`text-[28px] md:text-3xl lg:text-4xl font-bold leading-tight mb-5 md:text-[#2B2D42] text-white ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            style={{ textShadow: 'none' }}
          >
            감염관리도
            <br />
            하나의 진료입니다
          </h2>

          <p
            className={`text-[18px] leading-relaxed mb-6 md:text-[#2B2D42] text-white/90 ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: '0.15s' } : undefined}
          >
            <span className="text-[#60c0ff] md:text-[#0080C8] font-semibold">서울이건치과</span>는 치료 결과만큼이나<br />
            그 과정의 안전함을 중요하게 생각합니다.<br />
            모든 진료 기구는 개인별로 구분 사용 후<br />
            <span className="text-[#60c0ff] md:text-[#0080C8] font-semibold">철저한 멸균 과정</span>을 거치며,<br />
            진료실과 장비 역시 매일<br />
            <span className="text-[#60c0ff] md:text-[#0080C8] font-semibold">위생점검</span>과{' '}
            <span className="text-[#60c0ff] md:text-[#0080C8] font-semibold">소독</span>을 진행합니다.
          </p>

          <a
            href="https://fromel.biz/business/system/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[44px] items-center px-5 py-3 rounded-xl text-white text-[18px] font-medium transition-opacity hover:opacity-80 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={{ backgroundColor: '#0080C8', ...(isVisible ? { animationDelay: '0.3s' } : {}) }}
          >
            믿을 수 있는 위생 시스템
          </a>
        </div>

        {/* 이미지 영역 — 데스크탑만 표시 */}
        <div
          className={`relative hidden md:block w-full h-[320px] lg:h-[380px] rounded-xl overflow-hidden shadow-xl ${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={isVisible ? { animationDelay: '0.1s' } : undefined}
        >
          <Image
            src="/images/clinic/clean.jpg"
            alt="개별 멸균 포장된 진료 기구"
            fill
            sizes="(max-width: 1024px) 50vw, 480px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Bottom Accent — 데스크탑만 */}
      <div
        className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 h-1 w-24 rounded-full"
        style={{ backgroundColor: '#0080C8' }}
      />
    </section>
  )
}
