"use client";

import { useState } from "react";
import {
  formatMoney,
  percentTrue,
  type PaySummary,
  type PayShiftTypeSummary,
  type RateTypeSummary,
  type ReviewRow,
} from "@/lib/reviews";
import { IconChevronRight } from "@/app/components/icons";
import PresenceChip from "@/app/browse/components/PresenceChip";
import HourlyRateOverTimeChart from "@/app/browse/components/charts/HourlyRateOverTimeChart";
import HourlyRateByAgencyChart from "@/app/browse/components/charts/HourlyRateByAgencyChart";

const RATE_TYPE_LABEL: Record<RateTypeSummary, string> = {
  hourly: "Hourly",
  fixed_shift_rate: "Fixed shift rate",
  mixed: "Hourly or fixed shift rate",
};

type RateUnit = "hourly" | "perShift";
type GraphView = "time" | "agency";

export default function PayPanel({
  reviews,
  payByShiftType,
  paySummary,
}: {
  reviews: ReviewRow[];
  payByShiftType: PayShiftTypeSummary[];
  paySummary: PaySummary;
}) {
  const [unit, setUnit] = useState<RateUnit>("hourly");
  const [selectedShiftType, setSelectedShiftType] = useState<string | null>(null);
  const [graphView, setGraphView] = useState<GraphView>("time");

  const overtimePaid = percentTrue(reviews, "overtime_paid") > 50;

  if (payByShiftType.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-line bg-white p-5 text-sm text-ink-soft">
        No pay data has been reported for this job yet.
      </div>
    );
  }

  const selected = payByShiftType.find((s) => s.shiftType === selectedShiftType) ?? null;

  return (
    <div className="mt-4 rounded-2xl border border-line bg-white p-5">
      {selected ? (
        <div>
          <button
            type="button"
            onClick={() => setSelectedShiftType(null)}
            className="flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <IconChevronRight className="h-4 w-4 rotate-180" />
            {selected.shiftType}
          </button>

          <div className="mt-4">
            <SegmentedToggle
              value={graphView}
              onChange={setGraphView}
              options={[
                { value: "time", label: "Over time" },
                { value: "agency", label: "By agency" },
              ]}
            />
          </div>

          <div className="mt-4">
            {graphView === "time" ? (
              <HourlyRateOverTimeChart points={selected.points} />
            ) : (
              <HourlyRateByAgencyChart data={selected.byAgency} />
            )}
          </div>
        </div>
      ) : (
        <div>
          <SegmentedToggle
            value={unit}
            onChange={setUnit}
            options={[
              { value: "hourly", label: "Hourly" },
              { value: "perShift", label: "Per Shift" },
            ]}
          />

          <div className="mt-4 space-y-2">
            {payByShiftType.map((summary) => (
              <ShiftTypeRateRow
                key={summary.shiftType}
                summary={summary}
                unit={unit}
                onSelect={() => setSelectedShiftType(summary.shiftType)}
              />
            ))}
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs tracking-wide text-amber-accent uppercase">Rate type</dt>
              <dd className="mt-1 text-sm text-ink">{RATE_TYPE_LABEL[paySummary.rateType]}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <PresenceChip label="Overtime paid" present={overtimePaid} />
          </div>
        </div>
      )}
    </div>
  );
}

function ShiftTypeRateRow({
  summary,
  unit,
  onSelect,
}: {
  summary: PayShiftTypeSummary;
  unit: RateUnit;
  onSelect: () => void;
}) {
  const range = unit === "hourly" ? summary.hourlyRange : summary.perShiftRange;
  const suffix = unit === "hourly" ? "/ hr" : "/ shift";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left hover:bg-muted-soft/40"
    >
      <span className="text-sm font-medium text-ink">{summary.shiftType}</span>
      <span className="flex items-center gap-2 text-sm font-semibold text-purple">
        {range.min === range.max
          ? `${formatMoney(range.min)} ${suffix}`
          : `${formatMoney(range.min)}–${formatMoney(range.max)} ${suffix}`}
        <IconChevronRight className="h-4 w-4 text-ink-soft" />
      </span>
    </button>
  );
}

function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-muted-soft/40 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
            value === option.value ? "bg-purple text-white" : "text-ink-soft"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
