import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import {
  isMissingTableError,
  POPUP_TABLE,
  readLocalPopups,
  readStoragePopups,
  sortPopups,
  writeLocalPopups,
  writeStoragePopups,
  type SlidePopup,
} from '@/lib/slide-popups'

type RouteContext = { params: Promise<{ id: string }> }

const UPDATABLE_FIELDS = ['title', 'image_url', 'link_url', 'sort_order', 'is_active'] as const

function buildUpdates(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {}

  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) {
      if (field === 'title' && typeof body[field] === 'string') {
        updates[field] = body[field].trim()
      } else if (field === 'link_url') {
        const value = body[field]
        updates[field] =
          typeof value === 'string' && value.trim() ? value.trim() : null
      } else {
        updates[field] = body[field]
      }
    }
  }

  return updates
}

// PATCH: 팝업 수정 (인증 필요)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const updates = buildUpdates(body)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: '수정할 항목이 없습니다.' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    if (!hasSupabaseConfig()) {
      const popups = await readLocalPopups()
      const index = popups.findIndex((item) => item.id === id)
      if (index === -1) {
        return NextResponse.json({ error: '팝업을 찾을 수 없습니다.' }, { status: 404 })
      }
      popups[index] = { ...popups[index], ...updates } as SlidePopup
      await writeLocalPopups(sortPopups(popups))
      return NextResponse.json(popups[index])
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(POPUP_TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error) {
      return NextResponse.json(data)
    }

    if (!isMissingTableError(error)) {
      console.error('popups PATCH error:', error)
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const popups = await readStoragePopups(supabase)
    const index = popups.findIndex((item) => item.id === id)
    if (index === -1) {
      return NextResponse.json({ error: '팝업을 찾을 수 없습니다.' }, { status: 404 })
    }
    popups[index] = { ...popups[index], ...updates } as SlidePopup
    const { error: writeError } = await writeStoragePopups(supabase, popups)
    if (writeError) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }
    return NextResponse.json(popups[index])
  } catch (error) {
    console.error('popups PATCH error:', error)
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}

// DELETE: 팝업 삭제 (인증 필요)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = await context.params

    if (!hasSupabaseConfig()) {
      const popups = await readLocalPopups()
      await writeLocalPopups(popups.filter((item) => item.id !== id))
      return NextResponse.json({ success: true })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from(POPUP_TABLE).delete().eq('id', id)

    if (!error) {
      return NextResponse.json({ success: true })
    }

    if (!isMissingTableError(error)) {
      console.error('popups DELETE error:', error)
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const popups = await readStoragePopups(supabase)
    const { error: writeError } = await writeStoragePopups(
      supabase,
      popups.filter((item) => item.id !== id),
    )
    if (writeError) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('popups DELETE error:', error)
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}
