"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Check, Quote, Volume2, VolumeX, X } from "lucide-react";
import { PROCEDURES, COURT_EXPRESSIONS, type ProcedureNature } from "./procedures";
import { useVoice } from "@/lib/useVoice";

interface BriefingProps {
  nature: ProcedureNature;
  caseTitle: string;
  onComplete: () => void;
  onExit: () => void;
}

interface FlatStep {
  kind: "intro" | "step" | "ready";
  phaseIndex: number;
  phaseLabel: string;
  stepNumber: number; // 1-based among real steps, 0 for intro/ready
  title: string;
  actor: string;
  narration: string;
  points?: string[];
  say?: string;
}

const TYPE_SPEED_MS = 18;

export default function ProcedureBriefing({ nature, caseTitle, onComplete, onExit }: BriefingProps) {
  const procedure = PROCEDURES[nature];

  /* Flatten phases into one list: intro → every step → ready */
  const steps = useMemo<FlatStep[]>(() => {
    const list: FlatStep[] = [
      {
        kind: "intro",
        phaseIndex: -1,
        phaseLabel: "Briefing",
        stepNumber: 0,
        title: procedure.name,
        actor: "Legal Mouse",
        narration: procedure.intro,
      },
    ];
    let n = 0;
    procedure.phases.forEach((phase, pi) =>
      phase.steps.forEach((s) => {
        n += 1;
        list.push({ kind: "step", phaseIndex: pi, phaseLabel: phase.label, stepNumber: n, ...s });
      })
    );
    list.push({
      kind: "ready",
      phaseIndex: procedure.phases.length,
      phaseLabel: "Ready",
      stepNumber: 0,
      title: "You're ready for the hearing",
      actor: "Legal Mouse",
      narration: `That is the full journey of ${procedure.name.toLowerCase()}. In the simulation you appear as counsel, so open with your appearance and follow the stages you just learnt. Good luck!`,
    });
    return list;
  }, [procedure]);

  const totalSteps = steps.filter((s) => s.kind === "step").length;

  const [index, setIndex] = useState(0);
  const [visited, setVisited] = useState(0);
  const [typed, setTyped] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = steps[index];
  const isTyping = typed.length < current.narration.length;
  const isLast = index === steps.length - 1;

  /* ── Typewriter ─────────────────────────────── */
  useEffect(() => {
    const text = steps[index].narration;
    let i = 0;
    if (typingTimer.current) clearInterval(typingTimer.current);
    typingTimer.current = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length && typingTimer.current) clearInterval(typingTimer.current);
    }, TYPE_SPEED_MS);
    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, [index, steps]);

  /* ── Voice: the mouse reads each step aloud in a natural voice ─── */
  const narrator = useVoice();
  const { speak: narrate, stop: stopNarration } = narrator;
  useEffect(() => {
    if (!soundOn) {
      stopNarration();
      return;
    }
    const s = steps[index];
    narrate(`${s.title}. ${s.narration}`, "narrator");
    return () => stopNarration();
  }, [index, soundOn, steps, narrate, stopNarration]);

  const finishTyping = useCallback(() => {
    if (typingTimer.current) clearInterval(typingTimer.current);
    setTyped(steps[index].narration);
  }, [index, steps]);

  const goTo = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(steps.length - 1, i));
      if (next === index) return;
      setTyped("");
      setIndex(next);
      setVisited((v) => Math.max(v, next));
    },
    [steps.length, index]
  );

  const next = useCallback(() => {
    if (isTyping) return finishTyping();
    if (isLast) {
      stopNarration();
      return onComplete();
    }
    goTo(index + 1);
  }, [isTyping, isLast, finishTyping, goTo, index, onComplete]);

  /* ── Keyboard: → / Enter next, ← back ──────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showGlossary) return;
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, goTo, index, showGlossary]);

  const skip = () => {
    stopNarration();
    onComplete();
  };

  const progress = Math.round((index / (steps.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col">
      {/* ── Top bar ─────────────────────────────── */}
      <header className="w-full bg-surface-container-low border-b border-outline-variant/10 px-4 md:px-8 py-3 flex flex-wrap items-center gap-4">
        <button onClick={onExit} className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Setup
        </button>
        <div className="h-6 w-px bg-outline-variant/30" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Case briefing · {procedure.forum}</p>
          <p className="font-extrabold truncate">{caseTitle}</p>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setShowGlossary(true)}
          className="px-3 py-2 rounded-lg border border-outline-variant/30 text-xs font-bold flex items-center gap-2 hover:bg-surface-container"
        >
          <BookOpen className="w-4 h-4" /> Court phrases
        </button>
        <button
          onClick={() => setSoundOn((s) => !s)}
          aria-label={soundOn ? "Mute narration" : "Unmute narration"}
          className="p-2 rounded-lg border border-outline-variant/30 hover:bg-surface-container"
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button onClick={skip} className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10">
          Skip briefing
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-surface-container">
        <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr]">
        {/* ── Step map ──────────────────────────── */}
        <aside className="hidden lg:block border-r border-outline-variant/10 bg-surface-container-lowest p-6 overflow-y-auto max-h-[calc(100vh-70px)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Procedure map</p>
          {procedure.phases.map((phase, pi) => (
            <div key={phase.label} className="mb-5">
              <p className={`text-xs font-black uppercase tracking-widest mb-2 ${current.phaseIndex === pi ? "text-primary" : "text-on-surface-variant"}`}>
                {String.fromCharCode(65 + pi)}. {phase.label}
              </p>
              <ol className="space-y-1">
                {phase.steps.map((s) => {
                  const flatIndex = steps.findIndex((f) => f.kind === "step" && f.title === s.title && f.phaseIndex === pi);
                  const done = flatIndex < index;
                  const active = flatIndex === index;
                  const reachable = flatIndex <= visited;
                  return (
                    <li key={s.title}>
                      <button
                        disabled={!reachable}
                        onClick={() => goTo(flatIndex)}
                        className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left text-[13px] transition-colors ${
                          active ? "bg-primary/10 text-primary font-bold" : done ? "text-on-surface hover:bg-surface-container" : "text-on-surface-variant/60"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            active ? "bg-primary border-primary text-on-primary" : done ? "bg-on-surface border-on-surface text-surface" : "border-outline-variant"
                          }`}
                        >
                          {done ? <Check className="w-3 h-3" /> : steps[flatIndex].stepNumber}
                        </span>
                        {s.title}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </aside>

        {/* ── Stage ─────────────────────────────── */}
        <main className="px-5 md:px-12 py-10 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex-1 max-w-4xl w-full"
            >
              {/* Step heading */}
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                {current.kind === "step"
                  ? `Step ${current.stepNumber} of ${totalSteps} · ${String.fromCharCode(65 + current.phaseIndex)}. ${current.phaseLabel}`
                  : current.phaseLabel}
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">{current.title}</h1>
              <div className="flex flex-wrap gap-2 mb-10">
                <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold">{current.actor}</span>
                {current.kind === "intro" && (
                  <>
                    <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold">Presiding: {procedure.presiding}</span>
                    <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold">{procedure.parties}</span>
                    {procedure.draft && <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">Draft track</span>}
                  </>
                )}
              </div>

              {/* Guide: mouse + typing speech box */}
              <div className="flex items-start gap-5">
                <motion.div
                  animate={isTyping ? { y: [0, -4, 0] } : { y: 0 }}
                  transition={isTyping ? { repeat: Infinity, duration: 0.6 } : {}}
                  className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/mouse-avatar.png" alt="Legal Mouse" className="w-full h-full object-cover" />
                </motion.div>
                <button
                  onClick={finishTyping}
                  className="relative flex-1 text-left bg-surface-container-lowest border border-outline-variant/30 rounded-2xl rounded-tl-sm p-5 md:p-6 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Legal Mouse</p>
                  <p className="text-base md:text-lg leading-relaxed min-h-[4.5rem]">
                    {typed}
                    {isTyping && <span className="inline-block w-2 h-5 ml-0.5 align-middle bg-primary animate-pulse" />}
                  </p>
                </button>
              </div>

              {/* Details appear once typing finishes */}
              <AnimatePresence>
                {!isTyping && (current.points || current.say || current.kind === "intro") && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="md:ml-[6.25rem] mt-6 space-y-4">
                    {current.points && (
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {current.points.map((p) => (
                          <li key={p} className="flex gap-2 items-start text-sm bg-surface-container-low rounded-lg px-3 py-2.5">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {p}
                          </li>
                        ))}
                      </ul>
                    )}
                    {current.say && (
                      <div className="flex gap-3 items-start border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-4 py-3">
                        <Quote className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Say it like this</p>
                          <p className="font-serif italic text-lg text-on-surface">&ldquo;{current.say}&rdquo;</p>
                        </div>
                      </div>
                    )}
                    {current.kind === "intro" && (
                      <p className="text-xs text-on-surface-variant">Governing law: {procedure.authority}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation with pointing arrow ──── */}
          <div className="max-w-4xl w-full flex items-center justify-between pt-10 pb-20 md:pb-0 pr-20 md:pr-24">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="px-5 py-3 rounded-lg border border-outline-variant/30 text-sm font-bold flex items-center gap-2 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {!isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: [0, 10, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ x: { repeat: Infinity, duration: 1 }, opacity: { duration: 0.2 } }}
                    className="hidden sm:flex items-center gap-2 text-primary font-bold text-sm"
                  >
                    {isLast ? "Enter the courtroom" : "Next step"} <ArrowRight className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={next}
                className={`px-6 py-3 rounded-lg font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-all ${
                  isTyping ? "bg-surface-container text-on-surface-variant" : "bg-primary text-on-primary shadow-lg shadow-primary/30"
                }`}
              >
                {isTyping ? "Skip text" : isLast ? "Begin hearing" : "Next"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ── Court phrases glossary ──────────────── */}
      <AnimatePresence>
        {showGlossary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowGlossary(false)}
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">Courtroom phrases</h2>
                <button onClick={() => setShowGlossary(false)} aria-label="Close" className="p-2 rounded-lg hover:bg-surface-container">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <dl className="divide-y divide-outline-variant/20">
                {COURT_EXPRESSIONS.map(([phrase, meaning]) => (
                  <div key={phrase} className="py-3 grid sm:grid-cols-[1fr_1.2fr] gap-1 sm:gap-4">
                    <dt className="font-serif italic font-semibold">&ldquo;{phrase}&rdquo;</dt>
                    <dd className="text-sm text-on-surface-variant">{meaning}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
