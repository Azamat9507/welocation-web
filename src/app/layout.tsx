import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "위로케이션 · 위로가 되는 장소",
  description: "바다와 호수, 강이 보이는 카페와 전망대. 한국의 위로가 되는 장소를 모았습니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-baseline gap-2 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-accent">
              위로케이션
            </Link>
            <span className="text-sm text-muted">위로가 되는 장소</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4">{children}</main>
        <footer className="border-t border-line px-4 py-3 text-center text-xs text-muted">
          장소 정보와 사진: 한국관광공사 (공공누리)
        </footer>
      </body>
    </html>
  );
}
