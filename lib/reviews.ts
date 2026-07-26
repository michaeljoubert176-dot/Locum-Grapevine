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

  pay_amount: string;
  pay_unit: "hour" | "day";
  night_rate_differs: boolean;
  night_pay_amount: string | null;
  rate_type: "hourly" | "fixed_shift_rate";
  overtime_paid: boolean;

  car_provided: boolean;
  accommodation_provided: boolean;
  flights_provided: boolean;

  wish_youd_known: string | null;
  other_feedback: string | null;

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
  pay_amount, pay_unit, night_rate_differs, night_pay_amount, rate_type, overtime_paid,
  car_provided, accommodation_provided, flights_provided,
  wish_youd_known, other_feedback,
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

export type PayRange = { min: number; max: number };

export type RateTypeSummary = "hourly" | "fixed_shift_rate" | "mixed";

export type PaySummary = {
  dayRate: PayRange | null;
  hourlyRate: PayRange | null;
  nightRate: PayRange | null;
  rateType: RateTypeSummary;
};

function payRange(amounts: number[]): PayRange | null {
  if (amounts.length === 0) return null;
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
}

// Pools every review's pay facts into one summary. Day rate and hourly
// rate are kept as separate ranges rather than converted into one another,
// since turning an hourly rate into a day rate would mean guessing a shift
// length that isn't recorded anywhere.
export function summarizePay(reviews: ReviewRow[]): PaySummary {
  const dayAmounts = reviews.filter((r) => r.pay_unit === "day").map((r) => Number(r.pay_amount));
  const hourlyAmounts = reviews.filter((r) => r.pay_unit === "hour").map((r) => Number(r.pay_amount));

  // A review's night rate is its night_pay_amount when it reports one that
  // differs, or simply its regular pay_amount otherwise — so the night
  // rate always has a figure to show, the same as the day rate whenever it
  // doesn't actually differ.
  const nightAmounts = reviews
    .filter((r) => !r.night_rate_differs || r.night_pay_amount !== null)
    .map((r) => Number(r.night_rate_differs ? r.night_pay_amount : r.pay_amount));

  const hourlyCount = reviews.filter((r) => r.rate_type === "hourly").length;
  const fixedCount = reviews.filter((r) => r.rate_type === "fixed_shift_rate").length;
  const rateType: RateTypeSummary =
    hourlyCount > 0 && fixedCount > 0 ? "mixed" : fixedCount > 0 ? "fixed_shift_rate" : "hourly";

  return {
    dayRate: payRange(dayAmounts),
    hourlyRate: payRange(hourlyAmounts),
    nightRate: payRange(nightAmounts),
    rateType,
  };
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
  key: "car_provided" | "accommodation_provided" | "flights_provided" | "overtime_paid"
): boolean {
  const providedCount = reviews.filter((r) => r[key]).length;
  return providedCount > reviews.length - providedCount;
}
