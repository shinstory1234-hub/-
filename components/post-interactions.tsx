"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { Comment } from "@/lib/types";

type Props = {
  postId: string;
  initialLikes: number;
  initialComments: Comment[];
};

type LikesResponse = { ok: boolean; count?: number; likedByMe?: boolean; error?: string };
type CommentsResponse = { ok: boolean; comments?: Comment[]; comment?: Comment; commentId?: string; error?: string };
type CommentLikeResponse = { ok: boolean; liked?: boolean; likes_count?: number };
type SortType = "latest" | "oldest" | "likes";

function formatKST(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export function PostInteractions({ postId, initialLikes, initialComments }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [myLiked, setMyLiked] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [sort, setSort] = useState<SortType>("latest");
  const [authorName, setAuthorName] = useState("");
  const [commentPassword, setCommentPassword] = useState("");
  const [content, setContent] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetCommentId, setTargetCommentId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const { show } = useToast();

  const safeJson = async <T,>(res: Response): Promise<T | null> => {
    try { return (await res.json()) as T; } catch { return null; }
  };

  useEffect(() => {
    // localStorage 먼저 읽기
    const saved = localStorage.getItem(`liked_${postId}`);
    if (saved === "true") setMyLiked(true);

    const load = async () => {
      const [likesRes, commentsRes] = await Promise.all([
        fetch(`/api/likes/${postId}`, { cache: "no-store" }),
        fetch(`/api/comments/${postId}`, { cache: "no-store" })
      ]);
      const likesJson = await safeJson<LikesResponse>(likesRes);
      if (likesJson?.ok) {
        setLikes(likesJson.count ?? 0);
        // localStorage가 true면 서버 응답으로 덮어쓰지 않음
        if (saved !== "true") {
          setMyLiked(Boolean(likesJson.likedByMe));
        }
      }
      const commentsJson = await safeJson<CommentsResponse>(commentsRes);
      if (commentsJson?.ok) {
        setComments(commentsJson.comments ?? []);
        const initial: Record<string, { count: number; liked: boolean }> = {};
        (commentsJson.comments ?? []).forEach((c) => {
          const localLiked = localStorage.getItem(`comment_liked_${c.id}`) === "true";
          initial[c.id] = { count: c.likes_count ?? 0, liked: localLiked };
        });
        setCommentLikes(initial);
      }
    };
    load();
  }, [postId]);

  const sortedComments = [...comments].sort((a, b) => {
    if (sort === "latest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === "likes") return (commentLikes[b.id]?.count ?? 0) - (commentLikes[a.id]?.count ?? 0);
    return 0;
  });

  const toggleLike = async () => {
    const newLiked = !myLiked;
    setMyLiked(newLiked);
    localStorage.setItem(`liked_${postId}`, String(newLiked));
    setLikes((prev) => prev + (newLiked ? 1 : -1));
    const res = await fetch(`/api/likes/${postId}`, { method: newLiked ? "POST" : "DELETE" });
    const json = await safeJson<LikesResponse>(res);
    if (!json?.ok) {
      setMyLiked(!newLiked);
      localStorage.setItem(`liked_${postId}`, String(!newLiked));
      setLikes((prev) => prev + (newLiked ? -1 : 1));
      show(json?.error ?? "좋아요 처리 중 오류가 발생했습니다.", "error");
      return;
    }
    setLikes(json.count ?? 0);
  };

  const toggleCommentLike = async (commentId: string) => {
    const current = commentLikes[commentId] ?? { count: 0, liked: false };
    const newLiked = !current.liked;
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: { count: current.count + (newLiked ? 1 : -1), liked: newLiked }
    }));
    localStorage.setItem(`comment_liked_${commentId}`, String(newLiked));
    const res = await fetch(`/api/comment-likes/${commentId}`, { method: "POST" });
    const json = await safeJson<CommentLikeResponse>(res);
    if (json?.ok) {
      setCommentLikes((prev) => ({ ...prev, [commentId]: { count: json.likes_count ?? 0, liked: json.liked ?? false } }));
      localStorage.setItem(`comment_liked_${commentId}`, String(json.liked ?? newLiked));
    } else {
      setCommentLikes((prev) => ({ ...prev, [commentId]: current }));
      localStorage.setItem(`comment_liked_${commentId}`, String(current.liked));
    }
  };

  const submitComment = async () => {
    if (!authorName.trim() || !commentPassword.trim() || !content.trim()) {
      show("이름/비밀번호/댓글 내용을 모두 입력해 주세요.", "error");
      return;
    }
    const res = await fetch(`/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName: authorName.trim(), password: commentPassword.trim(), content: content.trim() })
    });
    const json = await safeJson<CommentsResponse>(res);
    if (!json?.ok || !json.comment) { show(json?.error ?? "댓글 등록에 실패했습니다.", "error"); return; }
    setComments((prev) => [json.comment as Comment, ...prev]);
    setCommentLikes((prev) => ({ ...prev, [json.comment!.id]: { count: 0, liked: false } }));
    setContent("");
    show("댓글이 등록되었습니다.");
  };

  const requestDelete = (id: string) => { setTargetCommentId(id); setDeletePassword(""); setDeleteOpen(true); };

  const requestEdit = (comment: Comment) => {
    setEditTargetId(comment.id);
    setEditContent(comment.content);
    setEditPassword("");
    setEditOpen(true);
  };

  const confirmEdit = async () => {
    if (!editTargetId) return;
    if (!editPassword.trim()) { show("비밀번호를 입력해 주세요.", "error"); return; }
    if (!editContent.trim()) { show("댓글 내용을 입력해 주세요.", "error"); return; }
    const res = await fetch(`/api/comments/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: editTargetId, password: editPassword.trim(), content: editContent.trim() })
    });
    const json = await safeJson<CommentsResponse>(res);
    if (!json?.ok || !json.comment) { show(json?.error ?? "댓글 수정에 실패했습니다.", "error"); return; }
    setComments((prev) => prev.map((c) => c.id === editTargetId ? (json.comment as Comment) : c));
    setEditOpen(false);
    setEditTargetId(null);
    show("댓글을 수정했습니다.");
  };

  const confirmDelete = async () => {
    if (!targetCommentId) return;
    if (!deletePassword.trim()) { show("삭제 비밀번호를 입력해 주세요.", "error"); return; }
    const res = await fetch(`/api/comments/${postId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: targetCommentId, password: deletePassword.trim() })
    });
    const json = await safeJson<CommentsResponse>(res);
    if (!json?.ok) { show(json?.error ?? "댓글 삭제에 실패했습니다.", "error"); return; }
    setComments((prev) => prev.filter((c) => c.id !== targetCommentId));
    setDeleteOpen(false);
    setTargetCommentId(null);
    show("댓글을 삭제했습니다.");
  };

  return (
    <div className="mt-10 space-y-4 border-t border-border pt-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant={myLiked ? "default" : "outline"} onClick={toggleLike}>
          좋아요 {likes}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">댓글 {comments.length}</p>
          <div className="flex gap-1">
            {(["latest", "oldest", "likes"] as SortType[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${sort === s ? "bg-foreground text-background" : "bg-surface-muted text-muted-foreground hover:text-foreground"}`}
              >
                {s === "latest" ? "최신순" : s === "oldest" ? "오래된순" : "좋아요순"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="이름" />
          <Input value={commentPassword} onChange={(e) => setCommentPassword(e.target.value)} type="password" placeholder="비밀번호" />
        </div>
        <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="댓글을 입력하세요" />
        <Button type="button" onClick={submitComment} className="w-full sm:w-auto">댓글 등록</Button>

        <div className="space-y-2">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-border bg-surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{comment.author_name ?? comment.author_email ?? "사용자"}</p>
                  <p className="text-xs text-muted-foreground">{formatKST(comment.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => requestEdit(comment)}>수정</button>
                  <button type="button" className="text-xs text-danger" onClick={() => requestDelete(comment.id)}>삭제</button>
                </div>
              </div>
              <p className="mt-1 text-muted-foreground">{comment.content}</p>
              <button
                type="button"
                onClick={() => toggleCommentLike(comment.id)}
                className={`mt-2 text-base cursor-pointer ${commentLikes[comment.id]?.liked ? "text-red-500 font-semibold" : "text-muted-foreground hover:text-red-400"}`}
              >
                ♥ {commentLikes[comment.id]?.count ?? 0}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="댓글 삭제" description="댓글 작성 시 입력한 비밀번호를 입력하세요.">
        <div className="space-y-3">
          <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="비밀번호" />
          <Button type="button" variant="danger" onClick={confirmDelete}>삭제 확인</Button>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="댓글 수정" description="수정할 내용과 작성 시 입력한 비밀번호를 입력하세요.">
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="수정할 댓글 내용"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={4}
          />
          <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="비밀번호" />
          <Button type="button" onClick={confirmEdit}>수정 확인</Button>
        </div>
      </Modal>

      <p className="text-xs text-muted-foreground mt-6">본 게시물은 투자 권유용이 아닌 정보 제공 및 작성자 개인 기록용입니다.</p>
    </div>
  );
}
