import { API_ORIGIN } from "@/lib/api";

// Kakao's unlink webhook (registered in the Kakao app as https://<site>/auth/kakao-unlink). Kakao calls it, by
// GET or POST, when someone disconnects WeLocation or deletes their Kakao account. The API is not public, so
// this passes the call on: the Authorization header (KakaoAK <admin key>) untouched, for the API to check.
// Kakao wants a 200 within 3 seconds and does not retry, so anything but a refused key answers 200.
const FIELDS = ["app_id", "user_id", "referrer_type"] as const;

async function forward(req: Request, params: URLSearchParams) {
  const authorization = req.headers.get("authorization");
  if (!authorization) return new Response(null, { status: 401 });

  const body = new URLSearchParams();
  for (const field of FIELDS) {
    const value = params.get(field);
    if (value) body.set(field, value.slice(0, 100));
  }
  const res = await fetch(`${API_ORIGIN}/api/auth/oauth/kakao/unlink`, {
    method: "POST",
    headers: { Authorization: authorization, "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(2_000),
    cache: "no-store",
  }).catch((error: unknown) => {
    console.error("kakao unlink: API call failed for Kakao user", body.get("user_id"), error);
    return null;
  });
  if (res && (res.status === 401 || res.status === 404)) return new Response(null, { status: res.status });
  // the Kakao id is enough to remove the user by hand
  if (res && !res.ok) console.error("kakao unlink: API answered", res.status, "for Kakao user", body.get("user_id"));
  return new Response(null, { status: 200 });
}

export async function GET(req: Request) {
  return forward(req, new URL(req.url).searchParams);
}

export async function POST(req: Request) {
  const params = new URLSearchParams((await req.text()).slice(0, 2_000));
  // the documented POST sends a form body; a field that came in the query string instead is taken from there
  for (const [key, value] of new URL(req.url).searchParams) if (!params.has(key)) params.set(key, value);
  return forward(req, params);
}
