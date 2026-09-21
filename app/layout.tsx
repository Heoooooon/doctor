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
// 병원 이름을 제목 맨 앞으로 옮기고, 검색 의도에 맞는 진료시간을 설명에 넣는다.
// 구글 1순위 목표인 '수원치과'는 제목 두 번째 자리에 유지한다.
const title = '서울이건치과 | 수원치과·영통 매탄동 - 화·목·금 야간진료'
const description =
  '수원 영통 매탄동 서울이건치과. 화·목·금 야간진료 20:30까지, 토요일 진료. 자연치아 보존·임플란트·교정·소아진료를 안내합니다.'

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
