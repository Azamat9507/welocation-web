import "server-only";
import { cache } from "react";
import { API_ORIGIN, type Page, type Review, type SpotSummary } from "./api";
import { clientAddress, getToken } from "./session";

// admin only picks which screens to show; the API checks the role again on every admin call
// email is null for a Kakao sign-up that shared no address
export type User = { id: number; email: string | null; nickname: string; admin?: boolean };
export type MyReview = { id: number; rating: number; content: string };
// review has the same shape as a review list item
export type MyState = { liked: boolean; bookmarked: boolean; review: Review | null };
export type ApiResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number; detail?: string };

// form: a multipart upload (admin photos); fetch sets its Content-Type with the boundary
type Options = { method?: string; body?: unknown; form?: FormData; token?: string | null };

// One place that talks to the API on behalf of the visitor
export async function call<T>(path: string, { method = "GET", body, form, token }: Options = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const auth = token === undefined ? await getToken() : token;
  if (auth) headers.Authorization = `Bearer ${auth}`;
  const ip = await clientAddress();
  if (ip) headers["X-Forwarded-For"] = ip;

  const res = await fetch(API_ORIGIN + path, {
    method,
    headers,
    body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }
  if (res.ok) return { ok: true, status: res.status, data: json as T };
  const detail = json && typeof json === "object" && "detail" in json ? String((json as { detail: unknown }).detail) : undefined;
  return { ok: false, status: res.status, detail };
}

// null = not logged in, or the token is no longer accepted. cache() = once per request, never shared between requests.
export const getMe = cache(async (): Promise<User | null> => {
  if (!(await getToken())) return null;
  const r = await call<User>("/api/me");
  if (r.ok) return r.data;
  if (r.status === 401) return null;
  throw new Error(`API ${r.status} for /api/me`);
});

// The API may not have this endpoint yet: then the state is simply unknown
export const getMyState = cache(async (spotId: number): Promise<MyState | null> => {
  const r = await call<MyState>(`/api/me/spots/${spotId}`);
  return r.ok ? r.data : null;
});

// The visitor's own review of a spot. Without the API's answer, only the first page of reviews can be searched.
export async function findMyReview(spotId: number, me: User, firstPage: Review[]): Promise<MyReview | undefined> {
  const state = await getMyState(spotId);
  const r = state ? state.review : firstPage.find((x) => x.author.id === me.id);
  return r ? { id: r.id, rating: r.rating, content: r.content } : undefined;
}

export async function getMyBookmarks(page: number): Promise<Page<SpotSummary> | null> {
  const r = await call<Page<SpotSummary>>(`/api/me/bookmarks?page=${page - 1}&size=20`);
  if (r.ok) return r.data;
  if (r.status === 401) return null;
  throw new Error(`API ${r.status} for /api/me/bookmarks`);
}

export type { Review };
