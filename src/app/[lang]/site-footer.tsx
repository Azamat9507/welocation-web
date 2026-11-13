import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import { LOCALES, href, type Locale } from "@/lib/i18n";

// Who runs the site and how to reach them, as the owner chose to publish it (also on the privacy page)
export const OPERATOR = { name: "SOLIJONOV AZAMATJON", email: "solijonov.azamat9507@gmail.com" };

const LANG_NAMES: Record<Locale, string> = { ko: "한국어", en: "English", ru: "Русский", uz: "O'zbekcha" };

export function SiteFooter({ lang, t }: { lang: Locale; t: Dictionary }) {
  const f = t.footer;
  const links = [
    { href: href(lang, "/privacy"), label: f.privacy, strong: true },
    { href: `mailto:${OPERATOR.email}`, label: f.contact },
    { href: href(lang, "/guide"), label: f.guide },
    { href: href(lang, "/ranking"), label: f.ranking },
    { href: href(lang, "/shorts"), label: f.shorts },
  ];
  return (
    // phones: room at the bottom for the floating AI guide button
    <footer className="mt-14 bg-[#f7f8fa] px-4 pt-8 pb-24 text-[13px] text-muted sm:pb-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-accent">WeLocation</p>
            <p className="mt-0.5 text-foreground/80">{f.tagline}</p>
          </div>
          <nav aria-label={f.languages}>
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {LOCALES.map((l) => (
                <li key={l}>
                  {/* plain <a>: each locale has its own root layout */}
                  <a href={`/${l}`} lang={l} aria-current={l === lang ? "true" : undefined} className={l === lang ? "font-semibold text-foreground" : "hover:text-foreground"}>
                    {LANG_NAMES[l]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <nav aria-label={f.linksLabel} className="mt-6">
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`hover:text-foreground ${l.strong ? "font-semibold text-foreground" : ""}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 space-y-1 border-t border-line pt-5 text-xs leading-relaxed">
          <p>
            {f.operator}: {OPERATOR.name} · {f.email}:{" "}
            <a href={`mailto:${OPERATOR.email}`} className="hover:text-foreground">
              {OPERATOR.email}
            </a>
          </p>
          <p>{t.common.footerCredit}</p>
          <p>{f.sources}</p>
          <p className="pt-2">© 2026 WeLocation</p>
        </div>
      </div>
    </footer>
  );
}
