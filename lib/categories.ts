import { supabase } from "@/lib/supabase";

// The category tree (state -> hospital -> specialty -> subspecialty -> role)
// lives in one small table, so the simplest way to work with it is to fetch
// every row once per request and do the tree-walking in memory, rather than
// making a round trip to Supabase for every level a visitor clicks through.

export type CategoryLevel = "state" | "hospital" | "specialty" | "subspecialty" | "role";

export type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
  level: CategoryLevel;
};

export type CategoryFetchResult =
  | { data: CategoryRow[]; error: null }
  | { data: null; error: string };

export async function fetchAllCategories(): Promise<CategoryFetchResult> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent_id, level");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

export function getChildren(all: CategoryRow[], parentId: string | null): CategoryRow[] {
  return all
    .filter((row) => row.parent_id === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getById(all: CategoryRow[], id: string): CategoryRow | undefined {
  return all.find((row) => row.id === id);
}

// Walks parent_id up to the root and returns the path from top-level state
// down to (and including) the given category, in display order.
export function getAncestorPath(all: CategoryRow[], id: string): CategoryRow[] {
  const byId = new Map(all.map((row) => [row.id, row]));
  const path: CategoryRow[] = [];

  let current = byId.get(id);
  while (current) {
    path.unshift(current);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }

  return path;
}

export const CATEGORY_LEVEL_LABEL: Record<CategoryLevel, string> = {
  state: "State",
  hospital: "Hospital",
  specialty: "Specialty",
  subspecialty: "Subspecialty",
  role: "Role",
};
