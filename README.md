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

Vercel(Production/Preview) 환경변수 3개를 동일하게 설정하세요.
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
Production + Preview 둘 다 누락 없이 적용하세요.
배포 후 Vercel Logs에서 track-post/track-view hit 로그를 확인하세요.

## 2) Supabase 설정 순서 (초보용)

1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 전체 실행
3. Authentication > Providers > Email 활성화
4. Storage > Buckets 에서 `images` 버킷 확인
5. 관리자 이메일(`ADMIN_EMAIL`) 계정으로 회원가입/로그인
6. SQL Editor에서 관리자 이메일 설정: `alter role authenticator set app.admin_email = 'shinstory1234@gmail.com';`

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


## 9) 이번 PR 기능 테스트 체크리스트

- [ ] 상단 메뉴에서 `카테고리`가 사라지고 `홈/소개/관리자`만 보인다.
- [ ] 홈 진입 시 상단 문구에 `Today X, Total Y`가 표시된다.
- [ ] 홈 새로고침 3회 시 Today 값이 최소 3 이상 증가한다(무조건 증가).
- [ ] `Total` 값은 항상 `Today` 이상이다.
- [ ] 브라우저에서 `/api/track-view` 직접 열면 `{ ok, today, total }` JSON이 나온다.
- [ ] 글쓰기에서 문장 중간 커서 위치에 이미지 첨부 시 해당 위치에 삽입된다.
- [ ] 이미지 삽입 직후 아래 문단이 생성되어 바로 타이핑 가능하다.
- [ ] 글쓰기에서 Ctrl+V 이미지 붙여넣기 시 자동 업로드 후 커서 위치에 삽입된다.
- [ ] 수정 페이지(`/admin/posts/[id]/edit`)에서도 동일한 이미지 업로드/삽입이 동작한다.
- [ ] 이미지 파일 형식/용량(10MB) 오류 시 토스트 에러 메시지가 표시된다.


## 10) 관리자 로그아웃 + 카테고리 순서 + 조회수 테스트

- [ ] `/admin` 사이드바의 **로그아웃** 버튼 클릭 시 홈(`/`)으로 이동하고, 다시 `/admin` 접속 시 로그인 페이지로 이동한다.
- [ ] `/admin/categories`에서 카테고리 **위로/아래로** 버튼 클릭 시 순서가 즉시 바뀌고 새로고침 후에도 유지된다.
- [ ] 홈의 카테고리 탭 순서가 관리자에서 바꾼 `sort_order`와 동일하게 보인다.
- [ ] 홈 새로고침 3회 시 `Today`와 `Total` 숫자가 실제로 증가한다(0 고정 아님).
- [ ] 글 상세 진입 시 `조회수 N`이 증가하고, 나갔다 다시 들어오면 값이 더 올라간다.


## 11) Supabase SQL 실행 순서 + 테스트 순서 (10줄)

1. Supabase SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다.
2. SQL Editor에서 `NOTIFY pgrst, 'reload schema';` 를 실행해 스키마 캐시를 즉시 갱신합니다.
3. 대체 방법 1: Supabase Dashboard → Project Settings → API에서 PostgREST(또는 API) 재시작을 실행합니다.
4. 대체 방법 2: Dashboard의 Database/Schema cache reload 기능으로 캐시를 갱신합니다.
5. 관리자 이메일 설정 SQL 실행: `alter role authenticator set app.admin_email = 'shinstory1234@gmail.com';`.
6. `/admin/categories`에서 이름 입력 후 생성 버튼을 누릅니다.
7. 생성 실패 시 토스트에 원인 에러 메시지가 표시되는지 확인합니다(조용히 실패 금지).
   - 예: `column categories.sort_order does not exist` 같은 원인이 그대로 보여야 합니다.
8. Supabase Table Editor의 `categories`에서 row가 실제로 생성됐는지 확인합니다.
9. 생성 직후 `/admin/categories` 목록에 새 항목이 새로고침 없이 나타나는지 확인합니다.
10. 권한 없는 계정으로 생성 시 에러 토스트가 표시되는지 확인합니다.

## 12) 카테고리 순서/상세 404 회귀 테스트 순서 (10줄)
1. Supabase SQL Editor에서 `supabase/schema.sql` 전체를 다시 실행합니다.
2. SQL Editor에서 `NOTIFY pgrst, 'reload schema';`를 실행합니다.
3. NOTIFY가 반영되지 않으면 Dashboard API 재시작을 실행합니다.
4. 또는 Dashboard의 schema reload 기능으로 캐시를 갱신합니다.
5. `/admin/categories`에서 위/아래 화살표를 눌러 순서 변경을 실행합니다.
6. 실패 토스트가 발생하면 원인 문자열이 그대로 노출되는지 확인합니다.
7. 성공 후 페이지 새로고침 시 변경된 순서가 유지되는지 확인합니다.
8. 홈에서 글 카드를 클릭해 `/posts/{slug}` 상세로 정상 이동하는지 확인합니다.
9. 상세 페이지 새로고침 후에도 404 없이 같은 글이 유지되는지 확인합니다.
10. slug가 비어 있는 글 카드 클릭 시 에러 토스트가 뜨고 앱이 크래시하지 않는지 확인합니다.
