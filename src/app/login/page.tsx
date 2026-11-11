import { Suspense } from "react";
import { safeNext } from "@/lib/session";
import { AuthForm } from "../auth-form";

export const metadata = { title: "로그인 · 위로케이션" };

export default function Page({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense>
      <Form searchParams={searchParams} />
    </Suspense>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const q = await searchParams;
  return <AuthForm mode="login" next={safeNext(Array.isArray(q.next) ? q.next[0] : q.next)} />;
}
