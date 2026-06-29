'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: '이건치과소개', href: '/about' },
  { label: '자연치아살리기', href: '/natural-tooth' },
  { label: '임플란트', href: '/implant' },
  { label: '심미보철', href: '/digital-prosthesis' },
  { label: '교정치료', href: '/orthodontic' },
  { label: '소아치과', href: '/pediatric' },
  { label: '오시는 길', href: '/location' },
]

const BOARD_ITEMS: NavItem[] = [
  { label: '공지사항', href: '/notice' },
  { label: '원장칼럼', href: '/column' },
  { label: '환자사례', href: '/cases' },
]

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  // 메뉴 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 슬라이드 패널 */}
      <nav
        role="dialog"
        aria-modal="true"
        aria-label="메인 메뉴"
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="text-[18px] font-semibold text-gray-500 tracking-widest uppercase">
            Menu
          </span>
          <button
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 메뉴 링크 */}
        <ul className="flex-1 overflow-y-auto py-4">
          {/* 칼럼/증례 섹션 — 맨 위 */}
          <li>
            <p className="px-6 pt-2 pb-1 text-[14px] font-bold text-gray-400 uppercase tracking-widest">
              칼럼/증례
            </p>
          </li>
          {BOARD_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex min-h-[52px] items-center gap-3 px-6 py-3 text-[18px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#0080C8] bg-[#0080C8]/5 border-r-2 border-[#0080C8]'
                      : 'text-gray-600 hover:text-[#0080C8] hover:bg-gray-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}

          {/* 구분선 */}
          <li><div className="mx-6 my-3 border-t border-gray-100" /></li>

          {/* 진료 메뉴 */}
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex min-h-[56px] items-center gap-3 px-6 py-4 text-[18px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#0080C8] bg-[#0080C8]/5 border-r-2 border-[#0080C8]'
                      : 'text-gray-700 hover:text-[#0080C8] hover:bg-gray-50'
                  }`}
                >
                  <span className="w-6 text-[14px] text-gray-400 font-normal tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* 하단 연락처 */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
          <p className="text-[14px] text-gray-500 mb-1">대표전화</p>
          <a
            href="tel:031-896-5512"
            className="text-lg font-bold text-[#0080C8] tracking-wide"
          >
            031-896-5512
          </a>
        </div>
      </nav>
    </>
  )
}
