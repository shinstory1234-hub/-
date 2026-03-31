import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { BottomNav } from "@/components/bottom-nav";
import { ToastProvider } from "@/components/ui/toast";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  metadataBase: new URL("https://moneynpc.vercel.app"),
  title: "머니NPC 블로그",
  description: "VC심사역 출신의 투자 기록 - 액티브 ETF",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "머니NPC",
  },
  openGraph: {
    siteName: "머니NPC의 액티브 ETF",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

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
          <SiteHeader />
          <main className="pb-24 md:pb-14">
            <PageTransition>{children}</PageTransition>
          </main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
