export type HeroSlide = {
  readonly id: number
  readonly image: string
  readonly isVideo?: boolean
  readonly loopVideo?: boolean
  readonly interval?: number
  readonly mobileObjectPosition?: string
}

export const WEB_SLIDES: readonly HeroSlide[] = [
  { id: 2, image: '/images/slides/main-02.mp4', isVideo: true },
  { id: 3, image: '/images/slides/slide-3.jpg', interval: 3000 },
  { id: 4, image: '/images/slides/slide-4.webp', interval: 3000 },
  { id: 5, image: '/images/slides/slide-5.png', interval: 3000 },
  { id: 6, image: '/images/slides/slide-6.jpg', interval: 3000 },
  { id: 1, image: '/images/slides/slide-1.mp4', isVideo: true },
]

export const MOBILE_SLIDES: readonly HeroSlide[] = [
  { id: 2, image: '/images/slides/main-02.mp4', isVideo: true, mobileObjectPosition: '30% center' },
  { id: 3, image: '/images/slides/slide-3.jpg', interval: 3000, mobileObjectPosition: '78% center' },
  { id: 4, image: '/images/slides/slide-4.webp', interval: 3000 },
  { id: 5, image: '/images/slides/slide-5.png', interval: 3000 },
  { id: 6, image: '/images/slides/slide-6.jpg', interval: 3000 },
  { id: 1, image: '/images/slides/slide-4-mobile.mp4', isVideo: true },
]

export const IMAGE_INTERVAL = 4700
export const LAST_SLIDE_SCROLL_DELAY = 3000
export const INDICATOR_RADIUS = 18
export const INDICATOR_CIRCUMFERENCE = 2 * Math.PI * INDICATOR_RADIUS

export function getVideoPoster(slide: HeroSlide): string | undefined {
  if (slide.image.includes('slide-1.mp4')) return '/images/slides/slide-1-poster.webp'
  if (slide.image.includes('slide-4-mobile.mp4')) return '/images/slides/slide-4-poster.webp'
  return undefined
}

export function getVideoPlaybackRate(slide: HeroSlide): number {
  return slide.id === 1 ? 0.7 : 1
}
