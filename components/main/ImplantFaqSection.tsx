'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const FAQS = [
  {
    q: '올온 임플란트는 어떤 분에게 적합한가요?',
    a: '전체 치아가 없거나 상태가 좋지 않아 전악 복원이 필요한 분, 기존 틀니의 불편함을 겪고 계신 분께 권장드립니다. 뼈 상태에 따라 4개 또는 6개의 임플란트로 고정합니다.',
  },
  {
    q: '수술 당일부터 음식을 먹을 수 있나요?',
    a: '즉시로딩 방식의 경우 수술 당일 임시 치아가 장착되어 부드러운 음식 섭취가 가능합니다. 최종 보철 완성까지는 단단한 음식을 피하시는 것이 좋습니다.',
  },
  {
    q: '임플란트 수명은 얼마나 되나요?',
    a: '적절한 관리와 정기 검진을 받으시면 반영구적으로 사용 가능합니다. 구강 위생 관리와 정기적인 내원이 수명을 결정하는 가장 중요한 요소입니다.',
  },
  {
    q: '수술 후 통증이 심한가요?',
    a: '의식하 진정(수면) 마취로 수술 중 불편함을 최소화하며, 수술 후에도 처방 약물로 통증을 효과적으로 조절할 수 있습니다.',
  },
  {
    q: '네비게이션 임플란트의 장점은?',
    a: '3D CT 데이터 기반으로 시술 계획을 수립하고 맞춤 수술 가이드를 제작해 정확한 위치에 식립합니다. 최소 절개로 회복이 빠르고 주요 신경·혈관 손상 위험을 크게 줄일 수 있습니다.',
  },
]

export default function ImplantFaqSection() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const { ref, isVisible } = useScrollReveal(0.15)

  const isOpen = (i: number) => hoverIdx === i

  return (
    <section
      ref={ref}
      className="min-h-screen w-full flex flex-col justify-center"
      style={{ backgroundColor: '#1a2035' }}
    >
      <div className="w-full max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-[0.85fr_1.75fr] gap-8 sm:gap-7 lg:gap-14 items-center">

          {/* 왼쪽: 제목 */}
          <div className={`${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <p
              className="tracking-[0.3em] uppercase mb-4"
              style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}
            >
              FREQUENTLY ASKED
            </p>
            <h2
              className="font-bold text-white leading-tight"
              style={{ fontSize: 'clamp(26px, 3vw, 42px)' }}
            >
              {/* 모바일: 2줄, 데스크탑: 3줄 */}
              <span className="sm:hidden">
                궁금한점을
                <br />
                먼저 풀어드립니다.
              </span>
              <span className="hidden sm:inline">
                궁금한 점을
                <br />
                먼저
                <br />
                풀어드립니다.
              </span>
            </h2>
          </div>

          {/* 오른쪽: 아코디언 */}
          <div
            className={`${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
            style={isVisible ? { animationDelay: '0.15s' } : undefined}
          >
            {FAQS.map((faq, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  borderLeft: isOpen(i) ? '3px solid #4fc3f7' : '3px solid transparent',
                  paddingLeft: isOpen(i) ? '12px' : '0px',
                  transition: 'border-left-color 0.25s ease, padding-left 0.25s ease',
                }}
              >
                {/* 질문 버튼 */}
                <button
                  className="w-full flex items-center justify-between text-left gap-4"
                  style={{ paddingTop: '14px', paddingBottom: isOpen(i) ? '10px' : '14px' }}
                >
                  <span
                    style={{
                      fontSize: '18px',
                      color: isOpen(i) ? '#4fc3f7' : 'rgba(255,255,255,0.5)',
                      flexShrink: 0,
                      transition: 'color 0.2s ease',
                    }}
                  >
                    Q.
                  </span>
                  <span
                    className="flex-1 text-[18px]"
                    style={{
                      fontWeight: isOpen(i) ? 700 : 500,
                      color: isOpen(i) ? '#fff' : 'rgba(255,255,255,0.92)',
                      transition: 'color 0.2s ease, font-weight 0.2s ease',
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      border: `1px solid ${isOpen(i) ? 'rgba(79,195,247,0.5)' : 'rgba(255,255,255,0.2)'}`,
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <Plus size={12} style={{ color: isOpen(i) ? '#4fc3f7' : 'rgba(255,255,255,0.4)' }} />
                  </span>
                </button>

                {/* 답변 — max-height 트랜지션으로 부드럽게 열림 */}
                <div
                  style={{
                    maxHeight: isOpen(i) ? '160px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.38s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                >
                  <div style={{ paddingBottom: '16px', paddingLeft: '38px', paddingRight: '32px' }}>
                    <p
                      style={{
                        fontSize: '18px',
                        color: 'rgba(255,255,255,0.62)',
                        lineHeight: 1.65,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
