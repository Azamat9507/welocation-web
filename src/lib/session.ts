import "server-only";
import { cookies, headers } from "next/headers";
import { href, splitLocale, type Locale } from "./i18n";

// The API's JWT lives only here, in an httpOnly cookie on the web origin.
// Browser scripts never see it; Server Actions and server components forward it to the API.
const COOKIE = "wl_session";

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

export async function clearSession() {
  (await cookies()).delete(COOKIE);
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
