import { call, getMe } from "@/lib/api-auth";

const MAX_BYTES = 5 * 1024 * 1024;

// Admin photo upload. A route handler rather than a Server Action: an action's body size limit is global,
// and raising it to 5 MB for this would let anyone post 5 MB to the login form too. Here the size and the
// admin are checked before the body is read.
export async function POST(req: Request, { params }: RouteContext<"/api/admin/photos/[id]">) {
  // the session cookie rides along on cross-site posts, so only this site's own pages may call this
  const origin = req.headers.get("origin");
  if (!origin || new URL(origin).host !== req.headers.get("host")) return Response.json({ error: "origin" }, { status: 403 });

  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) return Response.json({ error: "id" }, { status: 404 });
  const length = Number(req.headers.get("content-length"));
  if (!Number.isFinite(length) || length <= 0 || length > MAX_BYTES + 64 * 1024) {
    return Response.json({ error: "size" }, { status: 413 });
  }
  const me = await getMe().catch(() => null);
  if (!me?.admin) return Response.json({ error: "forbidden" }, { status: 403 });

  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_BYTES) return Response.json({ error: "photo" }, { status: 400 });
  const upload = new FormData();
  upload.set("file", file, "photo.jpg");
  const r = await call(`/api/admin/spots/${id}/photos`, { method: "POST", form: upload });
  if (r.ok) return Response.json({ ok: true });
  const error = r.status === 400 && r.detail?.includes("at most") ? "tooMany" : r.status === 400 ? "photo" : "failed";
  return Response.json({ error }, { status: r.status });
}
