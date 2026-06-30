'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { doctors } from '@/data/doctors'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const HOVER_SPECIALTY: Record<string, string> = {
  'lee-jaesung':  '고난도진료 · 심미보철',
  'jung-chaeyun': '임플란트 · 디지털보철',
  'yoo-suhyun':   '교정진료',
  'park-jiwon':   '보존진료, 일반진료',
  'baek-seola':   '소아진료',
}

const DOCTOR_ORDER = ['lee-jaesung', 'jung-chaeyun', 'yoo-suhyun', 'park-jiwon', 'baek-seola']

export default function DoctorTeamSection() {
  const [hoveredId,     setHoveredId]     = useState<string | null>(null)
  const [highlightIdx,  setHighlightIdx]  = useState<number | null>(null)
  const { ref, isVisible } = useScrollReveal(0.15)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displayDoctors = [...doctors].sort(
    (a, b) => DOCTOR_ORDER.indexOf(a.id) - DOCTOR_ORDER.indexOf(b.id)
  )

  const runHighlight = () => {
    // 진행 중인 타이머 클리어
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)

    let idx = 0
    const step = () => {
      if (idx >= displayDoctors.length) {
        setHighlightIdx(null)
        return
      }
      setHighlightIdx(idx)
      idx++
      highlightTimerRef.current = setTimeout(step, 500)
    }
    step()
  }

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    }
  }, [])

  const handleClick = (doctorId: string) => {
    const el = document.getElementById(doctorId)
    if (!el) return
    window.dispatchEvent(new CustomEvent('about-anchor-scroll'))
    const OFFSET = 96
    const top = el.getBoundingClientRect().top + window.scrollY - OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const handleCardClick = (doctorId: string) => {
    runHighlight()
    // 하이라이트 시작 직후 스크롤 (동시 진행)
    setTimeout(() => handleClick(doctorId), 200)
  }

  return (
    <section ref={ref} id="doctors" className="py-10 sm:py-24 bg-[#F8F7F9] border-b border-gray-100 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 타이틀 */}
        <div className={`mb-10 sm:mb-14 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}>
          <p className="text-xs tracking-[0.35em] uppercase text-[#0080C8] mb-2">Medical Team</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">이건진료진</h2>
          <div className="mt-3 w-10 h-0.5 bg-[#0080C8]" />
        </div>

        {/* 원장님 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {displayDoctors.map((doctor, i) => {
            const isHovered    = hoveredId === doctor.id
            const isHighlighted = highlightIdx === i

            return (
              <div
                key={doctor.id}
                className={`flex flex-col ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
                style={isVisible ? { animationDelay: `${i * 0.1}s` } : undefined}
                onMouseEnter={() => setHoveredId(doctor.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  className="relative rounded-2xl overflow-hidden cursor-pointer text-left group focus:outline-none"
                  style={{ aspectRatio: '3/4' }}
                  onClick={() => handleCardClick(doctor.id)}
                  aria-label={`${doctor.name} ${doctor.role} 소개 보기`}
                >
                  {/* 사진 */}
                  <Image
                    src={doctor.image}
                    alt={`${doctor.name} ${doctor.role}`}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="absolute inset-0 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* 기본 하단 그라디언트 + 이름 */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-4"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
                    }}
                  >
                    <p className="text-white font-bold text-[18px] leading-tight">
                      {doctor.name}
                    </p>
                    <p className="mt-1 text-white/75 text-[14px]">{doctor.role}</p>
                  </div>

                  {/* 호버 오버레이: 약력 */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,64,128,0.92) 0%, rgba(0,64,128,0.6) 50%, rgba(0,0,0,0.1) 100%)',
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    <p className="text-[11px] tracking-[0.2em] uppercase text-[#0080C8] font-medium mb-1">
                      {doctor.specialty}
                    </p>
                    <p className="text-white font-bold text-base mb-2 leading-tight">
                      {doctor.name} {doctor.role}
                    </p>
                    <ul className="space-y-1">
                      {doctor.careers.slice(0, 3).map((career, j) => (
                        <li key={j} className="text-white/85 text-[11px] leading-snug flex items-start gap-1">
                          <span className="text-[#0080C8] mt-0.5 shrink-0">·</span>
                          {career}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[11px] text-[#0080C8] font-medium tracking-wide">
                      자세히 보기 →
                    </p>
                  </div>

                  {/* 순차 하이라이트 플래시 오버레이 */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(0,128,200,0.4) 100%)',
                      opacity: isHighlighted ? 1 : 0,
                      transition: 'opacity 120ms ease',
                    }}
                  />
                </button>

                <div className="pt-3 text-center">
                  <p className="text-[18px] font-bold leading-tight text-gray-950">
                    {doctor.name} <span className="text-gray-500">{doctor.role}</span>
                  </p>
                  <p className="mt-1 text-[16px] font-extrabold leading-tight text-[#0080C8]">
                    {doctor.specialtyDetail || HOVER_SPECIALTY[doctor.id] || doctor.specialty}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
