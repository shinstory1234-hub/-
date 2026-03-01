import { Post } from "@/lib/types";

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "첫 글: Next.js + Supabase로 블로그 만들기",
    slug: "first-post",
    excerpt: "초보자도 따라할 수 있는 블로그 구축 체크리스트입니다.",
    content: "상세 본문 예시입니다. 여기에 마크다운 렌더러를 붙이면 더 좋습니다.",
    cover_url: null,
    category_id: null,
    category: { id: "c1", name: "개발", slug: "dev", description: null },
    tags: ["nextjs", "supabase"],
    is_published: true,
    published_at: "2026-01-10",
    created_at: "2026-01-10",
    updated_at: "2026-01-10"
  },
  {
    id: "2",
    title: "티스토리 느낌 카드형 UI 설계",
    slug: "card-ui-guide",
    excerpt: "카드 간격, 타이포, 썸네일 비율 중심으로 정리했습니다.",
    content: "카드 UI 설계 팁 본문.",
    cover_url: null,
    category_id: null,
    category: { id: "c2", name: "디자인", slug: "design", description: null },
    tags: ["ui", "tailwind"],
    is_published: true,
    published_at: "2026-01-17",
    created_at: "2026-01-17",
    updated_at: "2026-01-17"
  }
];
