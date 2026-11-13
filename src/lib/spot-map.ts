import "server-only";
import { cacheLife } from "next/cache";
import { API_ORIGIN, type SpotMap } from "./api";

// Changes once a night with the sync, so one copy serves every visitor for an hour.
// A failed call throws inside the cache, so an API restart doesn't leave the home page without a map for an hour.
async function fetchSpotMap(): Promise<SpotMap | null> {
  "use cache";
  cacheLife("hours");
  const res = await fetch(`${API_ORIGIN}/api/spots/map`, { headers: { Accept: "application/json" } });
  // an API build without the endpoint reads "map" as a spot id: no map then
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} for /api/spots/map`);
  return (await res.json()) as SpotMap;
}

export const getSpotMap = () => fetchSpotMap().catch(() => null);
