"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// brings the visitor back to the page they were on
export function LoginLink() {
  const path = usePathname();
  const skip = path === "/" || path === "/login" || path === "/signup";
  return (
    <Link href={skip ? "/login" : `/login?next=${encodeURIComponent(path)}`} className="shrink-0 text-accent">
      로그인
    </Link>
  );
}
