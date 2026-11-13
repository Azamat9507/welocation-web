"use client";

import { useActionState, useState, useTransition } from "react";
import { ACTIVITIES, CATEGORIES, REGIONS, type Activity, type Category, type Region } from "@/lib/api";
import type { Locale } from "@/lib/i18n";
import { geocode, saveSpot, type GeocodeHit, type SpotFormState } from "./actions";

export type SpotFormLabels = {
  name: string;
  category: string;
  activity: string;
  noActivity: string;
  region: string;
  regionAuto: string;
  address: string;
  findCoords: string;
  coords: string;
  coordsHint: string;
  checkMap: string;
  noCoords: string;
  failed: string;
  description: string;
  saveSpot: string;
  saved: string;
};

export type SpotFormValues = {
  name: string;
  category: Category;
  activity: Activity | "";
  region: Region | "";
  address: string;
  coords: string;
  description: string;
};

type Props = {
  spotId: number | null;
  initial: SpotFormValues;
  saved: boolean;
  lang: Locale;
  labels: SpotFormLabels;
  categories: Record<Category, string>;
  activities: Record<Activity, string>;
  regions: Record<Region, string>;
};

const field = "w-full rounded-lg border border-line bg-background px-2.5 py-1.5 text-sm";

function coordsOf(raw: string) {
  const m = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(raw);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132.5 ? { lat, lng } : null;
}

export function SpotForm({ spotId, initial, saved, lang, labels, categories, activities, regions }: Props) {
  const [state, action, pending] = useActionState<SpotFormState, FormData>(saveSpot.bind(null, spotId), {});
  const v = { ...initial, ...(state.values ?? {}) } as SpotFormValues;
  const [category, setCategory] = useState<Category>(v.category);
  const [address, setAddress] = useState(v.address);
  const [coords, setCoords] = useState(v.coords);
  const [hits, setHits] = useState<GeocodeHit[] | null>(null);
  const [geoError, setGeoError] = useState<string>();
  const [finding, startFind] = useTransition();
  const point = coordsOf(coords);

  return (
    <form action={action} className="mt-3 space-y-3">
      <input type="hidden" name="lang" value={lang} />
      <label className="block text-sm">
        {labels.name}
        <input name="name" defaultValue={v.name} required maxLength={200} className={field} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-sm">
          {labels.category}
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value as Category)} className={field}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categories[c]}
              </option>
            ))}
          </select>
        </label>
        {category === "LEISURE" && (
          <label className="block text-sm">
            {labels.activity}
            <select name="activity" defaultValue={v.activity} className={field}>
              <option value="">{labels.noActivity}</option>
              {ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {activities[a]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <label className="block text-sm">
        {labels.address}
        <input
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          maxLength={300}
          className={field}
        />
      </label>
      <label className="block text-sm">
        {labels.region}
        <select name="region" defaultValue={v.region} className={field}>
          <option value="">{labels.regionAuto}</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {regions[r]}
            </option>
          ))}
        </select>
      </label>

      <div className="text-sm">
        <div className="flex flex-wrap items-end gap-2">
          <label className="block min-w-48 flex-1">
            {labels.coords}
            <input
              name="coords"
              value={coords}
              onChange={(e) => setCoords(e.target.value)}
              required
              inputMode="decimal"
              placeholder="37.2854, 127.0215"
              className={field}
            />
          </label>
          <button
            type="button"
            disabled={finding || !address.trim()}
            onClick={() =>
              startFind(async () => {
                const found = await geocode(address);
                setGeoError(found === null ? labels.failed : found.length === 0 ? labels.noCoords : undefined);
                setHits(found && found.length > 0 ? found : null);
              })
            }
            className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50"
          >
            {labels.findCoords}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">{labels.coordsHint}</p>
        {geoError && <p className="mt-1 text-xs text-red-700">{geoError}</p>}
        {hits && (
          <ul className="mt-1 divide-y divide-line rounded-lg border border-line">
            {hits.map((h) => (
              <li key={`${h.latitude},${h.longitude}`}>
                <button
                  type="button"
                  onClick={() => {
                    setCoords(`${h.latitude.toFixed(6)}, ${h.longitude.toFixed(6)}`);
                    setHits(null);
                  }}
                  className="block w-full px-2.5 py-1.5 text-left text-xs hover:bg-surface"
                >
                  {h.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {point && (
          <a
            href={`https://map.kakao.com/link/map/${encodeURIComponent(address || "WeLocation")},${point.lat},${point.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs text-accent"
          >
            {labels.checkMap}
          </a>
        )}
      </div>

      <label className="block text-sm">
        {labels.description}
        <textarea name="description" defaultValue={v.description} maxLength={2000} rows={4} className={field} />
      </label>

      <button disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {labels.saveSpot}
      </button>
      {state.error && (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      )}
      {saved && !state.error && (
        <p role="status" className="text-xs text-accent">
          {labels.saved}
        </p>
      )}
    </form>
  );
}
