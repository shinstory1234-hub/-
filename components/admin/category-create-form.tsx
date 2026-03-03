"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCategoryStateAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

const initialState: ActionState = { ok: true, error: "" };

export function CategoryCreateForm({ initialLoadError }: { initialLoadError?: string | null }) {
  const [state, action, pending] = useActionState(createCategoryStateAction, initialState);
  const { show } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!initialLoadError) return;
    show(initialLoadError, "error");
  }, [initialLoadError, show]);

  useEffect(() => {
    if (!submittedRef.current) return;

    if (state?.error) {
      show(state.error, "error");
      submittedRef.current = false;
      return;
    }

    if (state?.ok) {
      show("카테고리가 생성되었습니다.");
      formRef.current?.reset();
      router.refresh();
      submittedRef.current = false;
    }
  }, [state, router, show]);

  return (
    <form ref={formRef} action={action} onSubmit={() => { submittedRef.current = true; }} className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-soft">
      <h2 className="font-semibold">새 카테고리</h2>
      <Input name="name" placeholder="예: 재테크" required />
      <Textarea name="description" placeholder="설명" rows={3} />
      <Button type="submit" disabled={pending}>
        {pending ? "생성 중..." : "생성"}
      </Button>
    </form>
  );
}
