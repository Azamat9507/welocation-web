import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { UserMenu } from "./user-menu";

export const metadata: Metadata = {
  title: "위로케이션 · 위로가 되는 장소",
  description: "바다와 호수, 강이 보이는 카페와 전망대. 한국의 위로가 되는 장소를 모았습니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 border-b border-line bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-1 px-4 pt-3 pb-2 sm:flex-nowrap sm:pb-3">
            <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight text-accent">
              위로케이션
            </Link>
            <span className="hidden text-sm text-muted md:inline">위로가 되는 장소</span>
            {/* on phones the links drop to their own row so nothing gets cut off */}
            <nav className="order-last -mx-4 flex w-full min-w-0 gap-5 overflow-x-auto px-4 text-sm sm:order-none sm:mx-0 sm:ml-auto sm:w-auto sm:px-0">
              <Link href="/nearby" className="shrink-0 hover:text-accent">
                내 주변
              </Link>
              <Link href="/ranking" className="shrink-0 hover:text-accent">
                주간 인기
              </Link>
              <Link href="/guide" className="shrink-0 hover:text-accent">
                AI 가이드
              </Link>
            </nav>
            <div className="ml-auto min-w-0 sm:ml-0">
              <Suspense>
                <UserMenu />
              </Suspense>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:py-6">{children}</main>
        <footer className="mt-10 border-t border-line px-4 py-5 text-center text-xs text-muted">
          장소 정보와 사진: 한국관광공사 (공공누리)
        </footer>
      </body>
    </html>
  );
}
