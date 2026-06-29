'use client'

import { ArrowRight, MapPin, Phone } from 'lucide-react'

type HeroForegroundProps = {
  readonly current: number
  readonly onConsultClick: () => void
}

type HeroCopy = {
  readonly eyebrow: string
  readonly title: readonly string[]
  readonly description: string
  readonly points: readonly string[]
}

const HERO_COPY: readonly HeroCopy[] = [
  {
    eyebrow: 'SEOUL EGUN DENTAL CLINIC',
    title: ['처음 상담부터', '차분히 설명합니다'],
    description: '현재 상태를 함께 확인하고 필요한 치료 방향을 알기 쉽게 안내합니다.',
    points: ['정확한 진단', '충분한 설명', '부담 없는 상담'],
  },
  {
    eyebrow: 'DIGITAL EXPLANATION',
    title: ['보이는 자료로', '이해를 돕습니다'],
    description: '구강 사진과 디지털 자료를 보며 치료 과정을 천천히 설명합니다.',
    points: ['치료 전 안내', '원장 직접 설명', '이해에서 시작'],
  },
  {
    eyebrow: 'NATURAL TOOTH CARE',
    title: ['가능한 경우', '자연치아 보존을 먼저'],
    description: '치아를 오래 사용할 수 있는 방향을 우선 검토하고 필요한 치료를 제안합니다.',
    points: ['보존 중심', '필요한 치료만', '정직한 계획'],
  },
  {
    eyebrow: 'ORTHODONTIC CARE',
    title: ['치열과 교합까지', '함께 살핍니다'],
    description: '웃는 모습과 생활 습관까지 고려해 교정 상담 방향을 안내합니다.',
    points: ['교정 상담', '생활까지 고려', '차분한 계획'],
  },
  {
    eyebrow: 'COMFORT CARE',
    title: ['편안한 진료를 위해', '불안을 줄입니다'],
    description: '통증과 수술 걱정이 큰 분도 충분히 설명을 듣고 결정할 수 있습니다.',
    points: ['불안감 배려', '진정치료 상담', '개인별 안내'],
  },
  {
    eyebrow: 'START WITH CONSULTATION',
    title: ['내 치아 상태를', '먼저 확인해보세요'],
    description: '상담을 통해 현재 상태와 가능한 선택지를 차분히 안내드립니다.',
    points: ['현재 상태 확인', '가능한 선택지 안내', '차분한 설명'],
  },
] as const

const TRUST_ITEMS = [
  '자연치아 보존 우선',
  '대표원장 직접 설명',
  '디지털 기반 진료',
] as const

export default function HeroForeground({
  current,
  onConsultClick,
}: HeroForegroundProps) {
  const copy = HERO_COPY[current] ?? HERO_COPY[0]
  const eyebrowSuffix = copy.eyebrow.replace('SEOUL EGUN ', '')
  const showConsultActions = current === HERO_COPY.length - 1

  return (
    <>
      <div className="absolute inset-0 z-20 hidden pointer-events-none md:flex">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-center px-8 pt-20">
          <div className="mx-auto max-w-[980px] text-center text-white">
            <p
              className="mx-auto inline-flex min-w-[360px] items-center justify-center gap-1.5 text-[22px] font-semibold tracking-normal text-white/82 lg:text-[24px]"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}
            >
              <span className="text-[var(--e-primary)]">SEOUL EGUN</span>
              <span
                key={`desktop-eyebrow-${current}`}
                className="hero-sequence inline-block whitespace-nowrap"
                style={{ animationDelay: '80ms' }}
              >
                {eyebrowSuffix}
              </span>
            </p>

            <div key={`desktop-copy-${current}`}>
              <h2
                className="mt-5 break-keep text-[46px] font-extrabold leading-[1.16] tracking-normal lg:text-[54px] xl:text-[62px] 2xl:text-[68px]"
                style={{ textShadow: '0 3px 22px rgba(0,0,0,0.6)' }}
              >
                {copy.title.map((line, index) => (
                  <span
                    key={line}
                    className="hero-sequence block"
                    style={{ animationDelay: `${220 + index * 140}ms` }}
                  >
                    {line}
                  </span>
                ))}
              </h2>

              <p
                className="hero-sequence mx-auto mt-5 max-w-[780px] break-keep text-[23px] font-medium leading-[1.6] text-white/88 lg:text-[24px]"
                style={{
                  animationDelay: '560ms',
                  textShadow: '0 2px 14px rgba(0,0,0,0.52)',
                }}
              >
                {copy.description}
              </p>

              {!showConsultActions && (
                <div
                  className="mx-auto mt-5 flex max-w-[820px] flex-wrap justify-center gap-x-4 gap-y-2 text-[22px] font-semibold leading-relaxed text-white/82 lg:text-[24px]"
                  style={{ textShadow: '0 2px 14px rgba(0,0,0,0.52)' }}
                >
                  {copy.points.map((line, index) => (
                    <span
                      key={line}
                      className="hero-sequence break-keep"
                      style={{ animationDelay: `${820 + index * 110}ms` }}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              )}

              {showConsultActions && (
                <>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
                    <button
                      type="button"
                      onClick={onConsultClick}
                      className="hero-sequence inline-flex min-h-[54px] items-center gap-2 rounded-md bg-[var(--e-primary)] px-8 py-3 text-[19px] font-semibold text-white shadow-[0_14px_34px_rgba(0,128,200,0.32)] transition-all duration-200 hover:bg-[#006BA8] hover:shadow-[0_18px_42px_rgba(0,128,200,0.42)] focus:outline-none focus:ring-2 focus:ring-[var(--e-primary)] focus:ring-offset-2 focus:ring-offset-black active:translate-y-px"
                      style={{ animationDelay: '760ms' }}
                    >
                      상담 신청
                      <ArrowRight size={20} aria-hidden="true" />
                    </button>
                    <a
                      href="tel:031-896-5512"
                      className="hero-sequence inline-flex min-h-[54px] items-center gap-2 rounded-md border border-white/35 bg-white/10 px-7 py-3 text-[19px] font-semibold text-white transition-all duration-200 hover:border-white/55 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-black active:translate-y-px"
                      style={{ animationDelay: '890ms' }}
                    >
                      <Phone size={19} aria-hidden="true" />
                      전화 상담 031-896-5512
                    </a>
                    <a
                      href="/location"
                      className="hero-sequence inline-flex min-h-[54px] items-center gap-2 px-2 py-3 text-[19px] font-semibold text-white/82 transition-colors duration-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-black"
                      style={{ animationDelay: '1020ms' }}
                    >
                      <MapPin size={19} aria-hidden="true" />
                      오시는 길
                    </a>
                  </div>

                  <ul className="mx-auto mt-8 grid max-w-[800px] grid-cols-3 border-t border-white/18 pt-5 text-white/78">
                    {TRUST_ITEMS.map((item, index) => (
                      <li
                        key={item}
                        className={`hero-sequence break-keep text-center text-[19px] font-semibold leading-snug ${
                          index === 0 ? '' : 'border-l border-white/18 px-5'
                        }`}
                        style={{ animationDelay: `${1180 + index * 100}ms` }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none md:hidden">
        <div
          className="text-center text-white"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}
        >
          <p className="mb-6 text-[19px] font-semibold tracking-normal text-white/75 sm:mb-8">
            <span className="block text-[var(--e-primary)]">SEOUL EGUN</span>
            <span
              key={`mobile-eyebrow-${current}`}
              className="hero-sequence mt-1 block whitespace-nowrap"
              style={{ animationDelay: '80ms' }}
            >
              {eyebrowSuffix}
            </span>
          </p>
          <div key={`mobile-copy-${current}`}>
            {copy.title.map((line, index) => (
              <p
                key={line}
                className="hero-sequence break-keep text-[32px] font-extrabold leading-[1.23] sm:text-[36px]"
                style={{ animationDelay: `${220 + index * 140}ms` }}
              >
                {line}
              </p>
            ))}
            <p
              className="hero-sequence mx-auto mt-5 max-w-[330px] break-keep text-[19px] font-medium leading-[1.58] text-white/84"
              style={{ animationDelay: '560ms' }}
            >
              {copy.description}
            </p>
            {!showConsultActions && (
              <div className="mx-auto mt-5 flex max-w-[340px] flex-wrap justify-center gap-x-3 gap-y-1 text-[21px] font-semibold text-white/78">
                {copy.points.map((line, index) => (
                  <span
                    key={line}
                    className="hero-sequence break-keep"
                    style={{ animationDelay: `${760 + index * 110}ms` }}
                  >
                    {line}
                  </span>
                ))}
              </div>
            )}
            {showConsultActions && (
              <div
                className="hero-sequence pointer-events-auto mx-auto mt-6 flex max-w-[310px] items-center justify-center gap-2"
                style={{ animationDelay: '760ms' }}
              >
                <button
                  type="button"
                  onClick={onConsultClick}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--e-primary)] px-4 py-3 text-[18px] font-semibold text-white shadow-[0_12px_26px_rgba(0,128,200,0.34)] transition-all duration-200 active:translate-y-px"
                >
                  상담 신청
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <a
                  href="tel:031-896-5512"
                  className="inline-flex min-h-[48px] w-12 items-center justify-center rounded-md border border-white/35 bg-white/12 text-white transition-colors duration-200 active:translate-y-px"
                  aria-label="전화 상담"
                >
                  <Phone size={18} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
