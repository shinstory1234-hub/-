-- 1) 확장
create extension if not exists "pgcrypto";

-- 2) posts 테이블
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  category text not null,
  tags text[] not null default '{}',
  cover_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_published_at on public.posts(published_at desc);
create index if not exists idx_posts_category on public.posts(category);
create index if not exists idx_posts_tags on public.posts using gin(tags);

-- 3) updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
before update on public.posts
for each row
execute procedure public.set_updated_at();

-- 4) RLS 활성화
alter table public.posts enable row level security;

-- 공개 읽기: 발행글만
create policy "public can read published posts"
on public.posts
for select
to anon, authenticated
using (is_published = true);

-- 작성자만 초안/자기글 읽기
create policy "authors can read own posts"
on public.posts
for select
to authenticated
using (auth.uid() = author_id);

-- 작성자만 작성
create policy "authors can insert own posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = author_id);

-- 작성자만 수정
create policy "authors can update own posts"
on public.posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

-- 작성자만 삭제
create policy "authors can delete own posts"
on public.posts
for delete
to authenticated
using (auth.uid() = author_id);

-- 5) Storage 버킷 및 정책
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- 공개 읽기
create policy "public read post images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'post-images');

-- 로그인 사용자 업로드 허용 (본인 폴더만)
create policy "users upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
