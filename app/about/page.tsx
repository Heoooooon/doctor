import type { Metadata } from 'next'
import AnchorNav from '@/components/about/AnchorNav'
import PhilosophySection from '@/components/about/PhilosophySection'
import DoctorProfileSection from '@/components/about/DoctorProfileSection'
import ScheduleSection from '@/components/about/ScheduleSection'
import InteriorSection from '@/components/about/InteriorSection'
import LabSection from '@/components/about/LabSection'
import AccessSection from '@/components/about/AccessSection'

export const metadata: Metadata = {
  title: '서울이건치과 소개 | 수원 영통 치과 의료진·진료철학',
  description:
    '서울대 출신 2인 대표원장의 진료 철학과 의료진, 본관·별관 진료 공간을 안내합니다. 수원시 영통구 인계로 위치.',
  keywords: ['서울이건치과', '수원치과 의료진', '서울대 출신 치과', '영통치과', '수원 영통 치과'],
  alternates: {
    canonical: 'https://egundc.com/about',
  },
}

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* SEO h1 */}
      <h1 className="sr-only">서울이건치과 소개</h1>

      {/* 앵커 내비게이션 (sticky) */}
      <AnchorNav />

      {/* 섹션들 */}
      <PhilosophySection />
      <DoctorProfileSection />
      <ScheduleSection />
      <InteriorSection />
      <LabSection />
      <AccessSection />
    </div>
  )
}
