"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { VisitCounter } from "@/components/visit-counter";

const menus = [
  { href: "/",          label: "홈" },
  { href: "/about",     label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/admin",     label: "관리자" },
];

export function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="space-y-3 pt-6">
      {/* 로고 + 메뉴 */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo.png" alt="머니NPC" width={32} height={32} className="object-contain" priority />
          <span className="text-base font-bold tracking-tight text-foreground md:text-xl">
            머니NPC의 액티브 ETF
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <nav className="hidden md:flex items-center">
            {menus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-surface-muted"
              >
                {menu.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <button
            type="button"
            aria-label="메뉴"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-surface-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 부제목 + 조회수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">VC심사역 출신의 투자 기록</p>
        <VisitCounter />
      </div>

      {/* 구분선 */}
      <div className="h-px bg-border" />

      {/* 모바일 드롭다운 */}
      {mobileOpen && (
        <div className="md:hidden flex flex-col rounded-lg border border-border bg-surface shadow-md overflow-hidden">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors border-b border-border last:border-0"
            >
              {menu.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
