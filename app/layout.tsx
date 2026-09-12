import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

import SiteShell from '@/components/layout/SiteShell'
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd'
import { TrackingScripts, GtmNoScript } from '@/components/seo/Tracking'
import { tracking } from '@/data/tracking'

const title = '수원치과 서울이건치과 | 자연치아 보존·임플란트·교정'
const description =
  '수원시 영통구 매탄동 서울이건치과. 자연치아 보존을 우선으로 임플란트·교정·소아진료를 안내합니다. 서울대 출신 대표원장, 원내 기공소, 진료시간·주차·오시는 길을 확인하세요.'

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://egundc.com'),
  verification: {
    google: 'p_FSsHqSLTp0KO8n3FpFMOKytCiScgpMXBaZtF55ibE',
    other: {
      ...(tracking.naverSiteVerification && {
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
        url: '/images/logo/egun-logo%20(1).png',
        width: 800,
        height: 600,
        alt: '서울이건치과',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/logo/egun-logo%20(1).png'],
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
        <LocalBusinessJsonLd />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
