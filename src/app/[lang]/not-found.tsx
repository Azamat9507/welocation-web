import Link from "next/link";
import { currentLocale } from "@/lib/current-locale";

export default async function NotFound() {
  const { lang, t } = await currentLocale();
  return (
    <div className="py-12 text-center">
      <p className="font-semibold">{t.notFound.message}</p>
      <Link href={`/${lang}`} className="mt-2 inline-block text-sm text-accent">
        {t.notFound.back}
      </Link>
    </div>
  );
}
