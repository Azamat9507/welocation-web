import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WORK_MAX_LENGTH, getWork, getWorks, isTourApiImage } from "@/lib/api";
import { currentLocale } from "@/lib/current-locale";
import { fill, href } from "@/lib/i18n";
import { byFame, workPoster, workTitle } from "@/lib/works";
import { SpotCard } from "../spot-card";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await currentLocale();
  return { title: t.scenes.metaTitle, description: t.scenes.metaDescription };
}

// /scenes lists the works; /scenes?work=겨울연가 shows one work's spots
export default async function ScenesPage({ searchParams }: PageProps<"/[lang]/scenes">) {
  const { t } = await currentLocale();
  return (
    <section className="mx-auto max-w-4xl">
      <Suspense fallback={<p className="py-8 text-center text-sm text-muted">{t.common.loading}</p>}>
        <Scenes searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Scenes({ searchParams }: { searchParams: PageProps<"/[lang]/scenes">["searchParams"] }) {
  const raw = (await searchParams).work;
  const work = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (work === undefined || work === "") return <Works />;
  if (work.length > WORK_MAX_LENGTH) notFound();
  return <WorkSpotsList title={work} />;
}

async function Works() {
  const { lang, t } = await currentLocale();
  const works = byFame(await getWorks());
  return (
    <>
      <h1 className="text-xl font-bold sm:text-2xl">{t.scenes.title}</h1>
      <p className="mt-0.5 text-sm text-muted">{t.scenes.note}</p>
      {works.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{t.scenes.empty}</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
          {works.map((w) => (
            <li key={w.title} className="min-w-0">
              <Link href={href(lang, `/scenes?${new URLSearchParams({ work: w.title })}`)} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
                  {workPoster(w.title) || w.coverUrl ? (
                    // a place photo is served as-is: the 공공누리 license does not allow altering it
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={workPoster(w.title) ?? w.coverUrl!}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                    />
                  ) : (
                    <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-4xl">
                      🎬
                    </span>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-semibold group-hover:text-accent">{workTitle(w.title, lang)}</p>
                <p className="text-xs text-muted">
                  {t.scenes.kind[w.kind]} · {fill(t.scenes.places, { n: w.spotCount })}
                  {lang !== "ko" && workTitle(w.title, lang) !== w.title && <> · {w.title}</>}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Credits
        photos={works.some((w) => !workPoster(w.title) && w.coverUrl && isTourApiImage(w.coverUrl))}
        posters={works.some((w) => workPoster(w.title))}
      />
    </>
  );
}

async function WorkSpotsList({ title }: { title: string }) {
  const { lang, t } = await currentLocale();
  const data = await getWork(title);
  if (!data) notFound();
  const name = workTitle(data.work.title, lang);
  const poster = workPoster(data.work.title);
  return (
    <>
      <Link href={href(lang, "/scenes")} className="text-sm text-muted hover:text-accent">
        {t.scenes.all}
      </Link>
      {/* The poster first, so the visitor knows the work at a glance; blurred behind itself as the banner */}
      <header className="relative mt-2 overflow-hidden rounded-2xl bg-[#0d1b2a] text-white">
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />
        )}
        <div className="relative flex items-end gap-4 p-4 sm:gap-6 sm:p-6">
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt={name}
              className="w-28 shrink-0 rounded-xl shadow-lg ring-1 ring-white/20 sm:w-44"
              fetchPriority="high"
            />
          )}
          <div className="min-w-0 pb-1">
            <p className="text-xs text-white/80 sm:text-sm">
              {t.scenes.kind[data.work.kind]} · {fill(t.scenes.places, { n: data.work.spotCount })}
            </p>
            <h1 className="mt-1 text-2xl leading-tight font-bold sm:text-4xl">{name}</h1>
            {name !== data.work.title && <p className="mt-1 text-sm text-white/80">{data.work.title}</p>}
          </div>
        </div>
      </header>
      {t.scenes.koreanOnly && <p className="mt-3 text-xs text-muted">{t.scenes.koreanOnly}</p>}
      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5">
        {data.spots.map(({ spot, scene }) => (
          <SpotScene key={spot.id} spot={spot} scene={scene} />
        ))}
      </ul>
      <Credits photos={data.spots.some((s) => s.spot.thumbnailUrl && isTourApiImage(s.spot.thumbnailUrl))} posters={!!poster} />
    </>
  );
}

// SpotCard renders its own <li>, so the scene line goes in a wrapper list item of its own
function SpotScene({ spot, scene }: { spot: Parameters<typeof SpotCard>[0]["spot"]; scene: string | null }) {
  return (
    <li className="min-w-0">
      <ul>
        <SpotCard spot={spot} swipe />
      </ul>
      {scene && <p className="mt-1 line-clamp-3 text-xs leading-snug text-muted">{scene}</p>}
    </li>
  );
}

async function Credits({ photos, posters }: { photos: boolean; posters: boolean }) {
  const { t } = await currentLocale();
  return (
    <p className="mt-4 text-right text-[11px] text-muted">
      {t.scenes.source}
      {photos && <> · {t.common.photoCredit}</>}
      {posters && <> · {t.scenes.posterCredit}</>}
    </p>
  );
}
