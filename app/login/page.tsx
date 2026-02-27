import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">로그인</h1>
      <p className="mb-6 text-sm text-zinc-500">관리자 계정으로 로그인하세요.</p>
      <LoginForm />
      <Link href="/reset-password" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
        비밀번호를 잊으셨나요?
      </Link>
    </section>
  );
}
