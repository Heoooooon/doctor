'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import QuickConsultBar from './QuickConsultBar'
import FloatingSidebar from './FloatingSidebar'
import ScrollToTopButton from './ScrollToTopButton'
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  // 뒤로/앞으로(popstate) 이동을 표시 → 홈 복귀 시 스크롤 위치 복원 판단에 사용
  useEffect(() => {
    const onPop = () => {
      try { sessionStorage.setItem('egun:nav-pop', '1') } catch {}
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="pb-16 sm:pb-14">{children}</main>
      {pathname !== '/' && <Footer />}
      <FloatingSidebar />
      <ScrollToTopButton />
      <QuickConsultBar />
    </>
  )
}
