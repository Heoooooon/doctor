// @TASK Board - 상담 CTA 블록
import Link from 'next/link'
import { Phone, MessageCircle, CalendarDays } from 'lucide-react'

const CTA_ITEMS = [
  {
    icon: MessageCircle,
    label: '카카오 상담',
    description: '편하게 문자로 문의하세요',
    href: 'http://pf.kakao.com/_xmDDNxb',
    external: true,
    bg: 'bg-[#FAE300]',
    text: 'text-gray-900',
    iconColor: 'text-gray-800',
  },
  {
    icon: Phone,
    label: '전화 상담',
    description: '031-896-5512',
    href: 'tel:031-896-5512',
    external: false,
    bg: 'bg-[#0080C8]',
    text: 'text-white',
    iconColor: 'text-white',
  },
  {
    icon: CalendarDays,
    label: '온라인 예약',
    description: '원하는 시간에 예약하세요',
    href: '/contact',
    external: false,
    bg: 'bg-gray-900',
    text: 'text-white',
    iconColor: 'text-white',
  },
]

export default function CtaSection() {
  return (
    <section
      className="bg-[#F8F7F9] rounded-3xl p-8 sm:p-12"
      aria-labelledby="cta-heading"
    >
      <div className="text-center mb-10">
        <p className="text-[#0080C8] text-base font-semibold tracking-widest uppercase mb-2">
          Consulting
        </p>
        <h2
          id="cta-heading"
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
        >
          궁금한 점이 있으신가요?
        </h2>
        <p className="text-gray-500 text-[18px] leading-relaxed max-w-md mx-auto">
          전화, 카카오, 온라인 예약 중 편한 방법으로 문의해 주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {CTA_ITEMS.map(
          ({ icon: Icon, label, description, href, external, bg, text, iconColor }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className={`${bg} ${text} rounded-2xl p-6 flex flex-col items-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all duration-200`}
              aria-label={label}
            >
              <Icon size={28} className={iconColor} aria-hidden="true" />
              <div className="text-center">
                <p className="font-semibold text-base">{label}</p>
                <p className={`text-sm mt-0.5 opacity-80`}>{description}</p>
              </div>
            </a>
          ),
        )}
      </div>

      <div className="text-center">
        <Link
          href="/contact"
          className="inline-block bg-[#0080C8] text-white font-semibold text-base px-10 py-4 rounded-full hover:bg-[#2B2D42] active:scale-[0.98] transition-all duration-200"
          aria-label="상담 예약 페이지로 이동"
        >
          상담 예약하기
        </Link>
      </div>
    </section>
  )
}
