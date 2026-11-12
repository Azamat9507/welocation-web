import type { Metadata } from "next";
import { Suspense } from "react";
import { currentLocale } from "@/lib/current-locale";
import { safeNext } from "@/lib/session";
import { AuthForm } from "../auth-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: t.auth.loginTitle };
}

export default function Page({ searchParams }: PageProps<"/[lang]/login">) {
  return (
    <Suspense>
      <Form searchParams={searchParams} />
    </Suspense>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/[lang]/login">["searchParams"] }) {
  const { lang, t } = await currentLocale();
  const q = await searchParams;
  const next = safeNext(Array.isArray(q.next) ? q.next[0] : q.next, lang);
  return <AuthForm mode="login" next={next} lang={lang} t={t.auth} />;
}
