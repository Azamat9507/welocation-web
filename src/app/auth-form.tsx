"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "./actions";

const input =
  "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-base focus:border-accent focus:outline-none";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : signup, {});
  const v = state.values ?? {};
  const back = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="mx-auto mt-4 max-w-sm space-y-3">
      <h1 className="text-xl font-bold">{mode === "login" ? "로그인" : "회원가입"}</h1>
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm">
        이메일
        <input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={v.email} className={input} />
      </label>
      {mode === "signup" && (
        <label className="block text-sm">
          닉네임
          <input name="nickname" autoComplete="nickname" required maxLength={30} defaultValue={v.nickname} className={input} />
        </label>
      )}
      <label className="block text-sm">
        비밀번호{mode === "signup" && <span className="text-muted"> (8자 이상)</span>}
        <input
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          maxLength={72}
          className={input}
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-md bg-accent px-3 py-2 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "잠시만요…" : mode === "login" ? "로그인" : "가입하기"}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            처음이신가요? <Link href={`/signup${back}`} className="text-accent">회원가입</Link>
          </>
        ) : (
          <>
            이미 계정이 있나요? <Link href={`/login${back}`} className="text-accent">로그인</Link>
          </>
        )}
      </p>
    </form>
  );
}
