"use server";

import { call } from "@/lib/api-auth";
import { getDictionary } from "@/lib/dictionaries";
import { fill, toLocale } from "@/lib/i18n";
import { clearSession, getToken } from "@/lib/session";
import { MAX_QUESTION, type GuideResponse, type GuideState } from "./types";

export async function askGuide(_prev: GuideState, form: FormData): Promise<GuideState> {
  const lang = toLocale(form.get("lang"));
  const t = await getDictionary(lang);
  const e = t.guide.errors;
  const raw = form.get("question");
  const question = typeof raw === "string" ? raw.trim() : "";
  if (!question) return { error: e.empty, question };
  if (question.length > MAX_QUESTION) return { error: fill(e.tooLong, { n: MAX_QUESTION }), question };
  if (!(await getToken())) return { login: true, question };

  let r;
  try {
    r = await call<GuideResponse>("/api/guide", { method: "POST", body: { question, lang } });
  } catch {
    return { error: e.connect, question };
  }
  if (r.ok) return { question, result: normalize(r.data) };
  if (r.status === 401) {
    await clearSession();
    return { login: true, question };
  }
  if (r.status === 429) return { error: e.quota, question };
  if (r.status === 503) return { error: e.unavailable, question };
  if (r.status === 400) return { error: fill(e.badRequest, { n: MAX_QUESTION }), question };
  if (r.status >= 500) return { error: t.errors.server, question };
  return { error: e.failed, question };
}

// Only what the page needs, and nothing unexpected if the API sends a partial body
function normalize(data: GuideResponse | undefined): GuideResponse {
  const spots = Array.isArray(data?.spots) ? data.spots.filter((p) => p?.spot && Number.isSafeInteger(p.spot.id)) : [];
  const route = Array.isArray(data?.route) ? data.route.filter((s) => s?.spot && Number.isSafeInteger(s.spot.id)) : null;
  return {
    answer: typeof data?.answer === "string" ? data.answer : "",
    spots: spots.map((p) => ({ spot: p.spot, reason: typeof p.reason === "string" ? p.reason : "" })),
    route: route && route.length > 0 ? route : null,
  };
}
