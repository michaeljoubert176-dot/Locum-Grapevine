import type { ReviewRow } from "@/lib/reviews";

function formatMonthYear(dateString: string): string {
  const [year, month] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    Date.UTC(year, month - 1, 1)
  );
}

function formatWorkedPeriod(review: ReviewRow): string {
  if (review.worked_from && review.worked_to) {
    const from = formatMonthYear(review.worked_from);
    const to = formatMonthYear(review.worked_to);
    return from === to ? `Worked ${from}` : `Worked ${from} – ${to}`;
  }
  if (review.worked_from) {
    return `Worked from ${formatMonthYear(review.worked_from)}`;
  }
  return "Dates not provided";
}

export default function ReviewCard({ review }: { review: ReviewRow }) {
  const hasWishYoudKnown = Boolean(review.wish_youd_known?.trim());
  const hasOtherFeedback = Boolean(review.other_feedback?.trim());

  return (
    <li className="rounded-2xl border border-teal-700/15 bg-paper-warm p-5">
      <p className="text-xs tracking-wide text-teal-700/70 uppercase">{formatWorkedPeriod(review)}</p>

      {hasWishYoudKnown && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-ink">What I wish I&apos;d known</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{review.wish_youd_known}</p>
        </div>
      )}

      {hasOtherFeedback && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-ink">Other feedback</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{review.other_feedback}</p>
        </div>
      )}
    </li>
  );
}
