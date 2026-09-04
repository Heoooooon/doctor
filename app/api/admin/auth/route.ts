import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkAdminPassword } from '@/lib/admin-password'
import {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
} from '@/lib/admin-session'

const ADMIN_SESSION_COOKIE = 'admin-session'

// POST: 비밀번호 검증 -> 쿠키 설정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 },
      )
    }

    const passwordCheck = checkAdminPassword(
      password,
      process.env.ADMIN_PASSWORD,
    )
    switch (passwordCheck.kind) {
      case 'unconfigured':
        return NextResponse.json(
          { error: '관리자 비밀번호가 설정되지 않았습니다.' },
          { status: 503 },
        )
      case 'invalid':
        return NextResponse.json(
          { error: '비밀번호가 올바르지 않습니다.' },
          { status: 401 },
        )
      case 'valid':
        break
    }

    const cookieStore = await cookies()
    const sessionToken = await createAdminSessionToken(
      process.env.ADMIN_PASSWORD ?? '',
    )
    cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}

// DELETE: 로그아웃 (쿠키 삭제)
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.set(ADMIN_SESSION_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 500 },
    )
  }
}
