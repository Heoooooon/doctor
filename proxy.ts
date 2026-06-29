import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // /admin 경로(로그인 페이지 제외)에서 쿠키 기반 인증 체크
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.next()
    }

    const session = request.cookies.get('admin-session')
    if (!session || session.value !== 'egun-admin-authenticated') {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
