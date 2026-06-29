import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import type { PatientCase } from '@/lib/patient-cases'
import CasesView from '@/components/cases/CasesView'

export const metadata: Metadata = {
  title: '환자사례 | 수원 임플란트·교정 치료 전후 - 서울이건치과',
  description: '실제 내원 환자분의 치료 전·후 사례입니다. 치료 결과는 개인의 구강 상태에 따라 달라질 수 있습니다.',
  keywords: ['수원치과 환자사례', '임플란트 전후', '교정 전후', '서울이건치과 사례'],
  alternates: { canonical: 'https://egundc.com/cases' },
}

export const dynamic = 'force-dynamic'

async function getActiveCases(): Promise<PatientCase[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('patient_cases')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data.map((row) => ({
      id: row.id,
      title: row.title,
      board_category: row.board_category,
      treatment_type: row.treatment_type,
      description: row.description,
      before_image_url: row.before_image_url,
      after_image_url: row.after_image_url,
      treatment_period: row.treatment_period,
      patient_info: row.patient_info,
      order: row.sort_order ?? 999,
    }))
  } catch {
    return []
  }
}

export default async function CasesPage() {
  const cases = await getActiveCases()
  return <CasesView cases={cases} />
}
