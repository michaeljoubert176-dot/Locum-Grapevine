import { supabase } from "@/lib/supabase";

// Reviews attach to a job (not a role in a category tree — see lib/jobs.ts
// for what a job is). Each review also owns zero or more "review_duties"
// rows, each recording one (shift type, duty) pair the reviewer ticked.

export type ReviewDuty = {
  shiftTypeName: string;
  dutyName: string;
};

// One row from review_shifts: what this reviewer was paid and worked for one
// shift type on this job. rate_amount comes back from Postgres/PostgREST as
// a numeric string (same convention the old flat pay_amount column used), so
// callers convert with Number() as needed. The four time fields come back as
// "HH:MM:SS" strings — hours aren't stored directly, they're derived from
// these (see durationHours below).
export type ReviewShift = {
  shiftTypeName: string;
  rateAmount: string;
  rosteredStart: string;
  rosteredFinish: string;
  actualStart: string;
  actualFinish: string;
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

  agencyName: string | null;

  wish_youd_known: string | null;
  overall_comment: string | null;

  shifts: ReviewShift[];
  duties: ReviewDuty[];
};

type RawReviewRow = Omit<ReviewRow, "duties" | "shifts" | "agencyName"> & {
  review_duties: { shift_types: { name: string }; duties: { name: string } }[];
  review_shifts: {
    rate_amount: string;
    rostered_start: string;
    rostered_finish: string;
    actual_start: string;
    actual_finish: string;
    shift_types: { name: string };
  }[];
  agencies: { name: string } | null;
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
  agencies ( name ),
  review_shifts ( rate_amount, rostered_start, rostered_finish, actual_start, actual_finish, shift_types ( name ) ),
  review_duties ( shift_types ( name ), duties ( name ) )
`;

export async function fetchReviewsForJob(jobId: string): Promise<ReviewFetchResult> {
  const { data, error } = await supabase.from("reviews").select(REVIEW_SELECT).eq("job_id", jobId);

  if (error) {
    return { data: null, error: error.message };
  }

  const rows: ReviewRow[] = ((data ?? []) as unknown as RawReviewRow[]).map((row) => ({
    ...row,
    agencyName: row.agencies?.name ?? null,
    shifts: row.review_shifts.map((rs) => ({
      shiftTypeName: rs.shift_types.name,
      rateAmount: rs.rate_amount,
      rosteredStart: rs.rostered_start,
      rosteredFinish: rs.rostered_finish,
      actualStart: rs.actual_start,
      actualFinish: rs.actual_finish,
    })),
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

// The job-level payment style. Individual reviews each report one contract
// style (hourly or fixed shift rate); "mixed" surfaces when reviews of the
// same job disagree, rather than silently picking one.
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

// Formats a decimal hours figure like "8.5h" — trims a trailing ".0" so
// whole-hour shifts read cleanly.
export function formatHours(hours: number): string {
  return `${Number(hours.toFixed(1))}h`;
}

export type PayRange = { min: number; max: number };

function payRange(amounts: number[]): PayRange | null {
  if (amounts.length === 0) return null;
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
}

// Parses a Postgres "time" string ("08:00:00") into minutes since midnight.
function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// The inverse of timeStringToMinutes, for display — e.g. 510 -> "08:30".
function minutesToTimeLabel(minutes: number): string {
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// Hours between a start and finish time-of-day. If finish is earlier than
// start, the shift is assumed to cross midnight (e.g. a Night shift from
// 22:00 to 07:00) rather than being negative.
function durationHours(start: string, finish: string): number {
  const startMinutes = timeStringToMinutes(start);
  const finishMinutes = timeStringToMinutes(finish);
  const diff = finishMinutes - startMinutes;
  return (diff < 0 ? diff + 24 * 60 : diff) / 60;
}

// The full set of shift types this job's reviews mention anywhere — either
// with pay/roster data (review_shifts) or duties (review_duties). Roster
// uses this so every shift type Duties shows also gets a Roster block, even
// if no pay/hours have been reported for it yet.
function shiftTypeSpine(reviews: ReviewRow[]): string[] {
  const names = new Set<string>();
  for (const review of reviews) {
    for (const shift of review.shifts) names.add(shift.shiftTypeName);
    for (const duty of review.duties) names.add(duty.shiftTypeName);
  }
  return Array.from(names).sort();
}

// One data point for the "hourly rate over time" graph: this review's
// hourly rate for one shift type, plotted against when it was worked.
export type PayPoint = { reviewId: string; workedFrom: string; hourlyRate: number };

export type AgencyRate = { agency: string; hourlyRange: PayRange };

export type PayShiftTypeSummary = {
  shiftType: string;
  // rate_amount as-is, ranged across every review that reported this shift
  // type — the "Per Shift" side of the Hourly ⇄ Per Shift toggle.
  perShiftRange: PayRange;
  // rate_amount ÷ rostered_hours, ranged the same way — ALWAYS rostered
  // hours, never actual, so pay isn't conflated with how hard the job
  // works you (see the schema spec).
  hourlyRange: PayRange;
  points: PayPoint[];
  byAgency: AgencyRate[];
};

// Groups every review_shifts row across all of this job's reviews by shift
// type — the shared spine Pay, Roster and Duties all key off. For each
// shift type this computes the per-shift and hourly rate ranges, the
// hourly-rate-over-time points (skipping rows with no rostered hours to
// divide by, or no worked_from date), and the hourly rate range per agency.
export function summarizePayByShiftType(reviews: ReviewRow[]): PayShiftTypeSummary[] {
  type Entry = {
    reviewId: string;
    rateAmount: number;
    rosteredHours: number;
    workedFrom: string | null;
    agencyName: string | null;
  };

  const byShiftType = new Map<string, Entry[]>();

  for (const review of reviews) {
    for (const shift of review.shifts) {
      const entries = byShiftType.get(shift.shiftTypeName) ?? [];
      entries.push({
        reviewId: review.id,
        rateAmount: Number(shift.rateAmount),
        rosteredHours: durationHours(shift.rosteredStart, shift.rosteredFinish),
        workedFrom: review.worked_from,
        agencyName: review.agencyName,
      });
      byShiftType.set(shift.shiftTypeName, entries);
    }
  }

  return Array.from(byShiftType.entries())
    .map(([shiftType, entries]) => {
      const perShiftAmounts = entries.map((e) => e.rateAmount);

      const hourlyEntries = entries.filter((e) => e.rosteredHours > 0);
      const hourlyAmounts = hourlyEntries.map((e) => e.rateAmount / e.rosteredHours);

      const points: PayPoint[] = hourlyEntries
        .filter((e): e is Entry & { workedFrom: string } => e.workedFrom !== null)
        .map((e) => ({
          reviewId: e.reviewId,
          workedFrom: e.workedFrom,
          hourlyRate: e.rateAmount / e.rosteredHours,
        }))
        .sort((a, b) => a.workedFrom.localeCompare(b.workedFrom));

      const byAgencyAmounts = new Map<string, number[]>();
      for (const e of hourlyEntries) {
        const label = e.agencyName ?? "No agency";
        const amounts = byAgencyAmounts.get(label) ?? [];
        amounts.push(e.rateAmount / e.rosteredHours);
        byAgencyAmounts.set(label, amounts);
      }
      const byAgency: AgencyRate[] = Array.from(byAgencyAmounts.entries())
        .map(([agency, amounts]) => ({ agency, hourlyRange: payRange(amounts) as PayRange }))
        .sort((a, b) => a.agency.localeCompare(b.agency));

      return {
        shiftType,
        perShiftRange: payRange(perShiftAmounts) as PayRange,
        hourlyRange: payRange(hourlyAmounts) ?? { min: 0, max: 0 },
        points,
        byAgency,
      };
    })
    .sort((a, b) => a.shiftType.localeCompare(b.shiftType));
}

export type RosterShiftTypeSummary =
  | {
      shiftType: string;
      hasData: true;
      rosteredStart: string;
      rosteredFinish: string;
      actualStart: string;
      actualFinish: string;
      avgRosteredHours: number;
      avgActualHours: number;
    }
  | { shiftType: string; hasData: false };

// Groups review_shifts by shift type and averages rostered vs actual times
// (and the hours derived from them) for each — the gap between the two is
// the "busier than advertised" signal the schema spec calls out. Covers
// every shift type in the job's shared spine (see shiftTypeSpine), not just
// the ones with review_shifts rows, so Roster always lists the same set of
// shift types Duties does — shift types with no pay/hours reported yet
// still get a block, just with hasData: false.
export function summarizeRosterByShiftType(reviews: ReviewRow[]): RosterShiftTypeSummary[] {
  type Entry = {
    rosteredStart: number[];
    rosteredFinish: number[];
    actualStart: number[];
    actualFinish: number[];
    rosteredHours: number[];
    actualHours: number[];
  };

  const byShiftType = new Map<string, Entry>();

  for (const review of reviews) {
    for (const shift of review.shifts) {
      const entry: Entry = byShiftType.get(shift.shiftTypeName) ?? {
        rosteredStart: [],
        rosteredFinish: [],
        actualStart: [],
        actualFinish: [],
        rosteredHours: [],
        actualHours: [],
      };
      entry.rosteredStart.push(timeStringToMinutes(shift.rosteredStart));
      entry.rosteredFinish.push(timeStringToMinutes(shift.rosteredFinish));
      entry.actualStart.push(timeStringToMinutes(shift.actualStart));
      entry.actualFinish.push(timeStringToMinutes(shift.actualFinish));
      entry.rosteredHours.push(durationHours(shift.rosteredStart, shift.rosteredFinish));
      entry.actualHours.push(durationHours(shift.actualStart, shift.actualFinish));
      byShiftType.set(shift.shiftTypeName, entry);
    }
  }

  return shiftTypeSpine(reviews).map((shiftType) => {
    const entry = byShiftType.get(shiftType);
    if (!entry) {
      return { shiftType, hasData: false };
    }

    return {
      shiftType,
      hasData: true,
      rosteredStart: minutesToTimeLabel(average(entry.rosteredStart) ?? 0),
      rosteredFinish: minutesToTimeLabel(average(entry.rosteredFinish) ?? 0),
      actualStart: minutesToTimeLabel(average(entry.actualStart) ?? 0),
      actualFinish: minutesToTimeLabel(average(entry.actualFinish) ?? 0),
      avgRosteredHours: average(entry.rosteredHours) ?? 0,
      avgActualHours: average(entry.actualHours) ?? 0,
    };
  });
}

export type ShiftTypeDuties = { shiftType: string; duties: string[] };

// The union of every (shift type, duty) pair ticked across all of this
// job's reviews, grouped by shift type. This deliberately isn't a
// per-review breakdown — the duties drill-in is meant to answer "what
// duties come up in this job overall", not "what did any one reviewer
// report".
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

// The percentage of reviews reporting this boolean fact as true — the
// figure shown on hover/tap for the Car/Accommodation/Flights chips (and
// reused for the Overtime paid / Weekends required chips elsewhere).
export function percentTrue(
  reviews: ReviewRow[],
  key: "car_provided" | "flights_provided" | "overtime_paid" | "weekends_required"
): number {
  if (reviews.length === 0) return 0;
  const count = reviews.filter((r) => r[key]).length;
  return (count / reviews.length) * 100;
}

// Accommodation is two booleans rather than one flat flag, so "was
// accommodation available" is true whenever either kind was.
export function percentAccommodationAvailable(reviews: ReviewRow[]): number {
  if (reviews.length === 0) return 0;
  const count = reviews.filter(
    (r) => r.accommodation_hospital_available || r.accommodation_private_available
  ).length;
  return (count / reviews.length) * 100;
}

export type AccommodationKinds = { hospital: boolean; private: boolean };

// Which kind(s) of accommodation were EVER reported as available across
// this job's reviews — used to list "Hospital-provided" and/or "Private"
// under the Accommodation chip's percentage.
export function accommodationKindsAvailable(reviews: ReviewRow[]): AccommodationKinds {
  return {
    hospital: reviews.some((r) => r.accommodation_hospital_available),
    private: reviews.some((r) => r.accommodation_private_available),
  };
}
