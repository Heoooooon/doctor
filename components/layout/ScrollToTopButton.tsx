'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/** 모바일 전용: 우측 하단 상담 신청 버튼 바로 위에 표시되는 '맨 위로' 버튼 */
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로 이동"
      className={`sm:hidden fixed right-4 z-50 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm text-[#2B2D42] border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      style={{ bottom: 'calc(64px + env(safe-area-inset-bottom) + 16px)' }}
    >
      <ArrowUp size={20} strokeWidth={2.4} />
    </button>
  )
}
