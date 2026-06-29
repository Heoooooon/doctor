import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await isAdminAuthenticated()

  // 비인증 상태: 사이드바 없이 children만 렌더링 (login 페이지용)
  if (!isAuthenticated) {
    return <>{children}</>
  }

  // 인증 상태: 사이드바 + children
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-20">
        {children}
      </main>
    </div>
  )
}
