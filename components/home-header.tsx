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
        </div>
      </div>

      {/* 부제목 + 조회수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">VC심사역 출신의 투자 기록</p>
        <VisitCounter />
      </div>

      {/* 구분선 */}
      <div className="h-px bg-border" />
    </header>
  );
}
