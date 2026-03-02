"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { isDev } from "@/lib/auth";

type LoginState = { error?: string };

export async function signInAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (isDev()) console.log("[login] submit", { email });

  if (!email || !password) return { error: "이메일과 비밀번호를 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (isDev()) console.log("[login] failed", error.message);
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  if (isDev()) console.log("[login] success");
  redirect("/admin?login=success");
}
