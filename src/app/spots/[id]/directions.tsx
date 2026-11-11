"use client";

import { useState } from "react";

type Props = { name: string; address: string; lat: number; lng: number };

// Plain links to the map apps people in Korea use; nothing is sent anywhere until the visitor taps one.
export function Directions({ name, address, lat, lng }: Props) {
  const [copied, setCopied] = useState(false);
  const q = encodeURIComponent(`${name} ${address}`);
  const links = [
    { label: "카카오맵 길찾기", href: `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}` },
    { label: "네이버 지도", href: `https://map.naver.com/p/search/${q}` },
    { label: "구글 지도", href: `https://www.google.com/maps/search/?api=1&query=${q}` },
  ];

  return (
    <section className="mt-4 rounded-xl bg-surface p-3">
      <h2 className="text-sm font-semibold">가는 길</h2>
      <div className="mt-1 flex min-w-0 items-start gap-2">
        <p className="min-w-0 flex-1 text-sm text-muted">{address}</p>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(address);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              setCopied(false);
            }
          }}
          className="shrink-0 text-xs text-accent"
        >
          {copied ? "복사됨" : "주소 복사"}
        </button>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-2 py-2 text-center text-xs font-medium hover:border-accent hover:text-accent"
          >
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
