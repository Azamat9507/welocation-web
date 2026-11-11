import "server-only";
import { API_ORIGIN, type Page, type Review, type SpotSummary } from "./api";
import { clientAddress, getToken } from "./session";

export type User = { id: number; email: string; nickname: string };
export type MyState = { liked: boolean; bookmarked: boolean; reviewId: number | null };
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

// null = not logged in, or the token is no longer accepted
export async function getMe(): Promise<User | null> {
  if (!(await getToken())) return null;
  const r = await call<User>("/api/me");
  if (r.ok) return r.data;
  if (r.status === 401) return null;
  throw new Error(`API ${r.status} for /api/me`);
}

// The API may not have this endpoint yet: then the state is simply unknown
export async function getMyState(spotId: number): Promise<MyState | null> {
  const r = await call<MyState>(`/api/me/spots/${spotId}`);
  return r.ok ? r.data : null;
}

export async function getMyBookmarks(page: number): Promise<Page<SpotSummary> | null> {
  const r = await call<Page<SpotSummary>>(`/api/me/bookmarks?page=${page - 1}&size=20`);
  if (r.ok) return r.data;
  if (r.status === 401) return null;
  throw new Error(`API ${r.status} for /api/me/bookmarks`);
}

export type { Review };
