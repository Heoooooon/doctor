'use client'

import { doctors } from '@/data/doctors'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import DoctorTeamSection from '@/components/about/DoctorTeamSection'

const DOCTOR_ORDER = ['lee-jaesung', 'jung-chaeyun', 'yoo-suhyun', 'park-jiwon', 'baek-seola']

function DoctorCard({
  doctor,
  index,
}: {
  doctor: (typeof doctors)[0]
  index: number
}) {
  const isReverse = index % 2 === 1
  const { ref, isVisible } = useScrollReveal(0.08)
  const mergedRef = (node: HTMLElement | null) => {
    (ref as React.MutableRefObject<HTMLElement | null>).current = node
  }

  return (
    <article
      ref={mergedRef}
      id={doctor.id}
      className={`w-full scroll-mt-24 ${isReverse ? 'bg-[#F8F8F8]' : 'bg-white'}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch w-full max-w-[1400px] mx-auto">
        {/* 사진 */}
        <div className="flex-shrink-0 w-full lg:w-[440px] lg:self-stretch relative overflow-hidden">
          <img
            src={doctor.image}
            alt={`${doctor.name} ${doctor.role}`}
            className="w-full h-[340px] lg:h-full object-cover object-top block"
          />
          {doctor.documents && doctor.documents.length > 0 && (
            <div className="absolute bottom-4 right-4 flex gap-2 lg:gap-3">
              {doctor.documents.map((doc, i) => (
                <img
                  key={i}
                  src={doc}
                  alt={`${doctor.name} 자격증 ${i + 1}`}
                  className="h-[90px] lg:h-[150px] w-auto shadow-2xl border-2 border-white/40 rounded-sm"
                />
              ))}
            </div>
          )}
        </div>

        {/* 텍스트 영역 */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-16">

          {/* ① 이름 + 구분선 — 가장 먼저 */}
          <div
            className={isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}
            style={isVisible ? { animationDelay: '0.05s' } : undefined}
          >
            <h2 className="text-[26px] lg:text-[38px] font-bold leading-[1.3] tracking-[-0.02em] text-[#2E2E2E]">
              {doctor.name} {doctor.role}
            </h2>
            <div className="w-full h-px bg-gray-300 mt-4 mb-4 lg:mt-5 lg:mb-5" />
          </div>

          {/* ② 전문과 + 약력 — ①이 60% 됐을 때 시작 */}
          <div
            className={isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}
            style={isVisible ? { animationDelay: '0.42s' } : undefined}
          >
            <span className="block text-[15px] lg:text-[24px] font-normal leading-[1.4] tracking-[-0.015em] text-[#1D458F] mb-4 lg:mb-6">
              {doctor.specialtyDetail ?? doctor.specialty}
            </span>
            <div className="flex flex-col sm:flex-row gap-x-12">
              <ul>
                {doctor.careers.map((c, i) => (
                  <li
                    key={i}
                    className={`text-[13px] lg:text-[17px] leading-[28px] tracking-[-0.01em] ${
                      i === 0 ? 'font-bold text-[#2E2E2E]' : 'font-normal text-[#5C5C5C]'
                    }`}
                  >
                    • {c}
                  </li>
                ))}
              </ul>
              {doctor.memberships && doctor.memberships.length > 0 && (
                <ul className="mt-2 sm:mt-0">
                  {doctor.memberships.map((m, i) => (
                    <li key={i} className="text-[13px] lg:text-[17px] font-normal leading-[28px] tracking-[-0.01em] text-[#5C5C5C]">
                      • {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ③ 한 마디 — ②가 60% 됐을 때 시작 */}
          {doctor.letter && (
            <div
              className={isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}
              style={isVisible ? { animationDelay: '0.78s' } : undefined}
            >
              <p className="mt-8 lg:mt-10 text-[14px] lg:text-[20px] font-bold leading-[1.8] tracking-[-0.01em] text-[#2E2E2E] whitespace-pre-line">
                {doctor.letter}
              </p>
            </div>
          )}
        </div>

      </div>
    </article>
  )
}

export default function DoctorProfileSection() {
  const { ref, isVisible } = useScrollReveal(0.15)
  const displayDoctors = [...doctors].sort(
    (a, b) => DOCTOR_ORDER.indexOf(a.id) - DOCTOR_ORDER.indexOf(b.id)
  )

  return (
    <section
      id="doctor-profile"
      className="bg-stone-50 scroll-mt-36"
      aria-labelledby="doctors-heading"
    >
      {/* 섹션 헤더 — 풀페이지 */}
      <div
        id="doctor-intro"
        className="relative min-h-screen flex items-center max-md:items-end overflow-hidden scroll-mt-20"
      >
        {/* 배경 이미지 */}
        <div
          className="absolute inset-x-0"
          style={{
            top: '-80px',
            bottom: '-10px',
            backgroundImage: "url('/images/clinic/egun-outerior.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'calc(50% + 220px) 0%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 100%)' }} />

        {/* 텍스트 오버레이 — 모바일 + 데스크탑 공통 */}
        {/* 모바일: -110px 위, 아이패드(lg): 6cm 아래 + 2cm 우, 데스크탑(xl+): 0 */}
        <div
          ref={ref}
          className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-8 py-16 sm:py-20
            -translate-y-[110px]
            max-md:translate-y-0 max-md:pb-[calc(var(--mobile-bottom-bar-height)+32px)]
            lg:translate-y-[117px] lg:translate-x-[76px]
            xl:translate-y-0 xl:translate-x-0"
        >
          <p
            className={`text-[18px] sm:text-[23px] font-semibold tracking-[0.25em] uppercase text-[#0080c8] mb-4 ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.95), 0 0 15px rgba(0,128,200,0.5)' }}
          >
            Our Doctors
          </p>
          <h2
            id="doctors-heading"
            className={`text-[31px] sm:text-[41px] lg:text-[49px] font-normal lg:font-bold text-white leading-tight ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: '0.1s' } : undefined}
          >
            한자리에서<br />
            <span style={{ color: '#ffffff', textShadow: '0 0 20px rgba(0,128,200,0.9), 0 2px 12px rgba(0,0,0,0.95)' }}>변하지 않는 마음</span>
          </h2>
          <p
            className={`mt-4 sm:mt-6 text-[20px] sm:text-[28px] lg:text-[30px] text-white/75 lg:text-white/90 max-w-2xl leading-relaxed ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: '0.2s' } : undefined}
          >
            각자의 전문 분야에서 최선을 다하며<br />
            언제나 같은 자리에서 기다리고 있습니다.
          </p>
        </div>
      </div>

      {/* 이건진료진 카드 그리드 */}
      <DoctorTeamSection />

      {/* 원장님 카드 — 각각 */}
      {displayDoctors.map((doctor, index) => (
        <DoctorCard key={doctor.id} doctor={doctor} index={index} />
      ))}
    </section>
  )
}
