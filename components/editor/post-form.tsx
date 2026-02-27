"use client";

import { useRef } from "react";
import { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/editor/rich-editor";

type Props = {
  categories: Category[];
  action: (formData: FormData) => void;
};

export function PostForm({ categories, action }: Props) {
  const slugRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="space-y-4">
      <Input
        name="title"
        placeholder="제목을 입력하세요"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            slugRef.current?.focus();
          }
        }}
      />
      <Input ref={slugRef} name="slug" placeholder="slug (예: money-npc-first-post)" required />
      <Textarea name="excerpt" rows={2} placeholder="요약" />
      <select name="category_id" className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm">
        <option value="">카테고리 선택</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <RichEditor name="content" />
      <label className="flex items-center gap-2 text-sm text-zinc-600">
        <input type="checkbox" name="is_published" value="true" />
        즉시 발행
      </label>
      <Button type="submit">저장</Button>
    </form>
  );
}
