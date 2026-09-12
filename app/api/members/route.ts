import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// GET: 회원 목록 (인증 필요) — 비밀번호 해시는 절대 반환하지 않음
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()

    let query = supabase
      .from('members')
      .select('id, user_id, name, phone, email, birthday, created_at')
      .order('created_at', { ascending: false })

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,user_id.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
      )
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
