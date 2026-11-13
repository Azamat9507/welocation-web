"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { login, signup, type FormState } from "./actions";

const input =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none";

type Props = {
  mode: "login" | "signup";
  next: string;
  lang: Locale;
  t: Dictionary["auth"];
  // sign-in providers the API has keys for; their buttons only show when set up
  providers?: ("google" | "kakao")[];
  // a failed or cancelled Google/Kakao sign-in that came back to this page
  oauthError?: string;
};

// Plain links: the sign-in leaves the site and comes back, so there is nothing for a script to do
function ProviderButtons({ providers, next, lang, t }: { providers: ("google" | "kakao")[]; next: string; lang: Locale; t: Dictionary["auth"] }) {
  const start = (p: string) => `/auth/${p}/start?${new URLSearchParams({ lang, next })}`;
  return (
    <div className="space-y-2">
      {providers.includes("kakao") && (
        // Kakao's button colours (#FEE500, black text at 85%), as its login design guide asks
        <a href={start("kakao")} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] px-3 py-2 font-semibold text-black/85">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
            <path fill="#000" d="M12 3.5C6.75 3.5 2.5 6.86 2.5 11c0 2.65 1.75 4.98 4.4 6.31l-.9 3.31c-.08.3.26.54.52.37l3.94-2.62c.5.06 1.01.1 1.54.1 5.25 0 9.5-3.36 9.5-7.5S17.25 3.5 12 3.5Z" />
          </svg>
          {t.withKakao}
        </a>
      )}
      {providers.includes("google") && (
        <a href={start("google")} className="flex w-full items-center justify-center gap-2 rounded-md border border-line bg-background px-3 py-2 font-semibold hover:bg-surface">
          <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5Z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5Z" />
          </svg>
          {t.withGoogle}
        </a>
      )}
      <p className="flex items-center gap-3 py-1 text-xs text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
        {t.orEmail}
      </p>
    </div>
  );
}

export function AuthForm({ mode, next, lang, t, providers = [], oauthError }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : signup, {});
  const v = state.values ?? {};
  const back = next !== `/${lang}` ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="mx-auto mt-4 max-w-sm space-y-3">
      <h1 className="text-xl font-bold">{mode === "login" ? t.login : t.signup}</h1>
      {oauthError && (
        <p role="alert" className="text-sm text-red-700">
          {oauthError}
        </p>
      )}
      {providers.length > 0 && <ProviderButtons providers={providers} next={next} lang={lang} t={t} />}
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
