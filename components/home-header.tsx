"use client";
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
  return (
    <header className="pt-6 pb-0 space-y-2 w-full">
      {/* 로고 + 메뉴 */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <Image src="/logo.png" alt="머니NPC" width={44} height={44} className="object-contain object-left" priority />
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
          <Link
            href="/search"
            aria-label="검색"
            className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-surface-muted transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      {/* 서브헤더: 설명 + 방문자 수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground pl-2">VC심사역 출신의 투자 기록</p>
        <VisitCounter />
      </div>
    </header>
  );
}
