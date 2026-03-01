"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { signInAction } from "./actions";

const initialState = {} as { error?: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      {pending ? "로그인 중..." : "로그인"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(signInAction, initialState);
  const { show } = useToast();

  useEffect(() => {
    if (state?.error) show(state.error, "error");
  }, [show, state?.error]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">이메일</label>
        <Input name="email" type="email" placeholder="admin@example.com" required autoFocus />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">비밀번호</label>
        <Input name="password" type="password" placeholder="비밀번호" required />
      </div>
      {state?.error ? (
        <p className="flex items-center gap-2 rounded-md border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4" />
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
