import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n";

// Top-level routes that live under /[lang]. "me" has to be listed because it looks like a language code.
const APP_SEGMENTS = new Set(["spots", "nearby", "ranking", "guide", "login", "signup", "me"]);

// "ru-RU,ru;q=0.9,en;q=0.8" -> first supported primary tag by q, ties in header order
function fromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => /^\s*q=([\d.]+)\s*$/.exec(p)?.[1]).find(Boolean);
      return { lang: tag.split("-")[0].toLowerCase(), q: q === undefined ? 1 : Number(q), i };
    })
    .filter((x) => x.q > 0 && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return ranked.find((x) => isLocale(x.lang))?.lang as Locale | undefined;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return;
  // A language code we do not serve (/xx, /ja/...) is left to the [lang] layout, which answers 404
  if (/^[a-z]{2}(-[a-z]{2})?$/i.test(first) && !APP_SEGMENTS.has(first)) return;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const lang = isLocale(saved) ? saved : (fromAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_LOCALE);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;
  url.search = search;
  const res = NextResponse.redirect(url);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = {
  // no API routes, sign-in redirects (/auth/<provider>/...), build output, or anything with a file extension
  matcher: ["/((?!api|auth/|_next|.*\\..*).*)"],
};
