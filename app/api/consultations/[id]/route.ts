import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

type RouteContext = { params: Promise<{ id: string }> }

// PATCH: 상태/메모 수정 (인증 필요)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { id } = await context.params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.status !== undefined) {
      const validStatuses = ['pending', 'contacted', 'completed']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: '유효하지 않은 상태값입니다.' },
          { status: 400 },
        )
      }
      updates.status = body.status
    }

    if (body.memo !== undefined) {
      updates.memo = body.memo
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '수정할 항목이 없습니다.' },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}

// DELETE: 삭제 (인증 필요)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { id } = await context.params

    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}
