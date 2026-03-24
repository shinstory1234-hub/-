"use client";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { VisitCounter } from "@/components/visit-counter";

const menus = [
  { href: "/about", label: "소개" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/admin", label: "관리자" },
];

export function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="space-y-2 pt-4">
      {/* 1행: 로고 + 메뉴 */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground hover:text-accent transition-colors md:text-2xl"
        >
          머니NPC의 액티브 ETF
        </Link>
        <div className="flex items-center gap-1">
          {/* 데스크탑 메뉴 */}
          <nav className="hidden md:flex items-center">
            {menus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                {menu.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          {/* 모바일 햄버거 버튼 */}
          <button
            type="button"
            aria-label="메뉴"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* 2행: 부제목 + 조회수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">VC심사역 출신의 투자 기록</p>
        <VisitCounter />
      </div>
      {/* 모바일 드롭다운 */}
      {mobileOpen && (
        <div className="md:hidden flex flex-col gap-0.5 border-t border-border mt-1 pt-2 pb-1">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm font-medium text-muted-foreground"
            >
              {menu.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
