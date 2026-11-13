import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { SEARCH_MAX_LENGTH, getShorts, getSpots, isVideoId } from "@/lib/api";
import { getMe } from "@/lib/api-auth";
import { currentLocale } from "@/lib/current-locale";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, href, type Locale } from "@/lib/i18n";
import { ShortsForm } from "./shorts-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: `${t.admin.title} · WeLocation`, robots: { index: false } };
}

export default async function AdminShortsPage({ searchParams }: PageProps<"/[lang]/admin/shorts">) {
  const { t } = await currentLocale();
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">{t.admin.title}</h1>
      <Suspense fallback={<p className="py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
        <Admin searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

type Row = { id: number; name: string; meta: string; videoId: string | null };

// Only decides what to render: every save goes through the API, which checks the admin role itself
async function Admin({ searchParams }: { searchParams: PageProps<"/[lang]/admin/shorts">["searchParams"] }) {
  const { lang, t } = await currentLocale();
  const me = await getMe().catch(() => null);
  if (!me) redirect(`/${lang}/login?next=${encodeURIComponent(href(lang, "/admin/shorts"))}`);
  if (!me.admin) notFound();

  const sp = await searchParams;
  const rawQ = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = rawQ?.trim().slice(0, SEARCH_MAX_LENGTH).trim() || undefined;

  const [shorts, found] = await Promise.all([getShorts(0, 50), q ? getSpots({ q, page: 1 }, 20) : null]);
  const videoOf = new Map(shorts.items.map((s) => [s.id, s.videoId]));
  const meta = (c: keyof Dictionary["categories"], r: keyof Dictionary["regions"]) => `${t.categories[c]} · ${t.regions[r]}`;

  const results: Row[] = (found?.items ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    meta: `${meta(s.category, s.region)} · ${s.address}`,
    videoId: videoOf.get(s.id) ?? null,
  }));
  const listed: Row[] = shorts.items.map((s) => ({ id: s.id, name: s.name, meta: meta(s.category, s.region), videoId: s.videoId }));

  return (
    <>
      <p className="mt-1 text-sm text-muted">{t.admin.hint}</p>

      <form className="mt-4 flex gap-2" role="search">
        <input
          name="q"
          defaultValue={q}
          maxLength={SEARCH_MAX_LENGTH}
          aria-label={t.admin.searchLabel}
          placeholder={t.admin.searchPlaceholder}
          className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">{t.admin.searchButton}</button>
      </form>

      {q && (
        <Rows lang={lang} t={t} rows={results} empty={t.admin.noResults} />
      )}

      <h2 className="mt-8 text-base font-bold">{fill(t.admin.listed, { n: shorts.totalElements })}</h2>
      <Rows lang={lang} t={t} rows={listed} empty={t.shorts.empty} />
    </>
  );
}

function Rows({ lang, t, rows, empty }: { lang: Locale; t: Dictionary; rows: Row[]; empty: string }) {
  if (rows.length === 0) return <p className="mt-3 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-3 divide-y divide-line">
      {rows.map((r) => (
        <li key={r.id} id={`spot-${r.id}`} className="py-3">
          <a href={href(lang, `/spots/${r.id}`)} className="font-semibold hover:text-accent">
            {r.name}
          </a>
          <p className="truncate text-xs text-muted">{r.meta}</p>
          <ShortsForm
            spotId={r.id}
            current={r.videoId && isVideoId(r.videoId) ? r.videoId : null}
            lang={lang}
            labels={{
              urlLabel: fill(t.admin.urlLabel, { name: r.name }),
              urlPlaceholder: t.admin.urlPlaceholder,
              save: t.admin.save,
              remove: t.admin.remove,
              saved: t.admin.saved,
            }}
          />
        </li>
      ))}
    </ul>
  );
}
