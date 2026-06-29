// @TASK Board - 소아치과 페이지
import type { Metadata } from 'next'
import TreatmentPage from '@/components/board/TreatmentPage'
import PediatricIdentity, { PediatricCredentialSection } from '@/components/board/PediatricIdentity'
import { pediatricTreatments } from '@/data/treatments'

export const metadata: Metadata = {
  title: '수원 소아치과 | 영통 어린이치과 - 서울이건치과',
  description:
    '아이의 치아 성장, 충치 예방, 치열 발달 상태를 확인하고 연령에 맞는 진료 방향을 소아치과 전문의가 안내합니다.',
  keywords: ['수원 소아치과', '영통 어린이치과', '수원 어린이치과', '매탄동 소아치과', '소아치과 전문의'],
  alternates: {
    canonical: 'https://egundc.com/pediatric',
  },
}

export default function PediatricPage() {
  return (
    <div
      className="pediatric-page"
      style={{
        backgroundImage: "url('/images/m/icons/child-background.png')",
        backgroundRepeat: 'repeat-y',
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
      }}
    >
      <TreatmentPage
        title="수원 소아치과 진료 안내"
        subtitle="아이의 치아 성장과 구강 관리를 함께 살펴봅니다"
        treatments={pediatricTreatments}
        hideCases
        frostedContent
        heroReplacement={<PediatricCredentialSection />}
        extraSection={<PediatricIdentity />}
      />
    </div>
  )
}
