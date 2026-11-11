"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { call } from "@/lib/api-auth";
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

function failMessage(status: number, fallback: string) {
  if (status === 429) return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  if (status >= 500) return "서버에 문제가 있어요. 잠시 후 다시 시도해 주세요.";
  return fallback;
}

async function startSession(email: string, password: string): Promise<number> {
  const r = await call<TokenResponse>("/api/auth/login", { method: "POST", body: { email, password }, token: null });
  if (!r.ok) return r.status;
  await setSession(r.data.accessToken, r.data.expiresIn);
  return 0;
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").trim();
  const password = str(form, "password");
  const values = { email };
  if (!email || !password || email.length > 254 || bytes(password) > 72) {
    return { error: "이메일과 비밀번호를 확인해 주세요.", values };
  }
  const status = await startSession(email, password);
  if (status === 401 || status === 400) return { error: "이메일 또는 비밀번호가 맞지 않아요.", values };
  if (status) return { error: failMessage(status, "로그인하지 못했어요."), values };
  redirect(safeNext(form.get("next")));
}

export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email").trim();
  const nickname = str(form, "nickname").trim();
  const password = str(form, "password");
  const values = { email, nickname };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { error: "이메일 형식이 아니에요.", values };
  if (!nickname || nickname.length > 30) return { error: "닉네임은 1~30자로 입력해 주세요.", values };
  if (password.length < 8) return { error: "비밀번호는 8자 이상 입력해 주세요.", values };
  if (bytes(password) > 72) return { error: "비밀번호가 너무 길어요. 조금 줄여 주세요.", values };

  const r = await call("/api/auth/signup", { method: "POST", body: { email, password, nickname }, token: null });
  if (!r.ok) {
    if (r.status === 409) return { error: "이미 가입된 이메일이에요.", values };
    if (r.status === 400) return { error: "입력한 내용을 다시 확인해 주세요.", values };
    return { error: failMessage(r.status, "가입하지 못했어요."), values };
  }
  const status = await startSession(email, password);
  const next = safeNext(form.get("next"));
  if (status) redirect(`/login?next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function logout() {
  await clearSession();
  redirect("/");
}

// Logged out or the 30-minute token ran out: send the visitor to log in and come back
async function toLogin(spotId: number): Promise<never> {
  await clearSession();
  redirect(`/login?next=${encodeURIComponent(`/spots/${spotId}`)}`);
}

// on is missing when the call failed: the button keeps whatever it showed before
export type ToggleResult = { on?: boolean; count?: number; error?: string };

export async function setLike(spotIdArg: number, on: boolean): Promise<ToggleResult> {
  const spotId = spotIdOf(spotIdArg);
  if (!(await getToken())) return toLogin(spotId);
  const r = await call<{ liked: boolean; likeCount: number }>(`/api/spots/${spotId}/like`, {
    method: on ? "POST" : "DELETE",
  });
  if (r.status === 401) return toLogin(spotId);
  if (!r.ok) return { error: failMessage(r.status, "처리하지 못했어요.") };
  refresh();
  return { on: r.data.liked, count: r.data.likeCount };
}

export async function setBookmark(spotIdArg: number, on: boolean): Promise<ToggleResult> {
  const spotId = spotIdOf(spotIdArg);
  if (!(await getToken())) return toLogin(spotId);
  const r = await call(`/api/spots/${spotId}/bookmark`, { method: on ? "POST" : "DELETE" });
  if (r.status === 401) return toLogin(spotId);
  if (!r.ok) return { error: failMessage(r.status, "처리하지 못했어요.") };
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
  if (!(await getToken())) return toLogin(spotId);

  const rating = Number(str(form, "rating"));
  const content = str(form, "content").trim();
  const values = { rating: str(form, "rating"), content };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "별점을 골라 주세요.", values };
  if (!content || content.length > 1000) return { error: "리뷰는 1~1000자로 써 주세요.", values };

  const r = await call(reviewId === null ? `/api/spots/${spotId}/reviews` : `/api/reviews/${reviewId}`, {
    method: reviewId === null ? "POST" : "PUT",
    body: { rating, content },
  });
  if (r.status === 401) return toLogin(spotId);
  if (!r.ok) {
    if (r.status === 409) return { error: "이미 이 장소에 리뷰를 남겼어요. 기존 리뷰를 수정해 주세요.", values };
    if (r.status === 403) return { error: "내 리뷰만 수정할 수 있어요.", values };
    return { error: failMessage(r.status, "리뷰를 저장하지 못했어요."), values };
  }
  refresh();
  return {};
}

export async function deleteReview(spotIdArg: number, reviewIdArg: number): Promise<FormState> {
  const spotId = spotIdOf(spotIdArg);
  const reviewId = spotIdOf(reviewIdArg);
  if (!(await getToken())) return toLogin(spotId);
  const r = await call(`/api/reviews/${reviewId}`, { method: "DELETE" });
  if (r.status === 401) return toLogin(spotId);
  if (!r.ok && r.status !== 404) return { error: failMessage(r.status, "리뷰를 지우지 못했어요.") };
  refresh();
  return {};
}
