'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        자주 묻는 질문
      </h3>
      <dl className="space-y-2">
        {faq.map((item, index) => {
          const isOpen = isMobile ? openIndex === index : hoveredIndex === index
          const answerId = `faq-answer-${index}`

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
              onMouseEnter={() => !isMobile && setHoveredIndex(index)}
              onMouseLeave={() => !isMobile && setHoveredIndex(null)}
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
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-5 pb-4 pt-1 flex gap-3">
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
    </div>
  )
}
