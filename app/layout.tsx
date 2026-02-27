import Link from "next/link";
import "./globals.css";

import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold">
              Minimal Tistory Blog
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-600">
              <Link href="/about">소개</Link>
              <Link href="/topics/nextjs">카테고리/태그</Link>
              <Link href="/login">로그인</Link>
              <Link href="/admin/posts/new">관리자</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
