import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getMyBookmarks } from "@/lib/api-auth";
import { currentLocale } from "@/lib/current-locale";
import { fill } from "@/lib/i18n";
import { SpotCard } from "../../spot-card";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: t.bookmarks.metaTitle };
}

export default async function BookmarksPage({ searchParams }: PageProps<"/[lang]/me/bookmarks">) {
  const { t } = await currentLocale();
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
      <Bookmarks searchParams={searchParams} />
    </Suspense>
  );
}

async function Bookmarks({ searchParams }: { searchParams: PageProps<"/[lang]/me/bookmarks">["searchParams"] }) {
  const { lang, t } = await currentLocale();
  const q = await searchParams;
  const n = Number(Array.isArray(q.page) ? q.page[0] : q.page);
  const page = Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : 1;
  const result = await getMyBookmarks(page);
  if (!result) redirect(`/${lang}/login?next=${encodeURIComponent(`/${lang}/me/bookmarks`)}`);

  return (
    <section>
      <h1 className="text-xl font-bold">{fill(t.bookmarks.title, { n: result.totalElements })}</h1>
      {result.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {t.bookmarks.empty}{" "}
          <Link href={`/${lang}`} className="text-accent">
            {t.common.browseSpots}
          </Link>
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((s) => (
            <SpotCard key={s.id} spot={s} />
          ))}
        </ul>
      )}
      {result.totalPages > 1 && (
        <nav className="mt-4 flex justify-center gap-4 text-sm">
          {page > 1 && (
            <Link href={`/${lang}/me/bookmarks?page=${page - 1}`} className="text-accent">
              {t.bookmarks.prev}
            </Link>
          )}
          <span className="text-muted">{page} / {result.totalPages}</span>
          {page < result.totalPages && (
            <Link href={`/${lang}/me/bookmarks?page=${page + 1}`} className="text-accent">
              {t.bookmarks.next}
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
