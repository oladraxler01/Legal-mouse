"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ── Voice note player ─────────────────────────────── */
const signedUrlCache = new Map<string, string>();

export function VoiceNotePlayer({
  path,
  duration,
  supabase,
  mine,
}: {
  path: string;
  duration: number | null;
  supabase: SupabaseClient;
  mine: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(duration || 0);

  useEffect(() => () => audioRef.current?.pause(), []);

  async function toggle() {
    if (state === "playing") {
      audioRef.current?.pause();
      return setState("paused");
    }
    if (!audioRef.current) {
      setState("loading");
      let url = signedUrlCache.get(path);
      if (!url) {
        const { data } = await supabase.storage.from("group-materials").createSignedUrl(path, 60 * 60);
        if (!data) return setState("idle");
        url = data.signedUrl;
        signedUrlCache.set(path, url);
      }
      const audio = new Audio(url);
      audio.ontimeupdate = () => setProgress(audio.currentTime);
      audio.onloadedmetadata = () => Number.isFinite(audio.duration) && setTotal(audio.duration);
      audio.onended = () => {
        setState("idle");
        setProgress(0);
      };
      audioRef.current = audio;
    }
    // Pause any other voice note that is playing.
    document.dispatchEvent(new CustomEvent("voicenote:play", { detail: path }));
    await audioRef.current.play().catch(() => setState("idle"));
    setState("playing");
  }

  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== path && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setState("paused");
      }
    };
    document.addEventListener("voicenote:play", onOther);
    return () => document.removeEventListener("voicenote:play", onOther);
  }, [path]);

  const pct = total ? Math.min(100, (progress / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 min-w-[200px] py-1">
      <button
        type="button"
        onClick={toggle}
        aria-label={state === "playing" ? "Pause voice note" : "Play voice note"}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${mine ? "bg-white/20 text-white" : "bg-primary text-white"}`}
      >
        {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : state === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className={`h-1.5 rounded-full overflow-hidden ${mine ? "bg-white/25" : "bg-on-surface/10"}`}>
          <div className={`h-full ${mine ? "bg-white" : "bg-primary"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11px] font-bold opacity-70 mt-1 block">
          {state === "idle" ? formatDuration(total) : `${formatDuration(progress)} / ${formatDuration(total)}`}
        </span>
      </div>
    </div>
  );
}

/* ── Emoji picker ──────────────────────────────────── */
const EMOJIS = [
  "😀", "😂", "🤣", "😊", "😍", "🥰", "😎", "🤓", "🤔", "🙄", "😅", "😭", "😤", "😴", "🤯", "😱",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "👀", "🤝", "✌️", "👌", "🫡", "🤞", "✍️", "💯", "🔥", "✨",
  "❤️", "💜", "💙", "💚", "🎉", "🥳", "✅", "❌", "⚠️", "❓", "💡", "📌", "📚", "📖", "📝", "📎",
  "⚖️", "🏛️", "👩‍⚖️", "👨‍⚖️", "🎓", "🧠", "⏰", "📅", "☕", "🍕", "😇", "🤗", "😬", "🫶", "👋", "🙈",
];

export function EmojiPicker({ onPick, onClose }: { onPick: (emoji: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-3 left-0 z-30 w-[min(20rem,calc(100vw-2rem))] max-h-64 overflow-y-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl p-3 grid grid-cols-8 gap-1"
    >
      {EMOJIS.map((e) => (
        <button key={e} type="button" onClick={() => onPick(e)} className="text-2xl leading-none p-1.5 rounded-lg hover:bg-surface-container-high">
          {e}
        </button>
      ))}
    </div>
  );
}
