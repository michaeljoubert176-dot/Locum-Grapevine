"use client";

import { useState } from "react";
import { IconCheck, IconX } from "@/app/components/icons";

// Car/Accommodation/Flights: a plain ticked/crossed pill that reveals the
// underlying percentage (and, for Accommodation, which kinds) on hover for
// desktop or tap for mobile. The percentage is what's actually informative
// here — the tick/cross alone only tells you whether a majority said yes.
export default function HoverStatChip({
  label,
  percent,
  availabilityLabel,
  detail,
}: {
  label: string;
  percent: number;
  availabilityLabel: string;
  detail?: string[];
}) {
  const [open, setOpen] = useState(false);
  const present = percent > 50;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${
          present ? "bg-green text-white" : "bg-muted-soft text-muted"
        }`}
      >
        {present ? <IconCheck className="h-3.5 w-3.5" /> : <IconX className="h-3.5 w-3.5" />}
        {label}
      </button>

      {open && (
        <span
          role="status"
          className="absolute bottom-full left-0 z-10 mb-2 w-56 rounded-xl border border-line bg-white p-3 text-xs shadow-md"
        >
          <span className="block font-semibold text-ink">
            {Math.round(percent)}% of locums said {availabilityLabel} was available
          </span>
          {detail?.map((line) => (
            <span key={line} className="mt-1 block text-ink-soft">
              {line}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
