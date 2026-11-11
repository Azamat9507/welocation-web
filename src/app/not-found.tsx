import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-12 text-center">
      <p className="font-semibold">찾는 장소가 없어요.</p>
      <Link href="/" className="mt-2 inline-block text-sm text-accent">
        목록으로
      </Link>
    </div>
  );
}
