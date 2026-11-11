export function Rating({ average, count }: { average: number | null; count: number }) {
  if (average === null) {
    return <p className="text-xs text-muted">아직 리뷰가 없어요</p>;
  }
  return (
    <p className="text-xs">
      <span className="text-accent">★ {average.toFixed(1)}</span>
      <span className="text-muted"> · 리뷰 {count}</span>
    </p>
  );
}
