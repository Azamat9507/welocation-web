"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { iconLinkClass, UserIcon } from "./icons";

// brings the visitor back to the page they were on
export function LoginLink() {
  const path = usePathname();
  const skip = path === "/" || path === "/login" || path === "/signup";
  return (
    <Link href={skip ? "/login" : `/login?next=${encodeURIComponent(path)}`} className={iconLinkClass}>
      <UserIcon />
      마이
    </Link>
  );
}
