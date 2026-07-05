"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  FileText,
  Users,
  Video,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Hand,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════
   TypeScript Interfaces
   ═══════════════════════════════════════════════════ */

interface CaseData {
  title: string;
  stage: string;
  chargeSheet: string;
  witnessStatement: string;
  exhibitA: string;
  exhibitB: string;
}

interface WarningCard {
  id: string;
  type: "error" | "warning";
  label: string;
  description: string;
  timestamp: string;
}

interface UploadedFile {
  name: string;
  size: string;
  content: string;
}

/* ═══════════════════════════════════════════════════
   Default Fallback Data
   ═══════════════════════════════════════════════════ */

const FALLBACK_CASE: CaseData = {
  title: "State v. Olasunkanmi (2026)",
  stage: "CRIMINAL APPEAL STAGE",
  chargeSheet:
    "Allegations under Section 311 of the Criminal Code Act. Count 1: Culpable homicide. Count 2: Armed robbery on the High Street.",
  witnessStatement:
    'Deposition of Sgt. Miller: "I arrived at exactly 22:15 hours. The suspect was already restrained by the night watchman..."',
  exhibitA: "CCTV footage from High St Intersection (0.42 GB)",
  exhibitB: "Ballistics Verified Forensic Report",
};

const DEFAULT_WARNINGS: WarningCard[] = [
  {
    id: "w1",
    type: "error",
    label: "HEARSAY OBJECTION",
    description:
      "Coach: You are testifying to what the witness told you, not what you perceived. Rephrase immediately.",
    timestamp: "12s ago",
  },
  {
    id: "w2",
    type: "warning",
    label: "LEADING QUESTION",
    description:
      "Coach: Suggesting the answer within the question during direct examination is prohibited.",
    timestamp: "1m ago",
  },
];

/* ═══════════════════════════════════════════════════
   Moot Court Simulator Page (Suspense Wrapped Wrapper)
   ═══════════════════════════════════════════════════ */

export default function CoachPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-sm font-mono">Loading simulation workspace...</p>
          </div>
        </div>
      }
    >
      <CoachPageContent />
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════════
   Main Workspace Content Component
   ═══════════════════════════════════════════════════ */

function CoachPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /* ── State ──────────────────────────────────────── */
  const [caseTitle, setCaseTitle] = useState<string>(FALLBACK_CASE.title);
  const [caseStage, setCaseStage] = useState<string>(FALLBACK_CASE.stage);
  const [chargeSheetText, setChargeSheetText] = useState<string>("");
  const [witnessStatementText, setWitnessStatementText] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [coachState, setCoachState] = useState<string>("LISTENING...");
  const [chargeSheetOpen, setChargeSheetOpen] = useState(true);
  const [witnessOpen, setWitnessOpen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [warnings, setWarnings] = useState<WarningCard[]>([]);
  const [legalAccuracy, setLegalAccuracy] = useState(90);
  const [demeanor, setDemeanor] = useState(85);
  const [maximCount, setMaximCount] = useState(0);
  const [timerDisplay] = useState("07:42 / 10:00");

  /* ── Functional Evidence Vault States ────────────── */
  const [exhibitAFile, setExhibitAFile] = useState<UploadedFile | null>(null);
  const [exhibitBFile, setExhibitBFile] = useState<UploadedFile | null>(null);
  const [activeSimulationContext, setActiveSimulationContext] = useState<string>("");

  /* ── Refs for Speech Recognition ─────────────────── */
  const recognitionRef = useRef<any>(null);

  /* ── Refs for Inputs ────────────────────────────── */
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  /* ── Supabase fetch on caseId param ─────────────── */
  useEffect(() => {
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      setCaseTitle(FALLBACK_CASE.title);
      setCaseStage(FALLBACK_CASE.stage);
      setChargeSheetText(FALLBACK_CASE.chargeSheet);
      setWitnessStatementText(FALLBACK_CASE.witnessStatement);
      setIsLoading(false);
      return;
    }

    const fetchCase = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("cases")
          .select("*")
          .eq("id", caseId)
          .single();

        if (error || !data) {
          console.error("Failed to fetch case:", error);
          setCaseTitle(FALLBACK_CASE.title);
          setCaseStage(FALLBACK_CASE.stage);
          setChargeSheetText(FALLBACK_CASE.chargeSheet);
          setWitnessStatementText(FALLBACK_CASE.witnessStatement);
        } else {
          setCaseTitle(data.title || FALLBACK_CASE.title);
          setCaseStage(data.stage || FALLBACK_CASE.stage);
          setChargeSheetText(data.charge_sheet || FALLBACK_CASE.chargeSheet);
          setWitnessStatementText(data.witness_statement || FALLBACK_CASE.witnessStatement);
        }
      } catch {
        setCaseTitle(FALLBACK_CASE.title);
        setCaseStage(FALLBACK_CASE.stage);
        setChargeSheetText(FALLBACK_CASE.chargeSheet);
        setWitnessStatementText(FALLBACK_CASE.witnessStatement);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCase();
  }, [searchParams]);

  /* ── Speech Recognition Lifecycle ───────────────── */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setLiveTranscript((prev) => {
            const next = prev + " " + finalTranscript;
            return next.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            console.error(e);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isListening]);

  /* ── Speech Recognition Toggle ──────────────────── */
  useEffect(() => {
    if (isListening) {
      setCoachState("LISTENING...");
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      setCoachState("LISTENING...");
      recognitionRef.current?.stop();
    }
  }, [isListening]);

  const toggleMic = useCallback(() => {
    setIsListening((prev) => !prev);
  }, []);

  /* ── Debounced AI Coach Evaluation ──────────────── */
  useEffect(() => {
    if (!liveTranscript.trim()) return;

    const delayDebounce = setTimeout(async () => {
      setCoachState("EVALUATING...");

      // Bundle Charge Sheet, Witness Statements, and Active Uploaded File Texts
      const bundleContext = `
Active Charge Sheet: ${chargeSheetText}
Active Witness Statements: ${witnessStatementText}
Exhibit A uploaded text: ${exhibitAFile?.content || "None"}
Exhibit B uploaded text: ${exhibitBFile?.content || "None"}
Extra Context: ${activeSimulationContext}
      `.trim();

      try {
        const response = await fetch("/api/coach/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: liveTranscript,
            documents: bundleContext,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.warnings) {
            setWarnings(data.warnings);
          }
          if (typeof data.legalAccuracy === "number") {
            setLegalAccuracy(data.legalAccuracy);
          }
          if (typeof data.demeanorScore === "number") {
            setDemeanor(data.demeanorScore);
          }
          // Scan for Latin phrases to count maxims
          const lower = liveTranscript.toLowerCase();
          let count = 0;
          if (lower.includes("res ipsa")) count++;
          if (lower.includes("necessity") || lower.includes("necessitas")) count++;
          if (lower.includes("homicide") || lower.includes("actus reus")) count++;
          setMaximCount(count);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCoachState("RULING...");
        setTimeout(() => setCoachState("LISTENING..."), 1500);
      }
    }, 2500);

    return () => clearTimeout(delayDebounce);
  }, [liveTranscript, chargeSheetText, witnessStatementText, exhibitAFile, exhibitBFile, activeSimulationContext]);

  /* ── File Handling & Meta Resolution ──────────────── */
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    exhibit: "A" | "B"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const textResult = (event.target?.result as string) || "";
      
      const newFile: UploadedFile = {
        name: file.name,
        size: sizeStr,
        content: textResult,
      };

      if (exhibit === "A") {
        setExhibitAFile(newFile);
      } else {
        setExhibitBFile(newFile);
      }

      // Append text content of file straight into active simulation context
      setActiveSimulationContext((prev) => {
        return `${prev}\n[File: ${file.name}]\n${textResult}`.trim();
      });
    };

    reader.readAsText(file);
  };

  /* ── Submit Session ─────────────────────────────── */
  const handleSubmit = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);

    const payload = {
      transcript: liveTranscript || "No voice argument recorded.",
      warningsCount: warnings.length,
      accuracy: legalAccuracy,
      demeanor: demeanor,
    };

    localStorage.setItem("legalmouse_coach_session", JSON.stringify(payload));
    router.push("/coach/judgment");
  };

  /* ── Coach state color mapping ──────────────────── */
  const coachStateColor = (() => {
    switch (coachState) {
      case "EVALUATING...":
        return "text-amber-400";
      case "RULING...":
        return "text-red-500";
      default:
        return "text-primary";
    }
  })();

  /* ── Loading skeleton ───────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-on-surface-variant text-sm font-mono">Loading case dossier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col">
      {/* ═══════════════════════════════════════════════
          TOP APPLICATION INFO HEADER BAR
          ═══════════════════════════════════════════════ */}
      <header className="w-full bg-surface-container-low border-b border-outline-variant/10 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg tracking-tight text-on-surface">
            THE EDITORIAL{" "}
            <span className="text-primary">JURIS</span>
          </span>
          <div className="hidden md:block h-5 w-px bg-outline-variant" />
          <span className="hidden md:inline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Coach
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <span className="flex items-center gap-2 font-bold text-on-surface font-mono text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400">{timerDisplay}</span>
          </span>
          <div className="hidden md:block h-4 w-px bg-outline-variant" />
          <span className="hidden md:inline px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-widest border border-outline-variant/20">
            Counsel for Appellant
          </span>
          <button className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors">
            Motion on Notice
          </button>
          <button className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors">
            Citations
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          MAIN THREE-PANEL LAYOUT
          ═══════════════════════════════════════════════ */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* ─────────────────────────────────────────────
            PANEL 1: LITIGATOR'S BRIEFCASE (LEFT)
            ───────────────────────────────────────────── */}
        <aside className="lg:col-span-3 border-r border-outline-variant/10 bg-surface-container-low flex flex-col overflow-y-auto">
          <div className="p-6">
            {/* Active Dossier Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-widest uppercase font-bold text-on-surface-variant">
                Active Dossier
              </span>
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-sm border border-primary/30 uppercase tracking-tighter">
                {caseStage}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-on-surface mb-6">
              {caseTitle}
            </h2>

            {/* Accordion Controls */}
            <div className="space-y-3">
              {/* Charge Sheet Accordion */}
              <div>
                <button
                  onClick={() => setChargeSheetOpen(!chargeSheetOpen)}
                  className={`w-full flex items-center justify-between p-3 rounded transition-all border-l-2 ${
                    chargeSheetOpen
                      ? "bg-surface-container border-primary"
                      : "bg-surface-container/30 border-transparent hover:bg-surface-container/50"
                  }`}
                >
                  <span className="text-sm font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-on-surface-variant" />
                    Charge Sheet
                  </span>
                  {chargeSheetOpen ? (
                    <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                  )}
                </button>
                <AnimatePresence>
                  {chargeSheetOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 ml-0.5 border-l-2 border-outline-variant/20">
                        <textarea
                          value={chargeSheetText}
                          onChange={(e) => setChargeSheetText(e.target.value)}
                          className="w-full bg-transparent border-0 outline-none resize-none focus:ring-0 text-sm text-on-surface-variant font-sans leading-relaxed min-h-[100px]"
                          placeholder="Type or paste your charge sheet details..."
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Witness Statements Accordion */}
              <div>
                <button
                  onClick={() => setWitnessOpen(!witnessOpen)}
                  className={`w-full flex items-center justify-between p-3 rounded transition-all border-l-2 ${
                    witnessOpen
                      ? "bg-surface-container border-primary"
                      : "bg-surface-container/30 border-transparent hover:bg-surface-container/50"
                  }`}
                >
                  <span className="text-sm font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-on-surface-variant" />
                    Witness Statements
                  </span>
                  {witnessOpen ? (
                    <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                  )}
                </button>
                <AnimatePresence>
                  {witnessOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 ml-0.5 border-l-2 border-outline-variant/20">
                        <textarea
                          value={witnessStatementText}
                          onChange={(e) => setWitnessStatementText(e.target.value)}
                          className="w-full bg-transparent border-0 outline-none resize-none focus:ring-0 text-sm text-on-surface-variant font-sans leading-relaxed min-h-[100px]"
                          placeholder="Type or paste your witness statement details..."
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Evidence Vault / Dynamic Dropzones */}
            <div className="pt-6">
              <span className="text-[10px] tracking-widest uppercase font-bold text-on-surface-variant block mb-4">
                Evidence Vault (Click to upload context)
              </span>
              <div className="space-y-2">
                {/* Exhibit A File Input */}
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
                  ref={fileInputARef}
                  onChange={(e) => handleFileChange(e, "A")}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputARef.current?.click()}
                  className={`w-full flex items-center gap-3 p-3 bg-surface-container/30 rounded border transition-all cursor-pointer group text-left ${
                    exhibitAFile ? "border-primary" : "border-outline-variant/10 hover:border-amber-500/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-amber-400 transition-colors shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      {exhibitAFile ? exhibitAFile.name : "Exhibit A: CCTV"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {exhibitAFile ? `${exhibitAFile.name} (${exhibitAFile.size})` : "High St Intersection (0.42 GB)"}
                    </p>
                  </div>
                </button>

                {/* Exhibit B File Input */}
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
                  ref={fileInputBRef}
                  onChange={(e) => handleFileChange(e, "B")}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputBRef.current?.click()}
                  className={`w-full flex items-center gap-3 p-3 bg-surface-container/30 rounded border transition-all cursor-pointer group text-left ${
                    exhibitBFile ? "border-primary" : "border-outline-variant/10 hover:border-amber-500/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-amber-400 transition-colors shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      {exhibitBFile ? exhibitBFile.name : "Exhibit B: Forensic Cert"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {exhibitBFile ? `${exhibitBFile.name} (${exhibitBFile.size})` : "Ballistics Verified Report"}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ─────────────────────────────────────────────
            PANEL 2: THE DIGITAL STAGE (CENTER)
            ───────────────────────────────────────────── */}
        <section className="lg:col-span-6 bg-surface-container relative flex flex-col">
          {/* Stage Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
            {/* AI Presiding Judge Module */}
            <div className="mb-10 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden bg-surface-dim shadow-2xl shadow-primary/10 relative z-10 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/mouse-avatar.png"
                    alt="Justice LegalMouse"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Status Indicator Badge */}
                <div
                  className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface z-20 ${
                    coachState === "RULING..."
                      ? "bg-red-500"
                      : coachState === "EVALUATING..."
                      ? "bg-amber-400"
                      : "bg-primary"
                  }`}
                >
                  <span className="text-white text-[10px] font-bold">
                    {coachState === "RULING..." ? "⚖" : coachState === "EVALUATING..." ? "👁" : "👂"}
                  </span>
                </div>
              </div>
              <h3 className="font-extrabold text-2xl text-on-surface mb-1">
                Justice LegalMouse
              </h3>
              <p className="text-xs text-on-surface-variant mb-1">(Presiding AI Judge)</p>
              <p
                className={`text-xs uppercase tracking-[0.2em] font-bold animate-pulse ${coachStateColor}`}
              >
                {coachState}
              </p>
            </div>

            {/* Active Voice Wave Trigger (Mic Button) */}
            <div className="relative mb-10">
              {/* Ping halo when active */}
              {isListening && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full bg-primary/20 animate-ping" />
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleMic}
                className={`relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-full border-2 flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${
                  isListening
                    ? "bg-primary border-primary shadow-[0_0_40px_rgba(138,43,226,0.4)]"
                    : "bg-surface-dim/50 border-outline-variant/30 hover:border-primary/60"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 text-on-primary" />
                ) : (
                  <Mic className="w-10 h-10 text-on-surface-variant hover:text-primary transition-colors" />
                )}
              </motion.button>

              {/* Waveform bars */}
              {isListening && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-end justify-center h-8 gap-[2px]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-primary rounded-full"
                      style={{
                        height: `${8 + Math.random() * 20}px`,
                        animation: `wave 1s infinite ease-in-out`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Transcription Display Tray */}
          <div className="px-4 md:px-8 pb-6 w-full max-w-2xl mx-auto">
            <div className="glass-panel p-5 md:p-6 rounded-xl border border-amber-500/20 relative">
              <div className="absolute -top-3 left-6 px-2 bg-surface-container text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                Live Transcription
              </div>
              <p className="text-base md:text-lg text-on-surface italic leading-relaxed font-serif min-h-[60px]">
                {liveTranscript || 'Click the microphone button and start speaking your address...'}
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            PANEL 3: AI COACH ANALYSIS (RIGHT)
            ───────────────────────────────────────────── */}
        <aside className="lg:col-span-3 border-l border-outline-variant/10 bg-surface-container-low flex flex-col overflow-y-auto">
          <div className="p-6">
            <span className="text-[10px] tracking-widest uppercase font-bold text-primary mb-4 block">
              AI Coach Analysis
            </span>

            {/* Core Score Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-surface-container/50 p-4 rounded-lg border border-outline-variant/10">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight mb-1">
                  Legal Accuracy
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-extrabold text-on-surface font-mono">
                    {legalAccuracy}%
                  </span>
                  <span className="text-green-500 text-sm mb-1">▲</span>
                </div>
              </div>
              <div className="bg-surface-container/50 p-4 rounded-lg border border-outline-variant/10">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight mb-1">
                  Demeanor
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-extrabold text-on-surface font-mono">
                    {demeanor}
                  </span>
                  <span className="text-[10px] text-on-surface-variant mb-1">/ 100</span>
                </div>
              </div>
            </div>

            {/* Maxim Metric Module */}
            <div className="mb-8 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-primary font-bold uppercase">
                  Latin Maxims Used
                </p>
                <p className="italic text-on-surface-variant text-xs mt-0.5">
                  &ldquo;Res ipsa loquitur&rdquo;
                </p>
              </div>
              <div className="text-3xl font-black text-primary opacity-50 font-mono">
                {String(maximCount).padStart(2, "0")}
              </div>
            </div>

            {/* Live Warning Stream */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] tracking-widest uppercase font-bold text-on-surface-variant">
                  Live Warning Stream
                </span>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="space-y-3">
                {warnings.length === 0 ? (
                  <p className="text-xs text-on-surface-variant italic">No objections logged yet. Make your argument.</p>
                ) : (
                  warnings.map((warning) => (
                    <div
                      key={warning.id}
                      className={`bg-surface-container/80 p-4 rounded-lg border-l-4 shadow-lg ${
                        warning.type === "error"
                          ? "border-red-500"
                          : "border-amber-500"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-xs font-black uppercase tracking-tighter ${
                            warning.type === "error"
                              ? "text-red-500"
                              : "text-amber-500"
                          }`}
                        >
                          {warning.label}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {warning.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-tight">
                        {warning.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tactical Advice */}
            <div className="mt-8 border-t border-outline-variant/10 pt-6">
              <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-3">
                Tactical Opportunity
              </p>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-on-surface font-medium">
                  Use the &ldquo;Doctrine of Necessity&rdquo; to bypass the
                  procedural hurdle mentioned by the judge.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ═══════════════════════════════════════════════
          FLOATING COMMAND FOOTER TRACK
          ═══════════════════════════════════════════════ */}
      <footer className="h-16 md:h-20 bg-surface border-t border-outline-variant/10 px-4 md:px-12 flex items-center justify-between z-50">
        {/* Left Action: Object Button */}
        <div className="flex-1">
          <button className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-500 hover:bg-amber-600/20 transition-all">
            <Hand className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">
              🖐️ Object!
            </span>
            <span className="text-xs font-black uppercase tracking-widest sm:hidden">
              Object!
            </span>
          </button>
        </div>

        {/* Center: Mic State Readout */}
        <div className="flex-none text-center">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isListening ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            {isListening ? "🔴 Microphone Active" : "Microphone Muted"}
          </span>
        </div>

        {/* Right Action: Submit Final Address */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 md:px-8 py-3 rounded bg-on-surface text-surface font-black text-xs uppercase tracking-[0.15em] hover:bg-primary hover:text-on-primary transition-all shadow-xl"
          >
            <span className="hidden sm:inline">Submit Final Address</span>
            <span className="sm:hidden">Submit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* ── Inline keyframe for waveform bars ──────── */}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            height: 8px;
          }
          50% {
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
