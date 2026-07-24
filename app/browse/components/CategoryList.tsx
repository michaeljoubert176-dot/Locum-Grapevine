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
      <div className="rounded-2xl border border-teal-700/15 bg-paper-warm p-6 text-sm text-ink-soft">
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
            className="flex items-center justify-between gap-3 rounded-2xl border border-teal-700/15 bg-paper-warm px-5 py-4 transition-colors hover:border-teal-700/35 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">{category.name}</span>
              <span className="text-xs tracking-wide text-teal-700/70 uppercase">
                {CATEGORY_LEVEL_LABEL[category.level]}
              </span>
            </span>
            <IconChevronRight className="h-5 w-5 shrink-0 text-teal-700/50" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
