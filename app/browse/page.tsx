import { supabase } from "@/lib/supabase";

// -----------------------------------------------------------------------
// Test page: confirms the Supabase connection works by fetching every row
// from the `categories` table and rendering it as a nested tree, using
// each row's parent_id to work out where it sits (state -> hospital ->
// specialty -> subspecialty -> role). Not meant to be a polished feature.
// -----------------------------------------------------------------------

type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
  level: string;
};

type CategoryNode = CategoryRow & { children: CategoryNode[] };

function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const nodesById = new Map<string, CategoryNode>(
    rows.map((row) => [row.id, { ...row, children: [] }])
  );

  const roots: CategoryNode[] = [];

  for (const row of rows) {
    const node = nodesById.get(row.id)!;
    const parent = row.parent_id ? nodesById.get(row.parent_id) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function CategoryTree({ nodes }: { nodes: CategoryNode[] }) {
  return (
    <ul role="list" className="space-y-1">
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="flex items-baseline gap-2">
            <span className="text-ink">{node.name}</span>
            <span className="text-xs tracking-wide text-teal-700/70 uppercase">
              {node.level}
            </span>
          </div>
          {node.children.length > 0 && (
            <div className="mt-1 border-l border-teal-700/20 pl-4">
              <CategoryTree nodes={node.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function BrowsePage() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent_id, level");

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        Browse categories
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        A raw view of the category hierarchy, straight from Supabase.
      </p>

      <div className="mt-10 rounded-2xl border border-teal-700/15 bg-paper-warm p-6">
        {error && (
          <p className="text-sm text-red-700">
            Couldn&apos;t load categories from Supabase: {error.message}
          </p>
        )}

        {!error && (!data || data.length === 0) && (
          <p className="text-sm text-ink-soft">No categories found yet.</p>
        )}

        {!error && data && data.length > 0 && (
          <CategoryTree nodes={buildTree(data)} />
        )}
      </div>
    </main>
  );
}
