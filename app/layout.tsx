import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

import SiteShell from '@/components/layout/SiteShell'
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd'
import { TrackingScripts, GtmNoScript } from '@/components/seo/Tracking'
import { NaverAnalytics } from '@/components/seo/NaverAnalytics'
import { tracking } from '@/data/tracking'

// 브랜드 검색이 노출의 절반을 차지하는데 클릭이 거의 없어(네이버 826노출 2클릭)
// 병원 이름을 제목 맨 앞에 두고, 뒤에 지역·진료과목 검색어를 붙인다.
// 설명에는 진료 소개 대신 진료시간과 주요 진료를 적는다. 문구는 2026-09-21 원장님 확정안이다.
// 목요일 20:30은 교정 야간진료만이라 일반 진료 안내에서는 화·금만 적는다.
const title = '서울이건치과 | 수원치과·영통치과 | 수원교정치과 | 임플란트 | 성장기교정'
const description =
  '수원치과 화.금 20:30까지 토요일 13:30까지 진료 고난도임플란트 전악임플란트.교정.소아치과진료 합니다.'

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://egundc.com'),
  verification: {
    google: 'p_FSsHqSLTp0KO8n3FpFMOKytCiScgpMXBaZtF55ibE',
    other: {
      ...(tracking.naverSiteVerification.length > 0 && {
        'naver-site-verification': tracking.naverSiteVerification,
      }),
      ...(tracking.bingSiteVerification && {
        'msvalidate.01': tracking.bingSiteVerification,
      }),
    },
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://egundc.com',
  },
  openGraph: {
    title,
    description,
    url: 'https://egundc.com',
    siteName: '서울이건치과',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/images/logo/egun-logo.png',
        width: 1000,
        height: 400,
        alt: '서울이건치과',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/logo/egun-logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <GtmNoScript />
        <TrackingScripts />
        <NaverAnalytics />
        <LocalBusinessJsonLd />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
