'use client'

import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function NaturalPhilosophySection() {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section ref={ref} className="h-screen w-full relative overflow-hidden">

      {/* ── 모바일: DoctorGroup 방식 — 배경 이미지 + 센터 레이아웃 ── */}
      <div className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/board/best_treat.jpg)' }} />
      <div className="md:hidden absolute inset-0 bg-black/55" />

      {/* ── 데스크탑: 흰 배경 ── */}
      <div className="hidden md:block absolute inset-0" style={{ backgroundColor: '#F8F7F9' }} />

      {/* ── 모바일 콘텐츠: 센터 정렬 ── */}
      <div className="md:hidden relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <h2 className={`font-black leading-[1.2] mb-6 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}>
          <span className="text-[28px] sm:text-[34px] block" style={{ color: '#0080C8' }}>
            가장 좋은 임플란트는
          </span>
          <span className="text-[28px] sm:text-[34px] block mt-1 text-white">
            내가 가진{' '}
            <span style={{ color: '#0080C8' }}>자연치아</span>{' '}입니다.
          </span>
        </h2>
        <p className={`text-[18px] text-white/85 leading-[1.85] max-w-sm ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={isVisible ? { animationDelay: '0.2s' } : undefined}>
          자연치아는 인공치아가 결코 흉내 낼 수 없는{' '}
          <strong style={{ color: '#0080C8' }}>고유의 치주인대</strong>를 가지고 있어,
          외부 충격을 완화하는 천연 완충 작용을 합니다.
        </p>
        <Link
          href="/natural-tooth"
          className={`mt-6 inline-flex min-h-[44px] items-center text-[18px] font-medium px-8 py-3 rounded-full transition-all duration-200 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={{
            color: '#0080C8',
            border: '1.5px solid #0080C8',
            ...(isVisible ? { animationDelay: '0.4s' } : {}),
          }}
        >
          자연치아 보존치료 →
        </Link>
      </div>

      {/* ── 데스크탑 콘텐츠: 2-column ── */}
      <div className="hidden md:flex relative z-10 h-full w-full max-w-6xl mx-auto px-6 lg:px-12 items-start pt-[20vh]">
        <div className="grid grid-cols-2 gap-16 items-start w-full">

          {/* 좌측: 헤드라인 — 80px 위로 올림 */}
          <div
            className={`${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            style={{ marginTop: '-80px' }}
          >
            <h2 className="font-black leading-[1.1]" style={{ color: '#2B2D42' }}>
              <span className="text-6xl lg:text-7xl block">
                <span style={{ color: '#0080C8' }}>가장 좋은</span>{' '}임플란트는
              </span>
              <span className="text-6xl lg:text-7xl block mt-1">
                내가 가진{' '}
                <span style={{ color: '#0080C8' }}>자연치아</span>{' '}입니다.
              </span>
            </h2>
          </div>

          {/* 우측: 본문 */}
          <div className="space-y-4">
            <p className={`text-[18px] leading-[1.9] text-gray-600 ${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
              style={isVisible ? { animationDelay: '0.15s' } : undefined}>
              자연치아는 인공치아가 결코 흉내 낼 수 없는{' '}
              <strong style={{ color: '#0080C8' }}>고유의 치주인대</strong>를 가지고 있어,
              음식의 질감을 느끼게 하고 외부 충격을 완화하는 천연{' '}
              <strong style={{ color: '#0080C8' }}>완충 작용</strong>을 합니다.
            </p>
            <p className={`text-[18px] leading-[1.9] text-gray-600 ${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
              style={isVisible ? { animationDelay: '0.28s' } : undefined}>
              손상이 큰 경우에도{' '}
              <strong style={{ color: '#0080C8' }}>불필요한 삭제를 줄이는 방향</strong>으로
              신중하게 결정합니다.
              결국 중요한 것은 치료 방법 자체가 아니라, 환자분의 치아 상태에 맞는 적절한 선택입니다.
            </p>
            <p className={`text-[18px] leading-[1.9] text-gray-600 ${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
              style={isVisible ? { animationDelay: '0.4s' } : undefined}>
              <strong style={{ color: '#0080C8' }}>
                자연치아를 얼마나 오래, 건강하게 유지할 수 있는가
              </strong>
              <br />— 이 원칙을 바탕으로 기능과 형태를 함께 회복하는 치료를 진행합니다.
            </p>
            <Link
              href="/natural-tooth"
              className={`inline-flex min-h-[44px] items-center mt-2 px-6 py-3 rounded-2xl text-white text-[18px] font-medium transition-opacity hover:opacity-80 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
              style={{ backgroundColor: '#0080C8', ...(isVisible ? { animationDelay: '0.52s' } : {}) }}
            >
              자연치아 보존치료 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
