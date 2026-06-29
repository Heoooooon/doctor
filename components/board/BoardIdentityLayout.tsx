'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import ScrollFillText from '@/components/ScrollFillText'
import RevealLines from '@/components/RevealLines'

interface Pillar {
  title: string
  description: string
}

interface BoardIdentityLayoutProps {
  label: string
  title: React.ReactNode
  description: React.ReactNode
  pillars: Pillar[]
  fill?: boolean      // 인트로 설명문에 스크롤-필(fill-by-scroll) 효과 적용
  frosted?: boolean   // 페이지 배경이 비치되 글자는 또렷하게 (반투명+블러, 소아치과 등)
}

export default function BoardIdentityLayout({ label, title, description, pillars, frosted = false, fill = false }: BoardIdentityLayoutProps) {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section className={`py-16 sm:py-24 border-b border-gray-100 ${frosted ? 'bg-white/70 backdrop-blur-md' : 'bg-white'}`}>
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className={`text-sm font-semibold tracking-[0.25em] uppercase text-[#0080C8] mb-4 ${isVisible ? 'domino-rise' : 'domino-hidden'}`}>
          {label}
        </p>

        {fill ? (
          <RevealLines className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-normal mb-4">
            {title}
          </RevealLines>
        ) : (
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-normal mb-4 ${isVisible ? 'domino-rise' : 'domino-hidden'}`}
            style={isVisible ? { animationDelay: '0.14s' } : undefined}>
            {title}
          </h2>
        )}

        {fill ? (
          <ScrollFillText className="text-base sm:text-[18px] leading-[1.85] tracking-normal max-w-2xl mb-12 sm:mb-16">
            {description}
          </ScrollFillText>
        ) : (
          <p className={`text-base sm:text-[18px] text-gray-600 leading-[1.85] tracking-normal max-w-2xl mb-12 sm:mb-16 ${isVisible ? 'domino-rise' : 'domino-hidden'}`}
            style={isVisible ? { animationDelay: '0.28s' } : undefined}>
            {description}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {pillars.map((pillar, i) => (
            <div key={pillar.title}
              className={`group ${isVisible ? 'domino-rise' : 'domino-hidden'}`}
              style={isVisible ? { animationDelay: `${0.42 + i * 0.14}s` } : undefined}
            >
              <div className="flex items-start gap-4 py-1">
                <div className="w-1 h-full min-h-16 bg-[#0080C8]/30 rounded-full group-hover:bg-[#0080C8] transition-colors mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-[20px] sm:text-[21px] leading-[1.35] tracking-normal">
                    {pillar.title}
                  </h3>
                  <p className="text-base sm:text-[19px] text-gray-600 leading-[1.85] tracking-normal whitespace-pre-line">
                    {pillar.description}
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
