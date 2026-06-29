// @TASK Board - 임플란트 페이지
import type { Metadata } from 'next'
import TreatmentPage from '@/components/board/TreatmentPage'
import ImplantIdentity from '@/components/board/ImplantIdentity'
import { implantTreatments } from '@/data/treatments'

export const metadata: Metadata = {
  title: '수원 임플란트 | 네비게이션·올온4·즉시로딩 - 서울이건치과',
  description:
    '수원·영통 임플란트 - 디지털 네비게이션 가이드 임플란트, 올온4, 즉시로딩 임플란트를 안내합니다. 치료 계획은 잇몸뼈·교합·전신질환 여부에 따라 달라질 수 있습니다.',
  keywords: ['수원 임플란트', '영통 임플란트', '매탄동 임플란트', '수원 올온4', '네비게이션 임플란트'],
  alternates: {
    canonical: 'https://egundc.com/implant',
  },
}

export default function ImplantPage() {
  return (
    <TreatmentPage
      title="수원 임플란트 치료 안내"
      subtitle="상실된 치아를 회복하는 방법"
      treatments={implantTreatments}
      localVideo="/images/video/sedation-hero.mp4"
      heroFull
      extraSection={<ImplantIdentity />}
    />
  )
}
