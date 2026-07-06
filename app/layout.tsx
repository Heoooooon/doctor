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

export const metadata: Metadata = {
  title: '서울이건치과 | 수원치과 영통치과 매탄동치과 임플란트·교정',
  description:
    '서울대 출신 2인 대표원장이 진료하는 수원 영통 치과. 디지털 네비게이션 임플란트, 의식하 진정(수면) 임플란트, 자연치아살리기, 교정, 소아치과. 수원시 영통구 인계로 위치.',
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
    title: '서울이건치과 | 수원치과 영통치과 매탄동치과 임플란트·교정',
    description:
      '서울대 출신 2인 대표원장이 진료하는 수원 영통 치과. 네비게이션 임플란트·수면치료·자연치아살리기·교정·소아치과.',
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
    title: '서울이건치과 | 수원치과 영통치과 매탄동치과 임플란트·교정',
    description:
      '서울대 출신 2인 대표원장이 진료하는 수원 영통 치과. 네비게이션 임플란트·수면치료·자연치아살리기·교정·소아치과.',
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
