"use client";

import { useState } from "react";
import {
  CORE_QUESTIONS,
  questionAverage,
  questionDistribution,
  sortReviewsNewestFirst,
  type CoreQuestionKey,
  type ReviewRow,
} from "@/lib/reviews";
import ReviewCard from "@/app/browse/components/ReviewCard";

type Filter = { key: CoreQuestionKey; score: 1 | 2 | 3 | 4 | 5 };

const SCORES = [1, 2, 3, 4, 5] as const;

// Owns the shared filter state: clicking a score in any question's
// distribution filters the review list further down the same section, and
// this is the one place both live so they can talk to each other.
export default function ReviewsBreakdownSection({ reviews }: { reviews: ReviewRow[] }) {
  const [filter, setFilter] = useState<Filter | null>(null);

  const sortedReviews = sortReviewsNewestFirst(reviews);
  const visibleReviews = filter
    ? sortedReviews.filter((review) => review[filter.key] === filter.score)
    : sortedReviews;

  const filterQuestionLabel = filter
    ? CORE_QUESTIONS.find((q) => q.key === filter.key)?.label
    : null;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">The breakdown</h2>

      <div className="mt-6 space-y-8">
        {CORE_QUESTIONS.map(({ key, label }) => (
          <QuestionRow
            key={key}
            questionKey={key}
            label={label}
            reviews={reviews}
            activeScore={filter?.key === key ? filter.score : null}
            onSelect={(score) => {
              setFilter((current) =>
                current?.key === key && current.score === score ? null : { key, score }
              );
            }}
          />
        ))}
      </div>

      <div className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink">Individual reviews</h2>
          {filter && (
            <p className="text-sm text-ink-soft">
              Showing reviews that rated &ldquo;{filterQuestionLabel}&rdquo; as {filter.score}/5 —{" "}
              <button
                type="button"
                onClick={() => setFilter(null)}
                className="font-medium text-green underline underline-offset-2 hover:opacity-80"
              >
                Clear filter
              </button>
            </p>
          )}
        </div>

        {visibleReviews.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">
            No reviews match this filter.
          </p>
        ) : (
          <ul role="list" className="mt-6 space-y-4">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function QuestionRow({
  questionKey,
  label,
  reviews,
  activeScore,
  onSelect,
}: {
  questionKey: CoreQuestionKey;
  label: string;
  reviews: ReviewRow[];
  activeScore: 1 | 2 | 3 | 4 | 5 | null;
  onSelect: (score: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const avg = questionAverage(reviews, questionKey);
  const distribution = questionDistribution(reviews, questionKey);
  const total = reviews.length;
  const maxCount = Math.max(...SCORES.map((s) => distribution[s]), 1);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-sm text-ink-soft">{avg !== null ? avg.toFixed(1) : "—"} / 5</p>
      </div>

      <div className="mt-3 flex items-end gap-1.5" style={{ height: "4.5rem" }}>
        {SCORES.map((score) => {
          const count = distribution[score];
          const heightPercent = count === 0 ? 0 : (count / maxCount) * 100;
          const isActive = activeScore === score;

          return (
            <button
              key={score}
              type="button"
              onClick={() => onSelect(score)}
              aria-pressed={isActive}
              disabled={count === 0}
              aria-label={`${count} of ${total} reviews rated this ${score} out of 5${
                isActive ? " (filter active)" : ""
              }`}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1 disabled:cursor-default"
            >
              <span
                className={`text-xs tabular-nums ${isActive ? "font-semibold text-green" : "text-ink-soft"}`}
              >
                {count}
              </span>
              <span
                style={{ height: `${Math.max(heightPercent, count === 0 ? 4 : 8)}%` }}
                className={`w-full min-h-[3px] rounded-t-sm transition-colors ${
                  isActive
                    ? "bg-green"
                    : count === 0
                      ? "bg-green/10"
                      : "bg-green/30 group-hover:bg-green/50 group-enabled:cursor-pointer"
                }`}
              />
              <span className="text-[11px] text-ink-soft">{score}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
