'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const TYPES = [
  {
    num: '01',
    title: '올온 임플란트',
    subtitle: 'ALL-ON-4 / 6',
    quote: '최소한의 임플란트로 틀니 없이 내 치아처럼',
    features: ['4-6개의 임플란트로 전악 고정', '틀니의 불편함 해소', '수술 당일 임시 치아 장착'],
    img: '/images/treatments/implant/all-on.jpg',
    href: '/implant#all-on',
  },
  {
    num: '02',
    title: '즉시로딩 임플란트',
    subtitle: 'IMMEDIATE LOADING',
    quote: '수술 직후 틀니 없이 식사가 가능한 치아 제작',
    features: ['당일 임시 보철', '저작 기능 즉시 회복', '최소 회복 기간'],
    img: '/images/treatments/implant/immediate_2.webp',
    href: '/implant#immediate-loading',
  },
  {
    num: '03',
    title: '네비게이션 임플란트',
    subtitle: 'NAVIGATION IMPLANT',
    quote: '최소 절개·최소 침습·디지털 임플란트',
    features: ['3D CT 기반 시술 계획', '수술 가이드 제작', '정확한 식립 위치'],
    img: '/images/treatments/implant/navigation.jpg',
    href: '/implant#navigation',
  },
]

export default function ImplantTypeSection() {
  const { ref, isVisible } = useScrollReveal(0.15)

  return (
    <section
      ref={ref}
      className="min-h-screen w-full flex items-center justify-center bg-white px-4 pt-24 sm:pt-28 pb-8"
    >
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 lg:scale-[0.864] lg:origin-top">
        <div className={`mb-8 lg:mb-10 ${isVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}>
          <p
            className="font-black tracking-tight uppercase leading-none select-none"
            style={{
              fontSize: 'clamp(34px, 5vw, 84px)',
              color: '#0f172a',
            }}
          >
            IMPLANT{' '}
            <span style={{
              background: 'linear-gradient(135deg, #0080C8 0%, #38b6ff 50%, #0080C8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 16px rgba(0,128,200,0.5))',
            }}>SOLUTION</span>{' '}
            <span style={{ color: '#0f172a' }}>TYPES</span>
          </p>
          <div className="mt-3 h-1.5 w-28 rounded-full bg-[#0080C8] shadow-[0_0_24px_rgba(0,128,200,0.35)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          {TYPES.map((type, i) => (
            <Link
              key={i}
              href={type.href}
              className={`rounded-xl flex flex-col overflow-hidden group cursor-pointer ${isVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
              style={{
                border: '1px solid rgba(26,32,53,0.12)',
                backgroundColor: '#252a3c',
                textDecoration: 'none',
                transition: 'border-color 0.25s ease, background-color 0.25s ease',
                ...(isVisible ? { animationDelay: `${i * 0.12}s` } : {}),
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,195,247,0.35)'; (e.currentTarget as HTMLElement).style.backgroundColor = '#283044' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,32,53,0.12)'; (e.currentTarget as HTMLElement).style.backgroundColor = '#252a3c' }}
            >
              {/* 텍스트 영역 */}
              <div className="p-4 lg:p-5 flex flex-col flex-grow">
                <p
                  className="tracking-[0.25em] mb-2 lg:mb-3"
                  style={{ fontSize: '9px', color: 'rgba(255,255,255,0.28)' }}
                >
                  TYPE / {type.num}
                </p>

                <h3
                  className="font-bold text-white leading-tight mb-1 lg:mb-2"
                  style={{ fontSize: 'clamp(17px, 1.8vw, 23px)' }}
                >
                  {type.title}
                </h3>

                <p
                  className="tracking-[0.18em] uppercase mb-2 lg:mb-3"
                  style={{ fontSize: '9px', color: 'rgba(255,255,255,0.32)' }}
                >
                  {type.subtitle}
                </p>

                <p
                  className="italic leading-snug mb-2 lg:mb-3"
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.48)' }}
                >
                  &ldquo;{type.quote}&rdquo;
                </p>

                <div
                  className="mb-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}
                />

                <ul className="space-y-1">
                  {type.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2"
                      style={{ fontSize: '11px', color: 'rgba(255,255,255,0.62)' }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.28)' }}>—</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 이미지 영역 — 모바일은 3:2 비율 고정(잘림 방지), 데스크탑은 고정 높이 */}
              <div className="relative aspect-[3/2] sm:aspect-auto sm:h-[200px] shrink-0 overflow-hidden">
                <Image
                  src={type.img}
                  alt={`수원 영통 ${type.title}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
