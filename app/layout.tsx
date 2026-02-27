import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#f6f8fb] text-zinc-900 antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
