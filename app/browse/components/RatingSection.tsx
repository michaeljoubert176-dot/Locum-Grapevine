"use client";

import { useState } from "react";
import {
  ATTRIBUTE_QUESTIONS,
  headlineAverage,
  percentAtLeast,
  questionAverage,
  questionDistribution,
  sortReviewsForOverallComments,
  type CoreQuestionKey,
  type OverallCommentSort,
  type ReviewRow,
} from "@/lib/reviews";
import { IconChevronDown } from "@/app/components/icons";
import ScoreHistogram from "@/app/browse/components/ScoreHistogram";
import StarRating from "@/app/browse/components/StarRating";

type Score = 1 | 2 | 3 | 4 | 5;

// The headline star rating. Tapping it reveals the fuller breakdown below:
// the overall-rating histogram, the two "would work again"/"would
// recommend" percentages, the six attribute histograms, and the Overall
// comments list (sortable, and filterable by tapping a score — either on
// the overall-rating histogram itself or the All/1–5 buttons below it).
export default function RatingSection({ reviews }: { reviews: ReviewRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const [overallScoreFilter, setOverallScoreFilter] = useState<Score | null>(null);

  const headline = headlineAverage(reviews);
  if (headline === null) return null;

  const overallDistribution = questionDistribution(reviews, "overall_good_job");
  const workAgainPercent = percentAtLeast(reviews, "would_work_again", 4);
  const recommendPercent = percentAtLeast(reviews, "would_recommend", 4);

  function toggleOverallScoreFilter(score: Score) {
    setOverallScoreFilter((current) => (current === score ? null : score));
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full flex-wrap items-center gap-3 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
      >
        <StarRating average={headline} />
        <p className="text-ink">
          <span className="text-2xl font-semibold">{headline.toFixed(1)}</span>
          <span className="text-ink-soft"> / 5</span>
          <span className="ml-2 text-sm text-ink-soft">
            based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </p>
        <IconChevronDown
          className={`ml-auto h-5 w-5 text-ink-soft ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-6 space-y-10 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div>
            <h3 className="text-sm font-semibold text-ink">Overall rating</h3>
            <div className="mt-3">
              <ScoreHistogram
                distribution={overallDistribution}
                total={reviews.length}
                color="green"
                selected={overallScoreFilter}
                onSelect={toggleOverallScoreFilter}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PercentStat label="Would work again" percent={workAgainPercent} color="green" />
            <PercentStat label="Would recommend" percent={recommendPercent} color="purple" />
          </div>

          <div className="space-y-6">
            {ATTRIBUTE_QUESTIONS.map(({ key, label }) => (
              <AttributeRow key={key} label={label} reviews={reviews} questionKey={key} />
            ))}
          </div>

          <OverallComments
            reviews={reviews}
            scoreFilter={overallScoreFilter}
            onScoreFilterChange={setOverallScoreFilter}
          />
        </div>
      )}
    </div>
  );
}

function PercentStat({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number | null;
  color: "green" | "purple";
}) {
  return (
    <div className={`rounded-xl px-4 py-3 text-white ${color === "green" ? "bg-green" : "bg-purple"}`}>
      <p className="text-2xl font-semibold">{percent !== null ? `${Math.round(percent)}%` : "—"}</p>
      <p className="text-sm text-white/80">{label}</p>
    </div>
  );
}

function AttributeRow({
  label,
  reviews,
  questionKey,
}: {
  label: string;
  reviews: ReviewRow[];
  questionKey: CoreQuestionKey;
}) {
  const [open, setOpen] = useState(false);
  const avg = questionAverage(reviews, questionKey);
  const distribution = questionDistribution(reviews, questionKey);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-baseline justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
      >
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-accent">
          {avg !== null ? avg.toFixed(1) : "—"} / 5
          <IconChevronDown className={`h-4 w-4 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="mt-3">
          <ScoreHistogram distribution={distribution} total={reviews.length} color="amber" />
        </div>
      )}
    </div>
  );
}

const SORT_LABEL: Record<OverallCommentSort, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "score-desc": "Highest score",
  "score-asc": "Lowest score",
};

const SORT_OPTIONS = Object.keys(SORT_LABEL) as OverallCommentSort[];

function OverallComments({
  reviews,
  scoreFilter,
  onScoreFilterChange,
}: {
  reviews: ReviewRow[];
  scoreFilter: Score | null;
  onScoreFilterChange: (score: Score | null) => void;
}) {
  const [sort, setSort] = useState<OverallCommentSort>("newest");

  const filtered = scoreFilter
    ? reviews.filter((review) => review.overall_good_job === scoreFilter)
    : reviews;
  const sorted = sortReviewsForOverallComments(filtered, sort);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Overall comments</h3>
        <label className="flex items-center gap-2 text-xs font-medium text-ink-soft">
          Sort by
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as OverallCommentSort)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SORT_LABEL[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterPill active={scoreFilter === null} onClick={() => onScoreFilterChange(null)}>
          All
        </FilterPill>
        {([1, 2, 3, 4, 5] as const).map((score) => (
          <FilterPill
            key={score}
            active={scoreFilter === score}
            onClick={() => onScoreFilterChange(score)}
          >
            {score}
          </FilterPill>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-line bg-white p-5 text-sm text-ink-soft">
          No reviews match this score.
        </p>
      ) : (
        <ul
          role="list"
          className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-muted-soft/40 p-4 sm:p-5"
        >
          {sorted.map((review) => (
            <li key={review.id} className="rounded-2xl border border-line bg-white p-4">
              <span className="inline-flex items-center rounded-full bg-green px-3 py-1 text-sm font-semibold text-white">
                {review.overall_good_job} / 5
              </span>
              {review.overall_comment?.trim() && (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {review.overall_comment.trim()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
        active ? "bg-green text-white" : "bg-green-soft text-green"
      }`}
    >
      {children}
    </button>
  );
}
