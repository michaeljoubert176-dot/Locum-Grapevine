import { formatMoney, type AgencyRate } from "@/lib/reviews";

// One horizontal range bar per agency, all on a shared scale — the same
// single-hue, directly-labelled bar style as ScoreHistogram, since agency
// identity here is carried by row position and label text rather than a
// second hue. Hourly only, matching the over-time graph next to it.
export default function HourlyRateByAgencyChart({ data }: { data: AgencyRate[] }) {
  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-muted-soft/40 p-4 text-sm text-ink-soft">
        Not enough agency data yet.
      </p>
    );
  }

  const allValues = data.flatMap((d) => [d.hourlyRange.min, d.hourlyRange.max]);
  const scaleMin = Math.min(...allValues);
  const scaleMax = Math.max(...allValues);
  const span = scaleMax - scaleMin || 1;

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const isPoint = d.hourlyRange.max === d.hourlyRange.min;
        const left = ((d.hourlyRange.min - scaleMin) / span) * 100;
        const width = isPoint ? 0 : ((d.hourlyRange.max - d.hourlyRange.min) / span) * 100;

        return (
          <div key={d.agency}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-ink">{d.agency}</span>
              <span className="text-sm tabular-nums text-ink-soft">
                {isPoint
                  ? `${formatMoney(d.hourlyRange.min)} / hr`
                  : `${formatMoney(d.hourlyRange.min)}–${formatMoney(d.hourlyRange.max)} / hr`}
              </span>
            </div>
            <div className="relative mt-1 h-2.5 rounded-full bg-purple-soft">
              {isPoint ? (
                <div
                  className="absolute h-2.5 w-2.5 rounded-full bg-purple"
                  style={{ left: `calc(${left}% - 1px)` }}
                />
              ) : (
                <div
                  className="absolute h-2.5 rounded-full bg-purple"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
