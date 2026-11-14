// Server-side only: pages and Server Actions fetch here; the browser never calls the API directly.
export const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8080";

// Labels for these keys live in the dictionaries (categories, regions, tags)
export const CATEGORIES = ["CAFE", "BEACH", "LAKE", "RIVER", "VIEWPOINT", "STAY", "LEISURE", "ATTRACTION"] as const;

export const REGIONS = [
  "SEOUL",
  "BUSAN",
  "DAEGU",
  "INCHEON",
  "GWANGJU",
  "DAEJEON",
  "ULSAN",
  "SEJONG",
  "GYEONGGI",
  "GANGWON",
  "CHUNGBUK",
  "CHUNGNAM",
  "JEONBUK",
  "JEONNAM",
  "GYEONGBUK",
  "GYEONGNAM",
  "JEJU",
] as const;

export const TAGS = ["OCEAN_VIEW", "LAKE_VIEW", "RIVER_VIEW", "NIGHT_VIEW", "ROOFTOP", "PET_FRIENDLY", "PARKING", "KIDS"] as const;

// What a LEISURE spot is for (SpotDtos activity); the API orders them the same way
export const ACTIVITIES = [
  "KART",
  "SHOOTING",
  "ARCHERY",
  "PAINTBALL",
  "SURVIVAL",
  "ATV",
  "OFF_ROAD",
  "BUNGEE",
  "JET_SKI",
  "KAYAK",
  "RAFTING",
  "SKYDIVING",
  "PARAGLIDING",
  "BALLOON",
  "THEME_PARK",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Activity = (typeof ACTIVITIES)[number];
export type Region = (typeof REGIONS)[number];
export type Tag = (typeof TAGS)[number];

export type SpotSummary = {
  id: number;
  name: string;
  category: Category;
  // LEISURE only; missing from API builds before activities
  activity?: Activity | null;
  region: Region;
  address: string;
  thumbnailUrl: string | null;
  tags: Tag[];
  // missing from API builds before likes (T5)
  likeCount?: number;
  reviewCount: number;
  averageRating: number | null;
  // first gallery photos, thumbnail first, for cards that flip through them; missing from older API builds
  photos?: string[];
};

export type SpotDetail = Omit<SpotSummary, "thumbnailUrl"> & {
  latitude: number;
  longitude: number;
  description: string | null;
  images: string[];
  // YouTube Shorts id an admin attached; missing from API builds before Shorts
  shortsVideoId?: string | null;
  // added by an admin, not from TourAPI: the photos are ours and the spot can be edited
  manual?: boolean;
  // dramas and films shot here; missing from API builds before scenes
  scenes?: SceneView[];
};

export type SceneKind = "DRAMA" | "MOVIE";

// scene: what happens at the spot in the work, in Korean (the source data has no other language)
export type SceneView = { work: string; kind: SceneKind; scene: string | null };

// GET /api/scenes/works (SpotDtos.Work), most spots first
export type Work = { title: string; kind: SceneKind; spotCount: number; coverUrl: string | null };

// GET /api/scenes?work= (SpotDtos.WorkSpots): spots with a photo first
export type WorkSpots = { work: Work; spots: { spot: SpotSummary; scene: string | null }[] };

// The API answers 400 above this length
export const WORK_MAX_LENGTH = 100;

// API builds before scenes answer 401 here (the path is not public there): no works then
export async function getWorks(): Promise<Work[]> {
  const res = await fetch(`${API_ORIGIN}/api/scenes/works`, { headers: { Accept: "application/json" } });
  if (res.status === 401 || res.status === 404) return [];
  if (!res.ok) throw new Error(`API ${res.status} for /api/scenes/works`);
  return res.json() as Promise<Work[]>;
}

export function getWork(title: string) {
  return get<WorkSpots>(`/api/scenes?${new URLSearchParams({ work: title })}`);
}

// GET /api/spots/shorts (SpotDtos.ShortsItem)
export type ShortsItem = {
  id: number;
  name: string;
  category: Category;
  region: Region;
  address: string;
  thumbnailUrl: string | null;
  videoId: string;
};

// The API only stores ids of this shape; checked again here because the id ends up in an iframe src
export const isVideoId = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_-]{11}$/.test(v);

// youtube-nocookie: no YouTube cookies until the visitor presses play
export const shortsEmbedUrl = (videoId: string, opts: { autoplay?: boolean; mute?: boolean } = {}) => {
  const p = new URLSearchParams({ playsinline: "1", rel: "0", loop: "1", playlist: videoId });
  if (opts.autoplay) p.set("autoplay", "1");
  if (opts.mute) p.set("mute", "1");
  return `https://www.youtube-nocookie.com/embed/${videoId}?${p}`;
};

export type Review = {
  id: number;
  rating: number;
  content: string;
  author: { id: number; nickname: string };
  createdAt: string;
};

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

// GET /api/spots/ranking/weekly (RankingDtos.WeeklyRanking): likes given since Monday 00:00 KST
export type RankedSpot = {
  rank: number;
  weeklyLikes: number;
  spot: SpotSummary;
};

export type WeeklyRanking = {
  // ISO week in Korean time, e.g. "2026-W46"
  week: string;
  items: RankedSpot[];
};

// scenes: false leaves drama and film locations out (the home page's newest row); not part of the page URL
export type SpotFilter = {
  region?: Region;
  category?: Category;
  activity?: Activity;
  tag?: Tag;
  q?: string;
  scenes?: false;
  page: number;
};

// The API answers 400 above this length
export const SEARCH_MAX_LENGTH = 50;

// URL query is user input: anything not on the lists is dropped instead of forwarded
export function parseFilter(q: Record<string, string | string[] | undefined>): SpotFilter {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const pick = <T extends string>(v: string | undefined, allowed: readonly T[]) =>
    v !== undefined && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
  const page = Number(one(q.page));
  return {
    region: pick(one(q.region), REGIONS),
    category: pick(one(q.category), CATEGORIES),
    activity: pick(one(q.activity), ACTIVITIES),
    tag: pick(one(q.tag), TAGS),
    q: one(q.q)?.trim().slice(0, SEARCH_MAX_LENGTH).trim() || undefined,
    page: Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1,
  };
}

export function filterQuery(f: Partial<SpotFilter>): string {
  const p = new URLSearchParams();
  if (f.region) p.set("region", f.region);
  if (f.category) p.set("category", f.category);
  if (f.activity) p.set("activity", f.activity);
  if (f.tag) p.set("tag", f.tag);
  if (f.q) p.set("q", f.q);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(API_ORIGIN + path, { headers: { Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} for ${path.split("?")[0]}`);
  return res.json() as Promise<T>;
}

export async function getSpots(f: SpotFilter, size = 20): Promise<Page<SpotSummary>> {
  const p = new URLSearchParams({ page: String(f.page - 1), size: String(size) });
  if (f.region) p.set("region", f.region);
  if (f.category) p.set("category", f.category);
  if (f.activity) p.set("activity", f.activity);
  if (f.tag) p.set("tag", f.tag);
  if (f.q) p.set("q", f.q);
  if (f.scenes === false) p.set("scenes", "false");
  return (await get<Page<SpotSummary>>(`/api/spots?${p}`))!;
}

export function getSpot(id: number) {
  return get<SpotDetail>(`/api/spots/${id}`);
}

// page is 0-based here, like the API's
export async function getShorts(page = 0, size = 20): Promise<Page<ShortsItem>> {
  const res = await fetch(`${API_ORIGIN}/api/spots/shorts?page=${page}&size=${size}`, { headers: { Accept: "application/json" } });
  // an API build without Shorts reads "shorts" as a spot id and answers 400 or 404: no videos then
  if (res.status === 400 || res.status === 404) return { items: [], page, size, totalElements: 0, totalPages: 0 };
  if (!res.ok) throw new Error(`API ${res.status} for /api/spots/shorts`);
  const r = (await res.json()) as Page<ShortsItem>;
  return { ...r, items: r.items.filter((i) => isVideoId(i.videoId)) };
}

export function getReviews(id: number) {
  return get<Page<Review>>(`/api/spots/${id}/reviews?page=0&size=10`);
}

// GET /api/spots/map (SpotDtos.SpotMap): every spot as [lat, lng], grouped by category, and counts per region
export type SpotMap = {
  total: number;
  points: Partial<Record<Category, [number, number][]>>;
  regions: Partial<Record<Region, number>>;
};

// Not cached: a like should show up on the next page load. The API answers from one Redis read.
export async function getWeeklyRanking(): Promise<WeeklyRanking> {
  const ranking = await get<WeeklyRanking>("/api/spots/ranking/weekly");
  if (!ranking) throw new Error("API 404 for /api/spots/ranking/weekly");
  return ranking;
}

// "2026-W46" -> Monday and Sunday of that ISO week as UTC dates, or null if the label is not one
export function isoWeekRange(label: string): { start: Date; end: Date } | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(label);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (week < 1 || week > 53) return null;
  // January 4th is always in week 1
  const jan4 = Date.UTC(year, 0, 4);
  const day = 24 * 60 * 60 * 1000;
  const monday1 = jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * day;
  const start = monday1 + (week - 1) * 7 * day;
  return { start: new Date(start), end: new Date(start + 6 * day) };
}

// GET /api/spots/nearby (SpotDtos.NearbySpot): nearest first
export type NearbySpot = {
  id: number;
  name: string;
  category: Category;
  region: Region;
  address: string;
  latitude: number;
  longitude: number;
  thumbnailUrl: string | null;
  distanceMeters: number;
};

export const NEARBY_RADII = [1, 3, 10, 30] as const;
export type NearbyRadius = (typeof NEARBY_RADII)[number];
export const DEFAULT_NEARBY_RADIUS: NearbyRadius = 3;

export type NearbyFilter = {
  // null until the browser has shared a location
  point: { lat: number; lng: number } | null;
  radius: NearbyRadius;
  category?: Category;
  // the point came from "search this area" on the map, not from the browser's location
  fromMap?: boolean;
};

// About 100 m: enough for a nearby list, and the URL never carries a precise location
export function roundCoord(v: number) {
  return Math.round(v * 1000) / 1000;
}

// Same rule as parseFilter: the query is user input, so only Korea-ish points and listed values pass
export function parseNearby(q: Record<string, string | string[] | undefined>): NearbyFilter {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const num = (v: string | undefined, min: number, max: number) => {
    if (v === undefined || !/^-?\d{1,3}(\.\d{1,15})?$/.test(v)) return undefined;
    const n = Number(v);
    return n >= min && n <= max ? roundCoord(n) : undefined;
  };
  const lat = num(one(q.lat), 33, 39);
  const lng = num(one(q.lng), 124, 132.5);
  const radius = NEARBY_RADII.find((r) => String(r) === one(q.radius)) ?? DEFAULT_NEARBY_RADIUS;
  const category = one(q.category);
  return {
    point: lat !== undefined && lng !== undefined ? { lat, lng } : null,
    radius,
    category: category !== undefined && (CATEGORIES as readonly string[]).includes(category) ? (category as Category) : undefined,
    fromMap: one(q.src) === "map" || undefined,
  };
}

export function nearbyQuery(f: NearbyFilter): string {
  const p = new URLSearchParams();
  if (f.point) {
    p.set("lat", String(f.point.lat));
    p.set("lng", String(f.point.lng));
  }
  if (f.radius !== DEFAULT_NEARBY_RADIUS) p.set("radius", String(f.radius));
  if (f.category) p.set("category", f.category);
  if (f.point && f.fromMap) p.set("src", "map");
  const s = p.toString();
  return s ? `?${s}` : "";
}

// Not cached: every point is a different query, and the API does not store or log it
export async function getNearby(point: { lat: number; lng: number }, radius: NearbyRadius, category?: Category) {
  const p = new URLSearchParams({
    lat: String(point.lat),
    lng: String(point.lng),
    radiusKm: String(radius),
    size: "50",
  });
  if (category) p.set("category", category);
  return (await get<NearbySpot[]>(`/api/spots/nearby?${p}`)) ?? [];
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)}m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)}km`;
}

// 공공누리 photos from KTO need the source shown next to them
export function isTourApiImage(url: string) {
  return url.startsWith("https://tong.visitkorea.or.kr/");
}
