import "server-only";
import { cookies, headers } from "next/headers";
import { href, splitLocale, type Locale } from "./i18n";

// The API's JWT lives only here, in an httpOnly cookie on the web origin.
// Browser scripts never see it; Server Actions and server components forward it to the API.
// In production the name carries the __Host- prefix: the browser then only accepts it from this exact host, over
// HTTPS, for the whole path. sslip.io is not on the Public Suffix List, so without it any *.sslip.io site could
// plant a session cookie for ours (logging a visitor into someone else's account). Local http keeps the plain name.
const COOKIE = process.env.NODE_ENV === "production" ? "__Host-wl_session" : "wl_session";

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

export async function setSession(token: string, expiresInSeconds: number) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(0, Math.floor(expiresInSeconds) - 30),
  });
}

// Set to empty with the same attributes: the browser ignores a __Host- cookie (even an expiring one) without Secure
export async function clearSession() {
  (await cookies()).set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Every request reaches the API from this server, so the visitor's address is passed on for the API's per-IP limits.
// Next keeps an X-Forwarded-For the browser sent, so no incoming header is trusted unless CLIENT_IP_HEADER names one
// that our own reverse proxy overwrites (e.g. nginx `proxy_set_header X-Real-IP $remote_addr`). Without it nothing is
// sent and the API sees this server's address: one shared limit, stricter, never bypassable.
export async function clientAddress(): Promise<string | undefined> {
  const name = process.env.CLIENT_IP_HEADER;
  if (!name) return undefined;
  const value = (await headers()).get(name)?.trim();
  return value && /^[0-9a-fA-F:.]{2,45}$/.test(value) ? value : undefined;
}

// Only same-site paths are allowed as a post-login target. A path without a locale gets the current one,
// so the visitor lands on a page directly instead of going through the proxy's redirect.
export function safeNext(value: unknown, lang: Locale): string {
  const home = `/${lang}`;
  if (typeof value !== "string" || value.length > 300) return home;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return home;
  if (/[\u0000-\u001f]/.test(value)) return home;
  // a doubled slash or a dot segment later in the path can turn into "//host" once a browser normalizes it
  if (value.includes("//") || /\/\.\.?(\/|$|\?|#)/.test(value)) return home;
  return splitLocale(value).lang ? value : href(lang, value);
}
