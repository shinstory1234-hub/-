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
import { createPostAction, type ActionState } from "@/app/admin/actions";

type Props = { categories: Category[] };
const initialState: ActionState = { ok: false };

function SubmitActions({ intentRef }: { intentRef: RefObject<HTMLInputElement | null> }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex gap-2">
      <Button type="submit" variant="outline" loading={pending} onClick={() => { if (intentRef.current) intentRef.current.value = "draft"; }}>임시저장</Button>
      <Button type="submit" loading={pending} onClick={() => { if (intentRef.current) intentRef.current.value = "publish"; }}>발행</Button>
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

const DRAFT_KEY = "admin_draft_new";

type Attachment = { name: string; url: string };

export function PostForm({ categories }: Props) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [savedDraft, setSavedDraft] = useState<{ title: string; content: string } | null>(null);
  const [state, action] = useActionState(createPostAction, initialState);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();
  const router = useRouter();
  const intentRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setSlug(slugify(title)); }, [title]);

  // 마운트 시 임시저장 확인
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setSavedDraft(JSON.parse(saved));
    } catch {}
  }, []);

  // 자동 임시저장 (1초 디바운스)
  useEffect(() => {
    if (!title && !editorContent) return;
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content: editorContent }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, editorContent]);

  // 탭/창 닫을 때 저장
  useEffect(() => {
    const save = () => {
      if (title || editorContent)
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content: editorContent }));
    };
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
  }, [title, editorContent]);

  useEffect(() => {
    if (state?.ok && state.redirectTo && state.id) {
      localStorage.removeItem(DRAFT_KEY);
      if (attachments.length > 0) {
        fetch("/api/attachments/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: state.id, attachments }),
        }).finally(() => {
          show("글이 저장되었습니다.");
          router.push(state.redirectTo!);
          router.refresh();
        });
      } else {
        show("글이 저장되었습니다.");
        router.push(state.redirectTo);
        router.refresh();
      }
      return;
    }
    if (state?.error) show(state.error, "error");
  }, [state]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    const results: Attachment[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
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

  const removeAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((a) => a.url !== url));
  };

  return (
    <form action={action} className="space-y-5">
      <div className="sticky top-20 z-30 flex items-center justify-between rounded-lg border border-border bg-surface/95 p-3 shadow-soft backdrop-blur">
        <p className="text-sm font-medium text-muted-foreground">초안 작성 중</p>
        {categories.length > 0 ? <SubmitActions intentRef={intentRef} /> : null}
      </div>

      {savedDraft && (
        <div className="flex items-center justify-between rounded-md border border-accent/30 bg-accent-soft p-3 text-sm">
          <span className="text-accent">이전에 작성 중이던 내용이 있습니다.</span>
          <div className="flex gap-2">
            <button type="button" className="text-xs font-semibold text-accent underline" onClick={() => {
              setTitle(savedDraft.title);
              setEditorContent(savedDraft.content);
              setEditorKey((k) => k + 1);
              setSavedDraft(null);
            }}>복원</button>
            <button type="button" className="text-xs text-muted-foreground underline" onClick={() => { localStorage.removeItem(DRAFT_KEY); setSavedDraft(null); }}>삭제</button>
          </div>
        </div>
      )}

      {state?.error ? <p className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger">{state.error}</p> : null}

      <Input name="title" placeholder="제목을 입력하세요" autoFocus value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => setSlug(slugify(title))}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); document.querySelector<HTMLElement>(".ProseMirror")?.focus(); } }}
      />
      <input ref={intentRef} type="hidden" name="intent" defaultValue="draft" />
      <input type="hidden" name="slug" value={slug} readOnly />
      <p className="text-xs text-muted-foreground">slug: {slug || "제목을 입력하면 자동 생성"}</p>
      <Textarea name="excerpt" rows={2} placeholder="요약" />

      {categories.length === 0 ? (
        <p className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger">카테고리를 먼저 생성한 뒤 글을 작성해 주세요.</p>
      ) : null}

      <select name="category_id" required className="h-11 w-full rounded-md border border-border bg-surface px-4 text-sm">
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
                <button type="button" onClick={() => removeAttachment(a.url)} className="ml-2 text-danger text-xs hover:underline">삭제</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <RichEditor key={editorKey} name="content" initialValue={editorContent} onChange={setEditorContent} onImageInserted={() => show("이미지를 커서 위치에 삽입했습니다.")} />
    </form>
  );
}
