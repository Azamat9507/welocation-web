"use server";

import { refresh } from "next/cache";
import { call } from "@/lib/api-auth";
import { getDictionary } from "@/lib/dictionaries";
import { toLocale } from "@/lib/i18n";

export type ShortsFormState = { ok?: boolean; error?: string; url?: string };

function spotIdOf(v: unknown): number {
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 1) throw new Error("bad spot id");
  return v;
}

// The API decides who is an admin; a visitor who isn't gets 403 and this message, nothing else
export async function saveShorts(spotIdArg: number, _prev: ShortsFormState, form: FormData): Promise<ShortsFormState> {
  const spotId = spotIdOf(spotIdArg);
  const t = (await getDictionary(toLocale(form.get("lang")))).admin;
  const raw = form.get("url");
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url || url.length > 200) return { error: t.badUrl, url };
  const r = await call(`/api/admin/spots/${spotId}/shorts`, { method: "PUT", body: { url } });
  if (r.status === 400) return { error: t.badUrl, url };
  if (!r.ok) return { error: t.failed, url };
  refresh();
  return { ok: true };
}

export async function removeShorts(spotIdArg: number, langArg: unknown): Promise<ShortsFormState> {
  const spotId = spotIdOf(spotIdArg);
  const t = (await getDictionary(toLocale(langArg))).admin;
  const r = await call(`/api/admin/spots/${spotId}/shorts`, { method: "DELETE" });
  if (!r.ok) return { error: t.failed };
  refresh();
  return { ok: true };
}
