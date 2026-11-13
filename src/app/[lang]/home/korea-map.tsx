import Link from "next/link";
import { CATEGORIES, type Region, type SpotMap } from "@/lib/api";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, href, intlLocale, type Locale } from "@/lib/i18n";
import { CATEGORY_COLORS, HEIGHT, LAYERS, WIDTH, project } from "@/lib/map-dots";

// Where each region's count bubble sits, placed by hand so the bubbles don't cover each other.
// small: metropolitan cities inside a province, shown on the map only from sm up where there is room;
// every region is also in the chip row, so nothing is out of reach on a phone.
const LABELS: { region: Region; lat: number; lng: number; small?: boolean }[] = [
  { region: "SEOUL", lat: 37.62, lng: 126.98 },
  { region: "INCHEON", lat: 37.42, lng: 126.35, small: true },
  { region: "GYEONGGI", lat: 37.2, lng: 127.3 },
  { region: "GANGWON", lat: 37.72, lng: 128.45 },
  { region: "CHUNGBUK", lat: 36.9, lng: 127.8 },
  { region: "CHUNGNAM", lat: 36.55, lng: 126.75 },
  { region: "SEJONG", lat: 36.62, lng: 127.38, small: true },
  { region: "DAEJEON", lat: 36.3, lng: 127.42, small: true },
  { region: "JEONBUK", lat: 35.78, lng: 127.1 },
  { region: "GWANGJU", lat: 35.18, lng: 126.85, small: true },
  { region: "JEONNAM", lat: 34.78, lng: 126.95 },
  { region: "GYEONGBUK", lat: 36.45, lng: 128.75 },
  { region: "DAEGU", lat: 35.87, lng: 128.55, small: true },
  { region: "ULSAN", lat: 35.58, lng: 129.3, small: true },
  { region: "GYEONGNAM", lat: 35.3, lng: 128.2 },
  { region: "BUSAN", lat: 35.12, lng: 129.12 },
  { region: "JEJU", lat: 33.42, lng: 126.55 },
];

export function KoreaMap({ lang, t, map }: { lang: Locale; t: Dictionary; map: SpotMap }) {
  const nf = new Intl.NumberFormat(intlLocale(lang));
  const counts = CATEGORIES.map((c) => ({ c, n: map.points[c]?.length ?? 0 })).filter((x) => x.n > 0);
  const regionHref = (r: Region) => href(lang, `/?region=${r}`);
  // most places first
  const regions = LABELS.map(({ region: r }) => ({ r, n: map.regions[r] ?? 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);

  return (
    <section aria-labelledby="korea-map-title" className="mt-12 overflow-hidden rounded-3xl sm:mt-14 bg-[#0d1b2a] text-white">
      <div className="grid gap-2 p-4 sm:p-6 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-6">
        {/* min-w-0: the phone's sideways chip row must not widen the grid column */}
        <div className="min-w-0">
          <h2 id="korea-map-title" className="text-lg font-bold tracking-tight sm:text-2xl">
            {fill(t.home.mapTitle, { n: nf.format(map.total) })}
          </h2>
          <p className="mt-1 text-[13px] text-white/70 sm:text-sm">{t.home.mapHint}</p>
          <ul
            aria-label={t.home.mapLegend}
            className="-mx-4 mt-3 flex gap-x-3 gap-y-1.5 overflow-x-auto px-4 text-xs whitespace-nowrap [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 sm:text-[13px] [&::-webkit-scrollbar]:hidden"
          >
            {counts.map(({ c, n }) => (
              <li key={c} className="shrink-0">
                <Link href={href(lang, `/?category=${c}`)} className="flex items-center gap-1.5 text-white/85 hover:text-white">
                  <span aria-hidden="true" className="size-2 rounded-full" style={{ background: CATEGORY_COLORS[c], boxShadow: `0 0 6px ${CATEGORY_COLORS[c]}` }} />
                  {t.categories[c]} <span className="text-white/50">{nf.format(n)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul
            aria-label={t.home.mapRegions}
            className="-mx-4 mt-2.5 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {regions.map(({ r, n }) => (
              <li key={r} className="shrink-0">
                <Link
                  href={regionHref(r)}
                  className="block rounded-full bg-white/10 px-2.5 py-1 text-xs whitespace-nowrap hover:bg-white hover:text-[#0d1b2a]"
                >
                  {t.regions[r]} <span className="opacity-60">{nf.format(n)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-[599/560] w-full max-w-[20rem] md:max-w-[30rem]">
          {/* The dots are drawn as images (src/app/map): they stay out of the HTML, and the browser and nginx
              keep them. Three layers pulse out of step so the map twinkles; only opacity moves, on the compositor. */}
          {Array.from({ length: LAYERS }, (_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={`/map/${i}.svg?v=${map.total}`}
              alt=""
              width={WIDTH}
              height={HEIGHT}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full will-change-[opacity] motion-safe:animate-[map-twinkle_4.5s_ease-in-out_infinite]"
              style={{ animationDelay: `${-i * 1.5}s` }}
            />
          ))}
          {/* the same links as the chip row, so screen readers and the keyboard get them once, there */}
          <ul aria-hidden="true">
            {LABELS.map(({ region, lat, lng, small }) => {
              const n = map.regions[region] ?? 0;
              if (n === 0) return null;
              const [x, y] = project(lat, lng);
              return (
                <li
                  key={region}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 hover:z-10 focus-within:z-10 ${small ? "hidden sm:block" : ""}`}
                  style={{ left: `${(x / WIDTH) * 100}%`, top: `${(y / HEIGHT) * 100}%` }}
                >
                  {/* the bubble shows the count; the region name opens on hover */}
                  <Link
                    href={regionHref(region)}
                    tabIndex={-1}
                    title={fill(t.home.mapRegionLabel, { region: t.regions[region], n: nf.format(n) })}
                    className="group/r flex items-center gap-1 rounded-full bg-black/50 px-1.5 py-px text-[10px] leading-4 font-semibold whitespace-nowrap ring-1 ring-white/20 transition-colors hover:bg-white hover:text-[#0d1b2a] sm:text-[11px]"
                  >
                    <span className="hidden group-hover/r:inline">{t.regions[region]}</span>
                    {nf.format(n)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
