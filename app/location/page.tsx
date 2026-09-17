import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/page-metadata'
import AccessSection from '@/components/about/AccessSection'

export const metadata: Metadata = pageMetadata({
  path: '/location',
  title: '서울이건치과 오시는 길 | 수원 영통 매탄동 치과 위치·주차',
  description:
    '서울이건치과 위치(수원시 영통구 인계로220번길), 진료시간, 본관·별관 안내, 주차 정보를 확인하실 수 있습니다.',
  keywords: ['수원 영통 치과', '매탄동 치과', '인계동 치과', '서울이건치과 위치', '수원 치과 오시는길'],
  image: '/images/clinic/way-2.png',
  imageWidth: 1004,
  imageHeight: 690,
  imageAlt: '서울이건치과 본관·별관 위치',
})

export default function LocationPage() {
  return (
    <main className="pt-20 sm:pt-24">
      <h1 className="sr-only">서울이건치과 오시는 길</h1>
      <AccessSection />
    </main>
  )
}
