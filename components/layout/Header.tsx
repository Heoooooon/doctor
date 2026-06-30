'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MobileNav from './MobileNav'

const NAV_ITEMS = [
  { label: '이건치과소개', href: '/about' },
  { label: '자연치아살리기', href: '/natural-tooth' },
  { label: '임플란트', href: '/implant' },
  { label: '심미보철', href: '/digital-prosthesis' },
  { label: '교정치료', href: '/orthodontic' },
  { label: '소아치과', href: '/pediatric' },
  { label: '오시는 길', href: '/location' },
]

const BOARD_ITEMS = [
  { label: '공지사항', href: '/notice' },
  { label: '원장칼럼', href: '/column' },
  { label: '환자사례', href: '/cases' },
]

const PHONE = '031-896-5512'

function clearSavedHomeScroll() {
  try {
    window.sessionStorage.removeItem('egun:home-scroll')
  } catch (error) {
    if (error instanceof DOMException) {
      return
    }
    throw error
  }
}

function clearIntroSeen() {
  try {
    window.sessionStorage.removeItem('egun:intro-seen')
  } catch (error) {
    if (error instanceof DOMException) {
      return
    }
    throw error
  }
}

export default function Header() {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()

  const isBoardActive = BOARD_ITEMS.some(b => pathname === b.href)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-20 gap-6 lg:gap-10">

            {/* 로고 */}
            <Link
              href="/"
              className="flex items-center shrink-0"
              aria-label="서울이건치과 홈으로 이동"
              onClick={(e) => {
                clearSavedHomeScroll()
                clearIntroSeen()
                if (pathname === '/') {
                  // 같은 홈 페이지에선 리마운트가 없으므로 이벤트로 온보딩 재생
                  e.preventDefault()
                  window.dispatchEvent(new Event('egun:hero-reset'))
                  window.dispatchEvent(new Event('egun:intro-replay'))
                }
                // 다른 페이지 → 홈: intro-seen을 비웠으므로 홈 진입 시 온보딩 재생
              }}
            >
              <Image
                src="/images/logo/egun-logo.png"
                alt="서울이건치과"
                width={1000}
                height={400}
                className="h-auto w-[150px] sm:w-[180px]"
              />
            </Link>

            {/* 데스크톱 네비게이션 (lg 이상) */}
            <nav
              className="hidden lg:flex flex-1 justify-center items-center gap-6 xl:gap-10"
              aria-label="주 메뉴"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex min-h-[44px] items-center px-1 py-2 text-[18px] font-medium whitespace-nowrap transition-colors duration-200 group ${
                      isActive ? 'text-[#0080C8]' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-transform duration-200 origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                      style={{ backgroundColor: '#0080C8' }}
                    />
                  </Link>
                )
              })}

              {/* 칼럼/증례 드롭다운 — 맨 오른쪽. 순수 CSS hover로 즉시 열림(하이드레이션과 무관) */}
              <div className="relative group/board">
                <button
                  className={`relative min-h-[44px] px-1 py-2 text-[18px] font-medium whitespace-nowrap transition-colors duration-200 group flex items-center gap-1 ${
                    isBoardActive ? 'text-[#0080C8]' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  칼럼/증례
                  <svg className="w-3.5 h-3.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span
                    className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full transition-transform duration-200 origin-left ${
                      isBoardActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                    style={{ backgroundColor: '#0080C8' }}
                  />
                </button>
                {/* top-full + pt-1(투명 패딩)로 버튼↔메뉴 사이를 이어 깜빡임 없이 호버 유지 */}
                <div className="absolute top-full right-0 pt-1 z-50 hidden group-hover/board:block group-focus-within/board:block">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[130px]">
                    {BOARD_ITEMS.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex min-h-[44px] items-center px-5 py-2.5 text-[18px] font-medium transition-colors hover:bg-[#EAF4FC] hover:text-[#0080C8] ${
                          pathname === item.href ? 'text-[#0080C8] bg-[#EAF4FC]' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* 예약하기 버튼 (데스크탑) */}
            <a
              href={`tel:${PHONE}`}
              className="hidden"
              style={{ backgroundColor: '#0080C8' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              예약하기
            </a>

            {/* 햄버거 메뉴 버튼 (lg 미만) */}
            <div className="lg:hidden ml-auto flex items-center gap-3">
              <a
                href={`tel:${PHONE}`}
                className="flex items-center justify-center w-11 h-11 rounded-full text-white"
                style={{ backgroundColor: '#0080C8' }}
                aria-label="전화 상담"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.59.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.02l-2.2 2.19z"/>
                </svg>
              </a>
              <button
                onClick={() => setNavOpen(true)}
                aria-label="메뉴 열기"
                aria-expanded={navOpen}
                aria-controls="mobile-nav"
                className="w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="block w-6 h-0.5 rounded-full bg-gray-700" />
                <span className="block w-6 h-0.5 rounded-full bg-gray-700" />
                <span className="block w-4 h-0.5 rounded-full self-start ml-[5px] bg-gray-700" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 모바일 내비게이션 */}
      <MobileNav isOpen={navOpen} onClose={() => setNavOpen(false)} />
    </>
  )
}
