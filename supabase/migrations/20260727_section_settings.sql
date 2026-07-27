-- 메인 페이지 섹션 설정 (싱글톤 key-value)
-- key: 섹션 식별자 (예: 'doctor-group')
-- value: JSONB (이미지 URL, 카피 등)
create table if not exists public.section_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz default now() not null
);

alter table public.section_settings enable row level security;

-- 공개 읽기 (메인 페이지 렌더링에 필요)
drop policy if exists "Anyone can read section_settings" on public.section_settings;
create policy "Anyone can read section_settings"
  on public.section_settings for select
  using (true);

-- 관리자만 쓰기
drop policy if exists "Only authenticated can upsert section_settings" on public.section_settings;
create policy "Only authenticated can upsert section_settings"
  on public.section_settings for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Only authenticated can update section_settings" on public.section_settings;
create policy "Only authenticated can update section_settings"
  on public.section_settings for update
  using (auth.role() = 'authenticated');

-- 초기값: 의료진 섹션 현재 하드코딩 값
insert into public.section_settings (key, value)
values ('doctor-group', '{
  "desktop_image": "/images/doctors/doctors-team-desktop.webp",
  "mobile_image": "/images/doctors/doctor-team-mobile.webp",
  "headline": "한자리에서\n변하지 않는 마음",
  "subcopy": "서울대학교 출신 2인 대표원장이\n처음 상담부터 차분히 설명합니다",
  "button_text": "자세히보기",
  "mobile_subcopy": "마음을 담아 정성을 다하여",
  "mobile_button_text": "이건진료진 소개"
}')
on conflict (key) do nothing;
