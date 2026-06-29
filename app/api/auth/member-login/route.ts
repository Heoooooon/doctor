import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, password } = body

    if (!userId || typeof userId !== 'string' || !userId.trim())
      return NextResponse.json({ error: '아이디를 입력해 주세요.' }, { status: 400 })

    if (!password || typeof password !== 'string' || !password)
      return NextResponse.json({ error: '비밀번호를 입력해 주세요.' }, { status: 400 })

    const supabase = createAdminClient()

    const { data: member } = await supabase
      .from('members')
      .select('id, user_id, name, password_hash')
      .eq('user_id', userId.trim())
      .maybeSingle()

    if (!member)
      return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })

    const passwordHash = await hashPassword(password)

    if (member.password_hash !== passwordHash)
      return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })

    // 세션 토큰 생성 (간단한 랜덤 토큰)
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')

    const res = NextResponse.json({ id: member.id, userId: member.user_id, name: member.name }, { status: 200 })

    // 세션 쿠키 설정 (7일)
    res.cookies.set('member_token', token, {
      httpOnly: false,   // 클라이언트에서 읽을 수 있도록
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    res.cookies.set('member_id', member.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    // NextResponse.cookies.set 이 자동으로 percent-encoding 하므로 수동 인코딩 금지 (이중 인코딩 방지)
    res.cookies.set('member_name', member.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch {
    return NextResponse.json({ error: '요청을 처리할 수 없습니다.' }, { status: 500 })
  }
}
