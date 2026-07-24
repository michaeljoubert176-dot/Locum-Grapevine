import { notFound } from "next/navigation";
import {
  fetchAllCategories,
  getAncestorPath,
  getById,
  getChildren,
} from "@/lib/categories";
import {
  fetchReviewsForRole,
  headlineAverage,
  average,
  sortReviewsNewestFirst,
  WORKLOAD_ANCHORS,
  SUPERVISION_ANCHORS,
} from "@/lib/reviews";
import Breadcrumb from "@/app/browse/components/Breadcrumb";
import CategoryList from "@/app/browse/components/CategoryList";
import HeadlineStars from "@/app/browse/components/HeadlineStars";
import FactChips from "@/app/browse/components/FactChips";
import GradientSpectrum from "@/app/browse/components/GradientSpectrum";
import ReviewsBreakdownSection from "@/app/browse/components/ReviewsBreakdownSection";

export const dynamic = "force-dynamic";

export default async function BrowseCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoriesResult = await fetchAllCategories();

  if (categoriesResult.error !== null) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <p className="rounded-2xl border border-red-700/20 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t load categories from Supabase: {categoriesResult.error}
        </p>
      </main>
    );
  }

  const categories = categoriesResult.data;
  const category = getById(categories, id);
  if (!category) {
    notFound();
  }

  const path = getAncestorPath(categories, id);

  if (category.level !== "role") {
    const children = getChildren(categories, id);
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <Breadcrumb path={path} />
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink">
          {category.name}
        </h1>
        <div className="mt-10">
          <CategoryList categories={children} />
        </div>
      </main>
    );
  }

  const reviewsResult = await fetchReviewsForRole(id);

  if (reviewsResult.error !== null) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <Breadcrumb path={path} />
        <RoleTitle path={path} category={category} />
        <p className="mt-10 rounded-2xl border border-red-700/20 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t load reviews from Supabase: {reviewsResult.error}
        </p>
      </main>
    );
  }

  const reviews = reviewsResult.data;

  if (reviews.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <Breadcrumb path={path} />
        <RoleTitle path={path} category={category} />
        <p className="mt-10 rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">
          No reviews yet for this role.
        </p>
      </main>
    );
  }

  const headline = headlineAverage(reviews);
  const workloadAverage = average(reviews.map((r) => r.workload_intensity));
  const supervisionAverage = average(reviews.map((r) => r.supervision_intensity));
  const mostRecentReview = sortReviewsNewestFirst(reviews)[0];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <Breadcrumb path={path} />
      <RoleTitle path={path} category={category} />

      <div className="mt-6">
        <HeadlineStars average={headline!} reviewCount={reviews.length} />
      </div>

      <div className="mt-8">
        <FactChips review={mostRecentReview} />
      </div>

      <div className="mt-12 grid gap-10 rounded-2xl border border-line bg-white p-6 sm:grid-cols-2 sm:p-8">
        <GradientSpectrum title="Workload" anchors={WORKLOAD_ANCHORS} average={workloadAverage!} />
        <GradientSpectrum
          title="Supervision"
          anchors={SUPERVISION_ANCHORS}
          average={supervisionAverage!}
        />
      </div>

      <div className="mt-12">
        <ReviewsBreakdownSection reviews={reviews} />
      </div>
    </main>
  );
}

function RoleTitle({
  path,
  category,
}: {
  path: { id: string; name: string; level: string }[];
  category: { name: string };
}) {
  const hospital = path.find((c) => c.level === "hospital");
  const state = path.find((c) => c.level === "state");
  const location = [hospital?.name, state?.name].filter(Boolean).join(", ");

  return (
    <div className="mt-3">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        {category.name}
      </h1>
      {location && <p className="mt-1 text-sm text-ink-soft">{location}</p>}
    </div>
  );
}
