import Link from "next/link";
import { AdminSuccessToast } from "@/components/admin-success-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";

export default async function AdminHomePage({ searchParams }: { searchParams: Promise<{ login?: string }> }) {
  await requireAdmin();
  const { login } = await searchParams;

  return (
    <section className="space-y-5">
      <AdminSuccessToast show={login === "success"} />
      <div className="space-y-2">
        <h2>관리자 대시보드</h2>
        <p className="text-sm text-muted-foreground">글, 카테고리, 발행 상태를 한 곳에서 관리하세요.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="text-lg font-semibold">글 목록</CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">작성한 글을 확인하고 수정합니다.</p>
            <Link href="/admin/posts">
              <Button variant="outline">글 목록 열기</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-semibold">카테고리 관리</CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">카테고리를 생성/수정/삭제합니다.</p>
            <Link href="/admin/categories">
              <Button variant="outline">카테고리 열기</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-semibold">글쓰기</CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">리치 텍스트 에디터로 글을 작성합니다.</p>
            <Link href="/admin/posts/new">
              <Button>새 글 작성</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
