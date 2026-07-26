import type { ReviewRow } from "@/lib/reviews";

function formatMonthYear(dateString: string): string {
  const [year, month] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year, month - 1, 1));
}

function formatWorkedPeriod(review: ReviewRow): string {
  if (review.worked_from && review.worked_to) {
    const from = formatMonthYear(review.worked_from);
    const to = formatMonthYear(review.worked_to);
    return from === to ? `Worked ${from}` : `Worked ${from} – ${to}`;
  }
  if (review.worked_from) {
    return `Worked from ${formatMonthYear(review.worked_from)} (ongoing)`;
  }
  return "Dates not provided";
}

// The dates, then each free-text answer under its own label —
// wish_youd_known first, then other_feedback. Either (or both) may be
// missing; a label is only shown when its answer is present.
export default function ReviewCard({ review }: { review: ReviewRow }) {
  const wishYoudKnown = review.wish_youd_known?.trim();
  const otherFeedback = review.other_feedback?.trim();

  return (
    <li className="rounded-2xl border border-line border-l-4 border-l-purple bg-white p-5">
      <p className="text-xs tracking-wide text-amber-accent uppercase">
        {formatWorkedPeriod(review)}
      </p>

      {wishYoudKnown && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-ink">What I wish I&apos;d known</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{wishYoudKnown}</p>
        </div>
      )}

      {otherFeedback && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-ink">Other feedback</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{otherFeedback}</p>
        </div>
      )}

      {!wishYoudKnown && !otherFeedback && (
        <p className="mt-3 text-sm text-ink-soft italic">No written feedback provided.</p>
      )}
    </li>
  );
}
