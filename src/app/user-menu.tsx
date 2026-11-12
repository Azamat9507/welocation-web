import { getMe } from "@/lib/api-auth";
import { logout } from "./actions";
import { iconLinkClass, UserIcon } from "./icons";
import { LoginLink } from "./login-link";

export async function UserMenu() {
  const me = await getMe().catch(() => null);
  if (!me) {
    return <LoginLink />;
  }
  return (
    <details className="relative">
      <summary className={`${iconLinkClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
        <UserIcon />
        마이
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-line bg-background p-3 text-sm shadow-sm">
        <p className="truncate font-medium">{me.nickname}</p>
        <form action={logout} className="mt-2">
          <button className="text-muted hover:text-accent">로그아웃</button>
        </form>
      </div>
    </details>
  );
}
