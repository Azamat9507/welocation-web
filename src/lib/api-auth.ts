import "server-only";
import { cache } from "react";
import { API_ORIGIN, type Page, type Review, type SpotSummary } from "./api";
import { clientAddress, getToken } from "./session";

export type User = { id: number; email: string; nickname: string };
export type MyReview = { id: number; rating: number; content: string };
export type MyState = { liked: boolean; bookmarked: boolean; reviewId: number | null; review?: MyReview | null };
export type ApiResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number; detail?: string };

type Options = { method?: string; body?: unknown; token?: string | null };

// One place that talks to the API on behalf of the visitor
export async function call<T>(path: string, { method = "GET", body, token }: Options = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const auth = token === undefined ? await getToken() : token;
  if (auth) headers.Authorization = `Bearer ${auth}`;
  const ip = await clientAddress();
  if (ip) headers["X-Forwarded-For"] = ip;

  const res = await fetch(API_ORIGIN + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
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

// The visitor's own review of a spot, wherever it sits in the newest-first list.
// Uses the API's answer when it includes the review, otherwise looks through a few pages.
export async function findMyReview(spotId: number, me: User, firstPage: Review[]): Promise<MyReview | undefined> {
  const state = await getMyState(spotId);
  if (state?.review) return state.review;
  if (state && state.reviewId === null) return undefined;
  const match = (r: Review) => (state?.reviewId != null ? r.id === state.reviewId : r.author.id === me.id);
  const pick = (r?: Review) => (r ? { id: r.id, rating: r.rating, content: r.content } : undefined);
  const hit = firstPage.find(match);
  if (hit || !state) return pick(hit);
  for (let page = 0; page < 4; page++) {
    const r = await call<Page<Review>>(`/api/spots/${spotId}/reviews?page=${page}&size=50`, { token: null });
    if (!r.ok) return undefined;
    const found = r.data.items.find(match);
    if (found) return pick(found);
    if (page + 1 >= r.data.totalPages) return undefined;
  }
  return undefined;
}

export async function getMyBookmarks(page: number): Promise<Page<SpotSummary> | null> {
  const r = await call<Page<SpotSummary>>(`/api/me/bookmarks?page=${page - 1}&size=20`);
  if (r.ok) return r.data;
  if (r.status === 401) return null;
  throw new Error(`API ${r.status} for /api/me/bookmarks`);
}

export type { Review };
