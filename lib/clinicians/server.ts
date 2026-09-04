import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { doctors, type Doctor } from '@/data/doctors'
import { CLINICIAN_SELECT } from './columns'
import {
  parseClinicianRows,
  resolvePublicClinicians,
  type ClinicianLoad,
} from './domain'

const DOCTOR_ORDER = new Map<string, number>([
  ['lee-jaesung', 0],
  ['jung-chaeyun', 1],
  ['yoo-suhyun', 2],
  ['park-jiwon', 3],
  ['kim-jina', 4],
])

function staticClinicians(): readonly Doctor[] {
  return [...doctors].sort(
    (left, right) =>
      (DOCTOR_ORDER.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (DOCTOR_ORDER.get(right.id) ?? Number.MAX_SAFE_INTEGER),
  )
}

class ClinicianConfigError extends Error {
  constructor() {
    super('Supabase 공개 읽기 환경변수가 설정되지 않았습니다.')
    this.name = 'ClinicianConfigError'
  }
}

export async function getPublicClinicians(): Promise<readonly Doctor[]> {
  let load: ClinicianLoad = { kind: 'failed' }
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) throw new ClinicianConfigError()
    const supabase = createSupabaseClient(url, anonKey)
    const { data, error } = await supabase
      .from('doctors')
      .select(CLINICIAN_SELECT)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('doctors public read error:', error.message)
    } else {
      const parsed = parseClinicianRows(data)
      if (parsed.ok) {
        load = { kind: 'loaded', clinicians: parsed.value }
      } else {
        console.error('doctors public parse error:', parsed.error)
      }
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error
    console.error('doctors public load error:', error.message)
  }

  return resolvePublicClinicians(load, staticClinicians())
}
