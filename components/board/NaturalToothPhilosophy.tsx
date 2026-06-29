'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function NaturalToothPhilosophy() {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section
      ref={ref}
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pl-8 lg:pr-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* 좌측: 대형 타이틀 — 이미지 레이아웃 동일 */}
          <div className="flex flex-col justify-center">
            <h2
              className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.25] ${isVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            >
              <span className="text-gray-900">가장 </span>
              <span style={{ color: 'var(--e-primary)' }}>좋은 임플란트는</span>
              <br />
              <span style={{ color: 'var(--e-primary)' }}>내 몸이 가진</span>
              <br />
              <span className="text-gray-900">자연치아입니다.</span>
            </h2>
          </div>

          {/* 우측: 상세 본문 */}
          <div className="space-y-5">
            <p
              className={`text-sm sm:text-base text-gray-600 leading-[1.85] ${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
              style={isVisible ? { animationDelay: '0.2s' } : undefined}
            >
              많은 이들이 빠르고 간편한 '대체'를 말할 때, 우리는 조금 더 느리고{' '}
              <strong style={{ color: 'var(--e-primary)' }}>세밀한 '보존'</strong>에 집중합니다.
              자연치아는 인공치아가 결코 흉내 낼 수 없는{' '}
              <strong style={{ color: 'var(--e-primary)' }}>고유의 치주인대</strong>를 가지고 있어,
              음식의 질감을 느끼게 하고 외부 충격을 완화하는 천연{' '}
              <strong style={{ color: 'var(--e-primary)' }}>완충 작용</strong>을 합니다.
            </p>

            <p
              className={`text-sm sm:text-base text-gray-600 leading-[1.85] ${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
              style={isVisible ? { animationDelay: '0.35s' } : undefined}
            >
              손상이 큰 경우에는 치아 보호를 위해 크라운 치료가 필요할 수 있지만,
              이 역시도{' '}
              <strong style={{ color: 'var(--e-primary)' }}>불필요한 삭제를 줄이는 방향</strong>으로
              신중하게 결정합니다.
              결국 중요한 것은 치료 방법 자체가 아니라, 환자분의 치아 상태에 맞는 적절한 선택입니다.
            </p>

            <p
              className={`text-sm sm:text-base text-gray-600 leading-[1.85] ${isVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
              style={isVisible ? { animationDelay: '0.45s' } : undefined}
            >
              <strong style={{ color: 'var(--e-primary)', fontWeight: 700 }}>
                자연치아를 얼마나 오래, 건강하게 유지할 수 있는가
              </strong>
              <br />
              — 이 원칙을 바탕으로 기능과 형태를 함께 회복하는 치료를 진행합니다.
            </p>

            {/* Left Border Blockquote */}
            <blockquote
              className={`relative pl-5 py-4 mt-2 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
              style={{
                borderLeft: '4px solid var(--e-primary)',
                backgroundColor: 'rgba(146, 220, 229, 0.06)',
                borderRadius: '0 8px 8px 0',
                ...(isVisible ? { animationDelay: '0.6s' } : {}),
              }}
            >
              <p className="text-sm sm:text-base text-gray-800 font-semibold leading-[1.9]">
                <span className="block text-base sm:text-lg font-black text-gray-900 mb-1">
                  '뽑기 전 마지막으로 들르는 곳'
                </span>
                그 책임감이 우리의 진료 철학이며,<br />
                타협하지 않는 정석 진료의 핵심입니다.
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
