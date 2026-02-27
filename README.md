# 머니NPC 블로그 (Next.js + Supabase)

토스 스타일의 미니멀 UI, 실제 로그인, 관리자 전용 카테고리 CRUD, 리치 텍스트 글쓰기를 포함한 개인 블로그 템플릿입니다.

## 무엇이 동작하나요?

- 공개: 홈, 글 상세, 카테고리 필터, 소개
- 인증: `/login`에서 `signInWithPassword` 로그인, 실패 메시지 표시
- 관리자 전용: `/admin`, 카테고리 생성/수정/삭제, 글쓰기
- 에디터: Tiptap 리치 텍스트 + 이미지 자동 업로드/삽입(Supabase Storage: `images`)

---

## 1) 초보용 설정 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] SQL Editor에서 `supabase/schema.sql` 전체 실행
- [ ] `public.is_admin()` 함수 안의 이메일을 내 관리자 이메일로 변경
- [ ] Authentication > Providers에서 Email 활성화
- [ ] 로컬 `.env.local` 작성
- [ ] `npm install && npm run dev`
- [ ] 관리자 이메일 계정으로 로그인 후 `/admin` 접근 확인

---

## 2) 로컬 실행

```bash
cp .env.example .env.local
npm install
npm run dev
```

브라우저: `http://localhost:3000`

### `.env.local` 예시

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL=admin@example.com
```

---

## 3) Vercel 배포 환경변수

Vercel > Project Settings > Environment Variables에 아래 값 등록:

- `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `ADMIN_EMAIL=admin@example.com`

---

## 4) Supabase SQL 포함 내용

`supabase/schema.sql`에는 다음이 포함됩니다.

- `categories` 테이블
- `posts` 테이블(`category_id` 외래키)
- `is_admin()` 함수 (지정 이메일 관리자)
- 공개 읽기 정책(홈/상세)
- 관리자 쓰기 정책(카테고리/글)
- Storage 버킷 `images` + 정책

---

## 5) 페이지 목록

- `/` 홈(카드 목록 + 카테고리 필터)
- `/posts/[slug]` 글 상세
- `/topics/[slug]` 카테고리 목록
- `/about` 소개
- `/login` 로그인
- `/reset-password` 비밀번호 재설정
- `/admin` 관리자 대시보드
- `/admin/categories` 카테고리 CRUD
- `/admin/posts/new` 글쓰기(Tiptap)

---

## 6) 로그인 버그 수정 내용

- 로그인 폼을 `useActionState + server action`으로 연결
- 클릭 시 실제 form submit이 발생하고 Network 요청이 발생
- 실패 메시지 UI 표시
- 성공 시 `/admin` 이동
- 개발환경에서만 디버그 로그 출력

---

## 7) 글쓰기 UX

- 제목 입력 후 Enter 시 다음 입력으로 자연스럽게 포커스 이동
- Tiptap 리치 텍스트 본문 작성
- 첨부 버튼 클릭 → 업로드 즉시 진행
- 업로드 성공 시 커서 위치에 이미지 자동 삽입
- 업로드 중/실패/재시도 UI 제공

---

## 8) 변경 파일(핵심)

- `app/login/*`, `app/admin/*`, `components/editor/*`
- `components/site-header.tsx`, `components/ui/*`
- `lib/auth.ts`, `lib/posts.ts`, `lib/types.ts`
- `supabase/schema.sql`
- `README.md`, `.env.example`, `package.json`
