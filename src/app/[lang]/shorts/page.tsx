import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getShorts } from "@/lib/api";
import { currentLocale } from "@/lib/current-locale";
import { ShortsFeed } from "./feed";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: t.shorts.metaTitle, description: t.shorts.metaDescription };
}

export default async function ShortsPage({ searchParams }: PageProps<"/[lang]/shorts">) {
  const { t } = await currentLocale();
  return (
    <section>
      <h1 className="sr-only">{t.shorts.title}</h1>
      <Suspense fallback={<p className="py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Feed({ searchParams }: { searchParams: PageProps<"/[lang]/shorts">["searchParams"] }) {
  const { lang, t } = await currentLocale();
  const q = await searchParams;
  const raw = Array.isArray(q.start) ? q.start[0] : q.start;
  const startId = raw && /^\d{1,18}$/.test(raw) ? Number(raw) : null;
  const first = await getShorts(0, 20);

  if (first.items.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted">{t.shorts.empty}</p>
        <Link href={`/${lang}`} className="mt-2 inline-block text-sm text-accent">
          {t.common.browseSpots}
        </Link>
      </div>
    );
  }
  return (
    <ShortsFeed
      lang={lang}
      first={first}
      startId={startId}
      categories={t.categories}
      regions={t.regions}
      labels={{
        feed: t.shorts.feed,
        play: t.shorts.play,
        openSpot: t.shorts.openSpot,
        prev: t.shorts.prev,
        next: t.shorts.next,
        videoTitle: t.shorts.videoTitle,
        source: t.shorts.source,
        loading: t.common.loading,
      }}
    />
  );
}
