import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction } from "./actions";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-xl border bg-white p-8">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>
      <form action={signInAction} className="space-y-3">
        <Input name="email" type="email" placeholder="email@example.com" required />
        <Input name="password" type="password" placeholder="••••••••" required />
        <Button type="submit" className="w-full">
          로그인
        </Button>
      </form>
    </section>
  );
}
