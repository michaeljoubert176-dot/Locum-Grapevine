import { notFound } from "next/navigation";
import { fetchJobById } from "@/lib/jobs";
import { fetchReviewsForJob } from "@/lib/reviews";
import Breadcrumb from "@/app/browse/components/Breadcrumb";
import JobHeader from "@/app/browse/components/JobHeader";
import RatingSection from "@/app/browse/components/RatingSection";
import FactChipsSection from "@/app/browse/components/FactChipsSection";
import AiSummaryPlaceholder from "@/app/browse/components/AiSummaryPlaceholder";
import ReviewsList from "@/app/browse/components/ReviewsList";

export const dynamic = "force-dynamic";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobResult = await fetchJobById(id);

  if (jobResult.error !== null) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <p className="rounded-2xl border border-red-700/20 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t load this job from Supabase: {jobResult.error}
        </p>
      </main>
    );
  }

  const job = jobResult.data;
  if (!job) {
    notFound();
  }

  const reviewsResult = await fetchReviewsForJob(id);

  if (reviewsResult.error !== null) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <Breadcrumb job={job} />
        <JobHeader job={job} />
        <p className="mt-10 rounded-2xl border border-red-700/20 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t load reviews from Supabase: {reviewsResult.error}
        </p>
      </main>
    );
  }

  const reviews = reviewsResult.data;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <Breadcrumb job={job} />
      <JobHeader job={job} />

      {reviews.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">
          No reviews yet for this job. Be the first to leave one.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <RatingSection reviews={reviews} />
          </div>

          <div className="mt-8">
            <FactChipsSection reviews={reviews} />
          </div>

          <div className="mt-8">
            <AiSummaryPlaceholder />
          </div>

          <div className="mt-12">
            <ReviewsList reviews={reviews} />
          </div>
        </>
      )}
    </main>
  );
}
