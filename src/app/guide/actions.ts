"use server";

import { call } from "@/lib/api-auth";
import { clearSession, getToken } from "@/lib/session";
import { MAX_QUESTION, type GuideResponse, type GuideState } from "./types";

export async function askGuide(_prev: GuideState, form: FormData): Promise<GuideState> {
  const raw = form.get("question");
  const question = typeof raw === "string" ? raw.trim() : "";
  if (!question) return { error: "질문을 입력해 주세요.", question };
  if (question.length > MAX_QUESTION) return { error: `질문은 ${MAX_QUESTION}자까지 쓸 수 있어요.`, question };
  if (!(await getToken())) return { login: true, question };

  let r;
  try {
    r = await call<GuideResponse>("/api/guide", { method: "POST", body: { question } });
  } catch {
    return { error: "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.", question };
  }
  if (r.ok) return { question, result: normalize(r.data) };
  if (r.status === 401) {
    await clearSession();
    return { login: true, question };
  }
  if (r.status === 429) return { error: "오늘 AI 가이드 사용 한도를 다 썼어요. 내일 다시 이용해 주세요.", question };
  if (r.status === 503) return { error: "AI 가이드를 지금 사용할 수 없어요. 잠시 후 다시 시도해 주세요.", question };
  if (r.status === 400) return { error: `질문을 다시 확인해 주세요. (${MAX_QUESTION}자 이하)`, question };
  if (r.status >= 500) return { error: "서버에 문제가 있어요. 잠시 후 다시 시도해 주세요.", question };
  return { error: "답을 받지 못했어요. 다시 시도해 주세요.", question };
}

// Only what the page needs, and nothing unexpected if the API sends a partial body
function normalize(data: GuideResponse | undefined): GuideResponse {
  const spots = Array.isArray(data?.spots) ? data.spots.filter((p) => p?.spot && Number.isSafeInteger(p.spot.id)) : [];
  const route = Array.isArray(data?.route) ? data.route.filter((s) => s?.spot && Number.isSafeInteger(s.spot.id)) : null;
  return {
    answer: typeof data?.answer === "string" ? data.answer : "",
    spots: spots.map((p) => ({ spot: p.spot, reason: typeof p.reason === "string" ? p.reason : "" })),
    route: route && route.length > 0 ? route : null,
  };
}
