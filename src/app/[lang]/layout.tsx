import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, isLocale } from "@/lib/i18n";
import "../globals.css";
import { ErrorStrings } from "./error-strings";
import { SiteHeader } from "./site-header";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = await getDictionary(lang);
  return { title: t.meta.title, description: t.meta.description };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getDictionary(lang);
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:py-6">
          <ErrorStrings value={t.error}>{children}</ErrorStrings>
        </main>
        <footer className="mt-10 border-t border-line px-4 py-5 text-center text-xs text-muted">
          {t.common.footerCredit}
        </footer>
      </body>
    </html>
  );
}
