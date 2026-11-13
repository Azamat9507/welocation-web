import { cookies } from "next/headers";
import { call } from "@/lib/api-auth";
import { toLocale } from "@/lib/i18n";
import { ATTEMPT_COOKIE, isProvider, sameState, type Attempt } from "@/lib/oauth";
import { safeNext, setSession } from "@/lib/session";

type Token = { accessToken: string; expiresIn: number };

// The provider sends the browser back here with ?code&state. The state must match this browser's attempt
// cookie (so nobody can log a visitor into an account of theirs), then the API trades the code for a token.
// A relative Location for our own pages: behind nginx, req.url names the internal host (localhost:3000),
// so an absolute URL built from it would send the visitor off the site
const to = (location: string) => new Response(null, { status: 302, headers: { Location: location } });

export async function GET(req: Request, ctx: RouteContext<"/auth/[provider]/callback">) {
  const { provider } = await ctx.params;
  const url = new URL(req.url);
  const jar = await cookies();
  const raw = jar.get(ATTEMPT_COOKIE)?.value;
  jar.delete({ name: ATTEMPT_COOKIE, path: "/auth" });

  let attempt: Attempt | null = null;
  try {
    attempt = raw ? (JSON.parse(raw) as Attempt) : null;
  } catch {
    attempt = null;
  }
  const lang = toLocale(attempt?.lang);
  const fail = (reason: string) => to(`/${lang}/login?error=${reason}`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  // the visitor pressed "cancel" on the provider's page
  if (url.searchParams.get("error")) return fail("oauthCancelled");
  if (!attempt || !isProvider(provider) || attempt.provider !== provider || !code || code.length > 2048) return fail("oauth");
  if (typeof attempt.state !== "string" || !sameState(state, attempt.state)) return fail("oauth");

  const r = await call<Token>(`/api/auth/oauth/${provider}`, {
    method: "POST",
    body: { code, codeVerifier: attempt.verifier },
    token: null,
  });
  if (!r.ok) return fail("oauth");
  await setSession(r.data.accessToken, r.data.expiresIn);
  return to(safeNext(attempt.next, lang));
}
