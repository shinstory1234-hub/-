import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">관리자</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="text-lg font-semibold">카테고리 관리</CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-500">카테고리를 생성/수정/삭제합니다.</p>
            <Link href="/admin/categories">
              <Button>카테고리 열기</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-semibold">글쓰기</CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-500">리치 텍스트 에디터로 글을 작성합니다.</p>
            <Link href="/admin/posts/new">
              <Button>새 글 작성</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
