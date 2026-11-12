"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { call } from "@/lib/api-auth";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import { href, toLocale, type Locale } from "@/lib/i18n";
import { clearSession, getToken, safeNext, setSession } from "@/lib/session";

export type FormState = { error?: string; values?: Record<string, string> };

type TokenResponse = { accessToken: string; tokenType: string; expiresIn: number };

// the API (bcrypt) limits passwords to 72 bytes, not characters
const bytes = (s: string) => new TextEncoder().encode(s).length;

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v : "";
};

// Action arguments come from the browser like any other input
function spotIdOf(v: unknown): number {
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < 1) throw new Error("bad spot id");
  return v;
}

function failMessage(t: Dictionary, status: number, fallback: string) {
  if (status === 429) return t.errors.tooMany;
  if (status >= 500) return t.errors.server;
  return fallback;
}

// The forms send their page's locale; Server Actions cannot read the route's root params
async function localeOf(form: FormData) {
  const lang = toLocale(form.get("lang"));
  return { lang, t: await getDictionary(lang) };
}

async function startSession(email: string, password: string): Promise<number> {
  const r = await call<TokenResponse>("/api/auth/login", { method: "POST", body: { email, password }, token: null });
  if (!r.ok) return r.status;
  await setSession(r.data.accessToken, r.data.expiresIn);
  return 0;
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const { lang, t } = await localeOf(form);
  const email = str(form, "email").trim();
  const password = str(form, "password");
  const values = { email };
  if (!email || !password || email.length > 254 || bytes(password) > 72) {
    return { error: t.errors.checkCredentials, values };
  }
  const status = await startSession(email, password);
  if (status === 401 || status === 400) return { error: t.errors.wrongCredentials, values };
  if (status) return { error: failMessage(t, status, t.errors.loginFailed), values };
  redirect(safeNext(form.get("next"), lang));
}

export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  const { lang, t } = await localeOf(form);
  const email = str(form, "email").trim();
  const nickname = str(form, "nickname").trim();
  const password = str(form, "password");
  const values = { email, nickname };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: t.errors.badEmail, values };
  if (!nickname || nickname.length > 30) return { error: t.errors.nicknameLength, values };
  if (password.length < 8) return { error: t.errors.passwordShort, values };
  if (bytes(password) > 72) return { error: t.errors.passwordLong, values };

  const r = await call("/api/auth/signup", { method: "POST", body: { email, password, nickname }, token: null });
  if (!r.ok) {
    if (r.status === 409) return { error: t.errors.emailTaken, values };
    if (r.status === 400) return { error: t.errors.checkInput, values };
    return { error: failMessage(t, r.status, t.errors.signupFailed), values };
  }
  const status = await startSession(email, password);
  const next = safeNext(form.get("next"), lang);
  if (status) redirect(`/${lang}/login?next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function logout(langArg: unknown) {
  await clearSession();
  redirect(`/${toLocale(langArg)}`);
}

// Logged out or the 30-minute token ran out: send the visitor to log in and come back
async function toLogin(spotId: number, lang: Locale): Promise<never> {
  await clearSession();
  redirect(`/${lang}/login?next=${encodeURIComponent(href(lang, `/spots/${spotId}`))}`);
}

// on is missing when the call failed: the button keeps whatever it showed before
export type ToggleResult = { on?: boolean; count?: number; error?: string };

export async function setLike(spotIdArg: number, on: boolean, langArg: unknown): Promise<ToggleResult> {
  const spotId = spotIdOf(spotIdArg);
  const lang = toLocale(langArg);
  if (!(await getToken())) return toLogin(spotId, lang);
  const r = await call<{ liked: boolean; likeCount: number }>(`/api/spots/${spotId}/like`, {
    method: on ? "POST" : "DELETE",
  });
  if (r.status === 401) return toLogin(spotId, lang);
  if (!r.ok) {
    const t = await getDictionary(lang);
    return { error: failMessage(t, r.status, t.errors.actionFailed) };
  }
  refresh();
  return { on: r.data.liked, count: r.data.likeCount };
}

export async function setBookmark(spotIdArg: number, on: boolean, langArg: unknown): Promise<ToggleResult> {
  const spotId = spotIdOf(spotIdArg);
  const lang = toLocale(langArg);
  if (!(await getToken())) return toLogin(spotId, lang);
  const r = await call(`/api/spots/${spotId}/bookmark`, { method: on ? "POST" : "DELETE" });
  if (r.status === 401) return toLogin(spotId, lang);
  if (!r.ok) {
    const t = await getDictionary(lang);
    return { error: failMessage(t, r.status, t.errors.actionFailed) };
  }
  return { on };
}

export async function saveReview(
  spotIdArg: number,
  reviewId: number | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const spotId = spotIdOf(spotIdArg);
  if (reviewId !== null) spotIdOf(reviewId);
  const { lang, t } = await localeOf(form);
  if (!(await getToken())) return toLogin(spotId, lang);

  const rating = Number(str(form, "rating"));
  const content = str(form, "content").trim();
  const values = { rating: str(form, "rating"), content };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: t.errors.pickRating, values };
  if (!content || content.length > 1000) return { error: t.errors.reviewLength, values };

  const r = await call(reviewId === null ? `/api/spots/${spotId}/reviews` : `/api/reviews/${reviewId}`, {
    method: reviewId === null ? "POST" : "PUT",
    body: { rating, content },
  });
  if (r.status === 401) return toLogin(spotId, lang);
  if (!r.ok) {
    if (r.status === 409) return { error: t.errors.reviewExists, values };
    if (r.status === 403) return { error: t.errors.notYourReview, values };
    return { error: failMessage(t, r.status, t.errors.reviewSaveFailed), values };
  }
  refresh();
  return {};
}

export async function deleteReview(spotIdArg: number, reviewIdArg: number, langArg: unknown): Promise<FormState> {
  const spotId = spotIdOf(spotIdArg);
  const reviewId = spotIdOf(reviewIdArg);
  const lang = toLocale(langArg);
  if (!(await getToken())) return toLogin(spotId, lang);
  const r = await call(`/api/reviews/${reviewId}`, { method: "DELETE" });
  if (r.status === 401) return toLogin(spotId, lang);
  if (!r.ok && r.status !== 404) {
    const t = await getDictionary(lang);
    return { error: failMessage(t, r.status, t.errors.reviewDeleteFailed) };
  }
  refresh();
  return {};
}
