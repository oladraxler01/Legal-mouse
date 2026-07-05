"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ── Voice State Machine ────────────────────────────────────── */
type VoiceState = "idle" | "listening" | "processing" | "speaking";

/* ── Navigation map ─────────────────────────────────────────── */
const NAV_ROUTES: { patterns: string[]; path: string }[] = [
  { patterns: ["take me to templates", "open templates", "go to templates"], path: "/templates" },
  { patterns: ["take me to cases", "open cases", "go to cases"], path: "/cases" },
  { patterns: ["take me to statutes", "open statutes", "go to statutes"], path: "/authorities/statutes" },
  { patterns: ["take me to dictionary", "open dictionary", "black law", "black's law"], path: "/authorities/dictionary" },
  { patterns: ["take me to notes", "open notes", "go to notes"], path: "/notes" },
  { patterns: ["take me to videos", "open videos", "go to videos"], path: "/videos" },
  { patterns: ["take me to community", "open community", "go to community"], path: "/community" },
  { patterns: ["take me to dashboard", "open dashboard", "go to dashboard"], path: "/dashboard" },
  { patterns: ["go back home", "go home", "take me home"], path: "/dashboard" },
];

function matchNavigation(transcript: string): string | null {
  const lower = transcript.toLowerCase().trim();
  for (const route of NAV_ROUTES) {
    for (const pattern of route.patterns) {
      if (lower.includes(pattern)) return route.path;
    }
  }
  return null;
}

/* ── SpeechRecognition type augment ─────────────────────────── */
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

/* ── Component ──────────────────────────────────────────────── */
export default function LegalMouseAvatar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [statusText, setStatusText] = useState("Tap the mic to speak");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Cleanup on unmount ───────────────────────────────────── */
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
      window.speechSynthesis?.cancel();
      if (speakingPollRef.current) clearInterval(speakingPollRef.current);
    };
  }, []);

  /* ── Stop speaking when drawer closes ─────────────────────── */
  useEffect(() => {
    if (!isOpen) {
      recognitionRef.current?.abort?.();
      window.speechSynthesis?.cancel();
      if (speakingPollRef.current) clearInterval(speakingPollRef.current);
      setVoiceState("idle");
      setStatusText("Tap the mic to speak");
    }
  }, [isOpen]);

  /* ── Speak a reply using speechSynthesis ──────────────────── */
  const speakReply = useCallback((rawText: string) => {
    window.speechSynthesis.cancel();

    // Strip markdown symbols so they are never spoken aloud
    const text = rawText
      .replace(/[*#_~`>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.lang = "en-US";

    // Prioritize premium, natural-sounding English voices
    const voices = window.speechSynthesis.getVoices();
    const voicePriority = [
      "Google US English",
      "Google UK English Female",
      "Microsoft Aria Online (Natural)",
      "Microsoft Jenny Online (Natural)",
      "Samantha",
      "Natural",
      "Premium",
    ];
    let selectedVoice: SpeechSynthesisVoice | undefined;
    for (const name of voicePriority) {
      selectedVoice = voices.find((v) => v.name.includes(name) && v.lang.startsWith("en"));
      if (selectedVoice) break;
    }
    // Fallback: pick any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.lang.startsWith("en"));
    }
    if (selectedVoice) utterance.voice = selectedVoice;

    synthRef.current = utterance;

    utterance.onstart = () => {
      setVoiceState("speaking");
      setStatusText("Speaking...");
    };

    utterance.onend = () => {
      setVoiceState("idle");
      setStatusText("Tap the mic to speak");
      synthRef.current = null;
    };

    utterance.onerror = () => {
      setVoiceState("idle");
      setStatusText("Tap the mic to speak");
      synthRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  /* ── Send transcript to backend ───────────────────────────── */
  const sendToBackend = useCallback(
    async (transcript: string) => {
      setVoiceState("processing");
      setStatusText("Thinking...");

      // 1. Check for navigation intent first
      const navPath = matchNavigation(transcript);
      if (navPath) {
        const pageName = navPath.split("/").pop() || "page";
        speakReply(`Taking you to ${pageName} now.`);
        // Short delay so the voice starts before navigation
        setTimeout(() => router.push(navPath), 600);
        return;
      }

      // 2. Fetch Gemini response
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        speakReply(data.reply || "Sorry, I didn't get a response.");
      } catch {
        speakReply("Sorry, something went wrong. Please try again.");
      }
    },
    [speakReply, router]
  );

  /* ── Start listening ──────────────────────────────────────── */
  const startListening = useCallback(() => {
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusText("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setVoiceState("listening");
      setStatusText("Listening...");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setStatusText(`"${transcript}"`);
        sendToBackend(transcript);
      } else {
        setVoiceState("idle");
        setStatusText("Didn't catch that. Try again.");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setStatusText("Microphone access denied");
      } else {
        setStatusText("Didn't catch that. Try again.");
      }
      setVoiceState("idle");
    };

    recognition.onend = () => {
      // Only reset if we haven't moved to processing/speaking
      if (voiceState === "listening") {
        setVoiceState("idle");
        setStatusText("Tap the mic to speak");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [sendToBackend, voiceState]);

  /* ── Toggle mic ───────────────────────────────────────────── */
  const toggleMic = useCallback(() => {
    if (voiceState === "listening") {
      recognitionRef.current?.stop();
      setVoiceState("idle");
      setStatusText("Tap the mic to speak");
    } else if (voiceState === "idle") {
      startListening();
    }
    // If processing or speaking, ignore taps
  }, [voiceState, startListening]);

  /* ── Avatar animation class based on voice state ──────────── */
  const avatarAnimationClass = (() => {
    switch (voiceState) {
      case "listening":
        return "ring-4 ring-primary/60 animate-[ping_1.5s_ease-in-out_infinite]";
      case "processing":
        return "animate-pulse opacity-80";
      case "speaking":
        return "";
      case "idle":
      default:
        return "animate-pulse";
    }
  })();

  /* ── Mouth animation for speaking state ───────────────────── */
  const mouthAnimation = voiceState === "speaking"
    ? {
        animate: {
          scaleY: [1, 1.08, 0.95, 1.05, 1],
          scaleX: [1, 0.97, 1.02, 0.98, 1],
        },
        transition: {
          duration: 0.35,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      }
    : {
        animate: { scaleY: 1, scaleX: 1 },
        transition: { duration: 0.3 },
      };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-80 md:w-96 h-[450px] bg-surface-container-low border border-outline-variant/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10 bg-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/mouse-avatar.png"
                    alt="LegalMouse"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">LegalMouse</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        voiceState === "idle"
                          ? "bg-green-500"
                          : voiceState === "listening"
                          ? "bg-red-500 animate-pulse"
                          : voiceState === "processing"
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-blue-500 animate-pulse"
                      }`}
                    />
                    {voiceState === "idle" && "Ready"}
                    {voiceState === "listening" && "Listening"}
                    {voiceState === "processing" && "Processing"}
                    {voiceState === "speaking" && "Speaking"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Voice Canvas (Center Avatar) ───────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
              {/* Avatar container with state-based ring animations */}
              <div className="relative">
                {/* Glow ring for listening state */}
                {voiceState === "listening" && (
                  <motion.div
                    className="absolute -inset-4 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {voiceState === "listening" && (
                  <motion.div
                    className="absolute -inset-2 rounded-full bg-primary/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.2, 0.7] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  />
                )}

                {/* Speaking glow */}
                {voiceState === "speaking" && (
                  <motion.div
                    className="absolute -inset-3 rounded-full bg-blue-500/20"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Mouse avatar image with mouth animation */}
                <motion.div
                  className={`w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 ${
                    voiceState === "listening"
                      ? "border-primary shadow-[0_0_30px_rgba(var(--primary-rgb,99,102,241),0.4)]"
                      : voiceState === "speaking"
                      ? "border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "border-outline-variant/20"
                  } ${voiceState === "idle" || voiceState === "processing" ? "animate-pulse" : ""}`}
                  {...mouthAnimation}
                >
                  <Image
                    src="/images/mouse-avatar.png"
                    alt="LegalMouse Assistant"
                    width={176}
                    height={176}
                    className="w-full h-full object-cover"
                    priority
                  />
                </motion.div>
              </div>

              {/* Status text */}
              <p className="text-sm text-on-surface-variant text-center max-w-[260px] min-h-[40px] flex items-center justify-center">
                {statusText}
              </p>
            </div>

            {/* ── Mic Button (Bottom) ────────────────────────── */}
            <div className="p-4 border-t border-outline-variant/10 bg-surface-container flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleMic}
                disabled={voiceState === "processing" || voiceState === "speaking"}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  voiceState === "listening"
                    ? "bg-red-500 text-white shadow-red-500/30"
                    : voiceState === "processing" || voiceState === "speaking"
                    ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
                    : "bg-primary text-on-primary hover:shadow-xl"
                }`}
              >
                {voiceState === "listening" ? (
                  <MicOff size={24} />
                ) : (
                  <Mic size={24} />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Button (Idle – Collapsed) ──────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg relative group overflow-hidden border-2 border-primary/30 bg-surface-container"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/mouse-avatar.png"
              alt="LegalMouse"
              className="absolute inset-0 w-full h-full object-cover rounded-full"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface z-20" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
