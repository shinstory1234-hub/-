"use client";

import { useActionState, useEffect, useState } from "react";
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
    category_id: string | null;
    is_published: boolean;
  };
  categories: Category[];
};

const initialState: ActionState = { ok: false };

function SubmitActions({ defaultPublished }: { defaultPublished: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex gap-2">
      <Button type="submit" name="intent" value="draft" variant="outline" loading={pending}>
        임시저장
      </Button>
      <Button type="submit" name="intent" value="publish" loading={pending || defaultPublished}>
        발행 저장
      </Button>
    </div>
  );
}

function slugify(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function EditPostForm({ post, categories }: Props) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [state, action] = useActionState(updatePostAction, initialState);
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      show("글이 수정되었습니다.");
      router.push(state.redirectTo);
      router.refresh();
      return;
    }
    if (state?.error) show(state.error, "error");
  }, [router, show, state]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={post.id} />
      <div className="sticky top-20 z-30 flex items-center justify-between rounded-lg border border-border bg-surface/95 p-3 shadow-soft backdrop-blur">
        <p className="text-sm font-medium text-muted-foreground">글 수정 중</p>
        <SubmitActions defaultPublished={post.is_published} />
      </div>

      <Input
        name="title"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => {
          const v = e.target.value;
          setTitle(v);
          setSlug(slugify(v));
        }}
      />
      <input type="hidden" name="slug" value={slug} readOnly />
      <p className="text-xs text-muted-foreground">slug: {slug}</p>
      <Textarea name="excerpt" rows={2} placeholder="요약" defaultValue={post.excerpt ?? ""} />
      <select
        name="category_id"
        required
        defaultValue={post.category_id ?? ""}
        className="h-11 w-full rounded-md border border-border bg-surface px-4 text-sm"
      >
        <option value="">카테고리 선택(필수)</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <RichEditor
        name="content"
        initialValue={post.content}
        onImageInserted={() => show("이미지를 커서 위치에 삽입했습니다.")}
      />
    </form>
  );
}
