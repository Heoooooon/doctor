import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { hasSupabaseConfig } from '@/lib/supabase/config'

// GET: 증례 목록 (공개, ?board_category 필터)
export async function GET(request: NextRequest) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json([])
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const boardCategory = searchParams.get('board_category')

    let query = supabase
      .from('cases')
      .select('*, case_blogs(*)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (boardCategory && boardCategory !== 'all') {
      query = query.eq('board_category', boardCategory)
    }

    const { data, error } = await query

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

// POST: 증례 추가 (인증 필요)
export async function POST(request: NextRequest) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json(
        { error: 'Supabase 환경변수가 설정되지 않았습니다.' },
        { status: 503 },
      )
    }

    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const { title, description, board_category, treatment_type, before_image_url, after_image_url, blog_urls } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }
    if (!board_category) {
      return NextResponse.json({ error: '게시판 카테고리를 선택해주세요.' }, { status: 400 })
    }

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        board_category,
        treatment_type: treatment_type || null,
        before_image_url: before_image_url || null,
        after_image_url: after_image_url || null,
      })
      .select()
      .single()

    if (caseError) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    // 블로그 URL 추가
    if (blog_urls && Array.isArray(blog_urls) && blog_urls.length > 0) {
      const blogInserts = blog_urls
        .filter((b: { url: string; title?: string }) => b.url?.trim())
        .map((b: { url: string; title?: string }) => ({
          case_id: caseData.id,
          blog_url: b.url.trim(),
          blog_title: b.title?.trim() || null,
        }))

      if (blogInserts.length > 0) {
        await supabase.from('case_blogs').insert(blogInserts)
      }
    }

    return NextResponse.json(caseData, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}
