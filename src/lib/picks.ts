import "server-only";
import { cacheLife } from "next/cache";
import { API_ORIGIN, type SpotDetail, type SpotSummary } from "./api";

async function fetchPick(id: number): Promise<SpotSummary | null> {
  "use cache";
  cacheLife("hours");
  const res = await fetch(`${API_ORIGIN}/api/spots/${id}`, { headers: { Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} for /api/spots/{id}`);
  const d = (await res.json()) as SpotDetail;
  return { ...d, thumbnailUrl: d.images[0] ?? null, photos: d.images.slice(0, 4) };
}

// Hand-picked spots in the given order; one that is gone or fails is left out
export async function getPicks(ids: number[]): Promise<SpotSummary[]> {
  const spots = await Promise.all(ids.map((id) => fetchPick(id).catch(() => null)));
  return spots.filter((s): s is SpotSummary => s !== null);
}
