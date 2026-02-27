# Next.js 블로그 템플릿 (Tailwind + shadcn/ui + Supabase)

요청사항 기준으로 만든 구조입니다.
- 카드형 반응형 홈
- 글 상세
- 카테고리/태그 목록
- 소개
- 로그인
- 비밀번호 재설정
- 관리자 글쓰기/수정
- Supabase Auth/DB/Storage + RLS/정책 SQL 포함

## 1) 빠른 시작 (초보 체크리스트)

- [ ] Supabase 프로젝트 생성
- [ ] SQL Editor에서 `supabase/schema.sql` 전체 실행
- [ ] Authentication > URL Configuration에 사이트 주소 등록
- [ ] Vercel 환경변수 입력
- [ ] 프로젝트 실행/배포

## 2) 로컬 실행

```bash
npm install
npm run dev
```

브라우저: `http://localhost:3000`

## 3) 페이지 구성

- `/` : 홈(글 목록 카드 UI)
- `/posts/[slug]` : 글 상세
- `/topics/[slug]` : 카테고리/태그 목록
- `/about` : 소개
- `/login` : 로그인
- `/reset-password` : 비밀번호 재설정
- `/admin/posts/new` : 관리자 글쓰기
- `/admin/posts/[id]/edit` : 관리자 글 수정

## 4) Supabase 설정 순서 (아주 중요)

1. Supabase 프로젝트 생성
2. **SQL Editor**에서 `supabase/schema.sql` 실행
   - posts 테이블 생성
   - RLS 정책 생성
   - Storage 버킷(`post-images`) 생성
   - Storage 정책 생성
3. Authentication > Providers 에서 Email 로그인 활성화
4. Authentication > URL Configuration
   - Site URL: `http://localhost:3000` (개발)
   - Redirect URL: `http://localhost:3000/reset-password`

## 5) Vercel 배포용 환경변수 예시

`.env.local` 또는 Vercel Project Settings > Environment Variables에 아래 입력:

```bash
NEXT_PUBLIC_SITE_URL=https://your-blog.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

> `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용하세요. 클라이언트로 노출하면 안 됩니다.

## 6) 초보용 배포 체크리스트

- [ ] `npm run build` 로 빌드 성공
- [ ] Vercel에 Git 연결
- [ ] 환경변수 4개 등록
- [ ] 배포 후 로그인/비밀번호 재설정 테스트
- [ ] 글 작성 시 이미지 업로드 테스트
- [ ] 홈/상세/카테고리 페이지 확인

## 7) SQL 파일 위치

- 전체 SQL: `supabase/schema.sql`

## 8) 구현 메모

현재 예제는 UI/라우팅과 Supabase 연동 뼈대 중심입니다.
실서비스 전 아래 보완 권장:
- 관리자 페이지 서버 액션(글 저장/수정) 연결
- 마크다운 에디터 적용
- 이미지 최적화 및 업로드 에러 처리
- 관리자 권한(Role) 분리
