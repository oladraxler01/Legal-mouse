"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Who is speaking. Each role has its own natural Gemini voice (see /api/tts). */
export type VoiceRole = "mouse" | "judge" | "arbitrator" | "counsel" | "narrator";

/* ── Shared across the app for this browser tab ───────────── */
const audioCache = new Map<string, Promise<Blob | null>>();
let aiVoiceAvailable = true; // flips to false after a 401/429/503 so we stop retrying this session

function fetchSpeech(text: string, role: VoiceRole): Promise<Blob | null> {
  const key = `${role}::${text}`;
  const cached = audioCache.get(key);
  if (cached) return cached;
  const request = (async () => {
    if (!aiVoiceAvailable) return null;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, role }),
      });
      if (!res.ok) {
        if ([401, 429, 503].includes(res.status)) aiVoiceAvailable = false;
        return null;
      }
      return await res.blob();
    } catch {
      return null;
    }
  })();
  audioCache.set(key, request);
  if (audioCache.size > 60) audioCache.delete(audioCache.keys().next().value as string);
  request.then((b) => !b && audioCache.delete(key));
  return request;
}

/** Splits text into sentence-sized chunks. The first chunk is kept short so speech starts fast. */
export function splitForSpeech(text: string, maxLen = 220): string[] {
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = "";
  sentences.forEach((s, i) => {
    const sentence = s.trim();
    if (!sentence) return;
    if (i === 0) return chunks.push(sentence);
    if ((current + " " + sentence).trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`;
    }
  });
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/* Browser voice: used when the AI voice is unavailable. */
const BROWSER_STYLE: Record<VoiceRole, { rate: number; pitch: number }> = {
  mouse: { rate: 1.05, pitch: 1.15 },
  judge: { rate: 0.92, pitch: 0.8 },
  arbitrator: { rate: 0.95, pitch: 0.9 },
  counsel: { rate: 1.0, pitch: 0.95 },
  narrator: { rate: 1.0, pitch: 1.0 },
};

function speakWithBrowser(text: string, role: VoiceRole): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return resolve();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang === "en-GB" && /natural|online|google/i.test(v.name)) ||
      voices.find((v) => v.lang === "en-GB") ||
      voices.find((v) => v.lang.startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.rate = BROWSER_STYLE[role].rate;
    utterance.pitch = BROWSER_STYLE[role].pitch;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * useVoice: speak text in a natural voice.
 *   const { speak, stop, speaking } = useVoice();
 *   await speak("Objection sustained.", "judge");
 * Speaking again (or calling stop) interrupts whatever is playing.
 * speak() resolves to true when the speech finished, false if it was interrupted.
 */
export function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  const tokenRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, role: VoiceRole = "mouse"): Promise<boolean> => {
      stop();
      const token = tokenRef.current;
      const chunks = splitForSpeech(text);
      if (!chunks.length) return true;
      setSpeaking(true);

      for (let i = 0; i < chunks.length; i++) {
        const blob = await fetchSpeech(chunks[i], role);
        if (i + 1 < chunks.length) fetchSpeech(chunks[i + 1], role); // prefetch the next sentence while this one plays
        if (token !== tokenRef.current) return false;

        if (!blob) {
          // AI voice unavailable: read the rest with the browser voice.
          await speakWithBrowser(chunks.slice(i).join(" "), role);
          break;
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        const played = await new Promise<boolean>((resolve) => {
          audio.onended = () => resolve(true);
          audio.onerror = () => resolve(false);
          audio.play().catch(() => resolve(false));
        });
        URL.revokeObjectURL(url);
        if (token !== tokenRef.current) return false;
        if (!played) {
          await speakWithBrowser(chunks.slice(i).join(" "), role);
          break;
        }
      }
      if (token !== tokenRef.current) return false;
      audioRef.current = null;
      setSpeaking(false);
      return true;
    },
    [stop]
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, speaking };
}
