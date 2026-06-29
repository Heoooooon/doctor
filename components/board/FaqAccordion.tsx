'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

interface FaqAccordionProps {
  faq: FaqItem[]
}

export default function FaqAccordion({ faq }: FaqAccordionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // 각 답변 내용의 실제 높이 측정 → 하단 예약 공간 계산용
  const answerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [reserve, setReserve] = useState(0)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // 가장 큰 답변 높이를 하단에 예약 → 어떤 항목을 펼쳐도 FAQ 블록 전체 높이가 일정,
  // 아래 섹션(다음 진료 챕터/CTA)은 고정된다.
  useEffect(() => {
    const measure = () => {
      const max = answerRefs.current.reduce(
        (m, el) => Math.max(m, el ? el.scrollHeight : 0),
        0,
      )
      setReserve(max)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [faq])

  const activeIndex = isMobile ? openIndex : hoveredIndex
  const activeHeight =
    activeIndex != null ? answerRefs.current[activeIndex]?.scrollHeight ?? 0 : 0
  // 펼쳐진 답변 높이만큼 예약 공간을 줄여 총 높이를 일정하게 유지
  const spacer = Math.max(0, reserve - activeHeight)

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        자주 묻는 질문
      </h3>
      <dl
        className="space-y-2"
        onMouseLeave={() => !isMobile && setHoveredIndex(null)}
      >
        {faq.map((item, index) => {
          const isOpen = isMobile ? openIndex === index : hoveredIndex === index
          const answerId = `faq-answer-${index}`

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
              onMouseEnter={() => !isMobile && setHoveredIndex(index)}
            >
              <dt>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => isMobile && setOpenIndex(openIndex === index ? null : index)}
                >
                  <span
                    className="shrink-0 w-7 h-7 rounded-full bg-[#0080C8] flex items-center justify-center text-white text-xs font-bold"
                    aria-hidden="true"
                  >
                    Q
                  </span>
                  <span className="flex-1 text-base sm:text-[18px] font-medium text-gray-800">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </dt>
              <dd
                id={answerId}
                className="overflow-hidden transition-[max-height] duration-300"
                style={{
                  maxHeight: isOpen
                    ? answerRefs.current[index]?.scrollHeight ?? 400
                    : 0,
                }}
              >
                <div
                  ref={(el) => {
                    answerRefs.current[index] = el
                  }}
                  className="px-5 pb-4 pt-1 flex gap-3"
                >
                  <Image
                    src="/images/doctors/doctorqna.jpg"
                    alt="담당 원장"
                    width={1429}
                    height={1429}
                    className="shrink-0 w-8 h-8 rounded-full object-cover mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#0080C8] mb-1 block">원장 답변</span>
                    <p className="text-base sm:text-[18px] text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </dd>
            </div>
          )
        })}
      </dl>
      {/* 하단 예약 공간: 펼친 답변 높이만큼 줄어들어 아래 섹션을 고정시킨다 */}
      <div
        aria-hidden="true"
        className="transition-[height] duration-300"
        style={{ height: spacer }}
      />
    </div>
  )
}
