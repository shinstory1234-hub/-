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

type LikesResponse = {
  ok: boolean;
  count?: number;
  likedByMe?: boolean;
  error?: string;
};

type CommentsResponse = {
  ok: boolean;
  comments?: Comment[];
  comment?: Comment;
  commentId?: string;
  error?: string;
};

export function PostInteractions({ postId, initialLikes, initialComments }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [myLiked, setMyLiked] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [commentPassword, setCommentPassword] = useState("");
  const [content, setContent] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetCommentId, setTargetCommentId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  const { show } = useToast();

  const safeJson = async <T,>(res: Response): Promise<T | null> => {
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const load = async () => {
      const [likesRes, commentsRes] = await Promise.all([
        fetch(`/api/likes/${postId}`, { cache: "no-store" }),
        fetch(`/api/comments/${postId}`, { cache: "no-store" })
      ]);

      const likesJson = await safeJson<LikesResponse>(likesRes);
      if (likesJson?.ok) {
        setLikes(likesJson.count ?? 0);
        setMyLiked(Boolean(likesJson.likedByMe));
      }

      const commentsJson = await safeJson<CommentsResponse>(commentsRes);
      if (commentsJson?.ok) {
        setComments(commentsJson.comments ?? []);
      }
    };

    load();
  }, [postId]);

  const toggleLike = async () => {
    const res = await fetch(`/api/likes/${postId}`, { method: myLiked ? "DELETE" : "POST" });
    const json = await safeJson<LikesResponse>(res);

    if (!json?.ok) {
      show(json?.error ?? "좋아요 처리 중 오류가 발생했습니다.", "error");
      return;
    }

    setLikes(json.count ?? 0);
    setMyLiked(Boolean(json.likedByMe));
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
    if (!json?.ok || !json.comment) {
      show(json?.error ?? "댓글 등록에 실패했습니다.", "error");
      return;
    }

    setComments((prev) => [json.comment as Comment, ...prev]);
    setContent("");
    show("댓글이 등록되었습니다.");
  };

  const requestDelete = (id: string) => {
    setTargetCommentId(id);
    setDeletePassword("");
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetCommentId) return;
    if (!deletePassword.trim()) {
      show("삭제 비밀번호를 입력해 주세요.", "error");
      return;
    }

    const res = await fetch(`/api/comments/${postId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: targetCommentId, password: deletePassword.trim() })
    });

    const json = await safeJson<CommentsResponse>(res);
    if (!json?.ok) {
      show(json?.error ?? "댓글 삭제에 실패했습니다.", "error");
      return;
    }

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
        <p className="text-sm font-semibold">댓글 {comments.length}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="이름" />
          <Input value={commentPassword} onChange={(e) => setCommentPassword(e.target.value)} type="password" placeholder="비밀번호" />
          <Button type="button" onClick={submitComment}>댓글 등록</Button>
        </div>
        <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="댓글을 입력하세요" />

        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-border bg-surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{comment.author_name ?? comment.author_email ?? "사용자"}</p>
                <button type="button" className="text-xs text-danger" onClick={() => requestDelete(comment.id)}>
                  삭제
                </button>
              </div>
              <p className="mt-1 text-muted-foreground">{comment.content}</p>
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

      <p className="text-xs text-muted-foreground mt-6">본 게시물은 투자 권유용이 아닌 정보 제공 및 작성자 개인 기록용입니다.</p>
    </div>
  );
}