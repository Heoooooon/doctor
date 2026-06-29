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
    const { userId, password, name, phone, birthday, email } = body

    // ── 입력값 검증 ──────────────────────────────────────────
    if (!userId || typeof userId !== 'string' || userId.trim().length < 4)
      return NextResponse.json({ error: '아이디는 4자 이상 입력해 주세요.' }, { status: 400 })

    if (!/^[a-zA-Z0-9_]+$/.test(userId.trim()))
      return NextResponse.json({ error: '아이디는 영문·숫자·_만 사용 가능합니다.' }, { status: 400 })

    if (!password || typeof password !== 'string' || password.length < 8)
      return NextResponse.json({ error: '비밀번호는 8자 이상 입력해 주세요.' }, { status: 400 })

    if (!name || typeof name !== 'string' || !name.trim())
      return NextResponse.json({ error: '이름을 입력해 주세요.' }, { status: 400 })

    if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10)
      return NextResponse.json({ error: '올바른 휴대폰번호를 입력해 주세요.' }, { status: 400 })

    if (!birthday || typeof birthday !== 'string' || !birthday.trim())
      return NextResponse.json({ error: '생년월일을 입력해 주세요.' }, { status: 400 })

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해 주세요.' }, { status: 400 })

    const supabase = createAdminClient()

    // ── 아이디 중복 검사 ──────────────────────────────────────
    const { data: existingId } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', userId.trim())
      .maybeSingle()

    if (existingId)
      return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 })

    // ── 이메일 중복 검사 ──────────────────────────────────────
    const { data: existingEmail } = await supabase
      .from('members')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (existingEmail)
      return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 })

    // ── 비밀번호 해시 & 저장 ──────────────────────────────────
    const passwordHash = await hashPassword(password)

    const { data, error } = await supabase
      .from('members')
      .insert({
        user_id: userId.trim(),
        password_hash: passwordHash,
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        birthday: birthday.trim(),
        email: email.trim().toLowerCase(),
      })
      .select('id, user_id, name')
      .single()

    if (error) {
      console.error('member-signup insert error:', error)
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: '요청을 처리할 수 없습니다.' }, { status: 500 })
  }
}
