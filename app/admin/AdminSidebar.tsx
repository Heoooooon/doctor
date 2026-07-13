'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  Images,
  Users,
  Megaphone,
  BookOpen,
  PanelsTopLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/consultations', label: '상담 DB', icon: MessageSquare },
  { href: '/admin/cases', label: '증례 관리', icon: Images },
  { href: '/admin/patient-cases', label: '환자사례 관리', icon: Users },
  { href: '/admin/notices', label: '공지사항', icon: Megaphone },
  { href: '/admin/popups', label: '슬라이드 팝업', icon: PanelsTopLeft },
  { href: '/admin/columns', label: '원장칼럼', icon: BookOpen },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebar = (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-bold">서울이건치과</h2>
        <p className="text-xs text-white/50 mt-0.5">관리자 패널</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-[#0080C8] text-white font-semibold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* 모바일 토글 버튼 */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 text-white shadow-lg"
        aria-label="메뉴 토글"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 모바일 사이드바 */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>
    </>
  )
}
