"use server";

import { createClient } from "@/lib/supabase-server";

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
  });

  if (error) return { error: error.message };
  return { success: true };
}
