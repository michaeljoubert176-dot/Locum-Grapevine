const SCORES = [1, 2, 3, 4, 5] as const;

// A plain bar-per-score histogram (1 to 5), used both for the overall
// rating and for each attribute's popped-out distribution. Purely
// presentational — no interaction of its own.
export default function DistributionBars({
  distribution,
}: {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}) {
  const maxCount = Math.max(...SCORES.map((score) => distribution[score]), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height: "4.5rem" }}>
      {SCORES.map((score) => {
        const count = distribution[score];
        const heightPercent = count === 0 ? 0 : (count / maxCount) * 100;

        return (
          <div key={score} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs tabular-nums text-ink-soft">{count}</span>
            <span
              style={{ height: `${Math.max(heightPercent, count === 0 ? 4 : 8)}%` }}
              className={`w-full min-h-[3px] rounded-t-sm ${count === 0 ? "bg-green/10" : "bg-green/30"}`}
            />
            <span className="text-[11px] text-ink-soft">{score}</span>
          </div>
        );
      })}
    </div>
  );
}
