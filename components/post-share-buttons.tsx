"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: { sendDefault: (payload: Record<string, unknown>) => void };
    };
  }
}

type Props = {
  title: string;
  description: string;
  keyFromEnv?: string;
};

export function PostShareButtons({ title, description, keyFromEnv }: Props) {
  const { show } = useToast();
  const [kakaoReady, setKakaoReady] = useState(false);

  useEffect(() => {
    if (!keyFromEnv) return;

    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="1"]');
    const onReady = () => {
      if (!window.Kakao) return;
      if (!window.Kakao.isInitialized()) window.Kakao.init(keyFromEnv);
      setKakaoReady(true);
    };

    if (existing) {
      onReady();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    script.async = true;
    script.dataset.kakaoSdk = "1";
    script.onload = onReady;
    script.onerror = () => {
      setKakaoReady(false);
      show("카카오 SDK 로딩에 실패했습니다.", "error");
    };
    document.head.appendChild(script);
  }, [keyFromEnv, show]);

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      show("복사 완료");
    } catch {
      show("클립보드 복사에 실패했습니다.", "error");
    }
  };

  const shareLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        show("공유창을 열었습니다.");
        return;
      } catch {
        // 사용자가 공유창을 닫은 경우를 포함해 복사로 폴백합니다.
      }
    }
    await copyLink();
  };

  const shareKakao = () => {
    if (!keyFromEnv) {
      show("KAKAO_JS_KEY가 설정되지 않았습니다.", "error");
      return;
    }
    if (!window.Kakao || !kakaoReady) {
      show("카카오 공유 준비 중입니다. 잠시 후 다시 시도해 주세요.", "error");
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: "https://via.placeholder.com/600x315.png?text=MoneyNPC",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      },
      buttons: [
        {
          title: "글 보러가기",
          link: { mobileWebUrl: window.location.href, webUrl: window.location.href }
        }
      ]
    });
  };

  return (
    <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-6">
      <Button variant="outline" size="sm" type="button" onClick={shareLink}>
        링크 공유
      </Button>
      <Button variant="outline" size="sm" type="button" onClick={shareKakao} disabled={!keyFromEnv || !kakaoReady}>
        카카오 공유
      </Button>
    </div>
  );
}
