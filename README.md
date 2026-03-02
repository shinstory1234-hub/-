# 머니NPC 블로그 (Next.js + Supabase)

Next.js + Supabase 기반 블로그입니다. 공개 홈/상세, 관리자 글/카테고리 관리, 좋아요/댓글, Today 방문자 수를 포함합니다.

## 1) .env.local 필수 값

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
ADMIN_EMAIL=shinstory1234@gmail.com
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
KAKAO_JS_KEY=YOUR_KAKAO_JS_KEY
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


## 7) 공유/삭제/좋아요/댓글/카테고리 라벨 테스트 순서

- [ ] 홈에서 발행 글 카드의 카테고리 배지가 실제 카테고리명(예: 투자)으로 표시된다.
- [ ] 글 상세 상단 카테고리 배지도 동일하게 실제 카테고리명으로 표시된다.
- [ ] 글 상세에서 **링크 공유** 버튼 클릭 시 현재 URL이 클립보드에 복사되고 토스트가 뜬다.
- [ ] 관리자 `/admin/posts`에서 삭제 버튼 클릭 시 확인 모달이 열린다.
- [ ] 모달에서 “정말 삭제”를 누르면 삭제가 성공한다.
- [ ] 삭제 후 `/admin/posts` 목록에서 해당 글이 즉시 사라진다.
- [ ] 삭제 후 홈(`/`) 목록에서도 해당 글이 사라진다.
- [ ] 로그인 상태에서 좋아요 버튼 클릭 시 카운트가 증가하고 다시 클릭 시 감소한다.
- [ ] 새로고침 후에도 좋아요 카운트/내 좋아요 상태가 유지된다.
- [ ] 로그인 상태에서 댓글 작성/본인 댓글 삭제가 가능하고 새로고침 후 목록이 유지된다.


## 8) 비로그인 댓글/카테고리 페이지 동작

- 댓글은 로그인 없이 `이름 + 비밀번호 + 내용`으로 작성합니다.
- 비밀번호는 서버에서 bcrypt(crypt + gen_salt('bf')) 해시로 저장됩니다.
- 댓글 삭제 시 작성 비밀번호를 다시 입력해야 하며, 일치할 때만 삭제됩니다.
- `/topics/all` 페이지는 카테고리 목록만 보여줍니다.
- 카테고리를 클릭해 `/topics/[slug]`로 이동했을 때만 해당 카테고리 글 목록을 보여줍니다.
