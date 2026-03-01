"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { updateCategoryAction, deleteCategoryAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

export function CategoryItem({ category }: { category: { id: string; name: string; description: string | null } }) {
  const [open, setOpen] = useState(false);

  return (
    <form action={updateCategoryAction} className="space-y-3 rounded-lg border border-border bg-surface p-5">
      <input type="hidden" name="id" value={category.id} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold">카테고리 편집</p>
        <Dropdown trigger={<MoreHorizontal className="h-4 w-4 text-muted-foreground" />}>
          <DropdownItem onClick={() => setOpen(true)}>삭제하기</DropdownItem>
        </Dropdown>
      </div>
      <Input name="name" defaultValue={category.name} required />
      <Textarea name="description" defaultValue={category.description ?? ""} rows={2} />
      <Button type="submit" variant="outline">
        수정 저장
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="카테고리 삭제" description="삭제하면 연결된 글은 미분류가 됩니다.">
        <button
          type="submit"
          formAction={deleteCategoryAction}
          className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white"
        >
          삭제 계속하기
        </button>
      </Modal>
    </form>
  );
}
