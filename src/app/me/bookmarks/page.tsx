import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getMyBookmarks } from "@/lib/api-auth";
import { SpotCard } from "../../spot-card";

export const metadata = { title: "북마크 · 위로케이션" };

export default function BookmarksPage({ searchParams }: PageProps<"/me/bookmarks">) {
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-muted">불러오는 중…</p>}>
      <Bookmarks searchParams={searchParams} />
    </Suspense>
  );
}

async function Bookmarks({ searchParams }: { searchParams: PageProps<"/me/bookmarks">["searchParams"] }) {
  const q = await searchParams;
  const n = Number(Array.isArray(q.page) ? q.page[0] : q.page);
  const page = Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : 1;
  const result = await getMyBookmarks(page);
  if (!result) redirect("/login?next=%2Fme%2Fbookmarks");

  return (
    <section>
      <h1 className="text-xl font-bold">북마크 {result.totalElements}</h1>
      {result.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          아직 저장한 장소가 없어요. <Link href="/" className="text-accent">장소 둘러보기</Link>
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((s) => (
            <SpotCard key={s.id} spot={s} />
          ))}
        </ul>
      )}
      {result.totalPages > 1 && (
        <nav className="mt-4 flex justify-center gap-4 text-sm">
          {page > 1 && <Link href={`/me/bookmarks?page=${page - 1}`} className="text-accent">이전</Link>}
          <span className="text-muted">{page} / {result.totalPages}</span>
          {page < result.totalPages && <Link href={`/me/bookmarks?page=${page + 1}`} className="text-accent">다음</Link>}
        </nav>
      )}
    </section>
  );
}
