import type { SupabaseClient } from "@supabase/supabase-js";

export const COURSE_OPTIONS = ["Contract", "Tort", "Criminal", "Constitutional", "Other"];

export interface AuthorInfo {
  name: string;
  avatar_initial: string;
}

const UNKNOWN: AuthorInfo = { name: "Community member", avatar_initial: "C" };

/** Looks up display names for a list of profile ids. Unknown ids fall back to a generic name. */
export async function loadAuthors(supabase: SupabaseClient, ids: (string | null | undefined)[]) {
  const unique = Array.from(new Set(ids.filter(Boolean))) as string[];
  const map = new Map<string, AuthorInfo>();
  if (unique.length) {
    const { data } = await supabase.from("profiles").select("id, full_name").in("id", unique);
    (data || []).forEach((p: { id: string; full_name: string | null }) => {
      const name = p.full_name?.trim() || UNKNOWN.name;
      map.set(p.id, { name, avatar_initial: name.charAt(0).toUpperCase() });
    });
  }
  return (id: string | null | undefined): AuthorInfo => (id && map.get(id)) || UNKNOWN;
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [[31536000, "year"], [2592000, "month"], [86400, "day"], [3600, "hour"], [60, "minute"]];
  for (const [size, label] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${label}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
