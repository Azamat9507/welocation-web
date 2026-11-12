"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { splitLocale, type Locale } from "@/lib/i18n";
import { iconLinkClass, UserIcon } from "./icons";

// brings the visitor back to the page they were on
export function LoginLink({ lang, label }: { lang: Locale; label: string }) {
  const path = usePathname();
  const rest = splitLocale(path).rest;
  const skip = rest === "/" || rest === "/login" || rest === "/signup";
  return (
    <Link href={skip ? `/${lang}/login` : `/${lang}/login?next=${encodeURIComponent(path)}`} className={iconLinkClass}>
      <UserIcon />
      {label}
    </Link>
  );
}
