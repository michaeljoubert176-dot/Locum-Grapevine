"use client";

import { useState } from "react";
import {
  majorityAccommodationProvided,
  majorityProvided,
  summarizeDutiesByShiftType,
  summarizePay,
  type PaySummary,
  type RateTypeSummary,
  type ReviewRow,
  type ShiftTypeDuties,
} from "@/lib/reviews";
import { IconCheck, IconChevronDown, IconX } from "@/app/components/icons";

type Panel = "pay" | "roster" | null;

const RATE_TYPE_LABEL: Record<RateTypeSummary, string> = {
  hourly: "Hourly",
  fixed_shift_rate: "Fixed shift rate",
  mixed: "Hourly or fixed shift rate",
};

// The snapshot fact chips. Pay and Roster are tappable, each revealing a
// panel below; Car/Accommodation/Flights sit on their own line as simple,
// static yes/no chips. Only one drill-in panel is open at a time,
// accordion-style.
export default function FactChipsSection({ reviews }: { reviews: ReviewRow[] }) {
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  const pay = summarizePay(reviews);
  const duties = summarizeDutiesByShiftType(reviews);

  const car = majorityProvided(reviews, "car_provided");
  const accommodation = majorityAccommodationProvided(reviews);
  const flights = majorityProvided(reviews, "flights_provided");
  const overtimePaid = majorityProvided(reviews, "overtime_paid");

  function togglePanel(panel: "pay" | "roster") {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <ChipButton variant="purple" expanded={openPanel === "pay"} onClick={() => togglePanel("pay")}>
          {formatPayHeadline(pay)}
        </ChipButton>

        <ChipButton expanded={openPanel === "roster"} onClick={() => togglePanel("roster")}>
          Roster
        </ChipButton>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <PresenceChip label="Car" present={car} />
        <PresenceChip label="Accommodation" present={accommodation} />
        <PresenceChip label="Flights" present={flights} />
      </div>

      {openPanel === "pay" && <PayPanel pay={pay} overtimePaid={overtimePaid} />}
      {openPanel === "roster" && <RosterPanel duties={duties} />}
    </div>
  );
}

// Per-shift-type rate ranges (the "$X–$Y / hour" headline) now depend on
// review_shifts, which isn't wired up to the display yet — that's Build B.
// For now the chip and panel just surface the job-level rate type.
function formatPayHeadline(pay: PaySummary): string {
  return RATE_TYPE_LABEL[pay.rateType];
}

function PayPanel({ pay, overtimePaid }: { pay: PaySummary; overtimePaid: boolean }) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-white p-5">
      <dl className="grid gap-4 sm:grid-cols-2">
        <PayStat label="Rate type" value={RATE_TYPE_LABEL[pay.rateType]} />
      </dl>

      <div className="mt-4">
        <PresenceChip label="Overtime paid" present={overtimePaid} />
      </div>
    </div>
  );
}

function PayStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-amber-accent uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

function RosterPanel({ duties }: { duties: ShiftTypeDuties[] }) {
  if (duties.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-line bg-white p-5 text-sm text-ink-soft">
        No duties have been reported for this job yet.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-line bg-white p-5">
      {duties.map(({ shiftType, duties: dutyNames }) => (
        <div key={shiftType}>
          <p className="text-xs tracking-wide text-amber-accent uppercase">{shiftType}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dutyNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-full bg-amber-soft px-3 py-1 text-xs text-amber"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChipButton({
  children,
  variant = "amber",
  expanded,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "amber" | "purple";
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm ${
        variant === "purple" ? "bg-purple-soft text-purple" : "bg-amber-soft text-amber"
      } ${expanded ? "outline outline-2 outline-offset-1 outline-current/40" : ""}`}
    >
      {children}
      <IconChevronDown className={`h-3.5 w-3.5 ${expanded ? "rotate-180" : ""}`} />
    </button>
  );
}

function PresenceChip({ label, present }: { label: string; present: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${
        present ? "bg-green text-white" : "bg-muted-soft text-muted"
      }`}
    >
      {present ? <IconCheck className="h-3.5 w-3.5" /> : <IconX className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
