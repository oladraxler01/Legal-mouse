"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { createClient } from "@/lib/supabase";

/** Updates the user's daily study streak. Safe to call often: the database only counts one visit per day. */
export async function touchStreak(): Promise<number | null> {
  const { data, error } = await createClient().rpc("touch_streak");
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row?.current_streak ?? null;
}

/** Mounted once in the app layout: counts today's visit towards the streak. */
export default function StreakTracker() {
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    if (localStorage.getItem("legalmouse-streak-day") === today) return;
    touchStreak().then((streak) => {
      if (streak !== null) localStorage.setItem("legalmouse-streak-day", today);
    });
  }, []);
  return null;
}

/** Streak badge for the home page that shows today's up-to-date value. */
export function StreakBadge({ initial }: { initial: number }) {
  const [streak, setStreak] = useState(initial);
  useEffect(() => {
    touchStreak().then((s) => {
      if (s !== null) setStreak(s);
    });
  }, []);
  return (
    <div className="flex items-center gap-1.5 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
      <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tight">
        {streak} Day Streak
      </span>
    </div>
  );
}
