import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { resetPasswordAction } from "./actions";

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
        </CardHeader>
        <CardContent>
          <form action={resetPasswordAction} className="space-y-3">
            <Input name="email" type="email" placeholder="가입한 이메일" required />
            <Button type="submit" className="w-full">
              재설정 링크 보내기
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
