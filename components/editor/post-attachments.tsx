// "use client";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
type Attachment = { id: string; file_name: string; file_path: string; file_size: number | null; mime_type: string | null; };
type Props = { postId: string; initialAttachments?: Attachment[]; };
function formatBytes(bytes: number | null) { if (!bytes) return ""; if (bytes < 1024) return `${bytes}B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`; return `${(bytes / (1024 * 1024)).toFixed(1)}MB`; }
export function PostAttachments({ postId, initialAttachments = [] }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [isPending, setIsPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setIsPending(true);
    const formData = new FormData(); formData.append("post_id", postId); formData.append("file", file);
    try { const res = await fetch("/api/attachments", { method: "POST", body: formData }); const result = await res.json(); if (result.ok) { show("파일이 업로드되었습니다."); setAttachments((prev) => [...prev, result.attachment]); } else { show(result.error ?? "업로드 실패", "error"); } } catch { show("업로드 실패", "error"); } finally { setIsPending(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  async function handleDelete(attachment: Attachment) {
    setIsPending(true);
    try { const res = await fetch(`/api/attachments?id=${attachment.id}&file_path=${encodeURIComponent(attachment.file_path)}`, { method: "DELETE" }); const result = await res.json(); if (result.ok) { setAttachments((prev) => prev.filter((a) => a.id !== attachment.id)); show("파일이 삭제되었습니다."); } else { show(result.error ?? "삭제 실패", "error"); } } catch { show("삭제 실패", "error"); } finally { setIsPending(false); }
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-md border border-border bg-surface px-4 py-2 text-sm hover:bg-muted">
          {isPending ? "처리 중..." : "파일 첨부"}
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} disabled={isPending} />
        </label>
        <span className="text-xs text-muted-foreground">모든 파일 형식 가능</span>
      </div>
      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-2 text-sm">
              <a href={`${supabaseUrl}/storage/v1/object/public/attachments/${a.file_path}`} target="_blank" rel="noopener noreferrer" className="truncate text-blue-500 underline hover:text-blue-700">{a.file_name}</a>
              <div className="flex items-center gap-3 pl-4">
                <span className="text-xs text-muted-foreground">{formatBytes(a.file_size)}</span>
                <button type="button" onClick={() => handleDelete(a)} className="text-xs text-red-500 hover:text-red-700" disabled={isPending}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
