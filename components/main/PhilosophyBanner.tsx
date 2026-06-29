'use client'

import { useRef, useEffect, useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function PhilosophyBanner() {
  const { ref, isVisible } = useScrollReveal(0.2)
  const rightRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [scrolledToEnd, setScrolledToEnd] = useState(false)

  useEffect(() => {
    const rightEl = rightRef.current
    const sectionEl = sectionRef.current
    if (!rightEl || !sectionEl) return

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = rightEl
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2
      const atTop = scrollTop <= 0

      // 아래로 스크롤 중 + 아직 끝 안 닿음 → 오른쪽만 스크롤
      if (e.deltaY > 0 && !atBottom) {
        e.preventDefault()
        rightEl.scrollTop += e.deltaY
        return
      }

      // 위로 스크롤 중 + 아직 맨 위 아님 → 오른쪽만 스크롤
      if (e.deltaY < 0 && !atTop) {
        e.preventDefault()
        rightEl.scrollTop += e.deltaY
        return
      }

      // 끝까지 내렸으면 다음 섹션으로 이동 허용
      setScrolledToEnd(atBottom)
    }

    sectionEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => sectionEl.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <section
      ref={(el: HTMLElement | null) => {
        sectionRef.current = el
        const r = ref as React.MutableRefObject<HTMLDivElement | null> | ((node: HTMLDivElement | null) => void)
        if (typeof r === 'function') r(el as HTMLDivElement | null)
        else if (r) r.current = el as HTMLDivElement | null
      }}
      className="h-screen w-full flex items-center overflow-hidden"
      style={{ backgroundColor: 'var(--e-bg)' }}
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pr-12 sm:pr-16 lg:pr-20 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-20 items-start h-full md:py-16 pt-10 md:pt-0">
        {/* 좌측: 고정 타이틀 */}
        <div className="flex flex-col justify-center h-full">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-[1.35] ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
          >
            우리는 기술보다
            <br />
            <span style={{ color: 'var(--e-primary)' }}>마음의 무게</span>를
            <br />
            먼저 생각합니다.
          </h2>
          <p
            className={`text-sm sm:text-base text-gray-400 mt-6 leading-relaxed ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: '0.3s' } : undefined}
          >
            8년의 진심,
            <br />
            서울대 출신 대표원장의 책임 진료
          </p>
          <div
            className={`w-14 h-1.5 mt-6 rounded-full ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            style={{ backgroundColor: 'var(--e-primary)', animationDelay: isVisible ? '0.4s' : undefined }}
          />
        </div>

        {/* 우측: 내부 스크롤 (스크롤바 숨김) */}
        <div
          ref={rightRef}
          className={`h-full pt-8 md:pt-16 pb-24 overflow-y-auto ${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            ...(isVisible ? { animationDelay: '0.5s' } : {}),
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          <div className="space-y-10" style={{ lineHeight: '2' }}>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700">
              마음을 담아 정성을 다한다는 것,
              <br />
              그것은 저희에게 단순한 구호가 아닌
              <br />
              지난 <span style={{ color: 'var(--e-primary)', fontWeight: 900 }}>8년간</span> 지켜온
              <br />
              <span className="text-gray-900 font-black">단 하나의 약속</span>입니다.
            </p>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-500">
              한 자리에서 8년이라는 시간 동안,
              <br />
              <span style={{ color: 'var(--e-primary)', fontWeight: 900 }}>서울대학교 출신 대표원장 2인</span>이
              <br />
              바뀌지 않고 모든 환자분을
              <br />
              <span className="text-gray-900 font-black">끝까지 책임지며</span> 진료해 왔습니다.
            </p>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-500">
              환자 한 분을 위해
              <br />
              각 분야별 전문 원장님들이
              <br />
              상주하며 머리를 맞댑니다.
              <br />
              더 정확하고 깊이 있는
              <br />
              <span style={{ color: 'var(--e-primary)', fontWeight: 900 }}>협진 시스템</span>을 고집합니다.
            </p>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-500">
              고난도 임플란트부터
              <br />
              두려움을 줄여드리는
              <br />
              <span style={{ color: 'var(--e-primary)', fontWeight: 900 }}>안전한 수면치료</span>까지,
              <br />
              보이지 않는 곳에서
              <br />
              <span className="text-gray-900 font-black">대학병원급 멸균 소독</span>으로
              <br />
              안심을 더합니다.
            </p>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-500">
              내 가족의 아픔을 돌보듯
              <br />
              따뜻한 미소로 대하는 직원들,
              <br />
              그리고 치료가 끝난 후에도
              <br />
              당신의 곁을 지키는
              <br />
              <span style={{ color: 'var(--e-primary)', fontWeight: 900 }}>평생 주치의</span>가 되겠습니다.
            </p>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
              처음의 마음을 잊지 않고,
              <br />
              당신의 소중한 치아 건강을 위해
              <br />
              <span className="text-gray-900 font-black">끝까지 곁에 머무는 병원</span>이
              <br />
              될 것을 약속드립니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
