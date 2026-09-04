import { NextResponse, type NextRequest } from 'next/server'
import { verifyAdminSessionToken } from '@/lib/admin-session'

export async function proxy(request: NextRequest) {
  // /admin 경로(로그인 페이지 제외)에서 쿠키 기반 인증 체크
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('admin-session')
    const authenticated = await verifyAdminSessionToken(
      session?.value,
      process.env.ADMIN_PASSWORD,
    )
    if (!authenticated) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
