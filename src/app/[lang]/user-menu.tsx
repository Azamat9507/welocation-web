import Link from "next/link";
import { getMe } from "@/lib/api-auth";
import { currentLocale } from "@/lib/current-locale";
import { href } from "@/lib/i18n";
import { logout } from "./actions";
import { iconLinkClass, UserIcon } from "./icons";
import { LoginLink } from "./login-link";

export async function UserMenu() {
  const { lang, t } = await currentLocale();
  const me = await getMe().catch(() => null);
  if (!me) {
    return <LoginLink lang={lang} label={t.header.my} />;
  }
  return (
    <details className="relative">
      <summary className={`${iconLinkClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
        <UserIcon />
        {t.header.my}
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-line bg-background p-3 text-sm shadow-sm">
        <p className="truncate font-medium">{me.nickname}</p>
        {me.admin && (
          <>
            <Link href={href(lang, "/admin/shorts")} className="mt-2 block text-accent">
              {t.admin.menuLink}
            </Link>
            <Link href={href(lang, "/admin/spots")} className="mt-2 block text-accent">
              {t.admin.spotsMenuLink}
            </Link>
          </>
        )}
        <form action={logout.bind(null, lang)} className="mt-2">
          <button className="text-muted hover:text-accent">{t.header.logout}</button>
        </form>
      </div>
    </details>
  );
}
