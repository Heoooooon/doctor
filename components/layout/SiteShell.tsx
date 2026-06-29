'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import QuickConsultBar from './QuickConsultBar'
import FloatingSidebar from './FloatingSidebar'
import ScrollToTopButton from './ScrollToTopButton'
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

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
