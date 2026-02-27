import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordAction } from "./actions";

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-md rounded-xl border bg-white p-8">
      <h1 className="mb-6 text-2xl font-bold">비밀번호 재설정</h1>
      <form action={resetPasswordAction} className="space-y-3">
        <Input name="email" type="email" placeholder="가입한 이메일" required />
        <Button type="submit" className="w-full">
          재설정 링크 보내기
        </Button>
      </form>
    </section>
  );
}
