import type { Metadata } from "next";
import { currentLocale } from "@/lib/current-locale";
import { fill } from "@/lib/i18n";
import { OPERATOR } from "../site-footer";
import { EFFECTIVE, POLICY } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await currentLocale();
  return { title: `${POLICY[lang].title} · WeLocation` };
}

export default async function PrivacyPage() {
  const { lang } = await currentLocale();
  const p = POLICY[lang];
  const text = (s: string) => fill(s, { name: OPERATOR.name, email: OPERATOR.email });
  return (
    <article className="mx-auto max-w-2xl text-[15px] leading-relaxed">
      <h1 className="text-2xl font-bold tracking-tight">{p.title}</h1>
      <p className="mt-1 text-sm text-muted">
        {p.effective}: {EFFECTIVE}
      </p>
      {p.note && <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-sm">{p.note}</p>}
      <p className="mt-4">{p.intro}</p>
      {p.sections.map((s) => (
        <section key={s.h} className="mt-7">
          <h2 className="text-lg font-bold">{s.h}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 marker:text-muted">
            {s.p.map((line) => (
              <li key={line}>{text(line)}</li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
