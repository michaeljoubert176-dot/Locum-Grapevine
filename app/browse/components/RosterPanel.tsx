import { formatHours, percentTrue, type ReviewRow, type RosterShiftTypeSummary } from "@/lib/reviews";
import PresenceChip from "@/app/browse/components/PresenceChip";

// Rostered vs actual times (and the hours derived from them) per shift
// type — the "busier than advertised" signal — plus whether weekends are
// required. Lists every shift type this job has (the same set Duties
// shows), not just the ones with pay/hours reported yet.
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
  if (!summary.hasData) {
    return (
      <div className="rounded-xl border border-line p-4">
        <p className="text-xs tracking-wide text-amber-accent uppercase">{summary.shiftType}</p>
        <p className="mt-2 text-sm text-ink-soft">No rostered or actual hours reported yet.</p>
      </div>
    );
  }

  const { shiftType, rosteredStart, rosteredFinish, actualStart, actualFinish, avgRosteredHours, avgActualHours } =
    summary;
  const gap = avgActualHours - avgRosteredHours;

  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs tracking-wide text-amber-accent uppercase">{shiftType}</p>
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-ink-soft">Rostered</dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">
            {rosteredStart}–{rosteredFinish}
            <span className="ml-1.5 font-normal text-ink-soft">({formatHours(avgRosteredHours)})</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-soft">Actual (avg)</dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">
            {actualStart}–{actualFinish}
            <span className="ml-1.5 font-normal text-ink-soft">({formatHours(avgActualHours)})</span>
          </dd>
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
