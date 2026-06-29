export interface BusinessHours {
  day: string
  hours: string
  isClosed?: boolean
  note?: string
}

export interface ScheduleTab {
  id: string
  label: string
  hours: BusinessHours[]
  notice?: string[]
}

export interface SocialLinks {
  kakao: string
  youtube: string
  blog: string
  naverPlace: string
}

export interface ClinicInfo {
  name: string
  representative: string
  phone: string
  fax: string
  businessNumber: string
  address: string
  latitude: number
  longitude: number
  socialLinks: SocialLinks
  lunchTime: string
  businessHours: BusinessHours[]
  scheduleTabs: ScheduleTab[]
}

export const clinicInfo: ClinicInfo = {
  name: '서울이건치과',
  representative: '이재성',
  phone: '031-896-5512',
  fax: '031-213-5510',
  businessNumber: '770-17-01708',
  address: '경기도 수원시 영통구 인계로220번길 6-3 미산빌딩 2층 서울이건치과',
  latitude: 37.264707,
  longitude: 127.041222,
  socialLinks: {
    kakao: 'https://pf.kakao.com/_nqBms',
    youtube: 'https://youtube.com/@seoulegun',
    blog: 'https://blog.naver.com/seoulegundc',
    naverPlace: 'https://m.place.naver.com/restaurant/12872860',
  },
  lunchTime: '12:30 - 14:00',
  businessHours: [
    { day: '월', hours: '09:30 - 18:30' },
    { day: '화', hours: '09:30 - 20:30', note: '야간진료' },
    { day: '수', hours: '09:30 - 18:30' },
    { day: '목', hours: '09:30 - 20:30', note: '교정야간진료' },
    { day: '금', hours: '09:30 - 20:30', note: '야간진료' },
    { day: '토', hours: '09:30 - 13:30' },
  ],
  scheduleTabs: [
    {
      id: 'main',
      label: '본관 (일반)',
      hours: [
        { day: '월요일', hours: '09:30 - 18:30' },
        { day: '화요일', hours: '09:30 - 20:30', note: '야간진료' },
        { day: '수요일', hours: '09:30 - 18:30' },
        { day: '목요일', hours: '09:30 - 20:30', note: '교정야간진료' },
        { day: '금요일', hours: '09:30 - 20:30', note: '야간진료' },
        { day: '토요일', hours: '09:30 - 13:30' },
      ],
      notice: [
        '점심시간 12:30 - 14:00 (토요일 없음)',
        '화 · 목(교정야간진료) · 금 야간진료는 예약 후 방문 권장',
      ],
    },
    {
      id: 'annex-pediatric',
      label: '별관 (소아치과)',
      hours: [
        { day: '월요일', hours: '09:30 - 18:00' },
        { day: '화요일', hours: '09:30 - 18:00' },
        { day: '수요일', hours: '09:30 - 18:00' },
        { day: '목요일', hours: '09:30 - 18:00' },
        { day: '금요일', hours: '09:30 - 18:00' },
        { day: '토요일', hours: '09:30 - 13:00' },
      ],
      notice: [
        '점심시간 12:30 - 14:00 (토요일 없음)',
        '소아 전문의 담당 진료',
        '사전 예약 강력 권장',
      ],
    },
    {
      id: 'annex-ortho',
      label: '별관 (교정과)',
      hours: [
        { day: '월요일', hours: '10:00 - 18:00' },
        { day: '화요일', hours: '10:00 - 18:00' },
        { day: '수요일', hours: '휴진', isClosed: true },
        { day: '목요일', hours: '10:00 - 18:00' },
        { day: '금요일', hours: '10:00 - 18:00' },
        { day: '토요일', hours: '10:00 - 13:00' },
      ],
      notice: [
        '점심시간 13:00 - 14:00',
        '수요일 교정과 휴진',
        '교정 전문의 담당 진료 · 반드시 예약 후 방문',
      ],
    },
  ],
}
