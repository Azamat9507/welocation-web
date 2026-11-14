"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { DEFAULT_NEARBY_RADIUS, type Category } from "@/lib/api";
import type { Dictionary } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { CATEGORY_COLORS } from "@/lib/map-dots";

export type MapSpot = {
  id: number;
  name: string;
  category: Category;
  lat: number;
  lng: number;
  distance: string;
  url: string;
};

type Props = {
  center: { lat: number; lng: number };
  // true when the center came from "search this area", not from the browser's location
  fromMap: boolean;
  radiusKm: number;
  category?: Category;
  spots: MapSpot[];
  lang: Locale;
  labels: Dictionary["nearby"]["map"];
};

// Free vector tiles: no key, no cookies, no request limit
const STYLE = "https://tiles.openfreemap.org/styles/liberty";
export const FOCUS_EVENT = "nearby:focus";
// set on <body> when there is no map, so the "show on map" buttons hide themselves (see globals.css)
const FAILED_ATTR = "data-nearby-map-failed";
const LOAD_TIMEOUT_MS = 12_000;
const round = (v: number) => Math.round(v * 1000) / 1000;
// the same box parseNearby accepts; a search outside it would only show "outside Korea"
const inKorea = (p: { lat: number; lng: number }) => p.lat >= 33 && p.lat <= 39 && p.lng >= 124 && p.lng <= 132.5;

// A circle as a 64-sided polygon; good enough at these radii, and MapLibre has no circle in kilometres
function circle(lat: number, lng: number, km: number): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring: [number, number][] = [];
  const dLat = km / 110.574;
  const dLng = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * 2 * Math.PI;
    ring.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}

function kmBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.sqrt(x * x + y * y) * 6371;
}

// Lights up the list row of a spot; the rows are server-rendered with id="spot-<id>"
function highlightRow(id: number, scroll: boolean) {
  document.querySelectorAll("[data-map-active]").forEach((el) => el.removeAttribute("data-map-active"));
  const row = document.getElementById(`spot-${id}`);
  if (!row) return;
  row.setAttribute("data-map-active", "");
  // only where the list sits beside the map; on a phone it is below, and scrolling would hide the open card
  if (scroll && window.matchMedia("(min-width: 1024px)").matches) row.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

// The page gives this a key per search, so a new search starts with fresh state
export function NearbyMap({ center, fromMap, radiusKm, category, spots, lang, labels }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [moved, setMoved] = useState<{ lat: number; lng: number } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let map: MapLibreMap | undefined;
    let cancelled = false;
    let loaded = false;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const markers = new Map<number, { marker: Marker; popup: Popup; open: (scrollRow: boolean) => void }>();

    const fail = () => {
      if (cancelled) return;
      map?.remove();
      map = undefined;
      document.body.setAttribute(FAILED_ATTR, "");
      setFailed(true);
    };
    // the style, the tiles or the worker never arriving (offline, blocked host) shows no error of its own
    const watchdog = setTimeout(() => {
      if (!loaded) fail();
    }, LOAD_TIMEOUT_MS);

    const onFocus = (e: Event) => {
      const id = (e as CustomEvent<number>).detail;
      const hit = markers.get(id);
      if (!map || !hit) return;
      map.flyTo({ center: hit.marker.getLngLat(), zoom: Math.max(map.getZoom(), 14) });
      hit.open(false);
      box.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };

    // loaded here, so the map library only reaches people who open this page
    import("maplibre-gl")
      .then((maplibregl) => {
        if (cancelled || !box.current) return;
        // copied there by scripts/copy-map-worker.mjs; the version keeps an old copy out of the browser cache
        maplibregl.setWorkerUrl(`/vendor/maplibre-gl-worker.mjs?v=${maplibregl.getVersion()}`);
        const area = circle(center.lat, center.lng, radiusKm);
        const ring = area.geometry.coordinates[0] as [number, number][];
        const bounds = ring.reduce((b, p) => b.extend(p), new maplibregl.LngLatBounds(ring[0], ring[0]));
        const m = new maplibregl.Map({
          container: box.current,
          style: STYLE,
          bounds,
          fitBoundsOptions: { padding: 16 },
          // the tiles carry the OpenFreeMap / OpenMapTiles / OpenStreetMap credit themselves
          attributionControl: { compact: true },
          // one finger scrolls the page on a phone; the map moves with two
          cooperativeGestures: true,
          // the canvas is the map's labelled region; these are MapLibre's own strings in the page language
          locale: { "Map.Title": labels.label, "CooperativeGesturesHandler.MobileHelpText": labels.twoFingers },
          maxBounds: [
            [123.5, 32.5],
            [133, 39.5],
          ],
        });
        map = m;
        m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        // a missing tile later on is normal; any error before the first full load means there is no map
        m.on("error", () => {
          if (!loaded) fail();
        });

        m.on("load", () => {
          loaded = true;
          clearTimeout(watchdog);
          // Korean place names on the Korean page; elsewhere the style's "Latin \n Hangul" labels stay
          if (lang === "ko") {
            for (const layer of m.getStyle().layers) {
              if (layer.type === "symbol" && m.getLayoutProperty(layer.id, "text-field")) {
                m.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:ko"], ["get", "name"]]);
              }
            }
          }
          m.addSource("radius", { type: "geojson", data: area });
          m.addLayer({ id: "radius-fill", type: "fill", source: "radius", paint: { "fill-color": "#1e5b5e", "fill-opacity": 0.06 } });
          m.addLayer({
            id: "radius-line",
            type: "line",
            source: "radius",
            paint: { "line-color": "#1e5b5e", "line-width": 1.5, "line-dasharray": [2, 2] },
          });
        });

        // the browser's own position as a blue dot; a searched area's center as a plain pin
        const here = document.createElement("div");
        here.className = fromMap
          ? "size-3 rotate-45 rounded-sm border-2 border-white bg-[#1e5b5e] shadow"
          : "size-4 rounded-full border-2 border-white bg-[#2b6cff] shadow-[0_0_0_6px_rgba(43,108,255,0.25)]";
        here.setAttribute("role", "img");
        here.setAttribute("aria-label", fromMap ? labels.center : labels.you);
        new maplibregl.Marker({ element: here }).setLngLat([center.lng, center.lat]).addTo(m);

        for (const spot of spots) {
          const dot = document.createElement("div");
          dot.tabIndex = 0;
          dot.setAttribute("role", "button");
          // no transition or scale here: MapLibre moves the marker with an inline transform, and animating that made
          // the dot slide away from under the pointer between mousedown and mouseup
          dot.className = "size-3.5 cursor-pointer rounded-full border-2 border-white shadow hover:outline-2 hover:outline-offset-1 hover:outline-[#1e5b5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5b5e]";
          dot.style.background = CATEGORY_COLORS[spot.category];
          dot.setAttribute("aria-label", `${spot.name}, ${spot.distance}`);

          // built with text nodes, never innerHTML: names come from outside data
          const card = document.createElement("div");
          card.className = "text-sm";
          const title = document.createElement("p");
          title.className = "font-semibold";
          title.textContent = spot.name;
          const meta = document.createElement("p");
          meta.className = "text-xs text-muted";
          meta.textContent = spot.distance;
          const link = document.createElement("a");
          link.href = spot.url;
          link.className = "mt-1 inline-block text-xs font-semibold text-accent";
          link.textContent = labels.open;
          link.addEventListener("click", (e) => {
            // a new tab or window stays the browser's job
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            e.preventDefault();
            router.push(spot.url);
          });
          card.append(title, meta, link);

          // Not attached with setPopup: cards are opened here, so a click, a tap, Enter/Space and the list's
          // "show on map" button all go one way, and closed by a map click outside any marker (below).
          const popup = new maplibregl.Popup({ offset: 12, closeButton: false, closeOnClick: false, maxWidth: "220px", focusAfterOpen: false })
            .setLngLat([spot.lng, spot.lat])
            .setDOMContent(card);
          const marker = new maplibregl.Marker({ element: dot }).setLngLat([spot.lng, spot.lat]).addTo(m);
          const open = (scrollRow: boolean) => {
            markers.forEach((other) => other.popup !== popup && other.popup.remove());
            if (!popup.isOpen()) popup.addTo(m);
            highlightRow(spot.id, scrollRow);
          };
          dot.addEventListener("click", () => open(true));
          dot.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            open(true);
          });
          markers.set(spot.id, { marker, popup, open });
        }

        // Checked a moment after the map stops; "moveend" is not sent for every way of panning. Only moves the
        // person made count (they carry an originalEvent), not the first fit or a "show on map" flight.
        m.on("move", (e) => {
          if (!e.originalEvent && !settle) return;
          clearTimeout(settle);
          settle = setTimeout(() => {
            settle = undefined;
            const c = m.getCenter();
            const now = { lat: c.lat, lng: c.lng };
            // offer a new search once the view has left the searched area by a fair bit
            setMoved(inKorea(now) && kmBetween(center, now) > Math.max(radiusKm * 0.3, 0.3) ? now : null);
          }, 250);
        });
        m.on("click", (e) => {
          const target = e.originalEvent.target;
          if (target instanceof Element && target.closest(".maplibregl-marker")) return;
          markers.forEach((x) => x.popup.remove());
        });
        window.addEventListener(FOCUS_EVENT, onFocus);
      })
      .catch(fail);

    return () => {
      cancelled = true;
      clearTimeout(settle);
      clearTimeout(watchdog);
      window.removeEventListener(FOCUS_EVENT, onFocus);
      document.body.removeAttribute(FAILED_ATTR);
      map?.remove();
    };
  }, [center.lat, center.lng, fromMap, radiusKm, spots, lang, labels, router]); // eslint-disable-line react-hooks/exhaustive-deps -- center is compared by value

  const searchHere = () => {
    if (!moved) return;
    const p = new URLSearchParams({ lat: String(round(moved.lat)), lng: String(round(moved.lng)), src: "map" });
    if (radiusKm !== DEFAULT_NEARBY_RADIUS) p.set("radius", String(radiusKm));
    if (category) p.set("category", category);
    startTransition(() => router.push(href(lang, `/nearby?${p}`), { scroll: false }));
  };

  return (
    <div className="relative">
      {/* fixed height, so the list below does not jump when the map arrives */}
      <div
        ref={failed ? undefined : box}
        className="flex h-[clamp(220px,42svh,340px)] w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-sand lg:h-[calc(100svh-8rem)]"
      >
        {/* the box keeps its size when there is no map (no WebGL, tiles blocked), so the list does not jump up */}
        {failed && <p className="px-6 text-center text-sm text-muted">{labels.failed}</p>}
      </div>
      {moved && !failed && (
        <button
          type="button"
          onClick={searchHere}
          disabled={pending}
          className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-surface px-4 py-1.5 text-sm font-semibold text-accent shadow-md disabled:opacity-60"
        >
          {labels.searchHere}
        </button>
      )}
    </div>
  );
}
