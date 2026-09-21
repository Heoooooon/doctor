import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/cosmetic', destination: '/digital-prosthesis', permanent: true },
      { source: '/orthodontics', destination: '/orthodontic', permanent: true },
      // www 요청은 대표 도메인으로 모은다 — canonical은 apex 하나뿐이다.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.egundc.com' }],
        destination: 'https://egundc.com/:path*',
        permanent: true,
      },
      // 개편 전 구주소 — Search Console 404 목록(2026-09-16, 23건)의 네 갈래를
      // 가장 가까운 현재 페이지로 보낸다.
      { source: '/consult/reservation', destination: '/', permanent: true },
      { source: '/consult/:path*', destination: '/column', permanent: true },
      { source: '/intro/:path*', destination: '/about', permanent: true },
      { source: '/aesthetic/:path*', destination: '/digital-prosthesis', permanent: true },
      // 구 사이트의 모바일 미러(/m/*). Search Console 미색인 404의 대부분이 여기서 나온다.
      // 구체 규칙을 먼저 두고, 남는 주소는 마지막 규칙이 홈으로 보낸다.
      { source: '/m/notice', destination: '/notice', permanent: true },
      { source: '/m/notice_view/:path*', destination: '/notice', permanent: true },
      { source: '/m/tv', destination: '/media', permanent: true },
      { source: '/m/counsel', destination: '/column', permanent: true },
      { source: '/m/counsel_view/:path*', destination: '/column', permanent: true },
      { source: '/m/consult/:path*', destination: '/column', permanent: true },
      { source: '/m/:path(intro.*)', destination: '/about', permanent: true },
      { source: '/m/:path(implant.*)', destination: '/implant', permanent: true },
      { source: '/m/:path(orthodontics.*)', destination: '/orthodontic', permanent: true },
      { source: '/m/:path(aesthetic.*)', destination: '/digital-prosthesis', permanent: true },
      { source: '/m/:path(treatment.*)', destination: '/natural-tooth', permanent: true },
      { source: '/m/:path*', destination: '/', permanent: true },
      // 구 데스크톱 주소. 봇이 아직도 수집하는 경로만 가장 가까운 현재 페이지로 보낸다.
      { source: '/counsel_view/:path*', destination: '/column', permanent: true },
      { source: '/counsel_write', destination: '/column', permanent: true },
      { source: '/counsel/:path*', destination: '/column', permanent: true },
      { source: '/intro04_view/:path*', destination: '/about', permanent: true },
      { source: '/intro05_view/:path*', destination: '/about', permanent: true },
      { source: '/treatment/:path*', destination: '/natural-tooth', permanent: true },
      { source: '/orthodontics/:path*', destination: '/orthodontic', permanent: true },
      // `:path*`는 `/implant` 자신까지 매칭해 무한 리다이렉트가 된다. 하위 경로만 잡는다.
      { source: '/implant/:path+', destination: '/implant', permanent: true },
      { source: '/community/tv', destination: '/media', permanent: true },
      { source: '/community/review', destination: '/cases', permanent: true },
      { source: '/community/:path*', destination: '/notice', permanent: true },
      { source: '/personal', destination: '/privacy', permanent: true },
      { source: '/agree', destination: '/terms', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
