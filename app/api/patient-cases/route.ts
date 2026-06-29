import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const boardCategory = request.nextUrl.searchParams.get('board_category')
    const includeAll = request.nextUrl.searchParams.get('all') === '1'

    const supabase = createAdminClient()
    let query = supabase
      .from('patient_cases')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (boardCategory) query = query.eq('board_category', boardCategory)
    if (!includeAll) query = query.eq('is_active', true)

    const { data, error } = await query
    if (error) {
      // 테이블 미생성 등 → 빈 목록으로 graceful 처리 (페이지 깨짐 방지)
      console.error('patient_cases GET error:', error.message)
      return NextResponse.json([])
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const { title, board_category } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }
    if (!board_category || typeof board_category !== 'string') {
      return NextResponse.json({ error: '대분류를 선택해주세요.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('patient_cases')
      .insert({
        title: title.trim(),
        board_category,
        treatment_type: body.treatment_type || null,
        description: body.description?.trim() || null,
        before_image_url: body.before_image_url || null,
        after_image_url: body.after_image_url || null,
        treatment_period: body.treatment_period?.trim() || null,
        patient_info: body.patient_info?.trim() || null,
        sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .select()
      .single()

    if (error) {
      console.error('patient_cases insert error:', error)
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: '요청을 처리할 수 없습니다.' }, { status: 500 })
  }
}
