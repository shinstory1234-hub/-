"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function PostShareButtons() {
  const { show } = useToast();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      show("복사 완료");
    } catch {
      show("클립보드 복사에 실패했습니다.", "error");
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
      <Button variant="outline" size="sm" type="button" onClick={copyLink}>
        링크 공유
      </Button>
    </div>
  );
}
