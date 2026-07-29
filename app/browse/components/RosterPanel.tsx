import { formatHours, percentTrue, type ReviewRow, type RosterShiftTypeSummary } from "@/lib/reviews";
import PresenceChip from "@/app/browse/components/PresenceChip";

// Rostered vs actual hours per shift type — the "busier than advertised"
// signal — plus whether weekends are required. Unlike Pay, this has no
// further drill-in: it's just the two hours figures shown side by side.
export default function RosterPanel({
  reviews,
  rosterByShiftType,
}: {
  reviews: ReviewRow[];
  rosterByShiftType: RosterShiftTypeSummary[];
}) {
  const weekendsRequired = percentTrue(reviews, "weekends_required") > 50;

  return (
    <div className="mt-4 rounded-2xl border border-line bg-white p-5">
      <div>
        <PresenceChip label="Weekends required" present={weekendsRequired} />
      </div>

      {rosterByShiftType.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">No roster data has been reported for this job yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rosterByShiftType.map((summary) => (
            <RosterShiftTypeRow key={summary.shiftType} summary={summary} />
          ))}
        </div>
      )}
    </div>
  );
}

function RosterShiftTypeRow({ summary }: { summary: RosterShiftTypeSummary }) {
  const { shiftType, avgRosteredHours, avgActualHours } = summary;
  const gap = avgActualHours - avgRosteredHours;

  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs tracking-wide text-amber-accent uppercase">{shiftType}</p>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-ink-soft">Rostered</dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">{formatHours(avgRosteredHours)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-soft">Actual (avg)</dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">{formatHours(avgActualHours)}</dd>
        </div>
      </div>
      {Math.abs(gap) >= 0.1 && (
        <p className="mt-2 text-xs text-ink-soft">
          {gap > 0
            ? `On average, ${formatHours(gap)} longer than rostered.`
            : `On average, ${formatHours(Math.abs(gap))} shorter than rostered.`}
        </p>
      )}
    </div>
  );
}
