"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/editor/rich-editor";
import { useToast } from "@/components/ui/toast";
import { createPostAction, type CreatePostState } from "@/app/admin/actions";

type Props = {
  categories: Category[];
};

const initialState: CreatePostState = { ok: false };

function SubmitActions() {
  const { pending } = useFormStatus();

  return (
    <div className="flex gap-2">
      <Button type="submit" name="intent" value="draft" variant="outline" loading={pending}>
        임시저장
      </Button>
      <Button type="submit" name="intent" value="publish" loading={pending}>
        발행
      </Button>
    </div>
  );
}

function slugify(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function PostForm({ categories }: Props) {
  const [title, setTitle] = useState("");
  const slug = useMemo(() => slugify(title), [title]);
  const [state, action] = useActionState(createPostAction, initialState);
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      show("글이 저장되었습니다.");
      router.push(state.redirectTo);
      router.refresh();
      return;
    }

    if (state?.error) {
      show(state.error, "error");
    }
  }, [router, show, state]);

  return (
    <form action={action} className="space-y-5">
      <div className="sticky top-20 z-30 flex items-center justify-between rounded-lg border border-border bg-surface/95 p-3 shadow-soft backdrop-blur">
        <p className="text-sm font-medium text-muted-foreground">초안 작성 중</p>
        <SubmitActions />
      </div>

      {state?.error ? <p className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger">{state.error}</p> : null}

      <Input
        name="title"
        placeholder="제목을 입력하세요"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            document.querySelector<HTMLElement>(".ProseMirror")?.focus();
          }
        }}
      />
      <input type="hidden" name="slug" value={slug} />
      <p className="text-xs text-muted-foreground">slug: {slug || "제목을 입력하면 자동 생성"}</p>
      <Textarea name="excerpt" rows={2} placeholder="요약" />
      <select name="category_id" className="h-11 w-full rounded-md border border-border bg-surface px-4 text-sm">
        <option value="">카테고리 선택</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <RichEditor name="content" />
    </form>
  );
}
