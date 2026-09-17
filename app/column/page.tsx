import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/page-metadata'
import ColumnBoard from '@/components/column/ColumnBoard'
import { getPublicColumns } from '@/lib/columns'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  path: '/column',
  title: '원장칼럼 | 치과 건강정보 - 서울이건치과',
  description:
    '수원 영통구 매탄동 서울이건치과 이재성 대표원장이 직접 쓰는 원장칼럼입니다. 임플란트·교정·자연치아 보존·소아진료에서 자주 받는 질문과 치료 과정을 사례와 함께 설명합니다.',
  keywords: ['치과 칼럼', '치과 건강정보', '서울이건치과 칼럼', '임플란트 정보'],
  image: '/images/media-image/blog.webp',
  imageWidth: 1080,
  imageHeight: 1080,
  imageAlt: '서울이건치과 원장칼럼',
})

export default async function ColumnPage() {
  const posts = await getPublicColumns()
  return (
    <main className="bg-white min-h-screen pt-20">
      <ColumnBoard posts={posts} />
    </main>
  )
}
