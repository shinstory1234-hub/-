# 머니NPC 블로그 (Next.js + Supabase)

Next.js + Supabase 기반 블로그입니다. 공개 홈/상세, 관리자 글/카테고리 관리, 좋아요/댓글, Today 방문자 수를 포함합니다.

## 1) .env.local 필수 값

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
ADMIN_EMAIL=shinstory1234@gmail.com
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

## 2) Supabase 설정 순서 (초보용)

1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 전체 실행
3. Authentication > Providers > Email 활성화
4. Storage > Buckets 에서 `images` 버킷 확인
5. 관리자 이메일(`ADMIN_EMAIL`) 계정으로 회원가입/로그인

## 3) 로컬 실행

```bash
npm install
npm run dev
```

브라우저: `http://localhost:3000`

## 4) 기능 체크리스트

- [ ] 관리자 로그인 후 `/admin` 접근 가능(ADMIN_EMAIL만 허용)
- [ ] 카테고리 생성/수정/삭제 가능
- [ ] 글쓰기에서 카테고리 필수 선택, 카테고리 없으면 안내 문구 표시
- [ ] 글 발행 후 홈(`/`) + 관리자 목록(`/admin/posts`)에 즉시 반영
- [ ] 홈/상세는 발행된 글만 공개
- [ ] 상세에서 좋아요 중복 방지(사용자당 1회)
- [ ] 댓글 작성/목록/본인 댓글 삭제 가능
- [ ] Today 방문자 수가 홈에서 증가(중복 새로고침 최소화)

## 5) 발행 테스트 체크리스트(요청 반영)

- [ ] `/admin/posts/new` 발행 요청 payload에 `title`, `slug`, `content` 포함
- [ ] 서버 응답이 `undefined`가 아니라 `{ ok:true, id, redirectTo }` 또는 `{ ok:false, error }`
- [ ] 발행 성공 시 posts row 생성 + 홈/관리자 목록 즉시 갱신

## 6) 주요 변경 파일

- `app/admin/actions.ts`
- `components/editor/post-form.tsx`
- `components/editor/rich-editor.tsx`
- `app/admin/posts/page.tsx`
- `app/posts/[slug]/page.tsx`
- `components/post-interactions.tsx`
- `app/api/track-view/route.ts`
- `lib/posts.ts`, `lib/types.ts`
- `supabase/schema.sql`
