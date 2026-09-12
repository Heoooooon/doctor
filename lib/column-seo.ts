import type { Metadata } from 'next'
import { BASE_URL } from './board-carousel'
import type { ColumnPost } from './columns'

const CLINIC_NAME = '서울이건치과'
const FALLBACK_IMAGE = `${BASE_URL}/images/logo/egun-logo%20(1).png`

export function columnUrl(id: string): string {
  return `${BASE_URL}/column/${encodeURIComponent(id)}`
}

function columnDescription(post: ColumnPost): string {
  const entities: Readonly<Record<string, string>> = {
    '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'",
  }
  const text = (post.content ?? '')
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos|#39);/g, entity => entities[entity])
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return `${post.title} | ${CLINIC_NAME} 원장칼럼`
  return text.length > 155 ? `${text.slice(0, 155).trimEnd()}…` : text
}

export function buildColumnMetadata(post: ColumnPost): Metadata {
  const url = columnUrl(post.id)
  const description = columnDescription(post)
  const image = post.image_url ? new URL(post.image_url, BASE_URL).href : FALLBACK_IMAGE
  return {
    title: `${post.title} | ${CLINIC_NAME}`,
    description,
    alternates: { canonical: url },
    robots: { index: post.is_active, follow: post.is_active },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: CLINIC_NAME,
      locale: 'ko_KR',
      type: 'article',
      ...(post.is_active ? { publishedTime: post.column_date } : {}),
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [image],
    },
  }
}

export function buildColumnJsonLd(post: ColumnPost) {
  const url = columnUrl(post.id)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: post.title,
    description: columnDescription(post),
    datePublished: post.column_date,
    inLanguage: 'ko-KR',
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.image_url ? { image: new URL(post.image_url, BASE_URL).href } : {}),
    // The columns table has neither an author nor a modification timestamp.
    publisher: { '@type': 'Organization', name: CLINIC_NAME, url: BASE_URL },
  }
}
