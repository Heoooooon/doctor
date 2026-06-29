import type { Metadata } from 'next'
import TreatmentPage from '@/components/board/TreatmentPage'
import OrthodonticsIdentity, { OrthodonticsHeroBanner } from '@/components/board/OrthodonticsIdentity'
import { orthodonticsTreatments } from '@/data/treatments'

export const metadata: Metadata = {
  title: '수원 교정치과 | 치아교정·교합 상담 - 서울이건치과',
  description:
    '치아 배열뿐 아니라 교합, 얼굴형, 구강 상태를 함께 확인한 뒤 계획하는 교정치료를 안내합니다. 수원 영통 교정치과.',
  keywords: ['수원 교정치과', '영통 교정', '치아교정', '수원 교정', '매탄동 교정'],
  alternates: {
    canonical: 'https://egundc.com/orthodontic',
  },
}

export default function OrthodonticPage() {
  return (
    <TreatmentPage
      title="수원교정치과 인비절라인"
      subtitle="치아 배열과 교합을 함께 확인합니다"
      treatments={orthodonticsTreatments}
      hideCases
      heroReplacement={<OrthodonticsHeroBanner />}
      extraSection={<OrthodonticsIdentity />}
    />
  )
}
