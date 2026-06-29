'use client'

import Image from 'next/image'
import { clinicInfo } from '@/data/clinic-info'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Clock } from 'lucide-react'

const KAKAO_HREF = `https://map.kakao.com/link/to/서울이건치과 수원점,${clinicInfo.latitude},${clinicInfo.longitude}`

const KakaoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2C6.48 2 2 5.58 2 10c0 2.8 1.8 5.27 4.55 6.72L12 22l5.45-5.28C20.2 15.27 22 12.8 22 10c0-4.42-4.48-8-10-8z" fill="#3C1E1E"/>
    <circle cx="12" cy="10" r="3" fill="#FEE500"/>
  </svg>
)

export default function MapSection() {
  const { ref, isVisible } = useScrollReveal(0.2)

  return (
    <section ref={ref} className="relative w-full">
      {/* 지도 이미지 — 모바일 고정 높이 / 데스크탑 fullscreen */}
      <div className="relative w-full h-[220px] md:h-screen">
        <Image
          src="/images/clinic/map.png"
          alt="서울이건치과 위치 지도"
          fill
          sizes="100vw"
          className="object-cover"
        />

        {/* 데스크탑: 왼쪽 정보 카드 */}
        <div className="hidden md:flex absolute inset-y-0 left-0 z-10 items-center pl-10">
          <div className="scale-[0.8] origin-top-left">
            <div className={`w-[240px] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 md:p-5 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}>
              <Image
                src="/images/logo/egun-logo.png"
                alt="서울이건치과"
                width={1000}
                height={400}
                className="h-12 w-auto mb-3"
              />
              <div className="w-8 h-0.5 bg-[var(--e-primary)] mb-3" />
              <a
                href={`tel:${clinicInfo.phone}`}
                className="block text-lg md:text-xl font-bold text-gray-900 tracking-wide mb-2 hover:text-[var(--e-primary)] transition-colors"
              >
                {clinicInfo.phone}
              </a>
              <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
                경기도 수원시 영통구<br />
                인계로220번길 6-3 미산빌딩 2층
              </p>
              <a
                href={KAKAO_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold text-[11px] py-2 rounded-lg transition-colors"
              >
                <KakaoIcon />
                카카오맵 길찾기
              </a>
            </div>
          </div>
        </div>

        {/* 데스크탑: 오른쪽 진료시간 카드 */}
        <div className="hidden md:flex absolute inset-y-0 right-0 z-10 items-center pr-10">
          <div className={`w-[460px] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-5 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: '0.15s' } : undefined}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[var(--e-primary)] shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold text-gray-800">진료시간</span>
            </div>
            <div className="w-8 h-0.5 bg-[var(--e-primary)] mb-3" />
            <div className="space-y-1.5">
              {clinicInfo.businessHours.map((h) => (
                <div key={h.day} className="flex items-center text-sm">
                  <span className="text-gray-500 w-7 shrink-0">{h.day}</span>
                  <span className={`w-36 shrink-0 tabular-nums ${h.isClosed ? 'text-gray-300' : 'text-gray-800'}`}>
                    {h.hours}
                  </span>
                  {h.note && (
                    <span className="text-xs text-[var(--e-primary)] font-medium">{h.note}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              점심 12:30 – 14:00 &nbsp;·&nbsp; 토요일 점심 없음 &nbsp;·&nbsp; 일요일 휴진
            </p>
          </div>
        </div>

      </div>

      {/* 모바일 전용: 지도 아래 카드 영역 */}
      <div className="md:hidden bg-white px-4 pt-5 pb-6 flex flex-col gap-4">

        {/* 정보 카드 */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
          <Image
            src="/images/logo/egun-logo.png"
            alt="서울이건치과"
            width={1000}
            height={400}
            className="h-9 w-auto mb-3"
          />
          <div className="w-8 h-0.5 bg-[var(--e-primary)] mb-3" />
          <a
            href={`tel:${clinicInfo.phone}`}
            className="flex items-center text-lg font-bold text-gray-900 tracking-wide mb-2 hover:text-[var(--e-primary)] transition-colors min-h-[44px]"
          >
            {clinicInfo.phone}
          </a>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            경기도 수원시 영통구<br />
            인계로220번길 6-3 미산빌딩 2층
          </p>
          <a
            href={KAKAO_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] font-semibold text-sm rounded-lg transition-colors min-h-[44px]"
          >
            <KakaoIcon />
            카카오맵 길찾기
          </a>
        </div>

        {/* 진료시간 카드 */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[var(--e-primary)] shrink-0" aria-hidden="true" />
            <span className="text-sm font-bold text-gray-800">진료시간</span>
          </div>
          <div className="w-8 h-0.5 bg-[var(--e-primary)] mb-3" />
          <div className="space-y-2">
            {clinicInfo.businessHours.map((h) => (
              <div key={h.day} className="flex items-center text-sm">
                <span className="text-gray-500 w-7 shrink-0">{h.day}</span>
                <span className={`flex-1 tabular-nums ${h.isClosed ? 'text-gray-300' : 'text-gray-800'}`}>
                  {h.hours}
                </span>
                {h.note && (
                  <span className="text-xs text-[var(--e-primary)] font-medium">{h.note}</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 leading-relaxed">
            점심 12:30 – 14:00 (토요일 없음 · 일요일 휴진)
          </p>
        </div>

      </div>
    </section>
  )
}
