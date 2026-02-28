"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export function AdminSuccessToast({ show }: { show: boolean }) {
  const { show: showToast } = useToast();

  useEffect(() => {
    if (show) showToast("로그인 성공! 관리자 페이지에 진입했습니다.");
  }, [show, showToast]);

  return null;
}
