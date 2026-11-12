"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { login, signup, type FormState } from "./actions";

const input =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none";

type Props = { mode: "login" | "signup"; next: string; lang: Locale; t: Dictionary["auth"] };

export function AuthForm({ mode, next, lang, t }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : signup, {});
  const v = state.values ?? {};
  const back = next !== `/${lang}` ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="mx-auto mt-4 max-w-sm space-y-3">
      <h1 className="text-xl font-bold">{mode === "login" ? t.login : t.signup}</h1>
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="lang" value={lang} />
      <label className="block text-sm">
        {t.email}
        <input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={v.email} className={input} />
      </label>
      {mode === "signup" && (
        <label className="block text-sm">
          {t.nickname}
          <input name="nickname" autoComplete="nickname" required maxLength={30} defaultValue={v.nickname} className={input} />
        </label>
      )}
      <label className="block text-sm">
        {t.password}
        {mode === "signup" && <span className="text-muted"> {t.passwordHint}</span>}
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
        {pending ? t.wait : mode === "login" ? t.login : t.signupSubmit}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            {t.newHere}{" "}
            <Link href={`/${lang}/signup${back}`} className="text-accent">
              {t.signup}
            </Link>
          </>
        ) : (
          <>
            {t.haveAccount}{" "}
            <Link href={`/${lang}/login${back}`} className="text-accent">
              {t.login}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
