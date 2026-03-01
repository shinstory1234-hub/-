# 머니NPC 블로그 (Next.js + Supabase)

토스투자와 같은 결의 **미니멀/고밀도 UX**를 목표로 만든 블로그 템플릿입니다.
기능은 유지하면서 UI 시스템, 상호작용, 관리자 작업 흐름을 제품 수준으로 정리했습니다.

## 핵심 기능

- 공개 페이지: 홈, 글 상세, 카테고리 필터, 소개
- 인증: `/login` → Supabase `signInWithPassword` 로그인
- 관리자: `/admin`(대시보드), `/admin/posts`(글 목록), `/admin/categories`(카테고리 CRUD), `/admin/posts/new`(리치 에디터)
- 업로드: 이미지 첨부 즉시 업로드 + 본문 자동 삽입 + 진행률/실패/재시도 UI
- 권한: 관리자 1명 이메일 고정(`ADMIN_EMAIL=shinstory1234@gmail.com`)

---

## 1) 초보용 클릭 체크리스트 (순서대로)

### A. Supabase 준비
1. Supabase 프로젝트 생성
2. **SQL Editor** 열기 → `supabase/schema.sql` 전체 붙여넣기 → Run
3. **Authentication > Providers > Email** 활성화
4. **Storage > Buckets**에서 `images` 버킷 생성 여부 확인
5. **Authentication > Users**에서 `shinstory1234@gmail.com` 계정 생성(또는 회원가입)

### B. 로컬 실행
```bash
cp .env.example .env.local
npm install
npm run dev
```
브라우저: `http://localhost:3000`

### C. 로그인/관리자 확인
1. `/login` 접속
2. 이메일/비밀번호 입력 후 **로그인 버튼 클릭**
3. 브라우저 DevTools Network에 요청이 생기는지 확인
4. 성공 시 `/admin` 이동 + 성공 토스트 확인
5. 실패 시 에러 메시지/토스트 표시 확인

---

## 2) 환경변수

### `.env.local`
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL=shinstory1234@gmail.com
```

### Vercel
Project Settings → Environment Variables에 동일 키 등록:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL` (반드시 `shinstory1234@gmail.com`)

---

## 3) 디자인 시스템 요약

- 8px 간격 체계
- 뉴트럴 + 블루 포인트 1색
- 큰 radius, 얇은 border, 약한 shadow
- 제목/본문/보조 텍스트 3단 타이포
- 공통 UI: Button, Input, Textarea, Card, Badge, Tabs, Dropdown, Modal, Toast, Spinner, Skeleton
- 명확한 포커스 링 스타일

---

## 4) 점검 목록 (완료 기준)

- [ ] 로그인 클릭 시 Network 요청 발생
- [ ] 로그인 로딩 상태/실패 메시지/성공 이동 표시
- [ ] 카테고리 생성/수정/삭제 동작
- [ ] 관리자 글 목록에서 글 확인/수정 링크 이동
- [ ] 글쓰기: 제목 입력 후 Enter → 본문 에디터 포커스 이동
- [ ] 이미지 첨부 업로드 진행률 표시 + 업로드 후 본문 자동 삽입
- [ ] 업로드 실패 시 에러 + 재시도 동작
- [ ] 홈/상세/카테고리/관리자 화면이 같은 디자인 결로 통일
- [ ] `/login` 및 공개 페이지 렌더링 시 콘솔에 `Cookies can only be modified in a Server Action or Route Handler` 에러가 더 이상 발생하지 않음

---

## 5) 이번 변경 파일(핵심)

- 전역/토큰: `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`
- 공개 페이지: `app/page.tsx`, `app/posts/[slug]/page.tsx`, `app/topics/[slug]/page.tsx`, `app/loading.tsx`
- 로그인: `app/login/actions.ts`, `app/login/login-form.tsx`, `app/login/page.tsx`
- 관리자: `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/posts/page.tsx`, `app/admin/categories/page.tsx`, `app/admin/posts/new/page.tsx`
- 관리자 컴포넌트: `components/admin/*`
- 에디터: `components/editor/post-form.tsx`, `components/editor/rich-editor.tsx`
- 공통 UI: `components/ui/*`
- 권한/정책: `lib/auth.ts`, `supabase/schema.sql`, `.env.example`


## 6) 발행/카테고리 동작 확인(이번 버그 수정 포인트)

1. `/admin/posts/new`에서 제목 입력 시 `slug:` 값이 즉시 생성되는지 확인
2. 본문 입력 후 발행 클릭
3. DevTools Network에서 서버 액션 payload에 `title`, `slug`, `content`가 포함되는지 확인
4. 성공 응답이 `undefined`가 아닌 `{ ok: true, id, redirectTo }` 형태인지 확인
5. 실패 시 `{ ok: false, error }`가 오고 UI 토스트/인라인 에러가 보이는지 확인
6. `/admin/categories`에서 카테고리 생성 후 `/admin/posts/new` 드롭다운에 즉시 보이는지 확인


- [ ] `/admin/posts/new`에서 제목/본문 입력 후 발행 시 `ok:true` 응답 확인
- [ ] 발행 요청 payload에 `title`, `slug`, `content`가 모두 포함되는지 확인
- [ ] 발행 직후 홈(`/`)과 관리자 글 목록(`/admin/posts`)에 새 글이 반영되는지 확인
