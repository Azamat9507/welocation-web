import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./site-header";

export const metadata: Metadata = {
  title: "WeLocation · 위로가 되는 장소",
  description: "바다와 호수, 강이 보이는 카페와 전망대. 한국의 위로가 되는 장소를 모았습니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:py-6">{children}</main>
        <footer className="mt-10 border-t border-line px-4 py-5 text-center text-xs text-muted">
          장소 정보와 사진: 한국관광공사 (공공누리)
        </footer>
      </body>
    </html>
  );
}
