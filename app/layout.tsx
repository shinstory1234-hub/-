import type { ReactNode } from "react";
import "./globals.css";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { ToastProvider } from "@/components/ui/toast";
import { PageTransition } from "@/components/page-transition";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ToastProvider>
          <div className="mx-auto w-full max-w-3xl px-6 md:px-5">
            <SiteHeader />
          </div>
          <main className="pb-24 md:pb-14">
            <PageTransition>{children}</PageTransition>
          </main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
