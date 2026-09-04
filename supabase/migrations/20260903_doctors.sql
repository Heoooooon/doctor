-- 의료진 소개 CMS
create table if not exists public.doctors (
  id text primary key check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  role text not null,
  title text,
  specialty text not null,
  sub_role text,
  specialty_detail text,
  image_url text not null,
  careers jsonb not null default '[]'::jsonb,
  memberships jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  letter text,
  documents jsonb not null default '[]'::jsonb,
  team_card_zoom double precision,
  team_card_shift_y_percent double precision,
  profile_image_fit text
    check (profile_image_fit in ('cover', 'contain-natural-ratio')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_doctors_public_order
  on public.doctors (is_active, sort_order, updated_at desc);

alter table public.doctors enable row level security;

drop policy if exists "doctors public read" on public.doctors;
create policy "doctors public read"
  on public.doctors for select
  using (is_active = true);

insert into public.doctors (
  id, name, role, title, specialty, sub_role, specialty_detail, image_url,
  careers, memberships, highlights, letter, documents, team_card_zoom,
  team_card_shift_y_percent, profile_image_fit, sort_order, is_active
)
values
  (
    'lee-jaesung', '이재성', '대표원장', 'DDS, MSD, PhD(c)',
    '임플란트 · 심미보철', '임플란트 · 심미보철 전문가',
    '고난도진료 · 심미보철', '/images/doctors/doctor-lee.png',
    '["서울대학교 치과대학/치의학대학원 졸업","서울대학교 치의학대학원 석사학위 취득","서울대학교 치의학대학원 박사과정","미국 하버드대학교 심미보철 과정 수료"]'::jsonb,
    '["ICMC fellow","대한 디지털치의학회 정회원","미국 심미치과학회 정회원 (AACD)"]'::jsonb,
    '[{"icon":"ScanLine","text":"정밀한\n디지털 진단"},{"icon":"Sparkles","text":"심미보철\n전문 설계"},{"icon":"ShieldCheck","text":"1:1\n책임 진료"}]'::jsonb,
    E'처음 오신 분도, 오래 다니신 분도\n매번 진심으로 맞이하겠습니다.\n치료 결과만큼 치료 과정도\n편안하도록 최선을 다하겠습니다.',
    '[]'::jsonb, 1.68, null, null, 0, true
  ),
  (
    'jung-chaeyun', '정채윤', '원장', 'DDS, MSD',
    '통합치의학 전문의', '통합치의학 전문의',
    '임플란트 · 디지털보철', '/images/doctors/doctor-jung.png',
    '["서울대학교 치과대학/치의학대학원 졸업","보건복지부 인증 통합치의학 전문의","Osstem Implant AIC 과정 수료","University of Pennsylvania 근관치료 고급과정 수료"]'::jsonb,
    '["대한 구강악안면임플란트학회 정회원","대한 디지털치의학회 (KADD) 정회원"]'::jsonb,
    '[{"icon":"Leaf","text":"자연치아\n보존 우선"},{"icon":"Zap","text":"고난도\n임플란트 전문"},{"icon":"Users","text":"통합치의학\n협진 진료"}]'::jsonb,
    E'자연치아를 최대한 보존하면서도\n아름다운 미소를 만들어 드리겠습니다.\n세심한 진료로 항상 함께하겠습니다.',
    '[]'::jsonb, 1.4, null, null, 1, true
  ),
  (
    'yoo-suhyun', '유수현', '원장', 'DDS, MSD',
    '교정', '교정과 전문의', '투명교정 · 성장기교정',
    '/images/doctors/doctor-yoo.png',
    '["경희대학교 치의학전문대학원 졸업","경희대학교 치과대학 치의학 석사","청아치과 병원 교정과 수련","서울대학교 학사 최우등 졸업","경희대학교 치의학 대학원 임상 최우수 수상"]'::jsonb,
    '["대한치과교정학회 준회원","대한설측교정학회 정회원","Invisalign 공인 치과의사","전) 압구정 후즈후 치과 교정과 원장 역임","현) 브라이트 치과 교정과 역임"]'::jsonb,
    '[{"icon":"ShieldCheck","text":"정밀 진단과\n맞춤 치료 계획"},{"icon":"Smile","text":"심미와 기능을\n함께 고려한 교정"},{"icon":"UserCheck","text":"1:1 핵심 진료로\n끝까지 함께"}]'::jsonb,
    E'교정은 단순한 치아 배열이 아닌\n얼굴 전체의 균형을 만드는 과정입니다.\n끝까지 함께하며\n최선의 결과를 만들겠습니다.',
    '[]'::jsonb, 1.4, null, null, 2, true
  ),
  (
    'park-jiwon', '박지원', '원장', 'DDS, MSD',
    '보존', '통합치의학 전문의', '보존치료 · 통합치의학',
    '/images/doctors/doctor-park.png',
    '["KAIST 우등졸업","경희대학교 치의학대학원 우등졸업","경희대학교 치의학대학원 석사학위 취득","보건복지부 인증 통합치의학 전문의","미국 UCLA 치과대학 externship"]'::jsonb,
    '["전) 서울명문치과 원장"]'::jsonb,
    '[{"icon":"ShieldCheck","text":"기본에 충실한\n보존 진료"},{"icon":"Heart","text":"두려움 없는\n편안한 진료"},{"icon":"Clock","text":"오래 가는\n치료 계획"}]'::jsonb,
    E'한 번 치료하면 오래 유지될 수 있도록\n기본에 충실한 진료를 약속드립니다.\n치과가 두렵지 않도록\n편안하게 모시겠습니다.',
    '[]'::jsonb, 1.4, null, null, 3, true
  ),
  (
    'kim-jina', '김진아', '원장', null,
    '소아', '통합치의학과 전문의', '소아치과 · 불소도포',
    '/images/doctors/doctor-kimjina.png',
    '["고려대학교 컴퓨터교육과 졸업","경희대학교 치의학전문대학원 치의학과 졸업","치의학 석사 취득","보건복지부 인증 통합치의학과 전문의","예치과병원 소아치과 전문과정 수료","분당예치과병원 · 중동21세기치과 진료","파미에키즈치과 · 연세어린이치과 소아진료 원장"]'::jsonb,
    '["대한통합치과학회 정회원","E-교정연구회 수료","경구·흡입진정 연수회 수료"]'::jsonb,
    '[{"icon":"Baby","text":"아이 눈높이\n맞춤 진료"},{"icon":"ShieldCheck","text":"안전한\n소아 마취"},{"icon":"Heart","text":"따뜻하고\n친근한 케어"}]'::jsonb,
    E'아이들에게 치과는 무서운 곳이 아니라\n친구 같은 곳이 되길 바랍니다.\n아이의 눈높이에서\n따뜻하게 돌보겠습니다.',
    '[]'::jsonb, 1.15, 3, 'contain-natural-ratio', 4, true
  )
on conflict (id) do nothing;
