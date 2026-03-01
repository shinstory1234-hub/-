"use server";

import { createClient } from "@/lib/supabase-server";

export async function resetPasswordAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
  });

  if (error) throw new Error(error.message);
}
