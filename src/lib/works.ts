import type { Locale } from "./i18n";

// Official English titles of the works in scenes.json (the API only has the Korean ones), and the Uzbek
// titles these dramas aired under in Uzbekistan where we know them; other languages fall back to English.
// Listed best known first: byFame sorts by this order. poster: a file in public/posters (the official poster).
const TITLES: Record<string, { en: string; uz?: string; poster?: string }> = {
  주몽: { en: "Jumong", uz: "Jumong", poster: "jumong" },
  해신: { en: "Emperor of the Sea", uz: "Dengiz hukmdori", poster: "emperor-of-the-sea" },
  아이리스: { en: "IRIS", uz: "Iris", poster: "iris" },
  겨울연가: { en: "Winter Sonata", uz: "Qish sonatasi", poster: "winter-sonata" },
  올인: { en: "All In", uz: "Taqdir o'yini", poster: "all-in" },
  대장금: { en: "Jewel in the Palace", poster: "jewel-in-the-palace" },
  오징어게임: { en: "Squid Game", poster: "squid-game" },
  도깨비: { en: "Goblin", poster: "goblin" },
  "사랑의 불시착": { en: "Crash Landing on You", poster: "crash-landing-on-you" },
  "태양의 후예": { en: "Descendants of the Sun", poster: "descendants-of-the-sun" },
  "별에서 온 그대": { en: "My Love from the Star", poster: "my-love-from-the-star" },
  "꽃보다 남자": { en: "Boys Over Flowers", poster: "boys-over-flowers" },
  "이태원 클라쓰": { en: "Itaewon Class", poster: "itaewon-class" },
  "호텔 델루나": { en: "Hotel del Luna", poster: "hotel-del-luna" },
  "미스터 션샤인": { en: "Mr. Sunshine", poster: "mr-sunshine" },
  킹덤: { en: "Kingdom", poster: "kingdom" },
  "시크릿 가든": { en: "Secret Garden", poster: "secret-garden" },
  "응답하라 1988": { en: "Reply 1988", poster: "reply-1988" },
  "이상한 변호사 우영우": { en: "Extraordinary Attorney Woo", poster: "extraordinary-attorney-woo" },
  "동백꽃 필 무렵": { en: "When the Camellia Blooms", poster: "when-the-camellia-blooms" },
  "갯마을 차차차": { en: "Hometown Cha-Cha-Cha", poster: "hometown-cha-cha-cha" },
  빈센조: { en: "Vincenzo", poster: "vincenzo" },
  상속자들: { en: "The Heirs", poster: "the-heirs" },
  "커피프린스 1호점": { en: "The 1st Shop of Coffee Prince", poster: "coffee-prince" },
  "구르미 그린 달빛": { en: "Love in the Moonlight", poster: "love-in-the-moonlight" },
  "더 킹 : 영원의 군주": { en: "The King: Eternal Monarch", poster: "the-king-eternal-monarch" },
  올드보이: { en: "Oldboy", poster: "oldboy" },
  "태극기 휘날리며": { en: "Taegukgi", poster: "taegukgi" },
  명량: { en: "The Admiral: Roaring Currents", poster: "the-admiral" },
  택시운전사: { en: "A Taxi Driver", poster: "a-taxi-driver" },
  공동경비구역JSA: { en: "Joint Security Area", poster: "joint-security-area" },
  광해: { en: "Masquerade", poster: "masquerade" },
  아가씨: { en: "The Handmaiden", poster: "the-handmaiden" },
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

// The work's official poster, or null when we have none (the card then shows a photo of one of its places)
export function workPoster(work: string): string | null {
  const slug = TITLES[work]?.poster;
  return slug ? `/posters/${slug}.jpg` : null;
}
