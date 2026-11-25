"use client";

import { createClient } from "@/lib/supabase";

export type ActivityKind = "note" | "template" | "case" | "statute" | "dictionary" | "video" | "coach" | "question" | "group";

export interface ActivityInput {
  kind: ActivityKind;
  title: string;
  subtitle?: string;
  href?: string;
  fileUrl?: string;
  /** Identifies the item so repeat visits are grouped. Defaults to href or fileUrl. */
  itemKey?: string;
}

export interface ActivityItem {
  kind: ActivityKind;
  title: string;
  subtitle: string | null;
  href: string | null;
  file_url: string | null;
  item_key: string;
  created_at: string;
}

const LOCAL_KEY = "legalmouse-recent-activity";

/** Keeps a small copy on this device so "Continue learning" still works before the database is updated. */
function saveLocally(item: ActivityItem) {
  try {
    const list: ActivityItem[] = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    const next = [item, ...list.filter((i) => i.item_key !== item.item_key)].slice(0, 20);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

export function readLocalActivity(): ActivityItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Records that the user opened something. Fire-and-forget: never blocks or throws. */
export function recordActivity(input: ActivityInput) {
  const itemKey = input.itemKey || input.href || input.fileUrl || `${input.kind}:${input.title}`;
  const item: ActivityItem = {
    kind: input.kind,
    title: input.title,
    subtitle: input.subtitle || null,
    href: input.href || null,
    file_url: input.fileUrl || null,
    item_key: itemKey,
    created_at: new Date().toISOString(),
  };
  saveLocally(item);
  createClient()
    .rpc("record_activity", {
      p_kind: item.kind,
      p_title: item.title,
      p_subtitle: item.subtitle,
      p_href: item.href,
      p_file_url: item.file_url,
      p_item_key: itemKey,
    })
    .then(({ error }) => {
      if (error && error.code !== "PGRST202") console.warn("Activity not recorded:", error.message);
    });
}

/** The user's most recent distinct items: from the database, or this device as a fallback. */
export async function loadRecentActivity(limit = 6): Promise<ActivityItem[]> {
  const { data, error } = await createClient()
    .from("user_activity")
    .select("kind, title, subtitle, href, file_url, item_key, created_at")
    .order("created_at", { ascending: false })
    .limit(60);
  const rows = (!error && data ? (data as ActivityItem[]) : readLocalActivity()) || [];
  const seen = new Set<string>();
  return rows.filter((r) => (seen.has(r.item_key) ? false : (seen.add(r.item_key), true))).slice(0, limit);
}

/** Days the user was active in the last `days` days (from the activity log), as YYYY-MM-DD strings. */
export async function loadActiveDays(days = 7): Promise<Set<string>> {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await createClient().from("user_activity").select("created_at").gte("created_at", since).limit(1000);
  const rows = data || readLocalActivity().filter((r) => r.created_at >= since);
  return new Set(rows.map((r: { created_at: string }) => new Date(r.created_at).toLocaleDateString("en-CA")));
}
