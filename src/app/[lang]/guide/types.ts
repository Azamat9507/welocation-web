import type { SpotSummary } from "@/lib/api";

// POST /api/guide (GuideDtos on the API): token required, question 1-300 characters (@NotBlank @Size(max = 300)),
// optional lang (ko|en|ru|uz) for the language of the answer and reasons.
// Every fact on a card comes from the database; only `answer` and `reason` are the model's words, shown as plain text.
export const MAX_QUESTION = 300;

export type GuideSpot = SpotSummary & { latitude: number; longitude: number };
export type GuidePick = { spot: GuideSpot; reason: string };
// route is null unless the question asked for one; the first stop has metersFromPrevious null
export type RouteStop = { order: number; spot: GuideSpot; metersFromPrevious: number | null };
export type GuideResponse = { answer: string; spots: GuidePick[]; route: RouteStop[] | null };

export type GuideState = {
  question?: string;
  error?: string;
  // logged out, or the token ran out: the page shows a login link back to /guide
  login?: boolean;
  result?: GuideResponse;
};
