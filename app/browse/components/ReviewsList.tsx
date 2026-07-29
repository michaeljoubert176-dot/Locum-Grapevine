import { sortReviewsNewestFirst, type ReviewRow } from "@/lib/reviews";
import ReviewCard from "@/app/browse/components/ReviewCard";

// The "wish I'd known" answers, newest first by worked_from, scrollable
// within their own fixed-height container rather than stretching the
// whole page. Reviews with no wish_youd_known answer are skipped — a
// reviewer's overall comment (if any) appears separately, in the Overall
// comments list under the ratings section.
export default function ReviewsList({ reviews }: { reviews: ReviewRow[] }) {
  const withWishYoudKnown = reviews.filter((review) => review.wish_youd_known?.trim());
  const sorted = sortReviewsNewestFirst(withWishYoudKnown);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Individual reviews</h2>
      {sorted.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">
          No &ldquo;what I wish I&apos;d known&rdquo; answers yet.
        </p>
      ) : (
        <ul
          role="list"
          className="mt-6 max-h-[32rem] space-y-4 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-muted-soft/40 p-4 sm:p-5"
        >
          {sorted.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      )}
    </div>
  );
}
