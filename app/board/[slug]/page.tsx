import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { absoluteUrl, boardCarouselItems, getBoardCarouselItem } from '@/lib/board-carousel'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return boardCarouselItems.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = getBoardCarouselItem(slug)
  if (!item) return {}

  const url = absoluteUrl(item.href)
  const imageUrl = absoluteUrl(item.image)

  return {
    title: item.title,
    description: item.description,
    keywords: item.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: item.title,
      description: item.description,
      url,
      siteName: '서울이건치과',
      locale: 'ko_KR',
      type: 'article',
      images: [{ url: imageUrl, width: 1080, height: 1080, alt: item.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  }
}

export default async function BoardCarouselPage({ params }: Props) {
  const { slug } = await params
  const item = getBoardCarouselItem(slug)
  if (!item) notFound()

  const url = absoluteUrl(item.href)
  const imageUrl = absoluteUrl(item.image)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    name: item.title.replace(' | 서울이건치과', ''),
    description: item.description,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1080,
      height: 1080,
      caption: item.alt,
    },
    publisher: {
      '@type': 'Dentist',
      name: '서울이건치과',
      url: absoluteUrl('/'),
      telephone: '031-896-5512',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '인계로220번길 6-3 미산빌딩 2층',
        addressLocality: '수원시 영통구',
        addressRegion: '경기도',
        addressCountry: 'KR',
      },
    },
  }

  return (
    <main className="min-h-screen bg-[#F8F7F9] pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500" aria-label="breadcrumb">
          <Link href="/" className="hover:text-[#0080C8]">홈</Link>
          <span className="mx-2">/</span>
          <span>진료 안내</span>
        </nav>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          <img
            src={item.image}
            width={1080}
            height={1080}
            alt={item.alt}
            className="h-auto w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="space-y-5 p-6 sm:p-10">
            <h1 className="text-3xl font-bold leading-tight text-[#2B2D42] sm:text-4xl">
              {item.title}
            </h1>
            <p className="text-lg leading-8 text-gray-700">
              {item.description}
            </p>
            <p className="rounded-2xl bg-[#F8F7F9] p-5 text-base leading-7 text-gray-600">
              본 페이지는 검색엔진과 공유 미리보기에서 서울이건치과의 주요 진료 안내 이미지를 정확히 인식할 수 있도록 구성된 안내 페이지입니다.
              치료 방법과 결과는 개인의 구강 상태에 따라 달라질 수 있습니다.
            </p>
            <Link
              href={item.relatedHref}
              className="inline-flex rounded-full bg-[#0080C8] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#006EAA]"
            >
              관련 진료 자세히 보기
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
