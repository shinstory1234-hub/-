create extension if not exists "pgcrypto";

-- 관리자 이메일(필요 시 변경)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'email') = 'shinstory1234@gmail.com', false);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
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
  category_id uuid not null references public.categories(id) on delete restrict,
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

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_email text,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_stats (
  date date primary key,
  visits integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_published_at on public.posts(published_at desc);
create index if not exists idx_posts_category_id on public.posts(category_id);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_likes_post_id on public.likes(post_id);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at before update on public.posts for each row execute procedure public.set_updated_at();

alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.daily_stats enable row level security;

drop policy if exists "anyone read categories" on public.categories;
drop policy if exists "admin manage categories" on public.categories;
drop policy if exists "anyone read published posts" on public.posts;
drop policy if exists "admin read all posts" on public.posts;
drop policy if exists "admin insert posts" on public.posts;
drop policy if exists "admin update posts" on public.posts;
drop policy if exists "admin delete posts" on public.posts;

drop policy if exists "likes select" on public.likes;
drop policy if exists "likes insert own" on public.likes;
drop policy if exists "likes delete own" on public.likes;
drop policy if exists "comments select" on public.comments;
drop policy if exists "comments insert own" on public.comments;
drop policy if exists "comments delete own" on public.comments;
drop policy if exists "daily stats select" on public.daily_stats;
drop policy if exists "daily stats server mutate" on public.daily_stats;

create policy "anyone read categories"
on public.categories
for select
to anon, authenticated
using (true);

create policy "admin manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "anyone read published posts"
on public.posts
for select
to anon, authenticated
using (is_published = true or public.is_admin());

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

create policy "likes select"
on public.likes
for select
to anon, authenticated
using (true);

create policy "likes insert own"
on public.likes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "likes delete own"
on public.likes
for delete
to authenticated
using (auth.uid() = user_id);

create policy "comments select"
on public.comments
for select
to anon, authenticated
using (true);

create policy "comments insert own"
on public.comments
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "comments delete own"
on public.comments
for delete
to authenticated
using (auth.uid() = user_id);

create policy "daily stats select"
on public.daily_stats
for select
to anon, authenticated
using (true);

create policy "daily stats server mutate"
on public.daily_stats
for all
to service_role
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
drop policy if exists "admin upload images" on storage.objects;
drop policy if exists "admin update images" on storage.objects;
drop policy if exists "admin delete images" on storage.objects;

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
