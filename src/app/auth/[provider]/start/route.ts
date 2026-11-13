import { cookies } from "next/headers";
import { API_ORIGIN } from "@/lib/api";
import { toLocale } from "@/lib/i18n";
import { ATTEMPT_COOKIE, isProvider, newAttempt } from "@/lib/oauth";
import { safeNext } from "@/lib/session";

// /auth/google/start?lang=uz&next=/uz/me -> the provider's consent page.
// A fresh state and PKCE verifier per attempt, kept in a short-lived httpOnly cookie.
// A relative Location for our own pages: behind nginx, req.url names the internal host (localhost:3000),
// so an absolute URL built from it would send the visitor off the site
const to = (location: string) => new Response(null, { status: 302, headers: { Location: location } });

export async function GET(req: Request, ctx: RouteContext<"/auth/[provider]/start">) {
  const { provider } = await ctx.params;
  const url = new URL(req.url);
  const lang = toLocale(url.searchParams.get("lang"));
  const fail = () => to(`/${lang}/login?error=oauth`);
  if (!isProvider(provider)) return fail();

  const attempt = newAttempt(provider, lang, safeNext(url.searchParams.get("next"), lang));
  const qs = new URLSearchParams({ state: attempt.state, codeChallenge: attempt.challenge });
  const target = await fetch(`${API_ORIGIN}/api/auth/oauth/${provider}/authorize?${qs}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  })
    .then(async (res) => (res.ok ? ((await res.json()) as { url?: unknown }).url : undefined))
    .catch(() => undefined);
  // only ever send the visitor to the provider's own sign-in host (OAUTH_TEST_HOST: a stand-in for local tests)
  const allowed = [provider === "google" ? "accounts.google.com" : "kauth.kakao.com", process.env.OAUTH_TEST_HOST];
  if (typeof target !== "string" || !URL.canParse(target) || !allowed.includes(new URL(target).host)) return fail();

  const stored = { provider: attempt.provider, state: attempt.state, verifier: attempt.verifier, lang: attempt.lang, next: attempt.next };
  (await cookies()).set(ATTEMPT_COOKIE, JSON.stringify(stored), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // lax: the cookie must come along when the provider sends the browser back (a top-level GET)
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return to(target);
}
