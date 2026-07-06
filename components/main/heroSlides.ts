export type HeroPhase = 'intro' | 'slides'

export type HeroSlide = {
  readonly id: number
  readonly image: string
  /** 모바일 전용 미디어(세로 크롭 변형 등). 없으면 image를 그대로 사용 */
  readonly mobileImage?: string
  readonly isVideo?: boolean
  readonly loopVideo?: boolean
  readonly interval?: number
  /** 모바일 전용 노출 시간. 없으면 interval 사용 */
  readonly mobileInterval?: number
  readonly endHoldMs?: number
}

// 인트로 프리슬라이드 — 넘버링 캐러셀에 포함되지 않는다.
// 새로고침/로고 클릭 시 항상 이것부터 재생되고, 끝나면 HERO_SLIDES[0](진짜 1번)로 진입.
export const INTRO_SLIDE: HeroSlide = {
  id: 2,
  image: '/images/slides/main-02.mp4',
  isVideo: true,
}

// 데스크탑/모바일 공용 단일 소스 — 슬라이드 순서·첫 슬라이드·텍스트 인덱스가
// 항상 동일하게 유지되고, 미디어/인터벌만 슬라이드별 모바일 변형으로 오버라이드한다.
export const HERO_SLIDES: readonly HeroSlide[] = [
  { id: 3, image: '/images/slides/slide-3.jpg', interval: 3000, mobileInterval: 4000 },
  { id: 4, image: '/images/slides/slide-4.webp', interval: 3000, mobileInterval: 5000 },
  { id: 5, image: '/images/slides/slide-5.png', interval: 3000, mobileInterval: 5000 },
  { id: 6, image: '/images/slides/slide-6.jpg', interval: 3000 },
  {
    id: 1,
    image: '/images/slides/slide-1.mp4',
    mobileImage: '/images/slides/slide-4-mobile.mp4',
    isVideo: true,
  },
]

export const IMAGE_INTERVAL = 4700
export const LAST_SLIDE_SCROLL_DELAY = 3000
export const INDICATOR_RADIUS = 18
export const INDICATOR_CIRCUMFERENCE = 2 * Math.PI * INDICATOR_RADIUS

export function getSlideMedia(slide: HeroSlide, isMobile: boolean): string {
  return (isMobile && slide.mobileImage) || slide.image
}

export function getSlideInterval(slide: HeroSlide, isMobile: boolean): number {
  const interval = isMobile ? (slide.mobileInterval ?? slide.interval) : slide.interval
  return interval ?? IMAGE_INTERVAL
}

export function getVideoPoster(src: string): string | undefined {
  if (src.includes('slide-1.mp4')) return '/images/slides/slide-1-poster.webp'
  if (src.includes('slide-4-mobile.mp4')) return '/images/slides/slide-4-poster.webp'
  return undefined
}

export function getVideoPlaybackRate(slide: HeroSlide): number {
  return slide.id === 1 ? 0.7 : 1
}
