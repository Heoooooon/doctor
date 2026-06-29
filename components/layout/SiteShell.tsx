'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import QuickConsultBar from './QuickConsultBar'
import FloatingSidebar from './FloatingSidebar'
import ScrollToTopButton from './ScrollToTopButton'
import SmoothScroll from '@/components/SmoothScroll'
import HoverHintCursor from '@/components/HoverHintCursor'
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  // 홈(HeroSlider 휠 하이재킹)·소개(AboutScrollSnap)는 자체 스크롤 제어가 있어 Lenis 제외
  const smoothEnabled = pathname !== '/' && !pathname.startsWith('/about')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      {smoothEnabled && <SmoothScroll />}
      <HoverHintCursor />
      <Header />
      <main className="pb-16 sm:pb-14">{children}</main>
      {pathname !== '/' && <Footer />}
      <FloatingSidebar />
      <ScrollToTopButton />
      <QuickConsultBar />
    </>
  )
}
