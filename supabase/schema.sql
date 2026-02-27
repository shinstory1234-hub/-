create extension if not exists "pgcrypto";

-- 관리자 이메일(반드시 본인 이메일로 변경)
-- 아래 함수의 이메일을 수정하세요.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'email') = 'admin@example.com', false);
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  tags text[] not null default '{}',
  cover_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_published_at on public.posts(published_at desc);
create index if not exists idx_posts_category_id on public.posts(category_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories for each row execute procedure public.set_updated_at();

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at before update on public.posts for each row execute procedure public.set_updated_at();

alter table public.categories enable row level security;
alter table public.posts enable row level security;

-- 공개 페이지
create policy "anyone read categories"
on public.categories
for select
to anon, authenticated
using (true);

create policy "anyone read published posts"
on public.posts
for select
to anon, authenticated
using (is_published = true);

-- 관리자만 카테고리/글 쓰기
create policy "admin manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin read all posts"
on public.posts
for select
to authenticated
using (public.is_admin());

create policy "admin insert posts"
on public.posts
for insert
to authenticated
with check (public.is_admin() and auth.uid() = author_id);

create policy "admin update posts"
on public.posts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin delete posts"
on public.posts
for delete
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "public read images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'images');

create policy "admin upload images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'images' and public.is_admin());

create policy "admin update images"
on storage.objects
for update
to authenticated
using (bucket_id = 'images' and public.is_admin())
with check (bucket_id = 'images' and public.is_admin());

create policy "admin delete images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'images' and public.is_admin());
