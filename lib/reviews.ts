import { supabase } from "@/lib/supabase";

// Reviews attach to a job (not a role in a category tree — see lib/jobs.ts
// for what a job is). Each review also owns zero or more "review_duties"
// rows, each recording one (shift type, duty) pair the reviewer ticked.

export type ReviewDuty = {
  shiftTypeName: string;
  dutyName: string;
};

export type ReviewRow = {
  id: string;
  created_at: string;
  worked_from: string | null;
  worked_to: string | null;

  overall_good_job: number;
  would_work_again: number;
  would_recommend: number;
  supervision_needed: number;
  felt_safe: number;
  workload_manageable: number;
  information_accurate: number;
  felt_welcome: number;
  paid_correctly: number;

  rate_type: "hourly" | "fixed_shift_rate";
  overtime_paid: boolean;

  car_provided: boolean;
  accommodation_hospital_available: boolean;
  accommodation_private_available: boolean;
  flights_provided: boolean;
  weekends_required: boolean;

  wish_youd_known: string | null;
  overall_comment: string | null;

  duties: ReviewDuty[];
};

type RawReviewRow = Omit<ReviewRow, "duties"> & {
  review_duties: { shift_types: { name: string }; duties: { name: string } }[];
};

export type ReviewFetchResult =
  | { data: ReviewRow[]; error: null }
  | { data: null; error: string };

const REVIEW_SELECT = `
  id, created_at, worked_from, worked_to,
  overall_good_job, would_work_again, would_recommend, supervision_needed, felt_safe,
  workload_manageable, information_accurate, felt_welcome, paid_correctly,
  rate_type, overtime_paid,
  car_provided, accommodation_hospital_available, accommodation_private_available,
  flights_provided, weekends_required,
  wish_youd_known, overall_comment,
  review_duties ( shift_types ( name ), duties ( name ) )
`;

export async function fetchReviewsForJob(jobId: string): Promise<ReviewFetchResult> {
  const { data, error } = await supabase.from("reviews").select(REVIEW_SELECT).eq("job_id", jobId);

  if (error) {
    return { data: null, error: error.message };
  }

  const rows: ReviewRow[] = ((data ?? []) as unknown as RawReviewRow[]).map((row) => ({
    ...row,
    duties: row.review_duties.map((rd) => ({
      shiftTypeName: rd.shift_types.name,
      dutyName: rd.duties.name,
    })),
  }));

  return { data: rows, error: null };
}

// The nine core questions, in the exact order they're pooled for the
// headline star rating.
export const CORE_QUESTIONS = [
  { key: "overall_good_job", label: "Overall, this was a good job" },
  { key: "would_work_again", label: "I would work this job again" },
  { key: "would_recommend", label: "I would recommend this job to another locum" },
  { key: "supervision_needed", label: "I received the supervision I needed" },
  { key: "felt_safe", label: "I felt safe doing this job" },
  { key: "workload_manageable", label: "The workload was manageable" },
  { key: "information_accurate", label: "The information I was given was accurate" },
  { key: "felt_welcome", label: "The team made me feel welcome" },
  { key: "paid_correctly", label: "I was paid correctly and on time" },
] as const satisfies ReadonlyArray<{ key: keyof ReviewRow; label: string }>;

export type CoreQuestionKey = (typeof CORE_QUESTIONS)[number]["key"];

// The six attributes shown once the headline rating is expanded. This is a
// subset of CORE_QUESTIONS — it leaves out overall_good_job,
// would_work_again and would_recommend, which get their own dedicated
// summaries (the overall distribution and the two percentages) instead.
export const ATTRIBUTE_QUESTIONS = [
  { key: "supervision_needed", label: "Supervision" },
  { key: "felt_safe", label: "Safety" },
  { key: "workload_manageable", label: "Workload" },
  { key: "information_accurate", label: "As described" },
  { key: "felt_welcome", label: "Made welcome" },
  { key: "paid_correctly", label: "Payment" },
] as const satisfies ReadonlyArray<{ key: CoreQuestionKey; label: string }>;

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// The headline star rating: the average of all nine core questions, across
// all reviews, treated as one big pool of scores.
export function headlineAverage(reviews: ReviewRow[]): number | null {
  if (reviews.length === 0) return null;

  const allScores: number[] = [];
  for (const review of reviews) {
    for (const { key } of CORE_QUESTIONS) {
      allScores.push(review[key] as number);
    }
  }

  return average(allScores);
}

export function questionAverage(reviews: ReviewRow[], key: CoreQuestionKey): number | null {
  return average(reviews.map((review) => review[key] as number));
}

export function questionDistribution(
  reviews: ReviewRow[],
  key: CoreQuestionKey
): Record<1 | 2 | 3 | 4 | 5, number> {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const score = review[key] as 1 | 2 | 3 | 4 | 5;
    distribution[score] += 1;
  }
  return distribution;
}

// The percentage of reviews scoring a question at or above `threshold`.
// The denominator is always every review for this job — a review that gave
// a neutral (3/5) score still counts in the denominator, just not the
// numerator, so a job with a lot of "meh" reviews correctly shows a modest
// percentage instead of having those reviews quietly dropped from the count.
export function percentAtLeast(
  reviews: ReviewRow[],
  key: CoreQuestionKey,
  threshold: 1 | 2 | 3 | 4 | 5
): number | null {
  if (reviews.length === 0) return null;
  const count = reviews.filter((review) => (review[key] as number) >= threshold).length;
  return (count / reviews.length) * 100;
}

// Sorts newest-first by worked_from, with reviews missing a worked_from
// date pushed to the end (we don't know when they happened, so we can't
// call them "newest").
export function sortReviewsNewestFirst(reviews: ReviewRow[]): ReviewRow[] {
  return [...reviews].sort((a, b) => {
    if (a.worked_from && b.worked_from) {
      return b.worked_from.localeCompare(a.worked_from);
    }
    if (a.worked_from) return -1;
    if (b.worked_from) return 1;
    return b.created_at.localeCompare(a.created_at);
  });
}

// The mirror of sortReviewsNewestFirst: oldest worked_from first, with
// reviews missing a worked_from still pushed to the end rather than
// treated as "oldest" — we don't know when they happened either way.
function sortReviewsOldestFirst(reviews: ReviewRow[]): ReviewRow[] {
  return [...reviews].sort((a, b) => {
    if (a.worked_from && b.worked_from) {
      return a.worked_from.localeCompare(b.worked_from);
    }
    if (a.worked_from) return -1;
    if (b.worked_from) return 1;
    return a.created_at.localeCompare(b.created_at);
  });
}

export type OverallCommentSort = "newest" | "oldest" | "score-desc" | "score-asc";

// Sorts reviews for the "Overall comments" list: by worked_from (newest or
// oldest first) or by the overall_good_job score (highest or lowest
// first).
export function sortReviewsForOverallComments(
  reviews: ReviewRow[],
  sort: OverallCommentSort
): ReviewRow[] {
  switch (sort) {
    case "newest":
      return sortReviewsNewestFirst(reviews);
    case "oldest":
      return sortReviewsOldestFirst(reviews);
    case "score-desc":
      return [...reviews].sort((a, b) => b.overall_good_job - a.overall_good_job);
    case "score-asc":
      return [...reviews].sort((a, b) => a.overall_good_job - b.overall_good_job);
  }
}

export type RateTypeSummary = "hourly" | "fixed_shift_rate" | "mixed";

// Pay-per-shift-type figures now live in `review_shifts` rather than as flat
// columns on `reviews` (see the schema spec) — the per-shift-type rate
// ranges and hourly conversion are part of the Build B display work, not
// built yet. This summary is limited to the job-level facts that remain on
// `reviews` itself.
export type PaySummary = {
  rateType: RateTypeSummary;
};

export function summarizePay(reviews: ReviewRow[]): PaySummary {
  const hourlyCount = reviews.filter((r) => r.rate_type === "hourly").length;
  const fixedCount = reviews.filter((r) => r.rate_type === "fixed_shift_rate").length;
  const rateType: RateTypeSummary =
    hourlyCount > 0 && fixedCount > 0 ? "mixed" : fixedCount > 0 ? "fixed_shift_rate" : "hourly";

  return { rateType };
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export type ShiftTypeDuties = { shiftType: string; duties: string[] };

// The union of every (shift type, duty) pair ticked across all of this
// job's reviews, grouped by shift type. This deliberately isn't a
// per-review breakdown — the roster chip is meant to answer "what duties
// come up in this job overall", not "what did any one reviewer report".
export function summarizeDutiesByShiftType(reviews: ReviewRow[]): ShiftTypeDuties[] {
  const byShiftType = new Map<string, Set<string>>();

  for (const review of reviews) {
    for (const duty of review.duties) {
      const set = byShiftType.get(duty.shiftTypeName) ?? new Set<string>();
      set.add(duty.dutyName);
      byShiftType.set(duty.shiftTypeName, set);
    }
  }

  return Array.from(byShiftType.entries())
    .map(([shiftType, duties]) => ({ shiftType, duties: Array.from(duties).sort() }))
    .sort((a, b) => a.shiftType.localeCompare(b.shiftType));
}

// Whether more than half of reviews report this as true. A tie (or a
// minority) reads as "no" — a job shouldn't get a confident checkmark for
// something that's inconsistent in practice.
export function majorityProvided(
  reviews: ReviewRow[],
  key: "car_provided" | "flights_provided" | "overtime_paid"
): boolean {
  const providedCount = reviews.filter((r) => r[key]).length;
  return providedCount > reviews.length - providedCount;
}

// Same majority rule as majorityProvided, but for accommodation — which is
// now two booleans (hospital-available / private-available) rather than one
// flat flag, since a job can offer neither, either, or both kinds.
export function majorityAccommodationProvided(reviews: ReviewRow[]): boolean {
  const providedCount = reviews.filter(
    (r) => r.accommodation_hospital_available || r.accommodation_private_available
  ).length;
  return providedCount > reviews.length - providedCount;
}
