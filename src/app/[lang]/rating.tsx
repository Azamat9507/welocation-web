import { fill } from "@/lib/i18n";

// Used by server pages and the client guide form, so the labels come in as props
export function Rating({
  average,
  count,
  labels,
}: {
  average: number | null;
  count: number;
  labels: { none: string; count: string };
}) {
  if (average === null) {
    return <p className="text-xs text-muted">{labels.none}</p>;
  }
  return (
    <p className="text-xs">
      <span className="text-accent">★ {average.toFixed(1)}</span>
      <span className="text-muted"> · {fill(labels.count, { n: count })}</span>
    </p>
  );
}
