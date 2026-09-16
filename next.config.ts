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
