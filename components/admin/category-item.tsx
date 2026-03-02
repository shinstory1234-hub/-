"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import {
  updateCategoryFormAction,
  deleteCategoryFormAction,
  moveCategoryOrderStateAction,
  type ActionState
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

type CategoryItemProps = {
  category: { id: string; name: string; description: string | null; sort_order?: number | null };
  isFirst: boolean;
  isLast: boolean;
};

const initialMoveState: ActionState = { ok: false, error: "" };

export function CategoryItem({ category, isFirst, isLast }: CategoryItemProps) {
  const [open, setOpen] = useState(false);
  const [moveState, moveAction, movePending] = useActionState(moveCategoryOrderStateAction, initialMoveState);
  const directionRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);
  const { show } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!submittedRef.current) return;

    if (moveState?.error) {
      show(moveState.error, "error");
      submittedRef.current = false;
      return;
    }

    if (moveState?.ok) {
      router.refresh();
      submittedRef.current = false;
    }
  }, [moveState, router, show]);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-5">
      <form action={moveAction} className="flex items-start justify-between gap-2">
        <input type="hidden" name="id" value={category.id} />
        <input ref={directionRef} type="hidden" name="direction" defaultValue="up" />
        <p className="text-sm font-semibold">카테고리 편집</p>
        <div className="flex items-center gap-1">
          <button
            type="submit"
            disabled={isFirst || movePending}
            onClick={() => {
              submittedRef.current = true;
              if (directionRef.current) directionRef.current.value = "up";
            }}
            className="rounded-md border border-border p-1.5 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            title="위로"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={isLast || movePending}
            onClick={() => {
              submittedRef.current = true;
              if (directionRef.current) directionRef.current.value = "down";
            }}
            className="rounded-md border border-border p-1.5 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            title="아래로"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <Dropdown trigger={<MoreHorizontal className="h-4 w-4 text-muted-foreground" />}>
            <DropdownItem onClick={() => setOpen(true)}>삭제하기</DropdownItem>
          </Dropdown>
        </div>
      </form>

      <form action={updateCategoryFormAction} className="space-y-3">
        <input type="hidden" name="id" value={category.id} />
        <Input name="name" defaultValue={category.name} required />
        <Textarea name="description" defaultValue={category.description ?? ""} rows={2} />
        <Button type="submit" variant="outline">
          수정 저장
        </Button>

        <Modal open={open} onClose={() => setOpen(false)} title="카테고리 삭제" description="삭제하면 연결된 글은 미분류가 됩니다.">
          <button
            type="submit"
            formAction={deleteCategoryFormAction}
            className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white"
          >
            삭제 계속하기
          </button>
        </Modal>
      </form>
    </div>
  );
}
