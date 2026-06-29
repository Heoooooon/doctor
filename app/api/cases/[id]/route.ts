import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

type RouteContext = { params: Promise<{ id: string }> }

// PATCH: 증례 수정 (인증 필요)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { id } = await context.params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    const fields = ['title', 'description', 'board_category', 'treatment_type', 'before_image_url', 'after_image_url', 'sort_order']
    for (const field of fields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0 && !body.blog_urls) {
      return NextResponse.json(
        { error: '수정할 항목이 없습니다.' },
        { status: 400 },
      )
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()
      const { error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
      }
    }

    // 블로그 URL 업데이트 (전체 교체 방식)
    if (body.blog_urls !== undefined && Array.isArray(body.blog_urls)) {
      await supabase.from('case_blogs').delete().eq('case_id', id)

      const blogInserts = body.blog_urls
        .filter((b: { url: string; title?: string }) => b.url?.trim())
        .map((b: { url: string; title?: string }) => ({
          case_id: id,
          blog_url: b.url.trim(),
          blog_title: b.title?.trim() || null,
        }))

      if (blogInserts.length > 0) {
        await supabase.from('case_blogs').insert(blogInserts)
      }
    }

    const { data } = await supabase
      .from('cases')
      .select('*, case_blogs(*)')
      .eq('id', id)
      .single()

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}

// DELETE: 증례 삭제 (인증 필요)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { id } = await context.params

    // case_blogs는 cascade로 삭제되어야 하지만, 명시적으로도 삭제
    await supabase.from('case_blogs').delete().eq('case_id', id)

    const { error } = await supabase.from('cases').delete().eq('id', id)

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
