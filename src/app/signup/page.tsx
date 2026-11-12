import { Suspense } from "react";
import { safeNext } from "@/lib/session";
import { AuthForm } from "../auth-form";

export const metadata = { title: "회원가입 · WeLocation" };

export default function Page({ searchParams }: PageProps<"/signup">) {
  return (
    <Suspense>
      <Form searchParams={searchParams} />
    </Suspense>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/signup">["searchParams"] }) {
  const q = await searchParams;
  return <AuthForm mode="signup" next={safeNext(Array.isArray(q.next) ? q.next[0] : q.next)} />;
}
