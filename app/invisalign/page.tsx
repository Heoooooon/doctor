import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/page-metadata'
import TreatmentPage from '@/components/board/TreatmentPage'
import { orthodonticsTreatments } from '@/data/treatments'

export const metadata: Metadata = pageMetadata({
  path: '/invisalign',
  title: '수원 인비절라인 | 투명교정 상담 - 서울이건치과',
  description:
    '인비절라인 등 투명교정은 치아 배열, 교합 상태, 착용 시간에 따라 적합 여부가 달라질 수 있습니다. 교정과 전문의 상담을 통해 확인이 필요합니다.',
  keywords: ['수원 인비절라인', '영통 인비절라인', '투명교정', '수원 투명교정', '인비절라인 수원'],
  image: '/images/doctors/ortho-main.jpg',
  imageWidth: 2172,
  imageHeight: 724,
  imageAlt: '인비절라인 투명교정 상담',
})

export default function InvisalignPage() {
  return (
    <TreatmentPage
      title="수원 인비절라인 상담 안내"
      subtitle="치아 배열과 교합 상태를 먼저 확인합니다"
      treatments={orthodonticsTreatments}
      hideCases
      heroImage="/images/board/invisalign.jpg"
    />
  )
}
