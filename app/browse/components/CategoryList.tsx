import Link from "next/link";
import { CATEGORY_LEVEL_LABEL, type CategoryRow } from "@/lib/categories";
import { IconChevronRight } from "@/app/components/icons";

// A simple clickable list of categories one level below the current point
// in the tree (e.g. every hospital in a state, or every role in a
// subspecialty). Used both for the top-level state list and every level of
// drill-down in between.
export default function CategoryList({ categories }: { categories: CategoryRow[] }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">
        Nothing has been added here yet.
      </div>
    );
  }

  return (
    <ul role="list" className="grid gap-3 sm:grid-cols-2">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/browse/${category.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 transition-colors hover:border-green/35 hover:bg-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">{category.name}</span>
              <span className="text-xs tracking-wide text-amber-accent uppercase">
                {CATEGORY_LEVEL_LABEL[category.level]}
              </span>
            </span>
            <IconChevronRight className="h-5 w-5 shrink-0 text-green/50" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
