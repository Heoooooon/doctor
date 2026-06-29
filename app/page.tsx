import Image from 'next/image'
import HeroSlider from '@/components/main/HeroSlider'
import DoctorGroup from '@/components/main/DoctorGroup'
import PreserveTreatSection from '@/components/main/PreserveTreatSection'
import ImplantSection from '@/components/main/ImplantSection'
import ImplantTypeSection from '@/components/main/ImplantTypeSection'
import ImplantFaqSection from '@/components/main/ImplantFaqSection'
import SedationSection from '@/components/main/SedationSection'
import CleanSection from '@/components/main/CleanSection'
import MediaSection from '@/components/main/MediaSection'
import MapSection from '@/components/main/MapSection'
import Footer from '@/components/layout/Footer'
import IntroScreen from '@/components/IntroScreen'
import { boardCarouselItems } from '@/lib/board-carousel'

const SECTIONS = [
  HeroSlider,
  DoctorGroup,
  ImplantSection,
  ImplantTypeSection,
  ImplantFaqSection,
  PreserveTreatSection,
  SedationSection,
  CleanSection,
  MediaSection,
  MapSection,
] as React.ComponentType[]

export default function Home() {
  return (
    <>
      <IntroScreen />

      <h1 className="sr-only">서울이건치과 — 수원치과·영통치과 임플란트·교정·수면치과 | 서울대 출신 2인 대표원장</h1>
      <nav className="sr-only" aria-label="서울이건치과 주요 진료 안내">
        <h2>서울이건치과 주요 진료 안내</h2>
        <ul>
          {boardCarouselItems.map((item) => (
            <li key={item.slug}>
              <a href={item.href}>{item.title}</a>
              <Image src={item.image} alt={item.alt} width={1080} height={1080} />
            </li>
          ))}
        </ul>
      </nav>

      {/* 데스크탑 */}
      <div
        id="home-desktop"
        className="home-page hidden md:block h-screen overflow-y-scroll scrollbar-hide"
      >
        {SECTIONS.map((Section, i) => (
          <div key={i}>
            <Section />
          </div>
        ))}
        <div>
          <Footer />
        </div>
      </div>

      {/* 모바일 */}
      <div id="home-mobile" className="home-page md:hidden">
        <HeroSlider />
        <DoctorGroup />
        <ImplantSection />
        <ImplantTypeSection />
        <ImplantFaqSection />
        <PreserveTreatSection />
        <SedationSection />
        <CleanSection />
        <MediaSection />
        <MapSection />
        <Footer />
      </div>
    </>
  )
}