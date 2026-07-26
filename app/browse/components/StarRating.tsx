"use client";

import { useId } from "react";

// One row of five identical star shapes, drawn once as a light background
// layer and once again — clipped to the score's width — as a solid green
// fill on top. Both layers draw the exact same <path> at the exact same
// coordinates within one shared SVG viewBox, so the fill can never drift
// out of alignment with the outline beneath it (unlike stacking two
// independently-sized elements and hoping their layouts match).
const STAR_PATH =
  "M12 3.5l2.47 5.24 5.53.63-4.13 3.9 1.1 5.63L12 15.9l-5 2.99 1.1-5.62-4.13-3.9 5.53-.63L12 3.5Z";
const STAR_COUNT = 5;
const STAR_SIZE = 24;
const STAR_GAP = 4;
const ROW_WIDTH = STAR_COUNT * STAR_SIZE + (STAR_COUNT - 1) * STAR_GAP;

export default function StarRating({ average }: { average: number }) {
  const fillPercent = Math.max(0, Math.min(1, average / 5)) * 100;
  const fillWidth = (fillPercent / 100) * ROW_WIDTH;
  const clipId = useId();

  return (
    <svg
      viewBox={`0 0 ${ROW_WIDTH} ${STAR_SIZE}`}
      className="h-7 w-auto"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={fillWidth} height={STAR_SIZE} />
        </clipPath>
      </defs>
      <g className="text-green/20" fill="currentColor">
        {Array.from({ length: STAR_COUNT }).map((_, i) => (
          <path key={i} transform={`translate(${i * (STAR_SIZE + STAR_GAP)}, 0)`} d={STAR_PATH} />
        ))}
      </g>
      <g className="text-green" fill="currentColor" clipPath={`url(#${clipId})`}>
        {Array.from({ length: STAR_COUNT }).map((_, i) => (
          <path key={i} transform={`translate(${i * (STAR_SIZE + STAR_GAP)}, 0)`} d={STAR_PATH} />
        ))}
      </g>
    </svg>
  );
}
