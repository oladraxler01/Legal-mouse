"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Award, ShieldAlert, ArrowLeft, Home, BookOpen, Volume2 } from "lucide-react";
import Image from "next/image";

export default function JudgmentPage() {
  const router = useRouter();
  const [session, setSession] = useState<{
    transcript: string;
    warningsCount: number;
    accuracy: number;
    demeanor: number;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("legalmouse_coach_session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem("legalmouse_coach_session");
    router.push("/coach");
  };

  const accuracy = session?.accuracy ?? 88;
  const demeanor = session?.demeanor ?? 74;
  const warningsCount = session?.warningsCount ?? 2;
  const transcript = session?.transcript ?? "No transcript recorded.";

  const isSuccess = accuracy >= 75 && demeanor >= 70 && warningsCount <= 3;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="w-full bg-surface-container-low border-b border-outline-variant/10 px-8 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg tracking-tight text-on-surface">
            THE EDITORIAL <span className="text-primary">JURIS</span>
          </span>
          <div className="h-5 w-px bg-outline-variant/20" />
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Moot Court Ruling
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative mb-2">
            <div className="w-28 h-28 rounded-full border-4 border-primary overflow-hidden bg-surface-dim shadow-2xl relative z-10 flex items-center justify-center">
              <Image
                src="/images/mouse-avatar.png"
                alt="Justice LegalMouse"
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-surface z-20">
              <Scale className="text-white w-4 h-4" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Courtroom Ruling &amp; Judgment
          </h1>
          <p className="text-on-surface-variant max-w-lg text-sm">
            Justice LegalMouse has reviewed the arguments, analyzed the evidence vault chain of custody, and issued the official verdict.
          </p>
        </div>

        {/* Verdict Banner */}
        <div
          className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6 shadow-xl ${
            isSuccess
              ? "bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-400"
              : "bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400"
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
              isSuccess ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            {isSuccess ? <Award className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold uppercase tracking-wider">
              {isSuccess ? "Motion Carried Successfully" : "Motion Denied / Appeal Dismissed"}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              {isSuccess
                ? "Your oral address demonstrated adequate legal accuracy and appropriate demeanor. The appeal is sustained."
                : "Procedural objections and leading questions compromised the presentation of the brief. Counsel is ordered to rephrase."}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
              Legal Accuracy
            </span>
            <span className="text-3xl font-extrabold font-mono text-on-surface">
              {accuracy}%
            </span>
            <span className="text-xs text-green-500">▲ Target &gt;= 75%</span>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
              Demeanor Score
            </span>
            <span className="text-3xl font-extrabold font-mono text-on-surface">
              {demeanor}
            </span>
            <span className="text-xs text-on-surface-variant">Out of 100 max</span>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
              Procedural Objections
            </span>
            <span className="text-3xl font-extrabold font-mono text-on-surface">
              {warningsCount}
            </span>
            <span className="text-xs text-red-500">Target &lt;= 3 flags</span>
          </div>
        </div>

        {/* Transcript Log Panel */}
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant block mb-4">
            Recorded Oral Address
          </span>
          <p className="font-serif italic text-on-surface-variant leading-relaxed bg-surface/50 p-4 rounded-xl border border-outline-variant/10 max-h-48 overflow-y-auto">
            {transcript}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
          <button
            onClick={handleClear}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-outline-variant/30 text-on-surface font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retry Simulation
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:bg-primary-container transition-colors shadow-lg shadow-primary/20"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
