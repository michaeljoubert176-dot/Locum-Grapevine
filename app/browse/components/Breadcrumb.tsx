import Link from "next/link";
import type { CategoryRow } from "@/lib/categories";

// The full path from the top of the browse tree down to (and including)
// the category currently being viewed. Every ancestor is a link; the
// current category is plain text, since you're already there.
export default function Breadcrumb({ path }: { path: CategoryRow[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol role="list" className="flex flex-wrap items-center gap-1.5 text-ink-soft">
        <li className="flex items-center gap-1.5">
          <Link href="/browse" className="rounded-sm hover:text-teal-700 hover:underline">
            Browse
          </Link>
          {path.length > 0 && <span aria-hidden="true">/</span>}
        </li>
        {path.map((category, index) => {
          const isLast = index === path.length - 1;
          return (
            <li key={category.id} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="font-medium text-ink">
                  {category.name}
                </span>
              ) : (
                <Link
                  href={`/browse/${category.id}`}
                  className="rounded-sm hover:text-teal-700 hover:underline"
                >
                  {category.name}
                </Link>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
