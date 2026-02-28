import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <section className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-[1.1fr_1fr]">
      <Card className="hidden md:block">
        <CardHeader>
          <h2>머니NPC 관리자</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>로그인하면 관리자 대시보드에서 글/카테고리를 관리할 수 있습니다.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>실시간 폼 검증 및 에러 안내</li>
            <li>로딩 상태 버튼 + 성공 토스트</li>
            <li>권한 없는 계정은 관리자 접근 차단</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2>로그인</h2>
          <p className="mt-2 text-sm text-muted-foreground">관리자 이메일로 로그인하세요.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <Link href="/reset-password" className="inline-block text-sm text-accent hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
