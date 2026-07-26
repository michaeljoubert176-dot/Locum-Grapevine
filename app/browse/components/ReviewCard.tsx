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

// Deliberately no field labels here — just the dates, then whatever free
// text the reviewer wrote, wish_youd_known first and other_feedback as a
// following paragraph. Either (or both) may be missing.
export default function ReviewCard({ review }: { review: ReviewRow }) {
  const wishYoudKnown = review.wish_youd_known?.trim();
  const otherFeedback = review.other_feedback?.trim();

  return (
    <li className="rounded-2xl border border-line border-l-4 border-l-purple bg-white p-5">
      <p className="text-xs tracking-wide text-amber-accent uppercase">
        {formatWorkedPeriod(review)}
      </p>

      {wishYoudKnown && <p className="mt-3 text-sm leading-relaxed text-ink">{wishYoudKnown}</p>}
      {otherFeedback && (
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{otherFeedback}</p>
      )}
      {!wishYoudKnown && !otherFeedback && (
        <p className="mt-3 text-sm text-ink-soft italic">No written feedback provided.</p>
      )}
    </li>
  );
}
