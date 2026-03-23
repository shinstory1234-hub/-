import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ToastProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
