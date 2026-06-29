-- News 환자사례 게시판 전용 테이블 (치료페이지 증례 cases 와 분리)
create table if not exists public.patient_cases (
  id uuid default gen_random_uuid() primary key,
  board_category text not null,        -- 대분류: 자연치아살리기 / 임플란트 / 심미보철 / 치아교정
  treatment_type text,                 -- 소분류: VPT / 레진빌드업 / 인비절라인 ...
  title text not null,
  description text,
  before_image_url text,
  after_image_url text,
  treatment_period text,               -- 치료기간 (예: 약 3개월)
  patient_info text,                   -- 환자정보 (예: 40대 남성)
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

create index if not exists idx_patient_cases_board_category on public.patient_cases (board_category);
create index if not exists idx_patient_cases_sort on public.patient_cases (board_category, sort_order);

-- RLS: 서버 API는 service role key로 우회하므로 정책은 최소화 (활성 사례 공개 읽기만 허용)
alter table public.patient_cases enable row level security;

drop policy if exists "patient_cases public read" on public.patient_cases;
create policy "patient_cases public read"
  on public.patient_cases for select
  using (is_active = true);
