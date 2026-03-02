import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <AdminNav />
      <div>{children}</div>
    </div>
  );
}
