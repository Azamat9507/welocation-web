import Link from "next/link";
import { getMe } from "@/lib/api-auth";
import { logout } from "./actions";
import { LoginLink } from "./login-link";

export async function UserMenu() {
  const me = await getMe().catch(() => null);
  if (!me) {
    return <LoginLink />;
  }
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm">
      <span className="truncate text-muted">{me.nickname}</span>
      <Link href="/me/bookmarks" className="shrink-0 text-accent">
        북마크
      </Link>
      <form action={logout} className="shrink-0">
        <button className="text-muted hover:text-accent">로그아웃</button>
      </form>
    </div>
  );
}
