import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { API_ORIGIN } from "./api";

export const PROVIDERS = ["google", "kakao"] as const;
export type Provider = (typeof PROVIDERS)[number];
export const isProvider = (v: unknown): v is Provider => typeof v === "string" && (PROVIDERS as readonly string[]).includes(v);

// One sign-in attempt, kept in an httpOnly cookie between leaving for the provider and coming back
export const ATTEMPT_COOKIE = "wl_oauth";
export type Attempt = { provider: Provider; state: string; verifier: string; lang: string; next: string };

const b64url = (b: Buffer) => b.toString("base64url");

export function newAttempt(provider: Provider, lang: string, next: string): Attempt & { challenge: string } {
  const verifier = b64url(randomBytes(48));
  return {
    provider,
    lang,
    next,
    state: b64url(randomBytes(24)),
    verifier,
    challenge: b64url(createHash("sha256").update(verifier).digest()),
  };
}

export function sameState(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// The providers the API has keys for; none (and no buttons) when the API is down or predates sign-in
export async function getProviders(): Promise<Provider[]> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/auth/oauth/providers`, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const list = (await res.json()) as unknown;
    return Array.isArray(list) ? list.filter(isProvider) : [];
  } catch {
    return [];
  }
}
