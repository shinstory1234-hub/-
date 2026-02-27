import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminWritePage() {
  return (
    <section className="mx-auto max-w-3xl rounded-xl border bg-white p-8">
      <h1 className="mb-6 text-2xl font-bold">관리자 - 글쓰기</h1>
      <form className="space-y-4">
        <Input placeholder="제목" />
        <Input placeholder="slug (예: my-first-post)" />
        <Input placeholder="카테고리" />
        <Input placeholder="태그 (콤마 구분: nextjs,supabase)" />
        <Textarea rows={10} placeholder="본문" />
        <Input type="file" accept="image/*" />
        <Button type="submit">발행하기</Button>
      </form>
    </section>
  );
}
