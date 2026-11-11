// Server-side only: pages fetch here and render HTML, the browser never calls the API in W1.
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8080";

export const CATEGORIES = {
  CAFE: "카페",
  BEACH: "해변",
  LAKE: "호수",
  RIVER: "강",
  VIEWPOINT: "전망대",
  ATTRACTION: "명소",
} as const;

export const REGIONS = {
  SEOUL: "서울",
  BUSAN: "부산",
  DAEGU: "대구",
  INCHEON: "인천",
  GWANGJU: "광주",
  DAEJEON: "대전",
  ULSAN: "울산",
  SEJONG: "세종",
  GYEONGGI: "경기",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  JEJU: "제주",
} as const;

export const TAGS = {
  OCEAN_VIEW: "오션뷰",
  LAKE_VIEW: "호수뷰",
  RIVER_VIEW: "리버뷰",
  NIGHT_VIEW: "야경",
  ROOFTOP: "루프탑",
  PET_FRIENDLY: "반려동물",
  PARKING: "주차",
  KIDS: "아이와 함께",
} as const;

export type Category = keyof typeof CATEGORIES;
export type Region = keyof typeof REGIONS;
export type Tag = keyof typeof TAGS;

export type SpotSummary = {
  id: number;
  name: string;
  category: Category;
  region: Region;
  address: string;
  thumbnailUrl: string | null;
  tags: Tag[];
  // missing from API builds before likes (T5)
  likeCount?: number;
  reviewCount: number;
  averageRating: number | null;
};

export type SpotDetail = Omit<SpotSummary, "thumbnailUrl"> & {
  latitude: number;
  longitude: number;
  description: string | null;
  images: string[];
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

export type SpotFilter = { region?: Region; category?: Category; tag?: Tag; page: number };

// URL query is user input: anything not on the lists is dropped instead of forwarded
export function parseFilter(q: Record<string, string | string[] | undefined>): SpotFilter {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const pick = <T extends string>(v: string | undefined, allowed: Record<T, string>) =>
    v !== undefined && Object.hasOwn(allowed, v) ? (v as T) : undefined;
  const page = Number(one(q.page));
  return {
    region: pick(one(q.region), REGIONS),
    category: pick(one(q.category), CATEGORIES),
    tag: pick(one(q.tag), TAGS),
    page: Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1,
  };
}

export function filterQuery(f: Partial<SpotFilter>): string {
  const p = new URLSearchParams();
  if (f.region) p.set("region", f.region);
  if (f.category) p.set("category", f.category);
  if (f.tag) p.set("tag", f.tag);
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

export async function getSpots(f: SpotFilter): Promise<Page<SpotSummary>> {
  const p = new URLSearchParams({ page: String(f.page - 1), size: "20" });
  if (f.region) p.set("region", f.region);
  if (f.category) p.set("category", f.category);
  if (f.tag) p.set("tag", f.tag);
  return (await get<Page<SpotSummary>>(`/api/spots?${p}`))!;
}

export function getSpot(id: number) {
  return get<SpotDetail>(`/api/spots/${id}`);
}

export function getReviews(id: number) {
  return get<Page<Review>>(`/api/spots/${id}/reviews?page=0&size=10`);
}

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

// 공공누리 photos from KTO need the source shown next to them
export function isTourApiImage(url: string) {
  return url.startsWith("https://tong.visitkorea.or.kr/");
}
