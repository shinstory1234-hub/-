"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useToast } from "@/components/ui/toast";

type Props = {
  slug: string | null | undefined;
  className?: string;
  children: ReactNode;
};

export function PostSlugLink({ slug, className, children }: Props) {
  const { show } = useToast();

  if (!slug) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => show("이 글은 주소가 없어 열 수 없습니다.", "error")}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={`/posts/${encodeURIComponent(slug)}`} className={className}>
      {children}
    </Link>
  );
}
