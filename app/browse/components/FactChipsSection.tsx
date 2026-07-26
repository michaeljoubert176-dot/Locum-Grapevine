"use client";

import { useState } from "react";
import {
  formatMoney,
  majorityProvided,
  summarizeDutiesByShiftType,
  summarizePay,
  type PaySummary,
  type ReviewRow,
  type ShiftTypeDuties,
} from "@/lib/reviews";
import { IconCheck, IconChevronDown, IconX } from "@/app/components/icons";

type Panel = "pay" | "roster" | null;

// The snapshot fact chips: Pay and Roster are tappable, each revealing a
// panel below the chip row; Car/Accommodation/Flights are simple, static
// yes/no chips. Only one panel is open at a time, accordion-style.
export default function FactChipsSection({ reviews }: { reviews: ReviewRow[] }) {
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  const pay = summarizePay(reviews);
  const duties = summarizeDutiesByShiftType(reviews);

  const car = majorityProvided(reviews, "car_provided");
  const accommodation = majorityProvided(reviews, "accommodation_provided");
  const flights = majorityProvided(reviews, "flights_provided");

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

        <PresenceChip label="Car" present={car} />
        <PresenceChip label="Accommodation" present={accommodation} />
        <PresenceChip label="Flights" present={flights} />
      </div>

      {openPanel === "pay" && <PayPanel pay={pay} />}
      {openPanel === "roster" && <RosterPanel duties={duties} />}
    </div>
  );
}

function formatPayHeadline(pay: PaySummary): string {
  if (pay.dayRate) {
    return pay.dayRate.min === pay.dayRate.max
      ? `${formatMoney(pay.dayRate.min)} / day`
      : `${formatMoney(pay.dayRate.min)}–${formatMoney(pay.dayRate.max)} / day`;
  }
  if (pay.hourlyRate) {
    return pay.hourlyRate.min === pay.hourlyRate.max
      ? `${formatMoney(pay.hourlyRate.min)} / hour`
      : `${formatMoney(pay.hourlyRate.min)}–${formatMoney(pay.hourlyRate.max)} / hour`;
  }
  return "Pay";
}

function describeRateTypes(rateTypeCounts: { hourly: number; fixed_shift_rate: number }): string {
  const { hourly, fixed_shift_rate: fixedShiftRate } = rateTypeCounts;
  if (hourly > 0 && fixedShiftRate === 0) return "Hourly";
  if (fixedShiftRate > 0 && hourly === 0) return "Fixed shift rate";
  return `Hourly (${hourly}) / fixed shift rate (${fixedShiftRate})`;
}

function PayPanel({ pay }: { pay: PaySummary }) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-white p-5">
      <dl className="grid gap-4 sm:grid-cols-2">
        {pay.dayRate && (
          <PayStat
            label="Day rate"
            value={`${formatMoney(pay.dayRate.min)} – ${formatMoney(pay.dayRate.max)}`}
            note={`${pay.dayRate.count} of ${pay.totalReviews} reviews`}
          />
        )}
        {pay.hourlyRate && (
          <PayStat
            label="Hourly rate"
            value={`${formatMoney(pay.hourlyRate.min)} – ${formatMoney(pay.hourlyRate.max)}`}
            note={`${pay.hourlyRate.count} of ${pay.totalReviews} reviews`}
          />
        )}
        {pay.nightRate && (
          <PayStat
            label="Night rate (where it differs)"
            value={`${formatMoney(pay.nightRate.min)} – ${formatMoney(pay.nightRate.max)}`}
            note={`${pay.nightRate.count} of ${pay.totalReviews} reviews`}
          />
        )}
        <PayStat label="Rate type" value={describeRateTypes(pay.rateTypeCounts)} />
        <PayStat label="Overtime paid" value={`${pay.overtimePaidCount} of ${pay.totalReviews} reviews`} />
      </dl>
    </div>
  );
}

function PayStat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-amber-accent uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
      {note && <dd className="text-xs text-ink-soft">{note}</dd>}
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
