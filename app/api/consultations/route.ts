import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// POST: 상담 신청 (비인증)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, privacy_agreed } = body

    // 입력 검증
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: '이름은 2자 이상 입력해주세요.' },
        { status: 400 },
      )
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: '연락처를 입력해주세요.' },
        { status: 400 },
      )
    }
    if (!privacy_agreed) {
      return NextResponse.json(
        { error: '개인정보 수집에 동의해주세요.' },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('consultations')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        privacy_agreed: true,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}

// GET: 상담 목록 (인증 필요)
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
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
