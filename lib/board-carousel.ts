export const BASE_URL = 'https://egundc.com'

export interface BoardCarouselItem {
  slug: string
  title: string
  description: string
  image: string
  alt: string
  href: string
  relatedHref: string
  keywords: string[]
}

export const boardCarouselItems: BoardCarouselItem[] = [
  {
    slug: 'suwon-dental',
    title: '수원 치과 | 서울이건치과',
    description: '수원 영통구 서울이건치과의 진료 철학과 임플란트, 교정, 자연치아살리기, 소아치과 진료 안내를 확인하세요.',
    image: '/images/board/carousel/carousel-logo.jpg',
    alt: '서울이건치과 로고와 수원 치과 진료 안내 이미지',
    href: '/board/suwon-dental',
    relatedHref: '/about',
    keywords: ['수원 치과', '영통 치과', '서울이건치과'],
  },
  {
    slug: 'seoul-national-university-doctors',
    title: '서울대 출신 대표원장 | 서울이건치과',
    description: '서울대 출신 대표원장이 직접 설명하고 진료 계획을 세우는 서울이건치과의 진료 안내입니다.',
    image: '/images/board/carousel/carousel-doctor.jpg',
    alt: '서울대 출신 서울이건치과 대표원장 진료 안내 이미지',
    href: '/board/seoul-national-university-doctors',
    relatedHref: '/about',
    keywords: ['서울대 출신 치과', '수원 치과 원장', '서울이건치과 대표원장'],
  },
  {
    slug: 'sleep-treatment',
    title: '수면치료 센터 | 서울이건치과',
    description: '수면치료와 의식하진정법을 활용한 치과치료 안내입니다. 환자 상태에 따라 진료 방법은 달라질 수 있습니다.',
    image: '/images/board/carousel/carousel-sleep.jpg',
    alt: '의식하진정법 수면치료 치과치료 안내 이미지',
    href: '/board/sleep-treatment',
    relatedHref: '/implant',
    keywords: ['수면치료 치과', '의식하진정법', '수원 수면치과'],
  },
  {
    slug: 'navigation-implant',
    title: '네비게이션 임플란트 | 서울이건치과',
    description: '3D CT와 디지털 진단 자료를 바탕으로 치료 계획을 세우는 네비게이션 임플란트 안내입니다.',
    image: '/images/board/carousel/carousel_navi.jpg',
    alt: '네비게이션 임플란트 디지털 진단 안내 이미지',
    href: '/board/navigation-implant',
    relatedHref: '/implant#navigation',
    keywords: ['네비게이션 임플란트', '수원 임플란트', '디지털 임플란트'],
  },
  {
    slug: 'pediatric-orthodontics',
    title: '소아치과·교정치과 | 서울이건치과',
    description: '아이의 치아 관리와 성장기 교정 상담을 위한 소아치과·교정치과 진료 안내입니다.',
    image: '/images/board/carousel/carousel-ortho.jpg',
    alt: '소아치과와 교정치과 진료 안내 이미지',
    href: '/board/pediatric-orthodontics',
    relatedHref: '/pediatric',
    keywords: ['수원 소아치과', '수원 교정치과', '성장기 교정'],
  },
  {
    slug: 'night-clinic',
    title: '야간진료 안내 | 서울이건치과',
    description: '바쁜 현대인을 위한 서울이건치과 야간진료 시간과 내원 안내입니다.',
    image: '/images/board/carousel/carousel-time.jpg',
    alt: '서울이건치과 월금 야간진료 시간 안내 이미지',
    href: '/board/night-clinic',
    relatedHref: '/location',
    keywords: ['수원 야간진료 치과', '영통 야간진료', '서울이건치과 진료시간'],
  },
]

export function getBoardCarouselItem(slug: string) {
  return boardCarouselItems.find((item) => item.slug === slug)
}

export function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`
}
