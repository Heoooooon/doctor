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

type RouteContext = {
  readonly params: Promise<{ readonly id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = parseClinicianInput(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { id } = await context.params
  const { data, error } = await createAdminClient()
    .from('doctors')
    .update(clinicianInputToDatabaseValues(parsed.value))
    .eq('id', id)
    .select(CLINICIAN_SELECT)
    .single()

  if (error) {
    console.error('doctors update error:', error.message)
    return NextResponse.json(
      { error: '의료진 정보를 수정하지 못했습니다.' },
      { status: 500 },
    )
  }

  const updated = validateClinicianRows([data])
  if (!updated.ok) {
    return NextResponse.json({ error: updated.error }, { status: 500 })
  }
  revalidatePath('/about')
  return NextResponse.json(updated.value[0])
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const { id } = await context.params
  const { error } = await createAdminClient()
    .from('doctors')
    .delete()
    .eq('id', id)
  if (error) {
    console.error('doctors delete error:', error.message)
    return NextResponse.json(
      { error: '의료진을 삭제하지 못했습니다.' },
      { status: 500 },
    )
  }

  revalidatePath('/about')
  return NextResponse.json({ success: true })
}
