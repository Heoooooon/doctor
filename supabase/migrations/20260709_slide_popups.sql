-- 홈 인트로 이후 표시되는 슬라이드 팝업
create table if not exists public.slide_popups (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  link_url text,
  sort_order int default 0 not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_slide_popups_active_sort
  on public.slide_popups (is_active, sort_order asc, created_at desc);

alter table public.slide_popups enable row level security;

drop policy if exists "Anyone can read active slide_popups" on public.slide_popups;
create policy "Anyone can read active slide_popups"
  on public.slide_popups for select
  using (is_active = true or auth.role() = 'authenticated');

drop policy if exists "Only authenticated can insert slide_popups" on public.slide_popups;
create policy "Only authenticated can insert slide_popups"
  on public.slide_popups for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Only authenticated can update slide_popups" on public.slide_popups;
create policy "Only authenticated can update slide_popups"
  on public.slide_popups for update
  using (auth.role() = 'authenticated');

drop policy if exists "Only authenticated can delete slide_popups" on public.slide_popups;
create policy "Only authenticated can delete slide_popups"
  on public.slide_popups for delete
  using (auth.role() = 'authenticated');
