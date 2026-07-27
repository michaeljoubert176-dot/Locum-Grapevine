type Color = "green" | "purple" | "amber";

const SCORES = [1, 2, 3, 4, 5] as const;

const BAR_FILL: Record<Color, string> = {
  green: "bg-green",
  purple: "bg-purple",
  amber: "bg-amber",
};

const BAR_TRACK: Record<Color, string> = {
  green: "bg-green-soft",
  purple: "bg-purple-soft",
  amber: "bg-amber-soft",
};

const AXIS_LABEL_COLOR: Record<Color, string> = {
  green: "text-green",
  purple: "text-purple",
  amber: "text-amber-accent",
};

// A horizontal, Google-style histogram: score down the left, a bar sized
// to that score's share of all reviews, and the percentage on the right.
// When `onSelect` is given, each row becomes a tappable filter (used for
// the overall rating, to drive the Overall comments list below it) —
// otherwise the rows are purely a static readout (used for the six
// attributes, which have no comments list of their own to filter).
export default function ScoreHistogram({
  distribution,
  total,
  color = "green",
  selected,
  onSelect,
}: {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
  color?: Color;
  selected?: 1 | 2 | 3 | 4 | 5 | null;
  onSelect?: (score: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div>
      <p className={`text-xs font-semibold tracking-wide uppercase ${AXIS_LABEL_COLOR[color]}`}>
        Score
      </p>
      <div className="mt-2 space-y-1.5">
        {SCORES.map((score) => {
          const count = distribution[score];
          const percent = total === 0 ? 0 : (count / total) * 100;

          const row = (
            <>
              <span className="w-4 text-right text-sm tabular-nums text-ink-soft">{score}</span>
              <span className={`h-3 flex-1 overflow-hidden rounded-full ${BAR_TRACK[color]}`}>
                <span
                  style={{ width: `${percent}%` }}
                  className={`block h-full rounded-full ${BAR_FILL[color]}`}
                />
              </span>
              <span className="w-12 text-right text-sm tabular-nums text-ink-soft">
                {Math.round(percent)}%
              </span>
            </>
          );

          if (!onSelect) {
            return (
              <div key={score} className="flex items-center gap-3">
                {row}
              </div>
            );
          }

          return (
            <button
              key={score}
              type="button"
              onClick={() => onSelect(score)}
              aria-pressed={selected === score}
              className={`flex w-full items-center gap-3 rounded-md px-1 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                selected === score ? "bg-muted-soft" : ""
              }`}
            >
              {row}
            </button>
          );
        })}
      </div>
    </div>
  );
}
