import type { Metadata } from 'next'

const BASE_URL = 'https://egundc.com'
const SITE_NAME = '서울이건치과'

interface PageMetadataInput {
  /** 사이트 기준 경로. 예: '/implant' */
  readonly path: string
  readonly title: string
  readonly description: string
  readonly keywords?: readonly string[]
  /** 이 페이지를 대표하는 이미지 경로. 페이지마다 다른 이미지를 쓴다. */
  readonly image: string
  readonly imageWidth: number
  readonly imageHeight: number
  readonly imageAlt: string
}

/**
 * 페이지 메타데이터를 만든다.
 *
 * 레이아웃의 openGraph를 그대로 상속하면 og:url이 홈 주소로, og:image가 공용 로고로 나간다.
 * 네이버 웹마스터 가이드는 사이트 전체에 반복되는 로고를 개별 페이지 대표 이미지로 보지 않으므로
 * 경로와 이미지를 페이지마다 지정한다.
 */
export function pageMetadata({
  path,
  title,
  description,
  keywords,
  image,
  imageWidth,
  imageHeight,
  imageAlt,
}: PageMetadataInput): Metadata {
  const url = `${BASE_URL}${path}`

  return {
    title,
    description,
    ...(keywords ? { keywords: [...keywords] } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'ko_KR',
      type: 'website',
      images: [{ url: image, width: imageWidth, height: imageHeight, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
