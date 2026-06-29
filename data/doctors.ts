export interface Doctor {
  id: string
  name: string
  role: string
  title?: string
  specialty?: string
  subRole?: string
  image: string
  specialtyDetail?: string
  careers: string[]
  memberships?: string[]
  highlights?: { icon: string; text: string }[]
  letter?: string
  documents?: string[]
}

export const doctors: Doctor[] = [
  {
    id: 'lee-jaesung',
    name: '이재성',
    role: '대표원장',
    title: 'DDS, MSD, PhD(c)',
    specialty: '임플란트 · 심미보철',
    subRole: '임플란트 · 심미보철 전문가',
    specialtyDetail: '고난도진료 · 심미보철',
    image: '/images/doctors/doctor-lee.png',
    careers: [
      '서울대학교 치과대학/치의학대학원 졸업',
      '서울대학교 치의학대학원 석사학위 취득',
      '서울대학교 치의학대학원 박사과정',
      '미국 하버드대학교 심미보철 과정 수료',
    ],
    memberships: [
      'ICMC fellow',
      '대한 디지털치의학회 정회원',
      '미국 심미치과학회 정회원 (AACD)',
    ],
    highlights: [
      { icon: 'ScanLine', text: '정밀한\n디지털 진단' },
      { icon: 'Sparkles', text: '심미보철\n전문 설계' },
      { icon: 'ShieldCheck', text: '1:1\n책임 진료' },
    ],
    letter:
      '처음 오신 분도, 오래 다니신 분도\n매번 진심으로 맞이하겠습니다.\n치료 결과만큼 치료 과정도\n편안하도록 최선을 다하겠습니다.',
  },
  {
    id: 'yoo-suhyun',
    name: '유수현',
    role: '원장',
    title: 'DDS, MSD',
    specialty: '교정',
    subRole: '교정과 전문의',
    specialtyDetail: '투명교정 · 성장기교정',
    image: '/images/doctors/doctor-yoo.png',
    careers: [
      '경희대학교 치의학전문대학원 졸업',
      '경희대학교 치과대학 치의학 석사',
      '청아치과 병원 교정과 수련',
      '서울대학교 학사 최우등 졸업',
      '경희대학교 치의학 대학원 임상 최우수 수상',
    ],
    memberships: [
      '대한치과교정학회 준회원',
      '대한설측교정학회 정회원',
      'Invisalign 공인 치과의사',
      '전) 압구정 후즈후 치과 교정과 원장 역임',
      '현) 브라이트 치과 교정과 역임',
    ],
    highlights: [
      { icon: 'ShieldCheck', text: '정밀 진단과\n맞춤 치료 계획' },
      { icon: 'Smile', text: '심미와 기능을\n함께 고려한 교정' },
      { icon: 'UserCheck', text: '1:1 핵심 진료로\n끝까지 함께' },
    ],
    letter:
      '교정은 단순한 치아 배열이 아닌\n얼굴 전체의 균형을 만드는 과정입니다.\n끝까지 함께하며\n최선의 결과를 만들겠습니다.',
  },
  {
    id: 'jung-chaeyun',
    name: '정채윤',
    role: '대표원장',
    title: 'DDS, MSD',
    specialty: '통합치의학 전문의',
    subRole: '통합치의학 전문의',
    specialtyDetail: '임플란트 · 디지털보철',
    image: '/images/doctors/doctor-jung.png',
    careers: [
      '서울대학교 치과대학/치의학대학원 졸업',
      '보건복지부 인증 통합치의학 전문의',
      'Osstem Implant AIC 과정 수료',
      'University of Pennsylvania 근관치료 고급과정 수료',
    ],
    memberships: [
      '대한 구강악안면임플란트학회 정회원',
      '대한 디지털치의학회 (KADD) 정회원',
    ],
    highlights: [
      { icon: 'Leaf', text: '자연치아\n보존 우선' },
      { icon: 'Zap', text: '고난도\n임플란트 전문' },
      { icon: 'Users', text: '통합치의학\n협진 진료' },
    ],
    letter:
      '자연치아를 최대한 보존하면서도\n아름다운 미소를 만들어 드리겠습니다.\n세심한 진료로 항상 함께하겠습니다.',
  },
  {
    id: 'baek-seola',
    name: '백설아',
    role: '원장',
    specialty: '소아',
    subRole: '소아치과 전문의',
    specialtyDetail: '소아치과 · 불소도포',
    image: '/images/doctors/doctor-paek.png',
    careers: [
      '단국대학교 치과대학 졸업',
      '단국대학교 치과대학병원 소아치과 수련',
      '소아치과 전문의 취득',
    ],
    memberships: [
      '대한소아치과학회 정회원',
    ],
    highlights: [
      { icon: 'Baby', text: '아이 눈높이\n맞춤 진료' },
      { icon: 'ShieldCheck', text: '안전한\n소아 마취' },
      { icon: 'Heart', text: '따뜻하고\n친근한 케어' },
    ],
    letter:
      '아이들에게 치과는 무서운 곳이 아니라\n친구 같은 곳이 되길 바랍니다.\n아이의 눈높이에서\n따뜻하게 돌보겠습니다.',
    documents: [
      '/images/doctors/baek-docu1.png',
      '/images/doctors/baek-docu2.png',
    ],
  },
  {
    id: 'park-jiwon',
    name: '박지원',
    role: '원장',
    title: 'DDS, MSD',
    specialty: '보존',
    subRole: '통합치의학 전문의',
    specialtyDetail: '보존치료 · 통합치의학',
    image: '/images/doctors/doctor-park.png',
    careers: [
      'KAIST 우등졸업',
      '경희대학교 치의학대학원 우등졸업',
      '경희대학교 치의학대학원 석사학위 취득',
      '보건복지부 인증 통합치의학 전문의',
      '미국 UCLA 치과대학 externship',
    ],
    memberships: [
      '전) 서울명문치과 원장',
    ],
    highlights: [
      { icon: 'ShieldCheck', text: '기본에 충실한\n보존 진료' },
      { icon: 'Heart', text: '두려움 없는\n편안한 진료' },
      { icon: 'Clock', text: '오래 가는\n치료 계획' },
    ],
    letter:
      '한 번 치료하면 오래 유지될 수 있도록\n기본에 충실한 진료를 약속드립니다.\n치과가 두렵지 않도록\n편안하게 모시겠습니다.',
  },
]
