import { sortReviewsNewestFirst, type ReviewRow } from "@/lib/reviews";
import ReviewCard from "@/app/browse/components/ReviewCard";

// Individual reviews, newest first by worked_from, scrollable within their
// own fixed-height container rather than stretching the whole page.
export default function ReviewsList({ reviews }: { reviews: ReviewRow[] }) {
  const sorted = sortReviewsNewestFirst(reviews);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Individual reviews</h2>
      <ul
        role="list"
        className="mt-6 max-h-[32rem] space-y-4 overflow-y-auto rounded-2xl border border-line bg-muted-soft/40 p-4 sm:p-5"
      >
        {sorted.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>
    </div>
  );
}
