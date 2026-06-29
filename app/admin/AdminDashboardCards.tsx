'use client'

import Link from 'next/link'
import { MessageSquare, Images, Megaphone } from 'lucide-react'

interface Props {
  pendingCount: number
}

const cards = [
  {
    href: '/admin/consultations',
    label: '상담 DB',
    description: '상담 신청 내역 관리',
    icon: MessageSquare,
    showBadge: true,
  },
  {
    href: '/admin/cases',
    label: '증례 관리',
    description: '치료 사례 및 Before/After 관리',
    icon: Images,
    showBadge: false,
  },
  {
    href: '/admin/notices',
    label: '공지사항',
    description: '공지사항 등록 및 관리',
    icon: Megaphone,
    showBadge: false,
  },
]

export default function AdminDashboardCards({ pendingCount }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#0080C8]/30 transition-all group"
        >
          {card.showBadge && pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
          <div className="w-12 h-12 rounded-lg bg-[#0080C8]/10 flex items-center justify-center mb-4 group-hover:bg-[#0080C8]/20 transition-colors">
            <card.icon size={24} className="text-[#0080C8]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{card.label}</h3>
          <p className="text-sm text-gray-500 mt-1">{card.description}</p>
        </Link>
      ))}
    </div>
  )
}
