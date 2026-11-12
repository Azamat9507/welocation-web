import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { currentLocale } from "@/lib/current-locale";
import { getToken } from "@/lib/session";
import { GuideForm } from "./guide-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: t.guide.page.metaTitle, description: t.guide.page.metaDescription };
}

export default async function GuidePage() {
  const { lang, t } = await currentLocale();
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">{t.guide.page.title}</h1>
      <p className="mt-0.5 text-sm text-muted">{t.guide.page.intro}</p>
      <Suspense>
        <LoginHint />
      </Suspense>
      <GuideForm
        lang={lang}
        labels={t.guide.form}
        rating={t.rating}
        categories={t.categories}
        regions={t.regions}
      />
    </section>
  );
}

// Only whether a session cookie exists; the API still decides if the token is valid
async function LoginHint() {
  const { lang, t } = await currentLocale();
  if (await getToken()) return null;
  return (
    <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm">
      {t.guide.page.loginHint}{" "}
      <Link href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/guide`)}`} className="font-semibold text-accent">
        {t.guide.page.login}
      </Link>
    </p>
  );
}
