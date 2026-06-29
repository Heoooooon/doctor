// @TASK Board - 자연치아 살리기 페이지
import type { Metadata } from 'next'
import TreatmentPage from '@/components/board/TreatmentPage'
import NaturalToothIdentity from '@/components/board/NaturalToothIdentity'
import { naturalToothTreatments } from '@/data/treatments'

export const metadata: Metadata = {
  title: '자연치아 살리기 | 수원 신경치료·치아보존 - 서울이건치과',
  description:
    '치아 상태에 따라 가능한 자연치아 보존(신경치료·치아살리기) 방향을 먼저 검토합니다. 정확한 치료 계획은 구강 상태 확인 후 결정됩니다.',
  keywords: ['자연치아 살리기', '수원 신경치료', '치아 보존', '수원 영통 치과', '치아살리기'],
  alternates: {
    canonical: 'https://egundc.com/natural-tooth',
  },
}

export default function NaturalToothPage() {
  return (
    <div className="natural-tooth-page">
      <TreatmentPage
      title="자연치아 살리기"
      subtitle="치과 치료의 기본입니다"
      treatments={naturalToothTreatments}
      localVideo="/images/video/egun1.gif"
      extraSection={<NaturalToothIdentity />}
      />
    </div>
  )
}
