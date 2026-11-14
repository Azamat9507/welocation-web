import type { Locale } from "./i18n";

// Official English titles of the works in scenes.json (the API only has the Korean ones), and the Uzbek
// titles these dramas aired under in Uzbekistan where we know them; other languages fall back to English.
// Listed best known first: byFame sorts by this order.
const TITLES: Record<string, { en: string; uz?: string }> = {
  주몽: { en: "Jumong", uz: "Jumong" },
  해신: { en: "Emperor of the Sea", uz: "Dengiz hukmdori" },
  아이리스: { en: "IRIS", uz: "Iris" },
  겨울연가: { en: "Winter Sonata", uz: "Qish sonatasi" },
  올인: { en: "All In", uz: "Taqdir o'yini" },
  대장금: { en: "Jewel in the Palace" },
  오징어게임: { en: "Squid Game" },
  도깨비: { en: "Goblin" },
  "사랑의 불시착": { en: "Crash Landing on You" },
  "태양의 후예": { en: "Descendants of the Sun" },
  "별에서 온 그대": { en: "My Love from the Star" },
  "꽃보다 남자": { en: "Boys Over Flowers" },
  "이태원 클라쓰": { en: "Itaewon Class" },
  "호텔 델루나": { en: "Hotel del Luna" },
  "미스터 션샤인": { en: "Mr. Sunshine" },
  킹덤: { en: "Kingdom" },
  "시크릿 가든": { en: "Secret Garden" },
  "응답하라 1988": { en: "Reply 1988" },
  "이상한 변호사 우영우": { en: "Extraordinary Attorney Woo" },
  "동백꽃 필 무렵": { en: "When the Camellia Blooms" },
  "갯마을 차차차": { en: "Hometown Cha-Cha-Cha" },
  빈센조: { en: "Vincenzo" },
  상속자들: { en: "The Heirs" },
  "커피프린스 1호점": { en: "The 1st Shop of Coffee Prince" },
  "구르미 그린 달빛": { en: "Love in the Moonlight" },
  "더 킹 : 영원의 군주": { en: "The King: Eternal Monarch" },
  올드보이: { en: "Oldboy" },
  "태극기 휘날리며": { en: "Taegukgi" },
  명량: { en: "The Admiral: Roaring Currents" },
  택시운전사: { en: "A Taxi Driver" },
  공동경비구역JSA: { en: "Joint Security Area" },
  광해: { en: "Masquerade" },
  아가씨: { en: "The Handmaiden" },
};

// Sorts by the order of TITLES; works missing there go last
export function byFame<T extends { title: string }>(works: T[]): T[] {
  const keys = Object.keys(TITLES);
  const rank = (w: T) => {
    const i = keys.indexOf(w.title);
    return i === -1 ? keys.length : i;
  };
  return [...works].sort((a, b) => rank(a) - rank(b));
}

// The title a visitor knows the work by; Korean pages and unknown works keep the Korean title
export function workTitle(work: string, lang: Locale): string {
  const known = TITLES[work];
  if (lang === "ko" || !known) return work;
  return (lang === "uz" && known.uz) || known.en;
}
