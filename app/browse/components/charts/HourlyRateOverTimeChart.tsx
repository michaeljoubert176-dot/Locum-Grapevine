"use client";

import { useState } from "react";
import { formatMoney, type PayPoint } from "@/lib/reviews";

const WIDTH = 320;
const HEIGHT = 160;
const PAD_X = 12;
const PAD_Y = 16;

function formatShortDate(dateString: string): string {
  const [year, month] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(Date.UTC(year, month - 1, 1));
}

// A single-series line chart: hourly rate (always rate ÷ rostered hours,
// never actual — see the schema spec) plotted against when each review's
// placement started. Hourly only, no Hourly/Per Shift toggle here — that
// toggle only applies to the shift-type rate list, not this graph.
export default function HourlyRateOverTimeChart({ points }: { points: PayPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-muted-soft/40 p-4 text-sm text-ink-soft">
        Not enough dated reviews yet to plot pay over time.
      </p>
    );
  }

  const dates = points.map((p) => new Date(p.workedFrom).getTime());
  const rates = points.map((p) => p.hourlyRate);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);

  const xFor = (t: number) =>
    maxDate === minDate ? WIDTH / 2 : PAD_X + ((t - minDate) / (maxDate - minDate)) * (WIDTH - PAD_X * 2);
  const yFor = (r: number) =>
    maxRate === minRate
      ? HEIGHT / 2
      : HEIGHT - PAD_Y - ((r - minRate) / (maxRate - minRate)) * (HEIGHT - PAD_Y * 2);

  const coords = points.map((p) => ({
    x: xFor(new Date(p.workedFrom).getTime()),
    y: yFor(p.hourlyRate),
    point: p,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

  return (
    <div>
      <p className="text-sm text-ink-soft">
        Range: <span className="font-semibold text-ink">{formatMoney(minRate)}–{formatMoney(maxRate)} / hr</span>
      </p>

      <div className="relative mt-2">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Hourly rate over time">
          <line
            x1={PAD_X}
            y1={HEIGHT - PAD_Y}
            x2={WIDTH - PAD_X}
            y2={HEIGHT - PAD_Y}
            stroke="var(--color-line)"
            strokeWidth={1}
          />

          {coords.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-purple)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {coords.map((c, i) => (
            <circle
              key={c.point.reviewId}
              cx={c.x}
              cy={c.y}
              r={5}
              fill="var(--color-purple)"
              stroke="white"
              strokeWidth={1.5}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              onClick={() => setHovered((h) => (h === i ? null : i))}
            />
          ))}
        </svg>

        <div className="mt-1 flex justify-between text-xs text-ink-soft">
          <span>{formatShortDate(points[0].workedFrom)}</span>
          <span>{formatShortDate(points[points.length - 1].workedFrom)}</span>
        </div>

        {hovered !== null && (
          <div className="mt-2 inline-block rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink shadow-sm">
            <span className="font-semibold">{formatMoney(coords[hovered].point.hourlyRate)} / hr</span>
            <span className="ml-2 text-ink-soft">{formatShortDate(coords[hovered].point.workedFrom)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
