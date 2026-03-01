"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase-browser";
import { Comment } from "@/lib/types";

type Props = {
  postId: string;
  initialLikes: number;
  initialComments: Comment[];
};

export function PostInteractions({ postId, initialLikes, initialComments }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [me, setMe] = useState<string | null>(null);
  const [myLikedId, setMyLikedId] = useState<string | null>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const user = (await supabase.auth.getUser()).data.user;
      setMe(user?.id ?? null);
      if (user?.id) {
        const { data } = await supabase.from("likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
        setMyLikedId(data?.id ?? null);
      }
    };
    load();
  }, [postId]);

  const toggleLike = async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert("로그인 후 좋아요를 눌러주세요.");

    if (myLikedId) {
      const { error } = await supabase.from("likes").delete().eq("id", myLikedId);
      if (!error) {
        setMyLikedId(null);
        setLikes((v) => Math.max(0, v - 1));
      }
      return;
    }

    const { data, error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id }).select("id").single();
    if (!error && data) {
      setMyLikedId(data.id);
      setLikes((v) => v + 1);
    }
  };

  const submitComment = async () => {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert("로그인 후 댓글을 작성해주세요.");
    if (!content.trim()) return;

    const payload = { post_id: postId, user_id: user.id, author_email: user.email ?? null, content: content.trim() };
    const { data, error } = await supabase
      .from("comments")
      .insert(payload)
      .select("id,post_id,user_id,author_email,content,created_at")
      .single();
    if (!error && data) {
      setComments((prev) => [data as Comment, ...prev]);
      setContent("");
    }
  };

  const deleteComment = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-10 space-y-4 border-t border-border pt-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant={myLikedId ? "default" : "outline"} onClick={toggleLike}>
          좋아요 {likes}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">댓글 {comments.length}</p>
        <div className="flex gap-2">
          <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="댓글을 입력하세요" />
          <Button type="button" onClick={submitComment}>등록</Button>
        </div>
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
