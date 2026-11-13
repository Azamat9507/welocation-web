import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, isLocale } from "@/lib/i18n";
import "../globals.css";
import { ErrorStrings } from "./error-strings";
import { FontLoader } from "./font-loader";
import { GuidePanelProvider } from "./guide-panel/provider";
import { BackToTop } from "./back-to-top";
import { SiteFooter } from "./site-footer";
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
      <head>
        {/* the site font, off the critical path: FontLoader turns it on after the first paint */}
        {/* eslint-disable-next-line @next/next/no-css-tags -- on purpose: a bundled stylesheet would block the first paint */}
        <link id="pretendard" rel="stylesheet" href="/fonts/pretendard/pretendard.css" media="print" />
      </head>
      <body className="flex min-h-full flex-col">
        <FontLoader />
        <GuidePanelProvider
          lang={lang}
          labels={{
            panel: t.guide.panel,
            form: t.guide.form,
            connect: t.guide.errors.connect,
            categories: t.categories,
            regions: t.regions,
          }}
        >
          <SiteHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:py-6">
            <ErrorStrings value={t.error}>{children}</ErrorStrings>
          </main>
          <SiteFooter lang={lang} t={t} />
          <BackToTop label={t.footer.backToTop} />
        </GuidePanelProvider>
      </body>
    </html>
  );
}
