import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <section className="mx-auto max-w-3xl rounded-xl border bg-white p-8">
      <h1 className="mb-6 text-2xl font-bold">관리자 - 글 수정 #{id}</h1>
      <form className="space-y-4">
        <Input defaultValue="기존 제목" />
        <Textarea rows={10} defaultValue="기존 본문" />
        <Button type="submit">수정 저장</Button>
      </form>
    </section>
  );
}
