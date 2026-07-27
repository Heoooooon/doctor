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

// 데스크탑/모바일 공용 단일 소스 — 슬라이드 순서·첫 슬라이드·텍스트 인덱스가
// 항상 동일하게 유지되고, 미디어/인터벌만 슬라이드별 모바일 변형으로 오버라이드한다.
export const HERO_SLIDES: readonly HeroSlide[] = [
  { id: 2, image: '/images/slides/main-02.mp4', isVideo: true },
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

/**
 * 히어로 "스크롤 연동 슬라이드 전환" 기능 활성화 플래그.
 *
 * - true : 히어로 구간에서 휠(데스크탑)·세로 스와이프(모바일)가 페이지 스크롤 대신
 *   슬라이드를 한 장씩 넘기고, 마지막 슬라이드가 끝나면 다음 섹션으로 자동 스크롤한다.
 * - false(현재): 히어로가 일반 자동재생 캐러셀처럼 스스로 순환하고,
 *   페이지 스크롤은 아무 방해 없이 그대로 흐른다.
 *
 * 기능을 다시 켜려면 이 값만 `true`로 바꾸면 된다. (관련 코드 전부 유지되어 있음)
 */
export const HERO_SCROLL_CONTROLS_ENABLED = false

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
  // 첫 슬라이드 영상: 로드 전 검정 화면 대신 첫 프레임 정지 이미지를 즉시 표시
  if (src.includes('main-02.mp4')) return '/images/slides/main-02-poster.jpg'
  if (src.includes('slide-1.mp4')) return '/images/slides/slide-1-poster.webp'
  if (src.includes('slide-4-mobile.mp4')) return '/images/slides/slide-4-poster.webp'
  return undefined
}

export function getVideoPlaybackRate(slide: HeroSlide): number {
  return slide.id === 1 ? 0.7 : 1
}
