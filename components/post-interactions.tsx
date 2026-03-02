"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase-browser";
import { Comment } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

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
  const [me, setMe] = useState<string | null>(null);
  const [myLiked, setMyLiked] = useState(false);
  const [content, setContent] = useState("");
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const user = (await supabase.auth.getUser()).data.user;
      setMe(user?.id ?? null);

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

  const askLogin = (message: string) => {
    show(message, "error");
    router.push("/login");
  };

  const safeJson = async <T,>(res: Response): Promise<T | null> => {
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  const toggleLike = async () => {
    const res = await fetch(`/api/likes/${postId}`, { method: myLiked ? "DELETE" : "POST" });
    const json = await safeJson<LikesResponse>(res);

    if (!res.ok && res.status === 401) return askLogin("로그인 후 좋아요를 눌러주세요.");

    if (!json?.ok) {
      show(json?.error ?? "좋아요 처리 중 오류가 발생했습니다.", "error");
      return;
    }

    setLikes(json.count ?? 0);
    setMyLiked(Boolean(json.likedByMe));
  };

  const submitComment = async () => {
    if (!content.trim()) return;

    const res = await fetch(`/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() })
    });

    const json = await safeJson<CommentsResponse>(res);
    if (!res.ok && res.status === 401) return askLogin("로그인 후 댓글을 작성해주세요.");

    if (!json?.ok || !json.comment) {
      show(json?.error ?? "댓글 등록에 실패했습니다.", "error");
      return;
    }

    setComments((prev) => [json.comment as Comment, ...prev]);
    setContent("");
    show("댓글이 등록되었습니다.");
  };

  const deleteComment = async (id: string) => {
    const res = await fetch(`/api/comments/${postId}?commentId=${id}`, { method: "DELETE" });
    const json = await safeJson<CommentsResponse>(res);
    if (!res.ok && res.status === 401) return askLogin("로그인 후 댓글을 삭제할 수 있습니다.");

    if (!json?.ok) {
      show(json?.error ?? "댓글 삭제에 실패했습니다.", "error");
      return;
    }

    setComments((prev) => prev.filter((c) => c.id !== id));
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
        {me ? (
          <div className="flex gap-2">
            <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="댓글을 입력하세요" />
            <Button type="button" onClick={submitComment}>등록</Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            로그인 후 댓글을 작성할 수 있습니다. <Link href="/login" className="text-accent underline">로그인하기</Link>
          </p>
        )}
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-border bg-surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{comment.author_email ?? "사용자"}</p>
                {me && comment.user_id === me ? (
                  <button type="button" className="text-xs text-danger" onClick={() => deleteComment(comment.id)}>
                    삭제
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-muted-foreground">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
