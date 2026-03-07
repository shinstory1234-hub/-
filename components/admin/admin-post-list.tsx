"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

type Post = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  categories?: { name: string; slug: string } | null;
};

export function AdminPostList({ posts }: { posts: Post[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { show } = useToast();

  const toggleAll = () => {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p) => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size}개의 글을 삭제할까요?`)) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/posts/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const json = await res.json();
      if (json.ok) {
        show(`${selected.size}개의 글을 삭제했습니다.`);
        setSelected(new Set());
        router.refresh();
      } else {
        show(json.error ?? "삭제 실패", "error");
      }
    } catch {
      show("삭제 중 오류가 발생했습니다.", "error");
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected.size === posts.length && posts.length > 0}
          onChange={toggleAll}
          className="h-4 w-4 cursor-pointer"
        />
        <span className="text-sm text-muted-foreground">전체 선택</span>
        {selected.size > 0 && (
          <Button variant="danger" loading={deleting} onClick={deleteSelected}>
            선택 삭제 ({selected.size})
          </Button>
        )}
      </div>

      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(post.id)}
                onChange={() => toggleOne(post.id)}
                className="mt-1 h-4 w-4 cursor-pointer"
              />
              <div className="space-y-1">
                <p className="text-base font-semibold">{post.title}</p>
                <p className="text-xs text-muted-foreground">/{post.slug}</p>
                <div className="flex gap-2">
                  <Badge>{post.is_published ? "발행" : "임시저장"}</Badge>
                  <Badge>{post.categories?.name ?? "미분류"}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{(post.published_at ?? post.created_at)?.slice(0, 10)}</span>
              <Link href={`/admin/posts/${post.id}/edit`}>
                <Button variant="outline" type="button">수정</Button>
              </Link>
              <PostRowActions id={post.id} isPublished={post.is_published} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
