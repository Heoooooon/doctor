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
    const { email, password, birthday, address } = body

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해 주세요.' }, { status: 400 })
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상 입력해 주세요.' }, { status: 400 })
    }
    if (!birthday || typeof birthday !== 'string' || !birthday.trim()) {
      return NextResponse.json({ error: '생년월일을 입력해 주세요.' }, { status: 400 })
    }
    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json({ error: '주소를 입력해 주세요.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email.trim(),
        password_hash: passwordHash,
        birthday: birthday.trim(),
        address: address.trim(),
      })
      .select('id, email, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: '처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: '요청을 처리할 수 없습니다.' }, { status: 500 })
  }
}
