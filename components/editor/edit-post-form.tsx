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
    is_published: boolean;
  };
  categories: Category[];
  initialCategoryIds: string[];
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

export function EditPostForm({ post, categories, initialCategoryIds, initialAttachments }: Props) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);
  const [editorContent, setEditorContent] = useState(post.content);
  const [editorKey, setEditorKey] = useState(0);
  const [savedDraft, setSavedDraft] = useState<{ title: string; content: string } | null>(null);
  const [state, action] = useActionState(updatePostAction, initialState);
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();
  const router = useRouter();
  const intentRef = useRef<HTMLInputElement>(null);
  const draftKey = `admin_draft_edit_${post.id}`;

  // 마운트 시 임시저장 확인
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) setSavedDraft(JSON.parse(saved));
    } catch {}
  }, [draftKey]);

  // 자동 임시저장 (1초 디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ title, content: editorContent }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, editorContent, draftKey]);

  // 탭/창 닫을 때 저장
  useEffect(() => {
    const save = () => localStorage.setItem(draftKey, JSON.stringify({ title, content: editorContent }));
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
  }, [title, editorContent, draftKey]);

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      localStorage.removeItem(draftKey);
      show("글이 수정되었습니다.");
      router.push(state.redirectTo);
      router.refresh();
      return;
    }
    if (state?.error) show(state.error, "error");
  }, [router, show, state, draftKey]);

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

      {savedDraft && (
        <div className="flex items-center justify-between rounded-md border border-accent/30 bg-accent-soft p-3 text-sm">
          <span className="text-accent">이전에 저장된 임시 내용이 있습니다.</span>
          <div className="flex gap-2">
            <button type="button" className="text-xs font-semibold text-accent underline" onClick={() => {
              setTitle(savedDraft.title);
              setEditorContent(savedDraft.content);
              setEditorKey((k) => k + 1);
              setSavedDraft(null);
            }}>복원</button>
            <button type="button" className="text-xs text-muted-foreground underline" onClick={() => { localStorage.removeItem(draftKey); setSavedDraft(null); }}>삭제</button>
          </div>
        </div>
      )}

      <Input name="title" placeholder="제목을 입력하세요" value={title}
        onChange={(e) => { const v = e.target.value; setTitle(v); setSlug(slugify(v)); }}
      />
      <input ref={intentRef} type="hidden" name="intent" defaultValue="save" />
      <input type="hidden" name="slug" value={slug} readOnly />
      <p className="text-xs text-muted-foreground">slug: {slug}</p>
      <Textarea name="excerpt" rows={2} placeholder="요약" defaultValue={post.excerpt ?? ""} />

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">카테고리 선택 (최소 1개, 중복 선택 가능)</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const selected = selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSelectedCategoryIds((prev) =>
                    selected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                  )
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                  selected
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground bg-surface-muted border border-border hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
        {selectedCategoryIds.map((id) => (
          <input key={id} type="hidden" name="category_ids" value={id} />
        ))}
      </div>

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

      <RichEditor key={editorKey} name="content" initialValue={editorContent} onChange={setEditorContent} onImageInserted={() => show("이미지를 커서 위치에 삽입했습니다.")} />
    </form>
  );
}
