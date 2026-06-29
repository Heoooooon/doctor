'use client'

import Image from 'next/image'
import type { TreatmentContent } from '@/types/treatment'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider'
import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'

function LucideIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[name]
  if (!Icon) return null
  return <Icon {...props} />
}

interface TreatmentSectionProps {
  treatment: TreatmentContent
  index: number
}

const allOnSummaryCards = [
  {
    icon: 'Lightbulb',
    title: '한 줄 요약',
    body: '“4~6개의 임플란트로 위 또는 아래 전체 치아를 한 번에 완성하는 치료”',
  },
  {
    icon: 'CircleHelp',
    title: '틀니 대신 올온임플란트?',
    body: '틀니는 매일 빼고 끼워야 하고, 씹는 힘도 자연치아의 30%에 불과합니다. 올온임플란트는 적은 수의 임플란트로 전체 치아를 고정식으로 완성해 틀니 없이 자연치아처럼 드실 수 있습니다.',
  },
]

const immediateSummaryCards = [
  {
    icon: 'Zap',
    title: '한 줄 요약',
    body: '”임플란트를 심는 당일 임시치아를 연결해, 치아 없는 기간을 최소화하는 치료”',
  },
  {
    icon: 'Clock3',
    title: '왜 빠른가요?',
    body: '일반 임플란트는 뼈와 결합하는 시간을 기다린 뒤 치아를 올립니다. 즉시로딩은 뼈 밀도와 초기 고정력이 충분한 경우, 식립 당일 임시치아까지 연결해 일상 공백을 줄입니다.',
  },
]

const sinusSummaryCards = [
  {
    icon: 'Lightbulb',
    title: '한 줄 요약',
    body: '"위턱 어금니 쪽 뼈가 부족할 때, 상악동 공간을 확보해 뼈를 이식하고 임플란트를 심을 수 있게 만드는 치료"',
  },
  {
    icon: 'CircleHelp',
    title: '왜 필요한가요?',
    body: '치아가 빠지면 뼈가 서서히 흡수되고, 위 어금니 부위는 상악동이 가까워 뼈 높이가 특히 부족해지기 쉽습니다. 거상술로 공간을 확보하면 임플란트 식립의 기반을 마련할 수 있습니다.',
  },
  {
    icon: 'TriangleAlert',
    title: '이런 분께 특히 필요합니다',
    body: '',
    list: [
      '위 어금니 임플란트에서 "뼈가 부족하다"는 말을 들은 분',
      '치아가 빠진 지 오래된 분',
      '다른 병원에서 임플란트가 어렵다고 한 분',
    ],
  },
]

const diabetesSummaryCards = [
  {
    icon: 'Lightbulb',
    title: '한 줄 요약',
    body: '"혈당 조절 상태와 전신 건강을 함께 확인하면서, 안전하게 계획하는 임플란트 치료"',
  },
  {
    icon: 'CircleHelp',
    title: '왜 더 신중해야 하나요?',
    body: '당뇨가 있으면 면역력이 낮아지고 상처 회복이 느려 감염 위험이 높습니다. 혈당이 안정적으로 관리되는 상태라면 철저한 계획 아래 안전하게 진행할 수 있습니다.',
  },
  {
    icon: 'TriangleAlert',
    title: '이런 분께 추천드립니다',
    body: '',
    list: [
      '당뇨가 있지만 임플란트를 원하시는 분',
      '혈당이 비교적 안정적으로 관리되는 분',
      '당뇨로 임플란트를 포기하셨던 분',
    ],
  },
]

const navigationSummaryCards = [
  {
    icon: 'Lightbulb',
    title: '한 줄 요약',
    body: '”3D CT 데이터를 바탕으로 식립 위치를 미리 설계하고, 계획한 그대로 정밀하게 심는 임플란트 치료”',
  },
  {
    icon: 'ShieldCheck',
    title: '왜 더 안전한가요?',
    body: '턱 안에는 신경과 혈관이 지나고 있습니다. 수술 전 3D 시뮬레이션으로 신경 손상 위험을 최소화하고, 계획한 위치 그대로 오차 없이 식립합니다.',
  },
  {
    icon: 'ScanLine',
    title: '디지털 워크플로우',
    body: '구강 스캔과 CT 데이터를 융합해 뼈 상태, 신경 위치, 보철 방향을 사전에 분석합니다. 가이드 제작 후 계획대로 식립해 예측 가능한 결과를 기대할 수 있습니다.',
  },
]

/** **볼드** → 브랜드 블루 강조 인라인 파서 */
function inlineParse(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className="font-semibold" style={{ color: '#0080C8' }}>{part.slice(2, -2)}</span>
    }
    return <span key={i}>{part}</span>
  })
}

/** 단순 **볼드** 강조만 처리하는 기본 description 렌더러 */
function HighlightedDescription({ text }: { text: string }) {
  return (
    <p className="text-gray-600 leading-[1.9] text-[16px] whitespace-pre-line">
      {inlineParse(text)}
    </p>
  )
}

/** richContent 마크다운 렌더러 (###, >, ---, - 지원) */
function AllOnImageMarquee() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black h-[180px] sm:h-[240px] lg:h-[280px]">
      <div className="all-on-marquee-track flex w-max h-full items-center">
        {[0, 1].map((item) => (
          <img
            key={item}
            src="/images/allon/all-on-side.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-auto max-w-none shrink-0 object-cover"
          />
        ))}
      </div>
    </div>
  )
}

function RichDescription({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="space-y-1.5 pl-1 my-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-600 text-[16px] leading-relaxed">
              <span className="shrink-0">{item.replace(/^-\s*/, '').split(' ')[0]}</span>
              <span>{inlineParse(item.replace(/^-\s*[\S]*\s*/, ''))}</span>
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ### heading
    if (line.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={key++} className="text-base font-bold text-gray-900 mt-6 mb-2 flex items-center gap-1.5">
          {inlineParse(line.replace(/^### /, ''))}
        </h3>
      )
      continue
    }

    // --- divider
    if (line.trim() === '---') {
      flushList()
      elements.push(<hr key={key++} className="border-gray-100 my-4" />)
      continue
    }

    // > blockquote
    if (line.startsWith('> ')) {
      flushList()
      const quoteText = line.replace(/^> /, '')
      elements.push(
        <blockquote key={key++} className="border-l-2 pl-4 py-1 my-3 text-[15px] text-gray-500 italic leading-relaxed" style={{ borderColor: '#0080C8' }}>
          {inlineParse(quoteText)}
        </blockquote>
      )
      continue
    }

    // - list item
    if (line.startsWith('- ')) {
      listItems.push(line)
      continue
    }

    // empty line
    if (line.trim() === '') {
      flushList()
      continue
    }

    // plain text
    flushList()
    elements.push(
      <p key={key++} className="text-gray-600 text-[16px] leading-[1.85] my-1">
        {inlineParse(line)}
      </p>
    )
  }

  flushList()
  return <div className="space-y-0.5">{elements}</div>
}

function BenefitsGrid({
  benefits,
  cardVisible,
}: {
  benefits: TreatmentContent['benefits']
  cardVisible: boolean
}) {
  const count = benefits.length
  const gridCols =
    count >= 5
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
      : count === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-2 sm:grid-cols-3'
  return (
    <div className={`grid gap-3 ${gridCols}`}>
      {benefits.map((benefit, i) => (
        <div
          key={benefit.tag}
          className={`rounded-xl overflow-hidden border border-[#D8E9F5] shadow-sm ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
        >
          <div className="bg-[#EAF4FC] px-4 py-3 flex items-center gap-2.5">
            <span className="text-[17px] font-black text-[#0080C8] leading-none tabular-nums shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="w-px h-4 bg-[#AACCE0] shrink-0" />
            <h4 className="text-[13px] font-bold text-[#004A7A] leading-tight">{benefit.tag}</h4>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[12px] text-gray-500 leading-relaxed">{benefit.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AllOnImplantChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  return (
    <div className="space-y-12">
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="MapPin" size={18} />
            <span>수원치과 서울이건치과</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[58px] lg:text-[66px] font-black leading-[1.06] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              <span className="block">올온</span>
              <span className="block text-[#0080C8]">임플란트</span>
              <span className="block text-[21px] sm:text-[27px] lg:text-[32px] mt-3 font-black text-gray-400">
                All-on-X
              </span>
            </h2>
            <p
              className={`text-[20px] sm:text-[24px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              여러 치아를 잃은 경우,<br />
              전체 기능 회복을 함께 고민합니다
            </p>
          </div>

          <div
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-6 shadow-[0_14px_45px_rgba(16,55,91,0.06)] ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            <p className="text-[16px] sm:text-[17px] leading-[1.9] text-gray-700">
              여러 개의 임플란트를 따로 심는 대신, 적은 수의 임플란트로
              위 또는 아래 전체 치아를 고정식으로 회복하는 치료입니다.
            </p>
          </div>
        </div>

        <div
          className={`relative ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[34px] bg-[#EAF6FD]" />
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-white shadow-[0_28px_90px_rgba(15,71,110,0.16)]">
            <img
              src={treatment.image}
              alt="올온 임플란트 보철"
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full sm:max-w-[80%] mx-auto">
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_18px_60px_rgba(16,55,91,0.1)]">
          <iframe
            src="https://www.youtube.com/embed/6Alck_RGgLo?rel=0&modestbranding=1"
            title="올온 임플란트 안내 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      <div
        ref={cardRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {allOnSummaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[19px] font-bold text-gray-950">{card.title}</h3>
            </div>
            <p className="text-[16px] leading-[1.85] text-gray-700 whitespace-pre-line">{card.body}</p>
          </div>
        ))}

        <div
          className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={cardVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
              <LucideIcon name="TriangleAlert" size={25} className="text-[#0080C8]" />
            </span>
            <h3 className="text-[19px] font-bold text-gray-950">이런 분께 특히 필요합니다</h3>
          </div>
          <ul className="space-y-4">
            {treatment.indications?.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] leading-relaxed text-gray-700">
                <span className="mt-1 w-5 h-5 rounded-full bg-[#0080C8] flex items-center justify-center shrink-0">
                  <LucideIcon name="Check" size={12} className="text-white" strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {treatment.benefitsTitle && (
        <div className="flex items-center gap-6">
          <div className="h-px bg-gray-200 flex-1" />
          <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
            {treatment.benefitsTitle}
          </h3>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
      )}

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      {treatment.comparison && (
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-px bg-gray-200 flex-1" />
            <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
              틀니와 올온임플란트 비교
            </h3>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#DCE8F2] bg-white shadow-[0_16px_50px_rgba(16,55,91,0.07)]">
            <div className="grid grid-cols-[1fr_120px_1fr] sm:grid-cols-[1fr_180px_1fr]">
              <div className="bg-[#AEB8C8] text-white text-center py-3 text-[17px] font-bold">
                {treatment.comparison.leftLabel}
              </div>
              <div className="bg-white border-x border-[#E4EDF5]" />
              <div className="bg-[#0080C8] text-white text-center py-3 text-[17px] font-bold">
                {treatment.comparison.rightLabel}
              </div>
            </div>
            {treatment.comparison.rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[1fr_120px_1fr] sm:grid-cols-[1fr_180px_1fr] border-t border-[#E4EDF5] min-h-16">
                <div className="flex items-center justify-center px-3 py-4 text-center text-[14px] sm:text-[15px] text-gray-600 leading-snug">
                  {row.leftText}
                </div>
                <div className="flex items-center justify-center gap-2 px-3 py-4 border-x border-[#E4EDF5] text-gray-900 font-bold text-[14px] sm:text-[15px]">
                  {row.icon && <LucideIcon name={row.icon} size={22} className="text-[#0080C8] shrink-0" />}
                  <span>{row.label}</span>
                </div>
                <div className="flex items-center justify-center px-3 py-4 text-center text-[14px] sm:text-[15px] font-bold text-[#0080C8] leading-snug">
                  {row.rightText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {treatment.bottomCta && (
        <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
          <LucideIcon name="Tooth" size={34} className="text-[#0080C8] shrink-0" />
          <p className="text-[19px] sm:text-[21px] font-bold text-[#0080C8] text-center leading-relaxed">
            {treatment.bottomCta}
          </p>
        </div>
      )}
    </div>
  )
}

function SinusLiftChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  return (
    <div className="space-y-12">
      {/* ── 히어로 ── */}
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="ArrowUpFromLine" size={18} />
            <span>뼈가 부족해도 임플란트를 가능하게</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[60px] lg:text-[72px] font-black leading-[1.02] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              <span className="block text-[#0080C8]">상악동</span>
              <span className="block">거상술</span>
            </h2>
            <p
              className={`text-[21px] sm:text-[26px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              뼈가 부족하다고 했다면,<br className="hidden sm:block" />
              포기하기 전에 먼저 확인하세요
            </p>
          </div>

          <div
            className={`grid grid-cols-3 gap-3 max-w-xl ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            {[
              ['STEP 1', '뼈 높이 분석'],
              ['STEP 2', '공간 확보'],
              ['STEP 3', '임플란트 식립'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-[#D9E7F1] bg-white px-4 py-4 text-center shadow-[0_10px_30px_rgba(16,55,91,0.06)]">
                <p className="text-[#0080C8] text-[14px] font-black leading-none">{k}</p>
                <p className="mt-2 text-[12px] font-semibold text-gray-600">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 인포그래픽 패널 */}
        <div
          className={`relative ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="rounded-[28px] bg-[#EAF6FD] border border-[#D0E8F5] p-8 space-y-5 shadow-[0_24px_70px_rgba(15,71,110,0.10)]">
            <p className="text-[12px] font-bold text-[#0080C8] uppercase tracking-widest">Sinus Lift Flow</p>
            {[
              { step: '01', title: '정밀 CT 분석', desc: '상악동 위치와 잔존 뼈 높이를 3D로 분석합니다' },
              { step: '02', title: '상악동 막 거상', desc: '상악동 막을 조심스럽게 들어올려 공간을 확보합니다' },
              { step: '03', title: '뼈 이식재 적용', desc: '확보된 공간에 뼈 이식재를 채워 높이를 만듭니다' },
              { step: '04', title: '임플란트 식립', desc: '충분한 뼈 높이가 확보된 뒤 임플란트를 심습니다' },
            ].map((item, i) => (
              <div key={item.step} className="flex items-start gap-4">
                <span className="w-9 h-9 rounded-full bg-[#0080C8] text-white flex items-center justify-center text-[12px] font-black shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-[15px] font-black text-gray-950 leading-snug">{item.title}</p>
                  <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="absolute left-[18px] mt-10 w-px h-5 bg-[#B8D8EE]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 요약 카드 3장 ── */}
      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sinusSummaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[17px] font-bold text-gray-950">{card.title}</h3>
            </div>
            {card.list ? (
              <ul className="space-y-3">
                {card.list.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-gray-700">
                    <span className="mt-1 w-5 h-5 rounded-full bg-[#0080C8] flex items-center justify-center shrink-0">
                      <LucideIcon name="Check" size={12} className="text-white" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] leading-[1.85] text-gray-700">{card.body}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── 장점 타이틀 ── */}
      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          상악동 거상술의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      {/* ── 영상 ── */}
      <div className="w-full sm:max-w-[80%] mx-auto rounded-[20px] overflow-hidden shadow-[0_16px_50px_rgba(16,55,91,0.10)]">
        <div className="relative w-full aspect-video">
          <iframe
            src="https://www.youtube.com/embed/RmQSCxLQpKA"
            title="상악동 거상술 안내 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>

      {/* ── 하단 CTA ── */}
      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
        <LucideIcon name="ArrowUpFromLine" size={34} className="text-[#0080C8] shrink-0" />
        <p className="text-[19px] sm:text-[21px] font-bold text-[#0080C8] text-center leading-relaxed">
          뼈가 부족하다는 말이 임플란트의 끝이 아닙니다. 함께 방법을 찾겠습니다.
        </p>
      </div>
    </div>
  )
}

function DiabetesImplantChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  return (
    <div className="space-y-12">
      {/* ── 히어로 ── */}
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="HeartPulse" size={18} />
            <span>혈당 조절 상태를 함께 살피는 임플란트</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[60px] lg:text-[72px] font-black leading-[1.02] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              <span className="block">당뇨환자</span>
              <span className="block text-[#0080C8]">임플란트</span>
            </h2>
            <p
              className={`text-[21px] sm:text-[26px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              당뇨가 있어도 포기하지 않아도 됩니다.<br className="hidden sm:block" />
              체계적인 계획으로 함께합니다
            </p>
          </div>

          <div
            className={`grid grid-cols-3 gap-3 max-w-xl ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            {[
              ['혈당', '사전 확인'],
              ['계획', '맞춤 수술'],
              ['관리', '회복 케어'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-[#D9E7F1] bg-white px-4 py-4 text-center shadow-[0_10px_30px_rgba(16,55,91,0.06)]">
                <p className="text-[#0080C8] text-[17px] font-black leading-none">{k}</p>
                <p className="mt-2 text-[13px] font-semibold text-gray-600">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: before/after 이미지 */}
        <div
          className={`relative min-h-[340px] sm:min-h-[460px] lg:min-h-[520px] ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[38px] bg-[#EAF6FD]" />
          <div className="absolute -left-2 top-12 w-44 h-44 rounded-full bg-white/70 blur-2xl" />
          <div className="absolute right-4 bottom-10 w-56 h-56 rounded-full bg-[#D8EFFB] blur-2xl" />
          {treatment.beforeImage && (
            <div className="absolute left-0 top-0 w-[72%] rounded-[26px] overflow-hidden border border-white/80 shadow-[0_24px_70px_rgba(15,71,110,0.16)] bg-white">
              <img src={treatment.beforeImage} alt="당뇨 환자 임플란트 치료 전" className="w-full aspect-[16/9] object-cover" />
              <div className="absolute left-4 top-4 rounded-full bg-gray-900/70 px-3 py-1 text-[12px] font-bold text-white">Before</div>
            </div>
          )}
          {treatment.afterImage && (
            <div className="absolute right-0 bottom-0 w-[82%] rounded-[28px] overflow-hidden border border-white/90 shadow-[0_30px_90px_rgba(15,71,110,0.2)] bg-white">
              <img src={treatment.afterImage} alt="당뇨 환자 임플란트 치료 후" className="w-full aspect-[16/9] object-cover" />
              <div className="absolute left-4 top-4 rounded-full bg-[#0080C8] px-3 py-1 text-[12px] font-bold text-white">After</div>
            </div>
          )}
          {/* 전신 건강 고려 카드 — before/after 사이 빈 공간(우측 대각선)에 배치 */}
          <div className="absolute left-1/2 top-[46%] -translate-y-1/2 rounded-2xl bg-white/92 backdrop-blur px-5 py-4 border border-[#DCE8F2] shadow-[0_18px_50px_rgba(16,55,91,0.12)] whitespace-nowrap">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-[#E8F6FE] flex items-center justify-center shrink-0">
                <LucideIcon name="HeartPulse" size={23} className="text-[#0080C8]" />
              </span>
              <div>
                <p className="text-[12px] font-bold text-gray-500">전신 건강 고려</p>
                <p className="text-[17px] font-black text-gray-950">체계적 치료 계획</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 요약 카드 3장 ── */}
      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {diabetesSummaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[17px] font-bold text-gray-950">{card.title}</h3>
            </div>
            {card.list ? (
              <ul className="space-y-3">
                {card.list.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-gray-700">
                    <span className="mt-1 w-5 h-5 rounded-full bg-[#0080C8] flex items-center justify-center shrink-0">
                      <LucideIcon name="Check" size={12} className="text-white" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] leading-[1.85] text-gray-700">{card.body}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── 장점 타이틀 ── */}
      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          당뇨 환자 임플란트의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      {/* ── 하단 CTA ── */}
      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
        <LucideIcon name="HeartPulse" size={34} className="text-[#0080C8] shrink-0" />
        <p className="text-[19px] sm:text-[21px] font-bold text-[#0080C8] text-center leading-relaxed">
          당뇨가 있다고 임플란트를 포기할 이유는 없습니다. 함께 안전하게 계획합니다.
        </p>
      </div>
    </div>
  )
}

function NavigationImplantChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  return (
    <div className="space-y-12">
      {/* ── 히어로 ── */}
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="ScanLine" size={18} />
            <span>디지털 분석을 바탕으로 계획하는 임플란트</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[60px] lg:text-[72px] font-black leading-[1.02] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              <span className="block">네비게이션</span>
              <span className="block text-[#0080C8]">임플란트</span>
            </h2>
            <p
              className={`text-[21px] sm:text-[26px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              3D 설계대로,<br className="hidden sm:block" />
              오차 없이 정밀하게 심습니다
            </p>
          </div>

          <div
            className={`grid grid-cols-3 gap-3 max-w-xl ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            {[
              ['3D CT', '정밀 분석'],
              ['GUIDE', '디지털 설계'],
              ['PLACE', '계획대로 식립'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-[#D9E7F1] bg-white px-4 py-4 text-center shadow-[0_10px_30px_rgba(16,55,91,0.06)]">
                <p className="text-[#0080C8] text-[17px] font-black leading-none">{k}</p>
                <p className="mt-2 text-[13px] font-semibold text-gray-600">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 이미지 */}
        <div
          className={`relative min-h-[340px] sm:min-h-[460px] lg:min-h-[520px] ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[38px] bg-[#EAF6FD]" />
          <div className="absolute -left-2 top-12 w-44 h-44 rounded-full bg-white/70 blur-2xl" />
          <div className="absolute right-4 bottom-10 w-56 h-56 rounded-full bg-[#D8EFFB] blur-2xl" />
          <div className="relative rounded-[28px] overflow-hidden border border-white/80 shadow-[0_24px_70px_rgba(15,71,110,0.16)] bg-white">
            <img
              src={treatment.image}
              alt="네비게이션 임플란트"
              className="w-full object-cover"
            />
          </div>
          <div className="absolute left-7 bottom-10 rounded-2xl bg-white/92 backdrop-blur px-5 py-4 border border-[#DCE8F2] shadow-[0_18px_50px_rgba(16,55,91,0.12)]">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name="ShieldCheck" size={23} className="text-[#0080C8]" />
              </span>
              <div>
                <p className="text-[12px] font-bold text-gray-500">신경 손상 위험</p>
                <p className="text-[17px] font-black text-gray-950">최소화 목표</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 요약 카드 3장 + 적합 대상 카드 ── */}
      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {navigationSummaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[17px] font-bold text-gray-950">{card.title}</h3>
            </div>
            <p className="text-[15px] leading-[1.85] text-gray-700">{card.body}</p>
          </div>
        ))}

        <div
          className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={cardVisible ? { animationDelay: '0.18s' } : undefined}
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
              <LucideIcon name="TriangleAlert" size={25} className="text-[#0080C8]" />
            </span>
            <h3 className="text-[17px] font-bold text-gray-950">이런 분께 추천드립니다</h3>
          </div>
          <ul className="space-y-3">
            {[
              '신경·혈관 근처 식립이 필요한 분',
              '복잡한 증례로 정밀 계획이 중요한 분',
              '예측 가능한 결과를 원하시는 분',
              '최소 절개를 원하시는 분',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-gray-700">
                <span className="mt-1 w-5 h-5 rounded-full bg-[#0080C8] flex items-center justify-center shrink-0">
                  <LucideIcon name="Check" size={12} className="text-white" strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full sm:max-w-[80%] mx-auto">
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_18px_60px_rgba(16,55,91,0.1)]">
          <iframe
            src="https://www.youtube.com/embed/NA-OPSDyuJ0?rel=0&modestbranding=1"
            title="네비게이션 임플란트 안내 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      {/* ── 장점 타이틀 ── */}
      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          네비게이션 임플란트의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      {/* ── 하단 CTA ── */}
      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
        <LucideIcon name="ScanLine" size={34} className="text-[#0080C8] shrink-0" />
        <p className="text-[19px] sm:text-[21px] font-bold text-[#0080C8] text-center leading-relaxed">
          디지털 분석과 정밀 계획으로 예측 가능한 임플란트를 완성합니다.
        </p>
      </div>
    </div>
  )
}

function ImmediateLoadingChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  return (
    <div className="space-y-12">
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="CalendarCheck" size={18} />
            <span>당일 임시치아 연결을 고려하는 임플란트</span>
          </div>
          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[60px] lg:text-[72px] font-black leading-[1.02] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              <span className="block">즉시로딩</span>
              <span className="block text-[#0080C8]">임플란트</span>
            </h2>
            <p
              className={`text-[21px] sm:text-[26px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              임플란트 식립 당일,<br className="hidden sm:block" />
              임시치아까지 연결해 일상 공백을 줄입니다
            </p>
          </div>

          <div
            className={`grid grid-cols-3 gap-3 max-w-xl ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            {[
              ['DAY 0', '식립 당일'],
              ['TEMP', '임시치아'],
              ['CHECK', '적합성 평가'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-[#D9E7F1] bg-white px-4 py-4 text-center shadow-[0_10px_30px_rgba(16,55,91,0.06)]">
                <p className="text-[#0080C8] text-[17px] font-black leading-none">{k}</p>
                <p className="mt-2 text-[13px] font-semibold text-gray-600">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`relative min-h-[360px] sm:min-h-[480px] lg:min-h-[540px] ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[38px] bg-[#EAF6FD]" />
          <div className="absolute -left-2 top-12 w-44 h-44 rounded-full bg-white/70 blur-2xl" />
          <div className="absolute right-4 bottom-10 w-56 h-56 rounded-full bg-[#D8EFFB] blur-2xl" />
          {treatment.beforeImage && (
            <div className="absolute left-0 top-0 w-[72%] rounded-[26px] overflow-hidden border border-white/80 shadow-[0_24px_70px_rgba(15,71,110,0.16)] bg-white">
              <img src={treatment.beforeImage} alt="즉시로딩 임플란트 치료 전" className="w-full aspect-[16/9] object-cover" />
              <div className="absolute left-4 top-4 rounded-full bg-gray-900/70 px-3 py-1 text-[12px] font-bold text-white">Before</div>
            </div>
          )}
          {treatment.afterImage && (
            <div className="absolute right-0 bottom-0 w-[82%] rounded-[28px] overflow-hidden border border-white/90 shadow-[0_30px_90px_rgba(15,71,110,0.2)] bg-white">
              <img src={treatment.afterImage} alt="즉시로딩 임플란트 치료 후" className="w-full aspect-[16/9] object-cover" />
              <div className="absolute left-4 top-4 rounded-full bg-[#0080C8] px-3 py-1 text-[12px] font-bold text-white">After</div>
            </div>
          )}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-7 lg:top-auto lg:translate-x-0 lg:translate-y-0 lg:bottom-20 rounded-2xl bg-white/92 backdrop-blur px-5 py-4 border border-[#DCE8F2] shadow-[0_18px_50px_rgba(16,55,91,0.12)] whitespace-nowrap">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-[#E8F6FE] flex items-center justify-center shrink-0">
                <LucideIcon name="ArrowRight" size={23} className="text-[#0080C8]" />
              </span>
              <div>
                <p className="text-[12px] font-bold text-gray-500">치아 없는 기간</p>
                <p className="text-[17px] font-black text-gray-950">최소화 목표</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={cardRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {immediateSummaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[19px] font-bold text-gray-950">{card.title}</h3>
            </div>
            <p className="text-[16px] leading-[1.85] text-gray-700 whitespace-pre-line">{card.body}</p>
          </div>
        ))}

        <div
          className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={cardVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
              <LucideIcon name="TriangleAlert" size={25} className="text-[#0080C8]" />
            </span>
            <h3 className="text-[19px] font-bold text-gray-950">이런 분께 특히 필요합니다</h3>
          </div>
          <ul className="space-y-4">
            {treatment.indications?.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] leading-relaxed text-gray-700">
                <span className="mt-1 w-5 h-5 rounded-full bg-[#0080C8] flex items-center justify-center shrink-0">
                  <LucideIcon name="Check" size={12} className="text-white" strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {treatment.steps && (
        <div className="rounded-[28px] bg-[#F7FBFE] border border-[#DCE8F2] p-6 sm:p-8">
          <div className="flex items-center gap-6 mb-7">
            <div className="h-px bg-gray-200 flex-1" />
            <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
              즉시로딩 진행 흐름
            </h3>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {treatment.steps.map((step, i) => (
              <div
                key={step.title}
                className={`relative rounded-2xl bg-white border border-[#E1EAF2] p-5 text-center shadow-[0_10px_30px_rgba(16,55,91,0.05)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
                style={cardVisible ? { animationDelay: `${0.08 + i * 0.05}s` } : undefined}
              >
                <span className="mx-auto mb-4 w-10 h-10 rounded-full bg-[#0080C8] text-white flex items-center justify-center text-[13px] font-black">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {step.icon && <LucideIcon name={step.icon} size={30} className="text-[#0080C8] mx-auto mb-3" strokeWidth={1.8} />}
                <h4 className="text-[16px] font-black text-gray-950 leading-snug">{step.title}</h4>
                {step.desc && <p className="mt-3 text-[13px] text-gray-600 leading-[1.75]">{step.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {treatment.benefitsTitle && (
        <div className="flex items-center gap-6">
          <div className="h-px bg-gray-200 flex-1" />
          <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
            {treatment.benefitsTitle}
          </h3>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
      )}

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      {treatment.comparison && (
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-px bg-gray-200 flex-1" />
            <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
              일반 임플란트와 즉시로딩 비교
            </h3>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#DCE8F2] bg-white shadow-[0_16px_50px_rgba(16,55,91,0.07)]">
            <div className="grid grid-cols-[1fr_120px_1fr] sm:grid-cols-[1fr_180px_1fr]">
              <div className="bg-[#AEB8C8] text-white text-center py-3 text-[17px] font-bold">
                {treatment.comparison.leftLabel}
              </div>
              <div className="bg-white border-x border-[#E4EDF5]" />
              <div className="bg-[#0080C8] text-white text-center py-3 text-[17px] font-bold">
                {treatment.comparison.rightLabel}
              </div>
            </div>
            {treatment.comparison.rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[1fr_120px_1fr] sm:grid-cols-[1fr_180px_1fr] border-t border-[#E4EDF5] min-h-16">
                <div className="flex items-center justify-center px-3 py-4 text-center text-[14px] sm:text-[15px] text-gray-600 leading-snug">
                  {row.leftText}
                </div>
                <div className="flex items-center justify-center gap-2 px-3 py-4 border-x border-[#E4EDF5] text-gray-900 font-bold text-[14px] sm:text-[15px]">
                  {row.icon && <LucideIcon name={row.icon} size={22} className="text-[#0080C8] shrink-0" />}
                  <span>{row.label}</span>
                </div>
                <div className="flex items-center justify-center px-3 py-4 text-center text-[14px] sm:text-[15px] font-bold text-[#0080C8] leading-snug">
                  {row.rightText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {treatment.bottomCta && (
        <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
          <LucideIcon name="CalendarCheck" size={34} className="text-[#0080C8] shrink-0" />
          <p className="text-[19px] sm:text-[21px] font-bold text-[#0080C8] text-center leading-relaxed">
            {treatment.bottomCta}
          </p>
        </div>
      )}
    </div>
  )
}

function DiastemaResinChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  const summaryCards = [
    {
      icon: 'Sparkles',
      title: '한 줄 요약',
      body: '앞니 사이 벌어진 틈을 치아를 깎지 않고 레진으로 메워 당일 자연스럽게 정리하는 치료',
    },
    {
      icon: 'Gem',
      title: '라미네이트와 다른 점',
      body: '세라믹을 제작해 붙이는 방식이 아니라 치아색 레진을 직접 채워 완성합니다. 작은 틈이라면 더 보존적인 선택이 될 수 있습니다.',
    },
    {
      icon: 'CalendarCheck',
      title: '이런 분께 적합합니다',
      body: '앞니 사이 틈이 신경 쓰이지만 치아 삭제나 여러 번의 내원이 부담스러운 분께 먼저 고려할 수 있습니다.',
    },
  ]

  return (
    <div className="space-y-12">
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="SmilePlus" size={18} />
            <span>치아 삭제를 줄이는 앞니 심미 수복</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[58px] lg:text-[66px] font-black leading-[1.06] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              <span className="block">앞니</span>
              <span className="block text-[#0080C8]">레진치료</span>
              <span className="block text-[21px] sm:text-[27px] lg:text-[32px] mt-3 font-black text-gray-400">
                Diastema
              </span>
            </h2>
            <p
              className={`text-[20px] sm:text-[24px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              치아 사이 벌어진 틈,<br className="hidden sm:block" />
              깎지 않고 당일 메워드립니다
            </p>
          </div>

          <div
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-6 shadow-[0_14px_45px_rgba(16,55,91,0.06)] ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            <p className="text-[16px] sm:text-[17px] leading-[1.9] text-gray-700">
              앞니 사이의 벌어진 공간을 치아색 레진으로 직접 채워,
              세라믹 보철 없이도 자연스러운 형태와 색상으로 당일 완성을 기대할 수 있습니다.
            </p>
          </div>
        </div>

        <div
          className={`relative ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[34px] bg-[#EAF6FD]" />
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-white shadow-[0_28px_90px_rgba(15,71,110,0.16)]">
            {treatment.beforeImage && treatment.afterImage ? (
              <BeforeAfterSlider
                beforeSrc={treatment.beforeImage}
                afterSrc={treatment.afterImage}
                beforeAlt={`${treatment.title} 시술 전`}
                afterAlt={`${treatment.title} 시술 후`}
                beforeScale={treatment.beforeScale}
                beforeOffsetX={treatment.beforeOffsetX}
              />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center text-gray-400 text-sm">
                치료 이미지 준비 중
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[19px] font-bold text-gray-950">{card.title}</h3>
            </div>
            <p className="text-[15px] leading-[1.85] text-gray-700">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          앞니 레진치료의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
        <LucideIcon name="Tooth" size={34} className="text-[#0080C8] shrink-0" />
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0080C8] text-center leading-relaxed">
          깎지 않고, 하루 만에. 작은 틈 하나가 바꾸는 미소의 차이를 경험해 보세요.
        </p>
      </div>
    </div>
  )
}

function ResinBuildupChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  return (
    <div className="space-y-12">
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="ShieldCheck" size={18} />
            <span>필요한 부분만 정교하게 회복하는 보존 치료</span>
          </div>
          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[58px] lg:text-[66px] font-black leading-[1.04] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              <span className="block">1DAY</span>
              <span className="block text-[#0080C8]">레진빌드업</span>
            </h2>
            <p
              className={`text-[20px] sm:text-[25px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              가능한 한 보존적으로,<br className="hidden sm:block" />
              필요한 부분을 정교하게 회복합니다
            </p>
          </div>

          <div
            className={`grid grid-cols-3 gap-3 max-w-xl ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            {[
              ['SAVE', '삭제 최소화'],
              ['ONE DAY', '당일 회복'],
              ['NATURAL', '자연 연결'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-[#D9E7F1] bg-white px-4 py-4 text-center shadow-[0_10px_30px_rgba(16,55,91,0.06)]">
                <p className="text-[#0080C8] text-[15px] font-black leading-none">{k}</p>
                <p className="mt-2 text-[13px] font-semibold text-gray-600">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`relative ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[34px] bg-[#EAF6FD]" />
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-white shadow-[0_28px_90px_rgba(15,71,110,0.16)]">
            {treatment.beforeImage && treatment.afterImage ? (
              <BeforeAfterSlider
                beforeSrc={treatment.beforeImage}
                afterSrc={treatment.afterImage}
                beforeAlt={`${treatment.title} 시술 전`}
                afterAlt={`${treatment.title} 시술 후`}
                beforeScale={treatment.beforeScale}
                beforeOffsetX={treatment.beforeOffsetX}
              />
            ) : treatment.image ? (
              <img src={treatment.image} alt={treatment.title} className="w-full h-auto" />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center text-gray-400 text-sm">
                치료 이미지 준비 중
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={cardRef}>
        <div
          className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
              <LucideIcon name="TriangleAlert" size={25} className="text-[#0080C8]" />
            </span>
            <h3 className="text-[19px] font-bold text-gray-950">이런 분께 특히 필요합니다</h3>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {treatment.indications?.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] leading-relaxed text-gray-700">
                <span className="mt-1 w-5 h-5 rounded-full bg-[#0080C8] flex items-center justify-center shrink-0">
                  <LucideIcon name="Check" size={12} className="text-white" strokeWidth={3} />
                </span>
                <span>{item.replace(/\n/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {treatment.steps && (
        <div className="rounded-[28px] bg-[#F7FBFE] border border-[#DCE8F2] p-6 sm:p-8">
          <div className="flex items-center gap-6 mb-7">
            <div className="h-px bg-gray-200 flex-1" />
            <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
              레진 빌드업 진행 흐름
            </h3>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {treatment.steps.map((step, i) => (
              <div
                key={step.title}
                className={`relative rounded-2xl bg-white border border-[#E1EAF2] p-5 text-center shadow-[0_10px_30px_rgba(16,55,91,0.05)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
                style={cardVisible ? { animationDelay: `${0.08 + i * 0.05}s` } : undefined}
              >
                <span className="mx-auto mb-4 w-10 h-10 rounded-full bg-[#0080C8] text-white flex items-center justify-center text-[13px] font-black">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {step.icon && <LucideIcon name={step.icon} size={30} className="text-[#0080C8] mx-auto mb-3" strokeWidth={1.8} />}
                <h4 className="text-[16px] font-black text-gray-950 leading-snug">{step.title}</h4>
                {step.desc && <p className="mt-3 text-[13px] text-gray-600 leading-[1.75]">{step.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          원데이 레진 빌드업의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      {treatment.bottomCta && (
        <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
          <LucideIcon name="ShieldCheck" size={34} className="text-[#0080C8] shrink-0" />
          <p className="text-[18px] sm:text-[20px] font-bold text-[#0080C8] text-center leading-relaxed">
            {treatment.bottomCta}
          </p>
        </div>
      )}
    </div>
  )
}

function LaminateChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  const summaryCards = [
    {
      icon: 'Sparkles',
      title: '한 줄 요약',
      body: '치아를 거의 깎지 않고 얇은 세라믹 조각을 붙여 색·모양·길이를 한 번에 개선하는 심미치료',
    },
    {
      icon: 'Gem',
      title: '세라믹 라미네이트란?',
      body: '치아 표면에 도자기처럼 얇은 세라믹 조각을 접착하여 변색, 형태 이상, 벌어진 치아 등을 자연스럽게 개선합니다. 기존 치아 구조를 최대한 살리면서 진행합니다.',
    },
    {
      icon: 'SmilePlus',
      title: '이런 분께 적합합니다',
      body: '치아 변색이나 형태 이상이 신경 쓰이지만 치아를 최대한 보존하고 싶은 분께 먼저 고려할 수 있습니다.',
    },
  ]

  return (
    <div className="space-y-12">
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="Gem" size={18} />
            <span>치아 삭제를 최소화한 앞니 심미치료</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[58px] lg:text-[66px] font-black leading-[1.06] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              {treatment.heroTitle?.line1 && (
                <span className="block">{treatment.heroTitle.line1}</span>
              )}
              <span className="block text-[#0080C8]">{treatment.heroTitle?.line2}</span>
            </h2>
            <p
              className={`text-[20px] sm:text-[24px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              {treatment.subtitle}
            </p>
          </div>

          <div
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-6 shadow-[0_14px_45px_rgba(16,55,91,0.06)] ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            <p className="text-[16px] sm:text-[17px] leading-[1.9] text-gray-700">
              치아 표면을 최소한으로 다듬고{' '}
              <span className="font-semibold" style={{ color: '#0080C8' }}>얇은 세라믹을 접착</span>하여
              형태, 색상, 배열을 개선합니다. 내 치아는 그대로, 미소만 새로 태어납니다.
            </p>
          </div>
        </div>

        <div
          className={`relative ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[34px] bg-[#EAF6FD]" />
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-white shadow-[0_28px_90px_rgba(15,71,110,0.16)]">
            {treatment.beforeImage && treatment.afterImage ? (
              <BeforeAfterSlider
                beforeSrc={treatment.beforeImage}
                afterSrc={treatment.afterImage}
                beforeAlt={`${treatment.title} 시술 전`}
                afterAlt={`${treatment.title} 시술 후`}
              />
            ) : treatment.image ? (
              <img src={treatment.image} alt={treatment.title} className="w-full h-auto" />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center text-gray-400 text-sm">
                치료 이미지 준비 중
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[19px] font-bold text-gray-950">{card.title}</h3>
            </div>
            <p className="text-[15px] leading-[1.85] text-gray-700">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          라미네이트의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
        <LucideIcon name="Gem" size={34} className="text-[#0080C8] shrink-0" />
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0080C8] text-center leading-relaxed">
          깎지 않아도 달라집니다. 내 치아는 그대로, 미소만 새로 태어납니다.
        </p>
      </div>
    </div>
  )
}

function InvisalignChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  const summaryCards = [
    {
      icon: 'Sparkles',
      title: '한 줄 요약',
      body: '금속 장치 없이 투명한 맞춤 틀을 끼워 일상에서 눈에 띄지 않게 치아를 가지런히 만드는 교정치료',
    },
    {
      icon: 'ArrowRightLeft',
      title: '일반 교정과 다른 점',
      body: '철사 교정은 금속 장치를 달고 생활해야 하지만, 인비절라인은 투명해서 대화·미소·사진 모두 자연스럽습니다. 식사 때는 빼서 드시면 됩니다.',
    },
    {
      icon: 'CalendarCheck',
      title: '이런 분께 적합합니다',
      body: '교정은 원하지만 티나는 게 부담스럽거나, 직장·학교 등 대외활동이 많아 외관이 중요한 분께 적합합니다.',
    },
  ]

  return (
    <div className="space-y-12">
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="SmilePlus" size={18} />
            <span>심미성과 편의성을 함께 고려하는 투명교정</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[58px] lg:text-[66px] font-black leading-[1.06] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              {treatment.heroTitle?.line1 && (
                <span className="block">{treatment.heroTitle.line1}</span>
              )}
              <span className="block text-[#0080C8]">{treatment.heroTitle?.line2}</span>
            </h2>
            <p
              className={`text-[20px] sm:text-[24px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              {treatment.subtitle}
            </p>
          </div>

          <div
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-6 shadow-[0_14px_45px_rgba(16,55,91,0.06)] ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            <p className="text-[16px] sm:text-[17px] leading-[1.9] text-gray-700">
              투명한 교정 장치로 치아 배열을 조금씩 개선해가는 교정치료입니다.{' '}
              <span className="font-semibold" style={{ color: '#0080C8' }}>눈에 잘 띄지 않아</span>{' '}
              일상생활 속에서도 비교적 자연스럽게 착용할 수 있다는 점이 특징입니다.
            </p>
          </div>
        </div>

        <div
          className={`relative ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[34px] bg-[#EAF6FD]" />
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-white shadow-[0_28px_90px_rgba(15,71,110,0.16)]">
            <video
              className="w-full h-full aspect-[3/4] object-cover"
              src="https://videos.ctfassets.net/vh25xg5i1h5l/3kxmu3HTOorCQDzI6DZMww/6eff8e1b5cef85457c0c1f2ef8e899ac/AU-treatment_plan1.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>
      </div>

      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[19px] font-bold text-gray-950">{card.title}</h3>
            </div>
            <p className="text-[15px] leading-[1.85] text-gray-700">{card.body}</p>
          </div>
        ))}
      </div>

      {treatment.bottomVideoUrl && (
        <div className={`w-full sm:max-w-[80%] mx-auto ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}>
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_18px_60px_rgba(16,55,91,0.1)]">
            <iframe
              src={`https://www.youtube.com/embed/${treatment.bottomVideoUrl.split('youtu.be/')[1]?.split('?')[0]}?rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${treatment.title} 영상`}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          인비절라인의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
        <LucideIcon name="SmilePlus" size={34} className="text-[#0080C8] shrink-0" />
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0080C8] text-center leading-relaxed">
          끼고 있는지도 모릅니다. 투명하게 시작해서, 가지런하게 완성합니다.
        </p>
      </div>
    </div>
  )
}

function PediatricOrthoChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  const summaryCards = [
    {
      icon: 'Sparkles',
      title: '한 줄 요약',
      body: '뼈와 턱이 한창 자라는 시기를 활용해, 치열과 턱 발육을 올바른 방향으로 유도하는 교정치료',
    },
    {
      icon: 'Zap',
      title: '왜 어릴 때 교정이 유리한가요?',
      body: '성인이 되면 뼈가 굳어 교정이 어렵습니다. 성장기에는 뼈가 유연하여 적은 힘으로도 효과적으로 턱과 치열을 바로잡고, 나중에 큰 치료를 예방할 수 있습니다.',
    },
    {
      icon: 'CalendarCheck',
      title: '이런 분께 적합합니다',
      body: '앞니가 거꾸로 물리거나 구강 호흡을 하는 아이, 영구치 배열이 걱정되는 성장기 자녀를 두신 분께 먼저 고려할 수 있습니다.',
    },
  ]

  return (
    <div className="space-y-12">
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="ShieldCheck" size={18} />
            <span>성장 시기를 활용하는 어린이 교정치료</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[58px] lg:text-[66px] font-black leading-[1.06] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              {treatment.heroTitle?.line1 && (
                <span className="block">{treatment.heroTitle.line1}</span>
              )}
              <span className="block text-[#0080C8]">{treatment.heroTitle?.line2}</span>
            </h2>
            <p
              className={`text-[20px] sm:text-[24px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              {treatment.subtitle}
            </p>
          </div>

          <div
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-6 shadow-[0_14px_45px_rgba(16,55,91,0.06)] ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            <p className="text-[16px] sm:text-[17px] leading-[1.9] text-gray-700">
              성장기 아이의{' '}
              <span className="font-semibold" style={{ color: '#0080C8' }}>골격 발육과 치아 배열을 함께 고려</span>하여
              적절한 시기에 개입하는 교정치료입니다. 성장 잠재력을 활용해 더 효과적으로 치료합니다.
            </p>
          </div>
        </div>

        <div
          className={`relative w-full sm:w-[50%] mx-auto ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[34px] bg-[#EAF6FD]" />
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-white shadow-[0_28px_90px_rgba(15,71,110,0.16)]">
            {treatment.beforeImage && treatment.afterImage ? (
              <BeforeAfterSlider
                beforeSrc={treatment.beforeImage}
                afterSrc={treatment.afterImage}
                beforeAlt={`${treatment.title} 시술 전`}
                afterAlt={`${treatment.title} 시술 후`}
              />
            ) : treatment.image ? (
              <img src={treatment.image} alt={treatment.title} className="w-full h-auto" />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center text-gray-400 text-sm">
                치료 이미지 준비 중
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[19px] font-bold text-gray-950">{card.title}</h3>
            </div>
            <p className="text-[15px] leading-[1.85] text-gray-700">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="w-full sm:max-w-[80%] mx-auto">
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_18px_60px_rgba(16,55,91,0.1)]">
          <iframe
            src="https://www.youtube.com/embed/57wxArpmC3s?rel=0&modestbranding=1"
            title="소아교정 안내 영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          소아교정의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
        <LucideIcon name="ShieldCheck" size={34} className="text-[#0080C8] shrink-0" />
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0080C8] text-center leading-relaxed">
          교정의 최적기는 다시 오지 않습니다. 성장이 끝나기 전에 시작할수록 치료는 간단해집니다.
        </p>
      </div>
    </div>
  )
}

function PediatricCavityChapter({ treatment }: { treatment: TreatmentContent }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal(0.12)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)

  const summaryCards = [
    {
      icon: 'Baby',
      title: '유치도 치료가 필요합니다',
      body: '유치는 영구치가 나올 공간을 유지하고 씹기·발음에 핵심 역할을 합니다. 방치하면 영구치 배열과 발육에 영향을 줄 수 있습니다.',
    },
    {
      icon: 'Zap',
      title: '진행 속도가 빠릅니다',
      body: '유치의 충치는 성인 치아보다 빠르게 진행될 수 있어, 조기에 발견하고 관리하는 것이 중요합니다.',
    },
    {
      icon: 'HeartHandshake',
      title: '아이 눈높이에 맞춥니다',
      body: '아이의 협조도와 불안감을 고려해 단계적으로 접근하며, 필요한 경우 웃음가스 등 보조 진정을 활용합니다.',
    },
  ]

  return (
    <div className="space-y-12">
      <div
        ref={heroRef}
        className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-center"
      >
        <div className="space-y-6">
          <div className={`inline-flex items-center gap-2 text-[#0080C8] font-semibold text-[14px] ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}>
            <LucideIcon name="Baby" size={18} />
            <span>아이의 치아를 지키는 조기 관리</span>
          </div>

          <div className="space-y-4">
            <h2
              className={`text-[42px] sm:text-[58px] lg:text-[66px] font-black leading-[1.06] tracking-normal text-gray-950 ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.08s' } : undefined}
            >
              <span className="block text-[#0080C8]">소아충치치료</span>
              <span className="block text-[21px] sm:text-[27px] lg:text-[32px] mt-3 font-black text-gray-400">
                Pediatric Cavity
              </span>
            </h2>
            <p
              className={`text-[20px] sm:text-[24px] leading-relaxed text-gray-900 font-medium ${heroVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
              style={heroVisible ? { animationDelay: '0.16s' } : undefined}
            >
              유치 충치, 빠를수록<br className="hidden sm:block" />
              영구치에 좋습니다
            </p>
          </div>

          <div
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-6 shadow-[0_14px_45px_rgba(16,55,91,0.06)] ${heroVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={heroVisible ? { animationDelay: '0.24s' } : undefined}
          >
            <p className="text-[16px] sm:text-[17px] leading-[1.9] text-gray-700">
              유치의 충치는 성인보다 진행 속도가 빠를 수 있으며,
              영구치 발육과 배열에도 영향을 줄 수 있어
              조기 발견과 관리가 중요합니다.
            </p>
          </div>
        </div>

        <div
          className={`relative ${heroVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={heroVisible ? { animationDelay: '0.12s' } : undefined}
        >
          <div className="absolute inset-4 rounded-[34px] bg-[#EAF6FD]" />
          <div className="relative rounded-[28px] overflow-hidden bg-white border border-white shadow-[0_28px_90px_rgba(15,71,110,0.16)]">
            <img
              src={treatment.image}
              alt={treatment.title}
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </div>

      <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-[#D9E7F1] bg-white p-7 shadow-[0_16px_50px_rgba(16,55,91,0.07)] ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
            style={cardVisible ? { animationDelay: `${0.06 * i}s` } : undefined}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="w-12 h-12 rounded-full bg-[#E8F6FE] flex items-center justify-center">
                <LucideIcon name={card.icon} size={25} className="text-[#0080C8]" />
              </span>
              <h3 className="text-[19px] font-bold text-gray-950">{card.title}</h3>
            </div>
            <p className="text-[15px] leading-[1.85] text-gray-700">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="h-px bg-gray-200 flex-1" />
        <h3 className="text-[25px] sm:text-[29px] font-black text-gray-950 text-center">
          소아충치치료의 장점
        </h3>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />

      {treatment.bottomImage && (
        <div className="rounded-[24px] overflow-hidden shadow-[0_16px_60px_rgba(16,55,91,0.10)]">
          <img
            src={treatment.bottomImage}
            alt="소아충치치료"
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-center gap-4 rounded-2xl border border-[#DCE8F2] bg-white px-6 py-5 shadow-[0_12px_40px_rgba(16,55,91,0.06)]">
        <LucideIcon name="Baby" size={34} className="text-[#0080C8] shrink-0" />
        <p className="text-[18px] sm:text-[20px] font-bold text-[#0080C8] text-center leading-relaxed">
          아이의 첫 치과 경험, 편안하고 안전하게 함께합니다.
        </p>
      </div>
    </div>
  )
}

export default function TreatmentSection({
  treatment,
}: TreatmentSectionProps) {
  const { ref: textRef, isVisible: textVisible } = useScrollReveal(0.15)
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal(0.1)
  const isTriPanel = !!(treatment.richContent && treatment.indications && treatment.steps)
  const isRootCanal = treatment.treatmentType === 'root-canal'
  // 근관치료·온레이: 모바일에서 이미지를 텍스트 아래로 (데스크탑은 우측 유지)
  const imageMobileBelow = isRootCanal || treatment.treatmentType === 'onlay'
  const imageOrderClass = imageMobileBelow ? 'md:order-last' : 'order-first md:order-last'
  const imageTopMargin = isRootCanal ? 'md:mt-10 md:translate-y-5' : 'md:mt-10'
  const singleImageFrameClass = isRootCanal ? 'max-w-[105%] mx-auto' : 'bg-gray-100 max-w-[70%] mx-auto'

  if (treatment.treatmentType === 'all-on') {
    return <AllOnImplantChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'immediate-loading') {
    return <ImmediateLoadingChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'navigation') {
    return <NavigationImplantChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'sinus-lift') {
    return <SinusLiftChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'diabetes') {
    return <DiabetesImplantChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'diastema') {
    return <DiastemaResinChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'resin-buildup') {
    return <ResinBuildupChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'laminate') {
    return <LaminateChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'invisalign') {
    return <InvisalignChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'pediatric-ortho') {
    return <PediatricOrthoChapter treatment={treatment} />
  }

  if (treatment.treatmentType === 'pediatric-cavity') {
    return <PediatricCavityChapter treatment={treatment} />
  }

  return (
    <div className="space-y-12">
      {/* 상단: 로고 + 제목 + 설명 + 이미지 */}
      <div ref={textRef} className={`${treatment.bottomImage ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12'} items-start`}>
        {/* 텍스트 영역 — 왼쪽에서 슬라이드인 */}
        <div className="space-y-4">
          {treatment.boardCategory !== 'pediatric' && treatment.treatmentType !== 'vpt' && (
            <Image
              src="/images/logo/egun-logo.png"
              alt="수원치과 서울이건치과"
              width={1000}
              height={400}
              className={`${treatment.boardCategory === 'natural-tooth' ? 'h-16' : 'h-12'} w-auto mb-2 ${textVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
            />
          )}
          {treatment.heroTitle ? (
            <>
              <div className={`flex items-center gap-1.5 text-[#0080C8] text-[12px] font-semibold ${textVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
                style={textVisible ? { animationDelay: '0.08s' } : undefined}>
                <LucideIcon name="ShieldCheck" size={13} />
                <span>{treatment.subtitle}</span>
              </div>
              <h2 className={`leading-none ${textVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
                style={textVisible ? { animationDelay: '0.1s' } : undefined}>
                {treatment.heroTitle.line1 && (
                  <span className="block text-[52px] sm:text-[64px] font-black text-gray-900 leading-[1.05]">
                    {treatment.heroTitle.line1}
                  </span>
                )}
                <span className="block text-[52px] sm:text-[64px] font-black leading-[1.05]" style={{ color: '#0080C8' }}>
                  {treatment.heroTitle.line2}
                </span>
              </h2>
            </>
          ) : (
            <>
              <h2 className={`text-3xl sm:text-4xl font-bold text-gray-900 leading-tight ${textVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
                style={textVisible ? { animationDelay: '0.1s' } : undefined}>
                {treatment.title}
              </h2>
              <p className={`text-[21px] sm:text-[23px] text-[#0080C8] font-bold leading-snug ${textVisible ? 'scroll-reveal-left' : 'scroll-hidden'}`}
                style={textVisible ? { animationDelay: '0.2s' } : undefined}>
                {treatment.subtitle}
              </p>
            </>
          )}
          <div className={`${textVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
            style={textVisible ? { animationDelay: '0.3s' } : undefined}>
            {/* richContent + highlights 동시에 있으면 → 아래 사이드패널로, 여기선 description만 */}
            {(treatment.richContent && treatment.highlights) || isTriPanel
              ? <HighlightedDescription text={treatment.description} />
              : treatment.richContent
                ? <RichDescription content={treatment.richContent} />
                : <HighlightedDescription text={treatment.description} />
            }
          </div>

          {/* isTriPanel: 치료 순서 리스트 (히어로 왼쪽) */}
          {isTriPanel && treatment.steps && (
            <div className={`mt-2 space-y-4 ${textVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
              style={textVisible ? { animationDelay: '0.4s' } : undefined}>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">치료 순서</p>
              {treatment.steps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-[#0080C8] flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-[16px] text-gray-900 leading-tight">{step.title}</p>
                    {step.desc && <p className="text-[15px] text-gray-600 leading-relaxed mt-1">{step.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 하이라이트 카드 — richContent 없을 때만 좌측 컬럼에 */}
          {treatment.highlights && !treatment.richContent && (
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 rounded-2xl p-4 mt-2 ${textVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
              style={textVisible ? { animationDelay: '0.4s' } : undefined}>
              {treatment.highlights.map((h, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5 py-2">
                  <LucideIcon name={h.icon} size={26} className="text-[#0080C8]" />
                  <p className="font-bold text-[16px] text-gray-900 leading-tight">{h.label}</p>
                  <p className="text-[12px] text-gray-600 font-medium leading-relaxed whitespace-pre-line">{h.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* 히어로 좌측 비교표 — comparison 있고 richContent가 사이드패널로 빠진 경우 */}
          {treatment.comparison && treatment.richContent && treatment.highlights && (
            <div className={`mt-2 ${textVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
              style={textVisible ? { animationDelay: '0.4s' } : undefined}>
              <p className="text-[12px] font-bold text-gray-800 mb-3 tracking-tight">
                {treatment.comparison.leftLabel}와의 차이점
              </p>
              {/* 헤더 */}
              <div className="grid grid-cols-2 gap-1 mb-1">
                <div className="text-center text-[12px] font-semibold text-gray-500 bg-gray-100 rounded-lg py-1.5">
                  {treatment.comparison.leftLabel}
                </div>
                <div className="text-center text-[12px] font-semibold text-white rounded-lg py-1.5" style={{ backgroundColor: '#0080C8' }}>
                  {treatment.comparison.rightLabel}
                </div>
              </div>
              {/* 행 */}
              <div className="space-y-1">
                {treatment.comparison.rows.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 gap-1">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[12px] text-gray-600 font-medium leading-snug">
                      {row.leftText}
                    </div>
                    <div className="rounded-lg px-3 py-2.5 text-[12px] font-semibold leading-snug" style={{ backgroundColor: '#EBF5FF', color: '#0060A0' }}>
                      {row.rightText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 이미지 영역 — 오른쪽에서 슬라이드인 (bottomImage 사용 시 숨김) */}
        {!treatment.bottomImage && <div className={`${imageOrderClass} ${imageTopMargin} ${textVisible ? 'scroll-reveal-right' : 'scroll-hidden'}`}
          style={textVisible ? { animationDelay: '0.15s' } : undefined}>
          {treatment.photoGrid ? (
            <div className="grid grid-cols-2 gap-2">
              {treatment.photoGrid.map((item, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <div className="relative">
                    <img src={item.src} alt={item.caption} className="w-full aspect-[4/3] object-cover block" />
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#0080C8] flex items-center justify-center shadow">
                      <span className="text-white text-[12px] font-bold leading-none">{i + 1}</span>
                    </div>
                  </div>
                  <p className="text-center text-[14px] text-gray-700 font-semibold py-2 px-2 leading-tight">{item.caption}</p>
                </div>
              ))}
            </div>
          ) : (
          <div className={`${treatment.beforeImage && treatment.afterImage || treatment.videoUrl ? '' : singleImageFrameClass} rounded-2xl flex items-center justify-center overflow-hidden`}>
            {treatment.videoUrl ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${treatment.videoUrl.split('/').pop()?.split('?')[0]}?rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${treatment.title} 영상`}
                />
              </div>
            ) : treatment.beforeImage && treatment.afterImage ? (
              <BeforeAfterSlider
                beforeSrc={treatment.beforeImage}
                afterSrc={treatment.afterImage}
                beforeAlt={`${treatment.title} 시술 전`}
                afterAlt={`${treatment.title} 시술 후`}
                beforeScale={treatment.beforeScale}
                beforeOffsetX={treatment.beforeOffsetX}
              />
            ) : treatment.image && treatment.sideImage ? (
              <div className="space-y-3">
                <img src={treatment.image} alt={treatment.title} className="w-full h-auto rounded-2xl" />
                <img src={treatment.sideImage} alt={`${treatment.title} 사례`} className="w-full h-auto rounded-2xl" />
              </div>
            ) : treatment.image ? (
              <img
                src={treatment.image}
                alt={treatment.title}
                className="w-full h-auto rounded-2xl"
              />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center">
                <span className="text-gray-400 text-sm">치료 이미지 준비 중</span>
              </div>
            )}
          </div>
          )}
        </div>}
      </div>

      {/* richContent + highlights 동시 존재 → 사이드패널 (좌: 질문박스, 우: 아이콘 카드 2×2) */}
      {treatment.richContent && treatment.highlights && !isTriPanel && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6 ${textVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={textVisible ? { animationDelay: '0.35s' } : undefined}>
          <div>
            <RichDescription content={treatment.richContent} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {treatment.highlights.map((h, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 py-3">
                <LucideIcon name={h.icon} size={36} className="text-gray-300" />
                <p className="font-bold text-[17px] text-gray-900 leading-tight">{h.label}</p>
                <p className="text-[14px] text-gray-600 font-medium leading-relaxed whitespace-pre-line">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2열 패널: richContent(질문박스) + indications (isTriPanel 시) */}
      {isTriPanel && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 ${textVisible ? 'scroll-reveal-drop' : 'scroll-hidden'}`}
          style={textVisible ? { animationDelay: '0.35s' } : undefined}>
          {/* Left: 질문 박스 */}
          <div className="p-8 border-b sm:border-b-0 sm:border-r border-gray-200">
            <RichDescription content={treatment.richContent!} />
          </div>
          {/* Right: 이런 분께 필요합니다 */}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-5">
              <LucideIcon name="AlertTriangle" size={20} className="text-[#0080C8] shrink-0" />
              <p className="text-[16px] font-bold text-gray-900">이런 분께 특히 필요합니다</p>
            </div>
            <ul className="space-y-4">
              {treatment.indications!.map((ind, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0080C8] flex items-center justify-center shrink-0 mt-0.5">
                    <LucideIcon name="Check" size={13} className="text-white" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] text-gray-700 font-medium leading-relaxed">{ind}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* bottomImage: 글귀 아래 이미지 (sideImage가 있으면 나란히) */}
      {treatment.bottomImage && (
        <div className={`${treatment.sideImage ? 'grid grid-cols-2 gap-4' : ''} ${textVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={textVisible ? { animationDelay: '0.4s' } : undefined}>
          <img
            src={treatment.bottomImage}
            alt={treatment.title}
            className="w-full h-auto rounded-2xl"
          />
          {treatment.sideImage && (
            <img
              src={treatment.sideImage}
              alt={`${treatment.title} 사례`}
              className="w-full h-auto rounded-2xl"
            />
          )}
        </div>
      )}

      {/* 치료 과정 */}
      {treatment.steps && !isTriPanel && (
        <div ref={cardRef} className={`${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}>
          {treatment.treatmentType === 'vpt' && (
            <div className="mb-6 rounded-2xl overflow-hidden">
              <Image src="/images/treatments/natural-tooth/vpt.jpg" alt="VPT 신경보존술" width={1920} height={1080} className="w-full h-auto" />
            </div>
          )}

          <div className="mb-6">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#0080C8]">Treatment Process</span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{treatment.title} 치료 과정</h2>
          </div>

          {/* 데스크탑: 전체 폭 균등 배치 */}
          <ol className="hidden md:flex items-stretch w-full">
            {treatment.steps.map((step, i) => (
              <li key={i} className="flex items-center flex-1 min-w-0">
                {/* 스텝 박스 */}
                <div className="flex-1 flex flex-col items-center text-center px-2 py-5 rounded-2xl border border-[#D8E9F5] bg-white hover:border-[#0080C8]/40 hover:bg-[#F0F7FD] transition-colors group">
                  <span className="text-[32px] font-black tabular-nums leading-none mb-3 text-[#0080C8] group-hover:scale-110 transition-transform">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[18px] sm:text-[20px] font-bold text-gray-900 leading-snug break-keep">
                    {step.title}
                  </span>
                  {step.desc && (
                    <span className="text-[13px] text-gray-500 mt-2 leading-relaxed break-keep">{step.desc}</span>
                  )}
                </div>
                {/* 화살표 */}
                {i < (treatment.steps?.length ?? 0) - 1 && (
                  <div className="flex items-center justify-center w-8 shrink-0">
                    <svg className="w-4 h-4 text-[#0080C8]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </li>
            ))}
          </ol>

          {/* 모바일: 2열 그리드 */}
          <ol className="md:hidden grid grid-cols-2 gap-3">
            {treatment.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 bg-white border border-[#D8E9F5] rounded-xl p-3.5">
                <span className="text-[17px] font-black tabular-nums text-[#0080C8] leading-none shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-gray-900 leading-snug break-keep">{step.title}</p>
                  {step.desc && <p className="text-[12px] text-gray-500 mt-1 leading-relaxed break-keep">{step.desc}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 치료가 필요한 경우 — 한 줄씩 */}
      {treatment.indications && !isTriPanel && (
        <div className={`${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {treatment.treatmentType === 'vpt' ? 'VPT 신경보존술이' : `${treatment.title}가`} 필요한 경우
          </h2>
          <ul className="space-y-3">
            {treatment.indications.map((ind, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-[#0080C8] flex items-center justify-center shrink-0">
                  <LucideIcon name="Check" size={11} className="text-white" strokeWidth={3} />
                </span>
                <span className="text-[16px] text-gray-700 leading-relaxed">
                  {ind.replace(/\n/g, ' ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* bottomVideoUrl: 해시태그 카드 위 영상 */}
      {treatment.bottomVideoUrl && (
        <div className={`w-full sm:max-w-[80%] mx-auto ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}>
          <div className="w-full aspect-video rounded-2xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${treatment.bottomVideoUrl.split('youtu.be/')[1]?.split('?')[0]}?rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${treatment.title} 영상`}
            />
          </div>
        </div>
      )}

      {/* benefits 섹션 타이틀 */}
      {treatment.benefitsTitle && (
        <h2 className={`text-3xl font-bold text-gray-900 text-center ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}>
          {treatment.benefitsTitle}
        </h2>
      )}

      {/* 치료의 장점 카드 그리드 */}
      <div ref={cardRef}>
        <BenefitsGrid benefits={treatment.benefits} cardVisible={cardVisible} />
      </div>

      {/* 비교표 */}
      {treatment.comparison && (
        <div className={`${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`} style={{ animationDelay: '0.15s' }}>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            {treatment.comparison.leftLabel}와의 차이점
          </h2>
          <div className="rounded-2xl overflow-hidden border border-gray-100">
            {/* 헤더 행 */}
            <div className="grid grid-cols-[1fr_auto_1fr]">
              <div className="bg-gray-100 text-center py-3 text-[14px] font-bold text-gray-500">
                {treatment.comparison.leftLabel}
              </div>
              <div className="bg-gray-100 w-28 sm:w-36" />
              <div className="py-3 text-center text-[14px] font-bold text-white" style={{ backgroundColor: '#0080C8' }}>
                {treatment.comparison.rightLabel}
              </div>
            </div>
            {/* 데이터 행 */}
            {treatment.comparison.rows.map((row, i) => (
              <div key={i} className={`grid grid-cols-[1fr_auto_1fr] ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="flex items-center justify-center px-4 py-4 text-[15px] text-gray-500 text-center leading-snug border-r border-gray-100">
                  {row.leftText}
                </div>
                <div className="flex flex-col items-center justify-center gap-1 w-28 sm:w-36 px-2 py-4 border-r border-gray-100">
                  {row.icon && <LucideIcon name={row.icon} size={18} className="text-[#0080C8]" />}
                  <span className="text-[13px] font-semibold text-gray-700">{row.label}</span>
                </div>
                <div className="flex items-center justify-center px-4 py-4 text-[15px] font-semibold text-center leading-snug" style={{ color: '#0080C8' }}>
                  {row.rightText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하단 CTA 배너 */}
      {treatment.bottomCta && (
        <div className={`flex items-center gap-4 border border-gray-200 rounded-2xl px-6 py-5 bg-gray-50 ${cardVisible ? 'scroll-reveal-up' : 'scroll-hidden'}`}
          style={{ animationDelay: '0.2s' }}>
          <LucideIcon name="Smile" size={28} className="text-[#0080C8] shrink-0" />
          <p className="text-[16px] text-gray-700 font-medium leading-relaxed">{treatment.bottomCta}</p>
        </div>
      )}
    </div>
  )
}
