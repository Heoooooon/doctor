import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import {
  createPopupRecord,
  isMissingTableError,
  POPUP_TABLE,
  readLocalPopups,
  readStoragePopups,
  sortPopups,
  writeLocalPopups,
  writeStoragePopups,
  type SlidePopup,
} from '@/lib/slide-popups'

async function listPopups(includeAll: boolean): Promise<SlidePopup[]> {
  if (!hasSupabaseConfig()) {
    const local = await readLocalPopups()
    const sorted = sortPopups(local)
    return includeAll ? sorted : sorted.filter((item) => item.is_active)
  }

  const supabase = createAdminClient()
  const query = supabase
    .from(POPUP_TABLE)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (!includeAll) {
    query.eq('is_active', true)
  }

  const { data, error } = await query

  if (!error) {
    return (data || []) as SlidePopup[]
  }

  if (!isMissingTableError(error)) {
    throw error
  }

  // 테이블 미생성 시 Storage JSON 폴백
  const stored = sortPopups(await readStoragePopups(supabase))
  return includeAll ? stored : stored.filter((item) => item.is_active)
}

// GET: 활성 팝업 목록 (공개) / all=1 이면 전체 (관리용)
export async function GET(request: NextRequest) {
  try {
    const includeAll = request.nextUrl.searchParams.get('all') === '1'
    const data = await listPopups(includeAll)
    return NextResponse.json(data)
  } catch (error) {
    console.error('popups GET error:', error)
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}

// POST: 팝업 추가 (인증 필요)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { title, image_url, link_url, sort_order, is_active } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }

    if (!image_url || typeof image_url !== 'string' || !image_url.trim()) {
      return NextResponse.json({ error: '이미지를 업로드해주세요.' }, { status: 400 })
    }

    if (!hasSupabaseConfig()) {
      const popups = await readLocalPopups()
      const popup = createPopupRecord({
        title,
        image_url: image_url.trim(),
        link_url,
        sort_order:
          typeof sort_order === 'number'
            ? sort_order
            : popups.reduce((max, item) => Math.max(max, item.sort_order), -1) + 1,
        is_active,
      })
      await writeLocalPopups(sortPopups([popup, ...popups]))
      return NextResponse.json(popup, { status: 201 })
    }

    const supabase = createAdminClient()
    const insertPayload = {
      title: title.trim(),
      image_url: image_url.trim(),
      link_url: typeof link_url === 'string' && link_url.trim() ? link_url.trim() : null,
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    }

    const { data, error } = await supabase
      .from(POPUP_TABLE)
      .insert(insertPayload)
      .select()
      .single()

    if (!error) {
      return NextResponse.json(data, { status: 201 })
    }

    if (!isMissingTableError(error)) {
      console.error('popups POST error:', error)
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const existing = await readStoragePopups(supabase)
    const popup = createPopupRecord({
      title,
      image_url: image_url.trim(),
      link_url,
      sort_order:
        typeof sort_order === 'number'
          ? sort_order
          : existing.reduce((max, item) => Math.max(max, item.sort_order), -1) + 1,
      is_active,
    })
    const next = sortPopups([popup, ...existing])
    const { error: writeError } = await writeStoragePopups(supabase, next)
    if (writeError) {
      console.error('popups storage write error:', writeError)
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(popup, { status: 201 })
  } catch (error) {
    console.error('popups POST error:', error)
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}
