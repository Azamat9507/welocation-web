import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getSpot, type Page, type SpotSummary } from "@/lib/api";
import { call, getMe } from "@/lib/api-auth";
import { currentLocale } from "@/lib/current-locale";
import { href } from "@/lib/i18n";
import { Photos } from "./photos";
import { SpotForm, type SpotFormValues } from "./spot-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: `${t.admin.spotsTitle} · WeLocation`, robots: { index: false } };
}

export default async function AdminSpotsPage({ searchParams }: PageProps<"/[lang]/admin/spots">) {
  const { t } = await currentLocale();
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">{t.admin.spotsTitle}</h1>
      <Suspense fallback={<p className="py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
        <Admin searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

const EMPTY: SpotFormValues = { name: "", category: "LEISURE", activity: "", region: "", address: "", coords: "", description: "" };

// Only decides what to render: every change goes through the API, which checks the admin role itself
async function Admin({ searchParams }: { searchParams: PageProps<"/[lang]/admin/spots">["searchParams"] }) {
  const { lang, t } = await currentLocale();
  const me = await getMe().catch(() => null);
  if (!me) redirect(`/${lang}/login?next=${encodeURIComponent(href(lang, "/admin/spots"))}`);
  if (!me.admin) notFound();

  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const rawEdit = one(sp.edit);
  const editId = rawEdit && /^\d{1,18}$/.test(rawEdit) ? Number(rawEdit) : null;

  const [list, editing] = await Promise.all([
    call<Page<SpotSummary>>("/api/admin/spots?page=0&size=50"),
    editId ? getSpot(editId) : null,
  ]);
  // only hand-added spots are edited here; TourAPI ones are rewritten every night
  const spot = editing?.manual ? editing : null;
  const values: SpotFormValues = spot
    ? {
        name: spot.name,
        category: spot.category,
        activity: spot.activity ?? "",
        region: spot.region,
        address: spot.address,
        coords: `${spot.latitude}, ${spot.longitude}`,
        description: spot.description ?? "",
      }
    : EMPTY;
  const a = t.admin;

  return (
    <>
      <p className="mt-1 text-sm text-muted">{a.spotsHint}</p>

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold">{spot ? `${a.editSpot}: ${spot.name}` : a.newSpot}</h2>
        {spot && (
          <span className="flex shrink-0 gap-3 text-xs">
            <Link href={href(lang, `/spots/${spot.id}`)} className="text-accent">
              {a.view}
            </Link>
            <Link href={href(lang, "/admin/spots")} className="text-accent">
              {a.newSpot}
            </Link>
          </span>
        )}
      </div>
      <SpotForm
        key={spot?.id ?? "new"}
        spotId={spot?.id ?? null}
        initial={values}
        saved={!!spot && one(sp.saved) === "1"}
        lang={lang}
        categories={t.categories}
        activities={t.activities}
        regions={t.regions}
        labels={{
          name: a.name,
          category: a.category,
          activity: a.activity,
          noActivity: a.noActivity,
          region: a.region,
          regionAuto: a.regionAuto,
          address: a.address,
          findCoords: a.findCoords,
          coords: a.coords,
          coordsHint: a.coordsHint,
          checkMap: a.checkMap,
          noCoords: a.noCoords,
          failed: a.failed,
          description: a.description,
          saveSpot: a.saveSpot,
          saved: a.saved,
        }}
      />
      {spot && (
        <Photos
          spotId={spot.id}
          images={spot.images}
          lang={lang}
          labels={{
            photos: a.photos,
            addPhoto: a.addPhoto,
            removePhoto: a.removePhoto,
            uploading: a.uploading,
            badPhoto: a.badPhoto,
            deleteSpot: a.deleteSpot,
            deleteConfirm: a.deleteConfirm,
            failed: a.failed,
          }}
        />
      )}

      <h2 className="mt-10 text-base font-bold">{a.spotsTitle}</h2>
      {!list.ok ? (
        <p className="mt-3 text-sm text-red-700">{a.failed}</p>
      ) : list.data.items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{a.noManual}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {list.data.items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2.5">
              {s.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- our own upload
                <img src={s.thumbnailUrl} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="size-12 shrink-0 rounded-lg bg-sand" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                <p className="truncate text-xs text-muted">
                  {s.activity ? t.activities[s.activity] : t.categories[s.category]} · {t.regions[s.region]}
                </p>
              </div>
              <Link href={href(lang, `/admin/spots?edit=${s.id}`)} className="shrink-0 text-xs text-accent">
                {a.editSpot}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
