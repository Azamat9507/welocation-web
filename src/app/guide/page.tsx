import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getToken } from "@/lib/session";
import { GuideForm } from "./guide-form";

export const metadata: Metadata = {
  title: "AI 가이드 · WeLocation",
  description: "원하는 장소를 말하면 위로케이션에 있는 장소 중에서 골라 드려요.",
};

export default function GuidePage() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">AI 가이드</h1>
      <p className="mt-0.5 text-sm text-muted">
        원하는 장소를 말해 주세요. 위로케이션에 있는 장소 중에서만 골라 드려요.
      </p>
      <Suspense>
        <LoginHint />
      </Suspense>
      <GuideForm />
    </section>
  );
}

// Only whether a session cookie exists; the API still decides if the token is valid
async function LoginHint() {
  if (await getToken()) return null;
  return (
    <p className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-sm">
      AI 가이드는 로그인 후 사용할 수 있어요.{" "}
      <Link href="/login?next=%2Fguide" className="font-semibold text-accent">
        로그인
      </Link>
    </p>
  );
}
