"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "./actions";

const initialState = {} as { error?: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "로그인 중..." : "로그인"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <Input name="email" type="email" placeholder="admin@example.com" required autoFocus />
      <Input name="password" type="password" placeholder="비밀번호" required />
      {state?.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
