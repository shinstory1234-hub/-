"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCategoryStateAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

const initialState: ActionState = { ok: false };

export function CategoryCreateForm({ initialLoadError }: { initialLoadError?: string | null }) {
  const [state, action, pending] = useActionState(createCategoryStateAction, initialState);
  const { show } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!initialLoadError) return;
    show(initialLoadError, "error");
  }, [initialLoadError, show]);

  useEffect(() => {
    if (!state.error) return;
    show(state.error, "error");
  }, [state.error, show]);

  useEffect(() => {
    if (!state.ok) return;
    show("카테고리가 생성되었습니다.");
    formRef.current?.reset();
    router.refresh();
  }, [state.ok, router, show]);

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-soft">
      <h2 className="font-semibold">새 카테고리</h2>
      <Input name="name" placeholder="예: 재테크" required />
      <Textarea name="description" placeholder="설명" rows={3} />
      <Button type="submit" disabled={pending}>
        {pending ? "생성 중..." : "생성"}
      </Button>
    </form>
  );
}
