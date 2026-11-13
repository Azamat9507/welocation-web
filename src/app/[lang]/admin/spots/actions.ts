"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { ACTIVITIES, CATEGORIES, REGIONS, type SpotDetail } from "@/lib/api";
import { call } from "@/lib/api-auth";
import { getDictionary } from "@/lib/dictionaries";
import { href, toLocale } from "@/lib/i18n";

export type SpotFormState = { error?: string; values?: Record<string, string> };
export type PhotoState = { error?: string };
export type GeocodeHit = { latitude: number; longitude: number; label: string };

function idOf(v: unknown): number {
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 1) throw new Error("bad spot id");
  return v;
}

const text = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
};

// "37.2854, 127.0215" as typed or pasted from a map; Korea only, like the API checks
function parseCoords(raw: string): { latitude: number; longitude: number } | null {
  const m = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(raw);
  if (!m) return null;
  const latitude = Number(m[1]);
  const longitude = Number(m[2]);
  if (latitude < 33 || latitude > 39 || longitude < 124 || longitude > 132.5) return null;
  return { latitude, longitude };
}

// Creates (spotId null) or updates a hand-added spot. The API checks the admin role on every call.
export async function saveSpot(spotIdArg: number | null, _prev: SpotFormState, form: FormData): Promise<SpotFormState> {
  const spotId = spotIdArg === null ? null : idOf(spotIdArg);
  const lang = toLocale(form.get("lang"));
  const t = (await getDictionary(lang)).admin;
  const values = Object.fromEntries(
    ["name", "category", "activity", "region", "address", "coords", "description"].map((k) => [k, text(form, k)]),
  );
  const pick = <T extends string>(v: string, allowed: readonly T[]) => ((allowed as readonly string[]).includes(v) ? (v as T) : null);
  const category = pick(values.category, CATEGORIES);
  const coords = parseCoords(values.coords);
  if (!values.name || !values.address || !category) return { error: t.failed, values };
  if (!coords) return { error: t.badCoords, values };

  const body = {
    name: values.name.slice(0, 200),
    category,
    activity: category === "LEISURE" ? pick(values.activity, ACTIVITIES) : null,
    region: pick(values.region, REGIONS),
    address: values.address.slice(0, 300),
    latitude: coords.latitude,
    longitude: coords.longitude,
    description: values.description.slice(0, 2000) || null,
  };
  const r = spotId === null
    ? await call<SpotDetail>("/api/admin/spots", { method: "POST", body })
    : await call<SpotDetail>(`/api/admin/spots/${spotId}`, { method: "PUT", body });
  if (!r.ok) {
    if (r.status === 400 && r.detail?.startsWith("region")) return { error: t.needRegion, values };
    return { error: t.failed, values };
  }
  // a new place goes straight to its edit form, where the photos are added
  redirect(href(lang, `/admin/spots?edit=${r.data.id}&saved=1`));
}

export async function deleteSpot(spotIdArg: number, langArg: unknown): Promise<PhotoState> {
  const spotId = idOf(spotIdArg);
  const lang = toLocale(langArg);
  const t = (await getDictionary(lang)).admin;
  const r = await call(`/api/admin/spots/${spotId}`, { method: "DELETE" });
  if (r.status === 409) return { error: t.deleteBlocked };
  if (!r.ok) return { error: t.failed };
  redirect(href(lang, "/admin/spots"));
}

export async function removePhoto(spotIdArg: number, url: unknown, langArg: unknown): Promise<PhotoState> {
  const spotId = idOf(spotIdArg);
  const t = (await getDictionary(toLocale(langArg))).admin;
  const name = typeof url === "string" ? /^\/photos\/([0-9a-f]{32}\.jpg)$/.exec(url)?.[1] : undefined;
  if (!name) return { error: t.failed };
  const r = await call(`/api/admin/spots/${spotId}/photos/${name}`, { method: "DELETE" });
  if (!r.ok) return { error: t.failed };
  refresh();
  return {};
}

export async function geocode(address: unknown): Promise<GeocodeHit[] | null> {
  const q = typeof address === "string" ? address.trim().slice(0, 200) : "";
  if (!q) return [];
  const r = await call<GeocodeHit[]>(`/api/admin/geocode?q=${encodeURIComponent(q)}`);
  return r.ok ? r.data : null;
}
