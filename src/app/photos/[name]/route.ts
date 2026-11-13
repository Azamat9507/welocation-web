import { API_ORIGIN } from "@/lib/api";

// Photos admins uploaded live on the API server, which the browser never talks to directly.
// The name is random and the file never changes, so browsers may keep it for a year.
export async function GET(_req: Request, { params }: RouteContext<"/photos/[name]">) {
  const { name } = await params;
  if (!/^[0-9a-f]{32}\.jpg$/.test(name)) return new Response(null, { status: 404 });
  const res = await fetch(`${API_ORIGIN}/api/spots/photos/${name}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) }).catch(() => null);
  if (!res?.ok || !res.body) return new Response(null, { status: res?.status === 404 ? 404 : 502 });
  return new Response(res.body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
