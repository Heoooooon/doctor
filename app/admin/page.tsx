import { createClient } from '@/lib/supabase/server'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import AdminDashboardCards from './AdminDashboardCards'

export default async function AdminDashboardPage() {
  if (!hasSupabaseConfig()) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">대시보드</h1>
        <AdminDashboardCards pendingCount={0} />
      </div>
    )
  }

  const supabase = await createClient()

  // 미확인 상담 건수 조회
  const { count } = await supabase
    .from('consultations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">대시보드</h1>
      <AdminDashboardCards pendingCount={count || 0} />
    </div>
  )
}
