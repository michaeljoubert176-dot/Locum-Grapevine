import { fetchAllCategories, getChildren } from "@/lib/categories";
import CategoryList from "@/app/browse/components/CategoryList";

// The top of the browse tree: every state. From here, clicking through
// drills down state -> hospital -> specialty -> subspecialty -> role via
// /browse/[id], following each row's parent_id.
export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const result = await fetchAllCategories();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Browse</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Start with a state, then work your way down to the role you&apos;re after.
      </p>

      <div className="mt-10">
        {result.error !== null ? (
          <p className="rounded-2xl border border-red-700/20 bg-red-50 p-6 text-sm text-red-700">
            Couldn&apos;t load categories from Supabase: {result.error}
          </p>
        ) : (
          <CategoryList categories={getChildren(result.data, null)} />
        )}
      </div>
    </main>
  );
}
