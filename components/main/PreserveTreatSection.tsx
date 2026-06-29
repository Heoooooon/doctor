'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const CARDS = [
  { img: '/images/treatments/natural-tooth/resin-buildup.jpg', spine: 'ONE·DAY', title: '원데이 레진 빌드업', href: '/natural-tooth#resin-buildup' },
  { img: '/images/treatments/natural-tooth/vpt.jpg',            spine: 'VPT',     title: 'VPT 신경보존술',    href: '/natural-tooth#vpt' },
  { img: '/images/treatments/natural-tooth/preserve_treat.jpg', spine: 'ONLAY',  title: '최소삭제 온레이',    href: '/natural-tooth#onlay' },
  { img: '/images/treatments/natural-tooth/endo-1.jpg',         spine: 'ROOT',    title: '신경치료·근관치료', href: '/natural-tooth#root-canal' },
  { img: '/images/treatments/natural-tooth/sc-rp.jpg',          spine: 'GUM',     title: '잇몸치료',           href: '/natural-tooth#gum' },
]

function CardItem({ card, idx, hoverIdx, setHoverIdx }: {
  card: typeof CARDS[0]
  idx: number
  hoverIdx: number | null
  setHoverIdx: (i: number | null) => void
}) {
  return (
    <Link
      href={card.href}
      className="relative rounded-xl overflow-hidden block aspect-[16/10]"
      style={{
        boxShadow: hoverIdx === idx
          ? '0 0 0 2.5px rgba(0,128,200,0.85), 0 16px 36px rgba(0,0,0,0.55)'
          : '0 4px 14px rgba(0,0,0,0.45)',
        transform: hoverIdx === idx ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      }}
      onMouseEnter={() => setHoverIdx(idx)}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${card.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hoverIdx === idx ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.5s ease',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent 25%, rgba(8,12,30,0.90) 100%)' }}
      />
      <span
        className="absolute"
        style={{
          top: '8px', right: '8px',
          fontSize: '14px', letterSpacing: '2px', color: '#0080C8',
          fontWeight: 700, writingMode: 'vertical-rl',
          background: 'rgba(15,20,43,0.85)', padding: '5px 4px',
          borderRadius: '4px', border: '1px solid rgba(0,128,200,0.35)',
        }}
      >
        {card.spine}
      </span>
      <div className="absolute bottom-0 left-0 right-0 p-2.5 lg:p-3">
        <h3 style={{ fontSize: 'clamp(18px, 1.15vw, 20px)', fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>
          {card.title}
        </h3>
      </div>
    </Link>
  )
}

export default function PreserveTreatSection() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const { ref, isVisible } = useScrollReveal(0.2)

  return (
    <section
      ref={ref}
      className="min-h-screen w-full flex flex-col lg:flex-row items-center relative overflow-hidden bg-white py-[clamp(90px,10vh,130px)]"
    >
      {/* 라디알 그라디언트 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(55% 50% at 75% 30%, rgba(0,128,200,0.08), transparent 70%),
            radial-gradient(50% 60% at 20% 90%, rgba(0,128,200,0.05), transparent 70%)
          `,
        }}
      />

      {/* ── 텍스트 영역 (왼쪽) ── */}
      <div
        className="relative z-10 flex-none lg:w-[36%] flex flex-col justify-center px-8 sm:px-12 lg:px-14 py-10 lg:py-0"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
        }}
      >
        <p style={{ color: '#0080C8', letterSpacing: '5px', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>
          NATURAL TOOTH SOLUTION
        </p>
        <h2 style={{ fontSize: 'clamp(24px, 2.45vw, 38px)', fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1.38, color: '#101828' }}>
          내 치아를 <span style={{ color: '#4f82c8' }}>최대한 남기는</span>
          <br />
          <span style={{ color: '#101828' }}>가장 좋은 임플란트는</span>
          <br />
          <span style={{ color: '#4f82c8', fontWeight: 900 }}>내가 가진 치아</span>
          <span style={{ color: '#101828' }}>입니다.</span>
        </h2>
        <p style={{ color: '#4b5563', marginTop: '18px', fontSize: '18px', lineHeight: 1.85, letterSpacing: '0.01em' }}>
          치아는 한 번 삭제하면 <strong style={{ color: '#101828' }}>되돌릴 수 없기에</strong>,
          처음 치료 방향이 가장 중요합니다. 저희는 충치를 없애는 것을 넘어{' '}
          <strong style={{ color: '#101828' }}>"어디까지 살릴 수 있는지"</strong>를 먼저 고민합니다.
        </p>
        <div className="flex gap-2.5 flex-wrap mt-5">
          <Link
            href="/natural-tooth"
            style={{
              padding: '8px 16px', borderRadius: '999px',
              minHeight: '44px',
              fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px',
              background: '#0080C8', color: '#fff',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s, transform 0.2s',
            }}
            className="hover:brightness-110 hover:-translate-y-0.5"
          >
            자연치아살리기 게시판 →
          </Link>
          <a
            href="tel:031-896-5512"
            style={{
              minHeight: '44px',
              padding: '8px 16px', borderRadius: '999px',
              fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px',
              background: 'transparent', color: '#101828',
              border: '1px solid rgba(16,24,40,0.22)',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.2s',
            }}
            className="hover:bg-slate-100"
          >
            빠른 상담
          </a>
        </div>
      </div>

      {/* ── 카드 영역 (데스크탑) ── */}
      <div
        className="hidden md:flex relative z-10 flex-1 flex-col justify-center gap-5 pr-8 lg:pr-14 pl-0 pb-8 pt-0 lg:py-12"
        style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}
      >
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 items-end">
          <CardItem card={CARDS[0]} idx={0} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />
          <CardItem card={CARDS[1]} idx={1} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />
          <div className="flex flex-col justify-end pb-2 pl-1">
            <span style={{ width: '24px', height: '1px', background: 'rgba(16,24,40,0.25)', display: 'block', marginBottom: '6px' }} />
            <span style={{ fontSize: '14px', letterSpacing: '3px', color: 'rgba(16,24,40,0.5)', textTransform: 'uppercase', lineHeight: 1.6 }}>
              TREATMENT<br />ARCHIVE
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-x-3 gap-y-5">
          <CardItem card={CARDS[2]} idx={2} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />
          <CardItem card={CARDS[3]} idx={3} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />
          <CardItem card={CARDS[4]} idx={4} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />
        </div>
      </div>

      {/* ── 카드 영역 (모바일 전용 — 텍스트 없음, 2·2·1 배열) ── */}
      <div
        className="md:hidden w-full px-4 pb-8 flex flex-col gap-3"
        style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}
      >
        {/* 2개 */}
        <div className="grid grid-cols-2 gap-3">
          {CARDS.slice(0, 2).map((card) => (
            <a key={card.href} href={card.href} className="relative rounded-xl overflow-hidden block aspect-[4/3]">
              <div className="absolute inset-0" style={{ backgroundImage: `url(${card.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </a>
          ))}
        </div>
        {/* 2개 */}
        <div className="grid grid-cols-2 gap-3">
          {CARDS.slice(2, 4).map((card) => (
            <a key={card.href} href={card.href} className="relative rounded-xl overflow-hidden block aspect-[4/3]">
              <div className="absolute inset-0" style={{ backgroundImage: `url(${card.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </a>
          ))}
        </div>
        {/* 1개 */}
        <div className="grid grid-cols-2 gap-3">
          <a href={CARDS[4].href} className="relative rounded-xl overflow-hidden block aspect-[4/3]">
            <div className="absolute inset-0" style={{ backgroundImage: `url(${CARDS[4].img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          </a>
          <div />
        </div>
      </div>
    </section>
  )
}
