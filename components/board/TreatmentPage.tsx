// @TASK Board - 치료 게시판 공통 레이아웃 템플릿
import type { TreatmentContent } from '@/types/treatment'
import BoardHero from './BoardHero'
import BoardAnchorNav from './BoardAnchorNav'
import TreatmentSection from './TreatmentSection'
import BenefitList from './BenefitList'
import CaseGallery from './CaseGallery'
import FaqAccordion from './FaqAccordion'
import BlogLinkCard from './BlogLinkCard'
import CtaSection from './CtaSection'
import { FaqJsonLd } from '@/components/seo/JsonLd'

interface TreatmentPageProps {
  title: string
  subtitle: string
  treatments: TreatmentContent[]
  hideCases?: boolean
  videoId?: string
  localVideo?: string
  heroImage?: string
  heroFull?: boolean
  extraSection?: React.ReactNode
  heroReplacement?: React.ReactNode
  treatImage?: string
  frostedContent?: boolean   // 페이지 배경 위 본문 가독성: 반투명+블러 패널 (소아치과 등)
}

export default function TreatmentPage({
  title,
  subtitle,
  treatments,
  hideCases,
  videoId,
  localVideo,
  heroImage,
  heroFull,
  extraSection,
  heroReplacement,
  treatImage,
  frostedContent,
}: TreatmentPageProps) {
  const navItems = treatments.map((t) => ({
    id: t.treatmentType,
    label: t.title,
  }))

  const allFaqs = treatments.flatMap((t) => t.faq)

  return (
    <>
      <FaqJsonLd faqs={allFaqs} />
      {heroReplacement ?? <BoardHero title={title} subtitle={subtitle} videoId={videoId} localVideo={localVideo} heroImage={heroImage} heroFull={heroFull} />}
      {extraSection}
      <BoardAnchorNav items={navItems} />

      <div className={`max-w-5xl mx-auto break-keep ${frostedContent ? 'bg-white/70 backdrop-blur-md rounded-2xl my-6 px-5 sm:px-8' : 'px-4 sm:px-6 lg:px-0'}`}>
        {treatments.map((treatment, index) => (
          <section
            key={treatment.treatmentType}
            id={treatment.treatmentType}
            className="py-14 sm:py-16 scroll-mt-44 border-b border-gray-100 last:border-b-0 space-y-10"
            aria-labelledby={`heading-${treatment.treatmentType}`}
          >
            {/* id를 heading에도 심어 두면 ARIA 연결이 자연스러워지지만,
                TreatmentSection 내부 h2가 이 역할을 겸하므로 별도 숨김 heading 불필요 */}
            <TreatmentSection treatment={treatment} index={index} />
            {!hideCases && (
              <CaseGallery
                boardCategory={treatment.boardCategory}
                treatmentType={treatment.treatmentType}
              />
            )}
            {treatment.faqVideoUrl && (
              <div className="w-full sm:max-w-[80%] mx-auto">
                <div className="w-full aspect-video rounded-2xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${treatment.faqVideoUrl.split('youtu.be/')[1]?.split('?')[0]}?rel=0&modestbranding=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${treatment.title} 영상`}
                  />
                </div>
              </div>
            )}
            <FaqAccordion faq={treatment.faq} />
            {!hideCases && (
              <BlogLinkCard boardCategory={treatment.boardCategory} />
            )}
            {treatImage && (
              <div className="md:hidden mt-6">
                <img src={treatImage} alt="치료 안내" className="w-full h-auto rounded-2xl" />
              </div>
            )}
          </section>
        ))}

        <div className="py-14 sm:py-16">
          <CtaSection />
        </div>
      </div>
    </>
  )
}
