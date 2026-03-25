"use client";
import { useActionState, useEffect, useRef, useState, type RefObject } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/editor/rich-editor";
import { useToast } from "@/components/ui/toast";
import { updatePostAction, type ActionState } from "@/app/admin/actions";

type Props = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_url: string | null;
    category_id: string | null;
    is_published: boolean;
  };
  categories: Category[];
  initialAttachments: { id: string; name: string; url: string }[];
};

const initialState: ActionState = { ok: false };

function SubmitActions({ intentRef }: { intentRef: RefObject<HTMLInputElement | null> }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex gap-2">
      <Button type="submit" variant="outline" loading={pending} onClick={() => { if (intentRef.current) intentRef.current.value = "save"; }}>저장</Button>
      <Button type="submit" loading={pending} onClick={() => { if (intentRef.current) intentRef.current.value = "publish"; }}>발행 저장</Button>
    </div>
  );
}

function slugify(v: string) {
  return v.trim().toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type Attachment = { id?: string; name: string; url: string };

export function EditPostForm({ post, categories, initialAttachments }: Props) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [state, action] = useActionState(updatePostAction, initialState);
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();
  const router = useRouter();
  const intentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      show("글이 수정되었습니다.");
      router.push(state.redirectTo);
      router.refresh();
      return;
    }
    if (state?.error) show(state.error, "error");
  }, [router, show, state]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    const results: Attachment[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("postId", post.id);
      try {
        const res = await fetch("/api/attachments", { method: "POST", body: formData });
        const json = await res.json();
        if (json.ok) {
          results.push({ name: json.name, url: json.url });
        } else {
          show(`${file.name} 업로드 실패: ${json.error}`, "error");
        }
      } catch {
        show(`${file.name} 업로드 중 오류 발생`, "error");
      }
    }
    setAttachments((prev) => [...prev, ...results]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (results.length > 0) show(`${results.length}개 파일이 업로드되었습니다.`);
  };

  const removeAttachment = async (a: Attachment) => {
    if (a.id) {
      await fetch(`/api/attachments?id=${a.id}`, { method: "DELETE" });
    }
    setAttachments((prev) => prev.filter((x) => x.url !== a.url));
  };

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={post.id} />
      <div className="sticky top-20 z-30 flex items-center justify-between rounded-lg border border-border bg-surface/95 p-3 shadow-soft backdrop-blur">
        <p className="text-sm font-medium text-muted-foreground">글 수정 중</p>
        <SubmitActions intentRef={intentRef} />
      </div>

      <Input name="title" placeholder="제목을 입력하세요" value={title}
        onChange={(e) => { const v = e.target.value; setTitle(v); setSlug(slugify(v)); }}
      />
      <input ref={intentRef} type="hidden" name="intent" defaultValue="save" />
      <input type="hidden" name="slug" value={slug} readOnly />
      <p className="text-xs text-muted-foreground">slug: {slug}</p>
      <Textarea name="excerpt" rows={2} placeholder="요약" defaultValue={post.excerpt ?? ""} />

      <select name="category_id" required defaultValue={post.category_id ?? ""} className="h-11 w-full rounded-md border border-border bg-surface px-4 text-sm">
        <option value="">카테고리 선택(필수)</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" loading={uploading} onClick={() => fileInputRef.current?.click()}>
            📎 첨부파일 추가
          </Button>
          <span className="text-xs text-muted-foreground">엑셀, PPT, PDF, 이미지 등 모두 가능</span>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" multiple
          accept=".pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg,.gif,.webp"
          onChange={handleFileChange}
        />
        {attachments.length > 0 && (
          <div className="space-y-1">
            {attachments.map((a) => (
              <div key={a.url} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs">
                  📄 {a.name}
                </a>
                <button type="button" onClick={() => removeAttachment(a)} className="ml-2 text-danger text-xs hover:underline">삭제</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <RichEditor name="content" initialValue={post.content} onImageInserted={() => show("이미지를 커서 위치에 삽입했습니다.")} />
    </form>
  );
}
