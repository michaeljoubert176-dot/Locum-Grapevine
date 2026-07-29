"use client";

import { useState } from "react";
import {
  accommodationKindsAvailable,
  percentAccommodationAvailable,
  percentTrue,
  summarizeDutiesByShiftType,
  summarizePay,
  summarizePayByShiftType,
  summarizeRosterByShiftType,
  type ReviewRow,
} from "@/lib/reviews";
import { IconChevronDown } from "@/app/components/icons";
import HoverStatChip from "@/app/browse/components/HoverStatChip";
import PayPanel from "@/app/browse/components/PayPanel";
import RosterPanel from "@/app/browse/components/RosterPanel";
import DutiesPanel from "@/app/browse/components/DutiesPanel";

type Panel = "pay" | "roster" | "duties" | null;

// The snapshot fact chips. Pay, Roster and Duties are three separate
// drill-ins onto the same underlying shift-type spine — tapping one reveals
// its own panel below; Car/Accommodation/Flights sit on their own line as
// hover/tap chips revealing the percentage of reviews reporting each.
// Only one drill-in panel is open at a time, accordion-style.
export default function FactChipsSection({ reviews }: { reviews: ReviewRow[] }) {
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  const paySummary = summarizePay(reviews);
  const payByShiftType = summarizePayByShiftType(reviews);
  const rosterByShiftType = summarizeRosterByShiftType(reviews);
  const duties = summarizeDutiesByShiftType(reviews);

  const carPercent = percentTrue(reviews, "car_provided");
  const flightsPercent = percentTrue(reviews, "flights_provided");
  const accommodationPercent = percentAccommodationAvailable(reviews);
  const accommodationKinds = accommodationKindsAvailable(reviews);

  const accommodationDetail: string[] = [];
  if (accommodationKinds.hospital) accommodationDetail.push("Hospital-provided accommodation available");
  if (accommodationKinds.private) accommodationDetail.push("Private accommodation reimbursement available");

  function togglePanel(panel: Exclude<Panel, null>) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <ChipButton variant="purple" expanded={openPanel === "pay"} onClick={() => togglePanel("pay")}>
          Pay
        </ChipButton>

        <ChipButton expanded={openPanel === "roster"} onClick={() => togglePanel("roster")}>
          Roster
        </ChipButton>

        <ChipButton expanded={openPanel === "duties"} onClick={() => togglePanel("duties")}>
          Duties
        </ChipButton>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <HoverStatChip label="Car" percent={carPercent} availabilityLabel="a car" />
        <HoverStatChip
          label="Accommodation"
          percent={accommodationPercent}
          availabilityLabel="accommodation"
          detail={accommodationDetail}
        />
        <HoverStatChip label="Flights" percent={flightsPercent} availabilityLabel="flight reimbursement" />
      </div>

      {openPanel === "pay" && (
        <PayPanel reviews={reviews} payByShiftType={payByShiftType} paySummary={paySummary} />
      )}
      {openPanel === "roster" && <RosterPanel reviews={reviews} rosterByShiftType={rosterByShiftType} />}
      {openPanel === "duties" && <DutiesPanel duties={duties} />}
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
