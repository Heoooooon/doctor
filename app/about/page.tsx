import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/page-metadata'
import AnchorNav from '@/components/about/AnchorNav'
import PhilosophySection from '@/components/about/PhilosophySection'
import DoctorProfileSection from '@/components/about/DoctorProfileSection'
import ScheduleSection from '@/components/about/ScheduleSection'
import InteriorSection from '@/components/about/InteriorSection'
import LabSection from '@/components/about/LabSection'
import AccessSection from '@/components/about/AccessSection'
import { getPublicClinicians } from '@/lib/clinicians/server'

export const metadata: Metadata = pageMetadata({
  path: '/about',
  title: '서울이건치과 소개 | 수원 영통 치과 의료진·진료철학',
  description:
    '서울대 출신 2인 대표원장의 진료 철학과 의료진, 본관·별관 진료 공간을 안내합니다. 수원시 영통구 인계로 위치.',
  keywords: ['서울이건치과', '수원치과 의료진', '서울대 출신 치과', '영통치과', '수원 영통 치과'],
  image: '/images/doctors/doctor-group.jpg',
  imageWidth: 1920,
  imageHeight: 937,
  imageAlt: '서울이건치과 의료진',
})

export default async function AboutPage() {
  const clinicians = await getPublicClinicians()

  return (
    <div className="about-page">
      {/* SEO h1 */}
      <h1 className="sr-only">서울이건치과 소개</h1>

      {/* 앵커 내비게이션 (sticky) */}
      <AnchorNav />

      {/* 섹션들 */}
      <PhilosophySection />
      <DoctorProfileSection doctors={clinicians} />
      <ScheduleSection />
      <InteriorSection />
      <LabSection />
      <AccessSection />
    </div>
  )
}
