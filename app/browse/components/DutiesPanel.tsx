import type { ShiftTypeDuties } from "@/lib/reviews";

// Per shift type, the union of duties reported for it across every review
// of this job — "what can come up", not a per-review breakdown or stats.
export default function DutiesPanel({ duties }: { duties: ShiftTypeDuties[] }) {
  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-line bg-white p-5">
      <p className="text-xs text-ink-soft">What locums report doing on each shift.</p>

      {duties.length === 0 ? (
        <p className="text-sm text-ink-soft">No duties have been reported for this job yet.</p>
      ) : (
        duties.map(({ shiftType, duties: dutyNames }) => (
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
        ))
      )}
    </div>
  );
}
