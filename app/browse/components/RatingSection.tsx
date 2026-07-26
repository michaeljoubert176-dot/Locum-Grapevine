"use client";

import { useState } from "react";
import {
  ATTRIBUTE_QUESTIONS,
  headlineAverage,
  percentAtLeast,
  questionAverage,
  questionDistribution,
  type CoreQuestionKey,
  type ReviewRow,
} from "@/lib/reviews";
import { IconChevronDown } from "@/app/components/icons";
import DistributionBars from "@/app/browse/components/DistributionBars";
import StarRating from "@/app/browse/components/StarRating";

// The headline star rating. Tapping it reveals the fuller breakdown below:
// the overall-rating distribution, the two "would work again"/"would
// recommend" percentages, and the six attribute averages (each of which
// can be tapped again to pop out its own distribution).
export default function RatingSection({ reviews }: { reviews: ReviewRow[] }) {
  const [expanded, setExpanded] = useState(false);

  const headline = headlineAverage(reviews);
  if (headline === null) return null;

  const overallDistribution = questionDistribution(reviews, "overall_good_job");
  const workAgainPercent = percentAtLeast(reviews, "would_work_again", 4);
  const recommendPercent = percentAtLeast(reviews, "would_recommend", 4);

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
        <div className="mt-6 space-y-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div>
            <h3 className="text-sm font-semibold text-ink">Overall rating</h3>
            <div className="mt-3">
              <DistributionBars distribution={overallDistribution} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PercentStat label="Would work again" percent={workAgainPercent} />
            <PercentStat label="Would recommend" percent={recommendPercent} />
          </div>

          <div className="space-y-6">
            {ATTRIBUTE_QUESTIONS.map(({ key, label }) => (
              <AttributeRow key={key} label={label} reviews={reviews} questionKey={key} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PercentStat({ label, percent }: { label: string; percent: number | null }) {
  return (
    <div className="rounded-xl bg-green-soft px-4 py-3">
      <p className="text-2xl font-semibold text-green">
        {percent !== null ? `${Math.round(percent)}%` : "—"}
      </p>
      <p className="text-sm text-ink-soft">{label}</p>
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
        <span className="flex items-center gap-2 text-sm text-ink-soft">
          {avg !== null ? avg.toFixed(1) : "—"} / 5
          <IconChevronDown className={`h-4 w-4 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="mt-3">
          <DistributionBars distribution={distribution} />
        </div>
      )}
    </div>
  );
}
