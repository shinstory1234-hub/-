import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "shinstory1234@gmail.com";

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
  if (user.email !== ADMIN_EMAIL) redirect("/");
  return user;
}

/** API route handler용 — redirect 대신 null 반환 */
export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return !!user && user.email === ADMIN_EMAIL;
}

export function isDev() {
  return process.env.NODE_ENV === "development";
}
