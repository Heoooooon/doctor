import type { Metadata } from 'next'
import TreatmentPage from '@/components/board/TreatmentPage'
import CosmeticIdentity from '@/components/board/CosmeticIdentity'
import { cosmeticTreatments } from '@/data/treatments'

export const metadata: Metadata = {
  title: '수원 심미보철 | 라미네이트·올세라믹 크라운 - 서울이건치과',
  description:
    '치아의 기능과 심미성을 함께 고려한 심미보철 - 라미네이트, 올세라믹 크라운, 잇몸미백 치료를 안내합니다. 보철 종류와 치료 방향은 개인의 구강 상태에 따라 달라질 수 있습니다.',
  keywords: ['수원 심미보철', '수원 라미네이트', '올세라믹 크라운', '영통 보철', '잇몸미백'],
  alternates: {
    canonical: 'https://egundc.com/digital-prosthesis',
  },
}

export default function DigitalProsthesisPage() {
  return (
    <TreatmentPage
      title="심미보철과 디지털 보철"
      subtitle="치아의 기능과 심미를 함께 고려합니다"
      treatments={cosmeticTreatments}
      heroImage="/images/board/esthetic-2.jpg"
      extraSection={<CosmeticIdentity />}
    />
  )
}
