-- 서울이건치과 초기 마이그레이션
-- consultations: 상담 신청 DB
create table public.consultations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  privacy_agreed boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'contacted', 'completed')),
  memo text,
  created_at timestamptz default now() not null
);

alter table public.consultations enable row level security;

create policy "Anyone can insert consultation"
  on consultations for insert with check (true);

create policy "Only authenticated can read consultations"
  on consultations for select using (auth.role() = 'authenticated');

create policy "Only authenticated can update consultations"
  on consultations for update using (auth.role() = 'authenticated');

create policy "Only authenticated can delete consultations"
  on consultations for delete using (auth.role() = 'authenticated');

-- cases: 증례 사진/글
create table public.cases (
  id uuid default gen_random_uuid() primary key,
  board_category text not null,
  treatment_type text not null,
  title text not null,
  description text,
  before_image_url text,
  after_image_url text,
  sort_order int default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.cases enable row level security;

create policy "Anyone can read cases"
  on cases for select using (true);

create policy "Only authenticated can insert cases"
  on cases for insert with check (auth.role() = 'authenticated');

create policy "Only authenticated can update cases"
  on cases for update using (auth.role() = 'authenticated');

create policy "Only authenticated can delete cases"
  on cases for delete using (auth.role() = 'authenticated');

-- case_blogs: 증례 관련 블로그 링크
create table public.case_blogs (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  blog_url text not null,
  blog_title text,
  created_at timestamptz default now() not null
);

alter table public.case_blogs enable row level security;

create policy "Anyone can read case_blogs"
  on case_blogs for select using (true);

create policy "Only authenticated can insert case_blogs"
  on case_blogs for insert with check (auth.role() = 'authenticated');

create policy "Only authenticated can delete case_blogs"
  on case_blogs for delete using (auth.role() = 'authenticated');

-- notices: 공지사항/휴무일정
create table public.notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  image_url text,
  notice_date date,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.notices enable row level security;

create policy "Anyone can read active notices"
  on notices for select using (is_active = true or auth.role() = 'authenticated');

create policy "Only authenticated can insert notices"
  on notices for insert with check (auth.role() = 'authenticated');

create policy "Only authenticated can update notices"
  on notices for update using (auth.role() = 'authenticated');

create policy "Only authenticated can delete notices"
  on notices for delete using (auth.role() = 'authenticated');

-- 인덱스
create index idx_consultations_created_at on consultations(created_at desc);
create index idx_consultations_status on consultations(status);
create index idx_cases_board_category on cases(board_category);
create index idx_cases_sort_order on cases(board_category, sort_order);
create index idx_notices_active on notices(is_active, notice_date desc);
create index idx_case_blogs_case_id on case_blogs(case_id);
