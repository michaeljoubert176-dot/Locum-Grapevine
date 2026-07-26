import { fetchBrowseData } from "@/lib/jobs";
import BrowseFilters from "@/app/browse/components/BrowseFilters";

// The browse page is filter-driven rather than a fixed tree: pick any
// combination of position, specialty, subspecialty, hospital and state,
// and the job list narrows or widens to match.
export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const result = await fetchBrowseData();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Browse</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Filter by position, specialty, subspecialty, hospital or state — mix and match to find the
        job you&apos;re after.
      </p>

      <div className="mt-10">
        {result.error !== null ? (
          <p className="rounded-2xl border border-red-700/20 bg-red-50 p-6 text-sm text-red-700">
            Couldn&apos;t load jobs from Supabase: {result.error}
          </p>
        ) : (
          <BrowseFilters data={result.data} />
        )}
      </div>
    </main>
  );
}
