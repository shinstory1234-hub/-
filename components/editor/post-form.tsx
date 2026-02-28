"use client";

import { useMemo, useState } from "react";
import { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/editor/rich-editor";

type Props = {
  categories: Category[];
  action: (formData: FormData) => void;
};

function slugify(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function PostForm({ categories, action }: Props) {
  const [title, setTitle] = useState("");
  const slug = useMemo(() => slugify(title), [title]);

  return (
    <form action={action} className="space-y-5">
      <div className="sticky top-20 z-30 flex items-center justify-between rounded-lg border border-border bg-surface/95 p-3 shadow-soft backdrop-blur">
        <p className="text-sm font-medium text-muted-foreground">초안 작성 중</p>
        <div className="flex gap-2">
          <Button type="submit" name="intent" value="draft" variant="outline">
            임시저장
          </Button>
          <Button type="submit" name="intent" value="publish">
            발행
          </Button>
        </div>
      </div>

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
