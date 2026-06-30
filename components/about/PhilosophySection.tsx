'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'

const CORE_VALUES = [
  {
    title: '책임진료',
    description:
      '처음 상담부터 치료 마무리까지\n담당 원장이 직접 책임지고 진료합니다.',
  },
  {
    title: '과잉진료 Zero',
    description:
      '필요한 치료만,\n정직하게 안내드립니다.\n최선의 선택지를 함께 고민합니다.',
  },
  {
    title: '통증 최소화',
    description:
      '무통마취기법과\n충분한 마취시간으로\n두려움 없이 치료받으실 수 있습니다.',
  },
  {
    title: '장기적 관점',
    description:
      '빠른 치료보다 오래가는 치료를\n목표로 자연치아 보존을 우선 고려합니다.',
  },
]

export default function PhilosophySection() {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section
      id="philosophy"
      className="py-12 sm:py-28 md:min-h-screen md:flex md:flex-col md:justify-center bg-white scroll-mt-32"
      aria-labelledby="philosophy-heading"
    >
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 레이블 */}
        <p className={`text-sm font-semibold tracking-[0.25em] uppercase text-[#0080C8] mb-4 ${isVisible ? 'domino-rise' : 'domino-hidden'}`}>
          Our Philosophy
        </p>

        {/* 메인 타이틀 */}
        <h2
          id="philosophy-heading"
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-normal mb-4 ${isVisible ? 'domino-rise' : 'domino-hidden'}`}
          style={isVisible ? { animationDelay: '0.1s' } : undefined}
        >
          마음을 담아<br />
          <span className="text-[#0080C8]">정성을 다하여</span>
        </h2>

        {/* 인트로 문구 */}
        <p className={`text-base sm:text-[18px] text-gray-600 leading-[1.85] tracking-normal max-w-2xl mb-12 sm:mb-16 ${isVisible ? 'domino-rise' : 'domino-hidden'}`}
          style={isVisible ? { animationDelay: '0.2s' } : undefined}
        >
          서울대학교 출신 원장들이 모여<br />
          처음부터 끝까지 직접 책임지는 진료를 실천합니다.
        </p>

        {/* 핵심 가치 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {CORE_VALUES.map((value, i) => (
            <div key={value.title}
              className={`group ${isVisible ? 'domino-rise' : 'domino-hidden'}`}
              style={isVisible ? { animationDelay: `${0.3 + i * 0.1}s` } : undefined}
            >
              <div className="flex items-start gap-4 py-1">
                <div className="w-1 h-full min-h-16 bg-[#0080C8]/30 rounded-full group-hover:bg-[#0080C8] transition-colors mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-[20px] sm:text-[21px] leading-[1.35] tracking-normal">
                    {value.title}
                  </h3>
                  <p className="text-[18px] sm:text-[19px] text-gray-600 leading-[1.85] tracking-normal whitespace-pre-line">
                    {value.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
