import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { CLINICIAN_SELECT } from '@/lib/clinicians/columns'
import { validateClinicianRows } from '@/lib/clinicians/domain'
import {
  clinicianInputToDatabaseValues,
  parseClinicianInput,
} from '@/lib/clinicians/input'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const { data, error } = await createAdminClient()
    .from('doctors')
    .select(CLINICIAN_SELECT)
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('doctors admin read error:', error.message)
    return NextResponse.json(
      { error: '의료진 목록을 불러오지 못했습니다. DB 마이그레이션을 확인해 주세요.' },
      { status: 500 },
    )
  }

  const validated = validateClinicianRows(data)
  if (!validated.ok) {
    console.error('doctors admin parse error:', validated.error)
    return NextResponse.json({ error: validated.error }, { status: 500 })
  }
  return NextResponse.json(validated.value)
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = parseClinicianInput(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { data, error } = await createAdminClient()
    .from('doctors')
    .insert({
      id: randomUUID(),
      ...clinicianInputToDatabaseValues(parsed.value),
    })
    .select(CLINICIAN_SELECT)
    .single()

  if (error) {
    console.error('doctors insert error:', error.message)
    return NextResponse.json(
      { error: '의료진을 등록하지 못했습니다.' },
      { status: 500 },
    )
  }

  const created = validateClinicianRows([data])
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 500 })
  }
  revalidatePath('/about')
  return NextResponse.json(created.value[0], { status: 201 })
}
