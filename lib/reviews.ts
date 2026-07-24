import { supabase } from "@/lib/supabase";

export type ReviewRow = {
  id: string;
  role_id: string;
  overall_good_job: number;
  would_work_again: number;
  would_recommend: number;
  supervision_needed: number;
  felt_safe: number;
  workload_manageable: number;
  information_accurate: number;
  felt_welcome: number;
  paid_correctly: number;
  workload_intensity: number;
  supervision_intensity: number;
  worked_from: string | null;
  worked_to: string | null;
  roster_type: "fixed" | "rotating";
  shift_times: string | null;
  after_hours: string | null;
  pay_amount: string;
  pay_unit: "hour" | "day";
  night_rate_differs: boolean;
  night_pay_amount: string | null;
  agency_id: string | null;
  car_provided: boolean;
  accommodation_provided: boolean;
  accommodation_quality: number | null;
  flights_provided: boolean;
  wish_youd_known: string | null;
  other_feedback: string | null;
  created_at: string;
};

export type ReviewFetchResult =
  | { data: ReviewRow[]; error: null }
  | { data: null; error: string };

export async function fetchReviewsForRole(roleId: string): Promise<ReviewFetchResult> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("role_id", roleId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

// The nine core questions, in the exact order they should be shown.
export const CORE_QUESTIONS = [
  { key: "overall_good_job", label: "Overall, this was a good job" },
  { key: "would_work_again", label: "I would work this role again" },
  { key: "would_recommend", label: "I would recommend this role to another locum" },
  { key: "supervision_needed", label: "I received the supervision I needed" },
  { key: "felt_safe", label: "I felt safe practising here" },
  { key: "workload_manageable", label: "I found the workload appropriate and manageable" },
  { key: "information_accurate", label: "The information I was given about the role was accurate" },
  { key: "felt_welcome", label: "I was made to feel welcome and part of the team" },
  { key: "paid_correctly", label: "I was paid correctly and on time" },
] as const satisfies ReadonlyArray<{ key: keyof ReviewRow; label: string }>;

export type CoreQuestionKey = (typeof CORE_QUESTIONS)[number]["key"];

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

// How many reviews gave each score (1-5) for a given question.
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

export const WORKLOAD_ANCHORS = ["Extreme", "Busy", "Comfortable", "Cruisey", "Quiet"] as const;
export const SUPERVISION_ANCHORS = ["Absent", "Unreliable", "On call", "Proactive", "Constant"] as const;
