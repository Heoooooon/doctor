export const BASE_URL = 'https://egundc.com'

export interface BoardSection {
  heading: string
  body: string
}

export interface BoardCarouselItem {
  slug: string
  title: string
  description: string
  image: string
  alt: string
  href: string
  relatedHref: string
  keywords: string[]
  /** 페이지 본문. 진료 정보를 안내하며 치료 결과를 보장하지 않는다. */
  sections: BoardSection[]
  /** 치료 설명이 포함된 페이지에 필요한 의료법 고지 */
  requiresTreatmentNotice: boolean
}

export const boardCarouselItems: BoardCarouselItem[] = [
  {
    slug: 'suwon-dental',
    title: '수원 치과 | 서울이건치과',
    description: '수원 영통구 서울이건치과의 진료 철학과 임플란트, 교정, 자연치아살리기, 소아치과 진료 안내를 확인하세요.',
    image: '/images/board/carousel/carousel-logo.jpg',
    alt: '서울이건치과 로고',
    href: '/board/suwon-dental',
    relatedHref: '/about',
    keywords: ['수원 치과', '영통 치과', '서울이건치과'],
    sections: [
      { heading: '영통구에서 찾아오시는 길', body: '서울이건치과는 경기도 수원시 영통구 인계로220번길 6-3 미산빌딩 2층에 있습니다. 영통·매탄동 생활권에서 접근하기 좋은 위치이며, 방문 전 전화(031-896-5512)로 예약 가능 시간을 확인하시면 대기 시간을 줄일 수 있습니다.' },
      { heading: '진료 범위', body: '자연치아 보존 치료, 임플란트, 교정, 소아 진료, 심미 보철까지 일상적인 치과 진료를 함께 다룹니다. 어떤 치료가 필요한지는 구강 검사와 방사선 검사 결과를 바탕으로 상담에서 안내해 드립니다.' },
      { heading: '진료 시간 안내', body: '평일은 09:30에 진료를 시작하며 화요일과 금요일은 20:30까지 야간진료를 운영합니다. 목요일 야간은 교정 진료로 운영되고 토요일은 13:30까지 진료합니다. 점심시간은 12:30부터 14:00까지입니다.' },
    ],
    requiresTreatmentNotice: false,
  },
  {
    slug: 'seoul-national-university-doctors',
    title: '서울대 출신 대표원장 | 서울이건치과',
    description: '서울대 출신 대표원장이 진단부터 치료 계획까지 직접 설명하는 수원 서울이건치과 진료 안내입니다. 검사 결과를 함께 보며 선택지와 예상 과정을 안내해 드립니다.',
    image: '/images/board/carousel/carousel-doctor.jpg',
    alt: '서울대 출신 서울이건치과 대표원장 진료 안내 이미지',
    href: '/board/seoul-national-university-doctors',
    relatedHref: '/about',
    keywords: ['서울대 출신 치과', '수원 치과 원장', '서울이건치과 대표원장'],
    sections: [
      { heading: '상담과 치료 계획', body: '대표원장이 구강 상태와 검사 결과를 직접 설명하고 치료 계획을 함께 정합니다. 치료 방법이 여러 가지인 경우 각각의 절차와 기간, 관리 방법을 함께 안내해 선택하실 수 있도록 합니다.' },
      { heading: '의료진 구성', body: '교정 진료는 교정과 전문의가, 소아 진료는 통합치의학과 전문의가 담당합니다. 진료 분야에 따라 담당 의료진이 달라질 수 있으며, 자세한 약력은 병원 소개 페이지에서 확인하실 수 있습니다.' },
      { heading: '검사와 기록', body: '진단에는 구강 검사와 방사선 검사 자료를 활용합니다. 치료 전후 기록을 남겨 경과를 함께 확인하며, 필요한 경우 추가 검사를 안내해 드립니다.' },
    ],
    requiresTreatmentNotice: false,
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
    sections: [
      { heading: '의식하진정법이란', body: '의식하진정법은 진정 약물을 이용해 긴장을 낮춘 상태에서 치과 치료를 받는 방법입니다. 완전히 잠드는 전신마취와는 다르며, 진료 중 의료진의 말에 반응할 수 있는 상태를 유지합니다.' },
      { heading: '이런 경우 상담해 보세요', body: '치과 치료에 대한 두려움이 크거나 구역 반사가 심해 진료가 어려운 경우, 또는 여러 치료를 한 번에 진행해야 하는 경우 상담 대상이 될 수 있습니다. 적용 여부는 전신 건강 상태와 복용 중인 약을 확인한 뒤 결정합니다.' },
      { heading: '진행 전 확인 사항', body: '시술 전에는 금식 등 준비 사항을 안내해 드리며, 진행 중에는 활력 징후를 확인합니다. 당일에는 보호자와 함께 내원하시고 운전은 피하시는 것이 좋습니다. 기저 질환이 있는 경우 반드시 미리 알려주세요.' },
    ],
    requiresTreatmentNotice: true,
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
    sections: [
      { heading: '디지털 진단 자료 활용', body: '3D CT 촬영 자료로 잇몸뼈의 양과 형태, 신경 위치를 확인한 뒤 식립 계획을 세웁니다. 계획 단계에서 위치와 깊이를 미리 검토해 수술 중 판단에만 의존하지 않도록 합니다.' },
      { heading: '진행 과정', body: '검사와 진단, 치료 계획 수립, 식립, 보철 제작과 장착 순으로 진행됩니다. 잇몸뼈 상태에 따라 뼈 이식이 함께 필요할 수 있으며, 전체 기간은 개인의 회복 속도에 따라 달라집니다.' },
      { heading: '식립 후 관리', body: '임플란트는 시술 후 관리가 오래 사용하는 데 중요합니다. 정기 점검과 스케일링, 올바른 칫솔질 방법을 안내해 드리며 불편한 증상이 있으면 예정일 전이라도 내원해 확인하시는 것이 좋습니다.' },
    ],
    requiresTreatmentNotice: true,
  },
  {
    slug: 'pediatric-orthodontics',
    title: '소아치과·교정치과 | 서울이건치과',
    description: '수원 영통 서울이건치과의 소아치과·성장기 교정 안내입니다. 아이의 충치 예방과 치열 발달 상태를 확인하고 연령에 맞는 관리 방법과 교정 시작 시기를 상담해 드립니다.',
    image: '/images/board/carousel/carousel-ortho.jpg',
    alt: '소아치과와 교정치과 진료 안내 이미지',
    href: '/board/pediatric-orthodontics',
    relatedHref: '/pediatric',
    keywords: ['수원 소아치과', '수원 교정치과', '성장기 교정'],
    sections: [
      { heading: '아이 치아 관리', body: '유치는 영구치가 자랄 공간을 유지하는 역할을 합니다. 충치나 조기 상실이 생기면 영구치 배열에 영향을 줄 수 있어 정기적인 검진과 불소 도포, 실란트 등 예방 관리가 도움이 됩니다.' },
      { heading: '교정 상담 시기', body: '턱 성장과 치아 교환 상태에 따라 적절한 시작 시기가 달라집니다. 치아가 겹쳐 나거나 위아래 맞물림이 고르지 않아 보이면 검진을 받아보시고, 바로 장치를 시작하지 않더라도 성장 관찰을 권해 드릴 수 있습니다.' },
      { heading: '진료 시 배려', body: '아이가 진료에 익숙해질 수 있도록 절차를 미리 설명하고 속도를 조절합니다. 보호자께는 가정에서의 칫솔질과 식습관 관리 방법을 함께 안내해 드립니다.' },
    ],
    requiresTreatmentNotice: true,
  },
  {
    slug: 'night-clinic',
    title: '야간진료 안내 | 서울이건치과',
    description: '낮에 시간 내기 어려운 분을 위한 수원 서울이건치과 야간진료 안내입니다. 화요일·금요일은 야간진료, 목요일은 교정진료로 오후 8시 30분까지 운영합니다.',
    image: '/images/board/carousel/carousel-time-current.png',
    alt: '서울이건치과 야간진료 안내: 화요일·금요일, 목요일 교정진료, 오후 8시 30분까지',
    href: '/board/night-clinic',
    relatedHref: '/location',
    keywords: ['수원 야간진료 치과', '영통 야간진료', '서울이건치과 진료시간'],
    sections: [
      { heading: '야간진료 운영 요일', body: '화요일과 금요일은 20:30까지 진료합니다. 목요일 야간은 교정 진료로 운영되며, 일반 진료를 원하시면 화요일이나 금요일을 이용하시면 됩니다.' },
      { heading: '평일·토요일 진료 시간', body: '월요일과 수요일은 09:30부터 18:30까지, 토요일은 09:30부터 13:30까지 진료합니다. 점심시간은 12:30부터 14:00까지이며 일요일과 공휴일은 휴진입니다.' },
      { heading: '예약 안내', body: '야간 시간대는 예약이 먼저 차는 경우가 많습니다. 전화(031-896-5512)나 상담 신청으로 미리 예약하시면 대기 시간을 줄일 수 있고, 진료 항목에 따라 소요 시간이 달라 미리 알려주시면 안내가 정확합니다.' },
    ],
    requiresTreatmentNotice: false,
  },
]

export function getBoardCarouselItem(slug: string) {
  return boardCarouselItems.find((item) => item.slug === slug)
}

export function absoluteUrl(path: string) {
  return `${BASE_URL}${path}`
}
