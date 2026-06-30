'use client'

import Image from 'next/image'
import { clinicInfo } from '@/data/clinic-info'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Phone, MapPin, Navigation } from 'lucide-react'

const KAKAO_DIRECTIONS = `https://map.kakao.com/link/to/서울이건치과,${clinicInfo.latitude},${clinicInfo.longitude}`
const KAKAO_MAP = `https://map.kakao.com/link/map/서울이건치과,${clinicInfo.latitude},${clinicInfo.longitude}`

const KakaoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.7 2.6-.8 3-.1.5.2.5.4.4.2-.1 2.6-1.8 3.7-2.5.6.1 1.3.1 2 .1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
  </svg>
)

export default function MapSection() {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section
      ref={ref}
      className="w-full bg-[#0f1216] text-white"
      aria-label="오시는 길 · 진료 안내"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* ── Contact ── */}
          <div className={`lg:col-span-3 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}>
            <p className="text-[#38b6ff] text-[18px] font-bold tracking-[0.16em] uppercase mb-5">
              Contact
            </p>
            <a
              href={`tel:${clinicInfo.phone}`}
              className="inline-flex items-center gap-2.5 text-[30px] lg:text-[34px] font-extrabold tracking-tight hover:text-[#38b6ff] transition-colors"
            >
              <Phone size={22} className="text-[#38b6ff]" aria-hidden="true" />
              {clinicInfo.phone}
            </a>

            <div className="mt-6 space-y-2">
              {clinicInfo.businessHours.map((h) => (
                <div key={h.day} className="flex items-baseline text-[18px]">
                  <span className="w-9 shrink-0 whitespace-nowrap text-white/45">{h.day}</span>
                  <span className="tabular-nums text-white/85">{h.hours}</span>
                  {h.note && (
                    <span className="ml-2 text-[18px] text-[#38b6ff] font-medium">{h.note}</span>
                  )}
                </div>
              ))}
              <div className="flex items-baseline text-[18px]">
                <span className="w-9 shrink-0 whitespace-nowrap text-white/45">점심</span>
                <span className="tabular-nums text-white/60">{clinicInfo.lunchTime}</span>
              </div>
            </div>

            <div className="mt-5 space-y-1 text-[18px] text-white/40 leading-relaxed">
              <p>※ 일요일 · 공휴일은 휴진입니다.</p>
              <p>※ 토요일은 점심시간 없이 진료합니다.</p>
            </div>
          </div>

          {/* ── Location ── */}
          <div className={`lg:col-span-4 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: '0.1s' } : undefined}
          >
            <p className="text-[#38b6ff] text-[18px] font-bold tracking-[0.16em] uppercase mb-5">
              Location
            </p>

            <div className="flex items-start gap-2.5">
              <MapPin size={20} className="text-[#38b6ff] shrink-0 mt-1" aria-hidden="true" />
              <p className="text-[18px] lg:text-[19px] font-semibold leading-relaxed">
                경기도 수원시 영통구<br />
                인계로220번길 6-3 미산빌딩 2층
              </p>
            </div>

            <div className="mt-6 space-y-3 text-[18px] text-white/70 leading-relaxed">
              <p>
                <span className="text-[#38b6ff] font-semibold">[ 본관 ]</span> 매탄위브하늘채 후문상가 파리바게트 2층
              </p>
              <p>
                <span className="text-[#38b6ff] font-semibold">[ 별관 ]</span> 뜰커피, GS마트 3층
              </p>
              <p>
                <span className="text-[#38b6ff] font-semibold">[ 주차 ]</span> 위브하늘채 B상가 주차장 (진료후 주차등록)
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={KAKAO_DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 bg-[#FEE500] hover:bg-[#f5dc00] text-[#3C1E1E] font-bold text-[18px] px-5 py-3 rounded-full transition-colors"
              >
                <KakaoIcon />
                카카오맵 길찾기
              </a>
              <a
                href={KAKAO_MAP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 border border-white/20 hover:border-[#38b6ff] hover:text-[#38b6ff] text-white/80 font-medium text-[18px] px-5 py-3 rounded-full transition-colors"
              >
                <Navigation size={15} aria-hidden="true" />
                지도 크게 보기
              </a>
            </div>
          </div>

          {/* ── Map ── */}
          <div className={`lg:col-span-5 ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: '0.2s' } : undefined}
          >
            <a
              href={KAKAO_MAP}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="카카오맵에서 서울이건치과 위치 보기"
              className="group relative block w-full aspect-[16/11] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            >
              <Image
                src="/images/clinic/map.png"
                alt="서울이건치과 위치 지도"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[18px] font-medium px-4 py-2 rounded-full">
                <Navigation size={13} aria-hidden="true" />
                지도 보기
              </span>
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}
