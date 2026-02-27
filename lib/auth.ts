import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) redirect("/");
  return user;
}

export function isDev() {
  return process.env.NODE_ENV === "development";
}
