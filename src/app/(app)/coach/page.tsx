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
  role?: string;
}

interface UploadedFile {
  name: string;
  size: string;
  content: string;
}

interface OpponentOption {
  id: string;
  label: string;
  description: string;
}

/* ═══════════════════════════════════════════════════
   Predefined Case Scenarios
   ═══════════════════════════════════════════════════ */

const PREDEFINED_SCENARIOS = {
  CRIMINAL: [
    {
      id: "crim_1",
      title: "State v. Olasunkanmi (2026)",
      stage: "CRIMINAL TRIAL STAGE",
      chargeSheet: "Allegations under Section 311 of the Criminal Code Act. Count 1: Culpable homicide. Count 2: Armed robbery on the High Street.",
      witnessStatement: 'Deposition of Sgt. Miller: "I arrived at exactly 22:15 hours. The suspect was already restrained by the night watchman. I observed blood on the suspect\'s outer garment. When questioned, the suspect immediately stated, \'I didn\'t touch him.\'"'
    },
    {
      id: "crim_2",
      title: "State v. Jenkins (2026)",
      stage: "BAIL HEARING",
      chargeSheet: "Count 1: Grand Larceny. Count 2: Evading Arrest. The defendant allegedly stole $45,000 in bearer bonds.",
      witnessStatement: 'Affidavit of Flight Risk: "The defendant was found at the international terminal with a one-way ticket to a non-extradition jurisdiction. We request bail be denied."'
    }
  ],
  CIVIL: [
    {
      id: "civ_1",
      title: "TechCorp v. Smith (2026)",
      stage: "CIVIL INJUNCTION HEARING",
      chargeSheet: "Breach of Non-Compete Agreement and Misappropriation of Trade Secrets. Plaintiff seeks immediate injunctive relief.",
      witnessStatement: 'Affidavit of HR Director: "Mr. Smith downloaded 40GB of proprietary source code the night before tendering his resignation to join our direct competitor. We request an immediate halt to his employment."'
    },
    {
      id: "civ_2",
      title: "Estate of Davis v. Horizon Medical",
      stage: "MEDICAL MALPRACTICE TRIAL",
      chargeSheet: "Wrongful death arising from gross negligence during routine appendectomy on August 14th.",
      witnessStatement: 'Expert Testimony - Dr. Aris: "The surgical team completely ignored the patient\'s clearly documented allergy to the administered anesthetic, leading to anaphylactic shock."'
    }
  ],
  HYBRID: [
    {
      id: "hyb_1",
      title: "City of New Port v. Industrial Chem",
      stage: "REGULATORY & TORT ACTION",
      chargeSheet: "Civil suit for environmental damages and statutory criminal negligence for unauthorized dumping of toxic waste in municipal waterways.",
      witnessStatement: 'EPA Inspector Log: "At 04:00 hours, we observed the facility actively bypassing the filtration unit and discharging raw toxic effluent directly into the river..."'
    }
  ]
};

const FALLBACK_CASE: CaseData = {
  title: "State v. Olasunkanmi (2026)",
  stage: "CRIMINAL APPEAL STAGE",
  chargeSheet:
    "Allegations under Section 311 of the Criminal Code Act. Count 1: Culpable homicide. Count 2: Armed robbery on the High Street.",
  witnessStatement:
    'Deposition of Sgt. Miller: "I arrived at exactly 22:15 hours. The suspect was already restrained by the night watchman..."',
  exhibitA: "Ccroll",
  exhibitB: "",
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
  const [activeChargeText, setActiveChargeText] = useState<string>("");
  const [activeWitnessText, setActiveWitnessText] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [coachState, setCoachState] = useState<string>("LISTENING...");
  const [chargeSheetOpen, setChargeSheetOpen] = useState(true);
  const [witnessOpen, setWitnessOpen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<WarningCard[]>([]);
  const [scale, setScale] = useState(1);
  const [courtTurn, setCourtTurn] = useState<'USER_ARGUMENT' | 'OPPOSING_RESPONSE' | 'JUDICIAL_INTERLOCUTORY'>('USER_ARGUMENT');
  const [isOpponentSpeaking, setIsOpponentSpeaking] = useState(false);
  const [opponentRole] = useState<string>("Defense Counsel");
  const [typedArgument, setTypedArgument] = useState("");
  const [argumentHistoryLog, setArgumentHistoryLog] = useState<{ role: 'advocate' | 'opponent'; text: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [opponentOptions, setOpponentOptions] = useState<OpponentOption[]>([]);

  const [isCaseInitialized, setIsCaseInitialized] = useState(false);
  const [caseNature, setCaseNature] = useState<'CRIMINAL' | 'CIVIL' | 'HYBRID' | null>(null);
  const [intakeMethod, setIntakeMethod] = useState<'AI_SCENARIO' | 'CUSTOM_UPLOAD' | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const isListeningRef = useRef(isListening);
  const recognitionRef = useRef<any>(null);
  const committedIndexRef = useRef(0);
  const lastSubmittedTextRef = useRef("");

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const [legalAccuracy, setLegalAccuracy] = useState(90);
  const [demeanor, setDemeanor] = useState(85);
  const [maximCount, setMaximCount] = useState(0);
  const [timerDisplay] = useState("07:42 / 10:00");

  /* ── Functional Evidence Vault States ────────────── */
  const [exhibitAFile, setExhibitAFile] = useState<UploadedFile | null>(null);
  const [exhibitBFile, setExhibitBFile] = useState<UploadedFile | null>(null);
  const [activeSimulationContext, setActiveSimulationContext] = useState<string>("");



  /* ── Refs for Inputs ────────────────────────────── */
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  /* ── Supabase fetch on caseId param ─────────────── */
  useEffect(() => {
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      setCaseTitle(FALLBACK_CASE.title);
      setCaseStage(FALLBACK_CASE.stage);
      setActiveChargeText(FALLBACK_CASE.chargeSheet);
      setActiveWitnessText(FALLBACK_CASE.witnessStatement);
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
          setActiveChargeText(FALLBACK_CASE.chargeSheet);
          setActiveWitnessText(FALLBACK_CASE.witnessStatement);
        } else {
          setCaseTitle(data.title || FALLBACK_CASE.title);
          setCaseStage(data.stage || FALLBACK_CASE.stage);
          setActiveChargeText(data.charge_sheet || FALLBACK_CASE.chargeSheet);
          setActiveWitnessText(data.witness_statement || FALLBACK_CASE.witnessStatement);
        }
      } catch {
        setCaseTitle(FALLBACK_CASE.title);
        setCaseStage(FALLBACK_CASE.stage);
        setActiveChargeText(FALLBACK_CASE.chargeSheet);
        setActiveWitnessText(FALLBACK_CASE.witnessStatement);
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
        let interimPart = "";
        
        // Process any new final results
        for (let i = committedIndexRef.current; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            if (transcript.trim()) {
              setLiveTranscript((prev) => {
                const trimmedPrev = prev.trim();
                const trimmedText = transcript.trim();
                if (!trimmedPrev) return trimmedText;
                return `${trimmedPrev} ${trimmedText}`;
              });
            }
            committedIndexRef.current = i + 1;
          } else {
            interimPart += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interimPart);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error, event);
        let errorMsg = "";
        let shouldStop = false;

        if (event.error === "not-allowed") {
          errorMsg = "Microphone access denied. Please check browser microphone permissions.";
          shouldStop = true;
        } else if (event.error === "audio-capture") {
          errorMsg = "No microphone detected. Please connect a microphone.";
          shouldStop = true;
        } else if (event.error === "network") {
          errorMsg = "Speech recognition network error.";
          shouldStop = true;
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          errorMsg = `Speech recognition error: ${event.error}`;
          shouldStop = true;
        }

        if (errorMsg) {
          setTranscriptionError(errorMsg);
        }

        if (shouldStop) {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        committedIndexRef.current = 0;
        setInterimTranscript("");

        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to auto-restart speech recognition:", e);
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
  }, []);

  /* ── Speech Recognition Toggle ──────────────────── */
  useEffect(() => {
    if (isListening) {
      setCoachState("LISTENING...");
      setTranscriptionError(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    } else {
      setCoachState("LISTENING...");
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.error("Failed to stop speech recognition:", e);
      }
    }
  }, [isListening]);

  const speakText = (text: string, onEnd: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      onEnd();
    };
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      onEnd();
    };
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
    if (voice) {
      utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const unlockInterface = useCallback(() => {
    setCoachState("LISTENING...");
    setLiveTranscript("");
    setInterimTranscript("");
    setTypedArgument("");
    setCourtTurn("USER_ARGUMENT");
    setIsSubmitting(false);
  }, []);

  const runOpponentTurn = async (currentTranscript: string) => {
    setCourtTurn("OPPOSING_RESPONSE");
    setIsOpponentSpeaking(true);
    setCoachState("OPPONENT SPEAKING...");

    const bundleContext = `
Active Charge Sheet: ${activeChargeText}
Active Witness Statements: ${activeWitnessText}
Exhibit A uploaded text: ${exhibitAFile?.content || "None"}
Exhibit B uploaded text: ${exhibitBFile?.content || "None"}
Extra Context: ${activeSimulationContext}
    `.trim();

    try {
      const response = await fetch("/api/coach/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: currentTranscript,
          documents: bundleContext,
          courtTurn: "OPPOSING_RESPONSE",
          caseNature
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.warnings && data.warnings.length > 0) {
          // Keep stream limited to only active context items (1 card row per turn)
          setWarnings([data.warnings[0]]);
        }
        if (typeof data.legalAccuracy === "number") setLegalAccuracy(data.legalAccuracy);
        if (typeof data.demeanorScore === "number") setDemeanor(data.demeanorScore);
        
        if (data.responseOptions && data.responseOptions.length > 0) {
          setOpponentOptions(data.responseOptions);
          setIsOpponentSpeaking(false);
          setCoachState("WAITING FOR DEPLOYMENT...");
        } else if (data.responseSpeech) {
          setArgumentHistoryLog(prev => [...prev, { role: 'opponent', text: data.responseSpeech }]);
          setWarnings([
            {
              id: `opp_${Date.now()}`,
              type: "warning",
              label: "Opposing Counsel Pushback",
              description: data.responseSpeech,
              timestamp: "Just now",
              role: data.role || "Defense Counsel"
            }
          ]);

          speakText(data.responseSpeech, () => {
            setIsOpponentSpeaking(false);
            runJudicialTurn(currentTranscript, data.responseSpeech);
          });
        } else {
          setIsOpponentSpeaking(false);
          runJudicialTurn(currentTranscript, "");
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (e) {
      console.error("Opponent Turn Error:", e);
      
      const fallbackText = "Counsel, your line of questioning directly compromises the witness timeline outlined by Sgt. Miller. Kindly reframe your approach or present a foundational argument for the Court to consider.";
      
      setArgumentHistoryLog(prev => [...prev, { role: 'opponent', text: fallbackText }]);
      setWarnings([
        {
          id: `fallback_${Date.now()}`,
          type: "warning",
          label: "PROSECUTION COUNSEL: REBUTTAL PUSHBACK",
          description: fallbackText,
          timestamp: "Just now",
          role: "Defense Counsel"
        }
      ]);
      
      setIsOpponentSpeaking(false);
      unlockInterface(); // Instantly release the UI lock
    }
  };

  const runJudicialTurn = async (userText: string, opponentText: string) => {
    setCourtTurn("JUDICIAL_INTERLOCUTORY");
    setCoachState("DELIVERING RULING...");

    const bundleContext = `
Active Charge Sheet: ${activeChargeText}
Active Witness Statements: ${activeWitnessText}
Exhibit A uploaded text: ${exhibitAFile?.content || "None"}
Exhibit B uploaded text: ${exhibitBFile?.content || "None"}
Extra Context: ${activeSimulationContext}
    `.trim();

    try {
      const response = await fetch("/api/coach/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: `User counsel argued: "${userText}". Opposing counsel countered: "${opponentText}".`,
          documents: bundleContext,
          courtTurn: "JUDICIAL_INTERLOCUTORY",
          caseNature
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.warnings) {
          setWarnings((prev) => [...data.warnings, ...prev]);
        }
        if (typeof data.legalAccuracy === "number") setLegalAccuracy(data.legalAccuracy);
        if (typeof data.demeanorScore === "number") setDemeanor(data.demeanorScore);

        if (data.responseSpeech) {
          setWarnings([
            {
              id: `judge_${Date.now()}`,
              type: "error",
              label: "Procedural Ruling",
              description: data.responseSpeech,
              timestamp: "Just now",
              role: data.role || "Justice LegalMouse"
            }
          ]);

          const animInterval = setInterval(() => {
            setScale(1 + Math.random() * 0.15);
          }, 100);

          speakText(data.responseSpeech, () => {
            clearInterval(animInterval);
            setScale(1);
            unlockInterface();
          });
        } else {
          unlockInterface();
        }
      } else {
        unlockInterface();
      }
    } catch (e) {
      console.error(e);
      unlockInterface();
    }
  };

  const deployObjection = (option: OpponentOption) => {
    setOpponentOptions([]); // Clear the menu
    setArgumentHistoryLog(prev => [...prev, { role: 'opponent', text: option.description }]);
    setWarnings([
      {
        id: `opp_${Date.now()}`,
        type: "warning",
        label: option.label,
        description: option.description,
        timestamp: "Just now",
        role: opponentRole
      }
    ]);
    
    setIsOpponentSpeaking(true);
    setCoachState("OPPONENT SPEAKING...");

    speakText(option.description, () => {
      setIsOpponentSpeaking(false);
      runJudicialTurn(lastSubmittedTextRef.current, option.description);
    });
  };

  const submitArgument = async (textToSubmit: string) => {
    if (!textToSubmit.trim() || isSubmitting || courtTurn !== 'USER_ARGUMENT') return;
    
    setIsSubmitting(true);
    setArgumentHistoryLog(prev => [...prev, { role: 'advocate', text: textToSubmit }]);
    lastSubmittedTextRef.current = textToSubmit;
    
    // Clear the typed text explicitly to reflect submission
    setTypedArgument("");
    setLiveTranscript("");
    setInterimTranscript("");
    
    if (isListeningRef.current) {
        setIsListening(false);
        isListeningRef.current = false;
        try { recognitionRef.current?.stop(); } catch(e) {}
    }

    await runOpponentTurn(textToSubmit);
  };

  const toggleMic = useCallback(() => {
    if (isSubmitting) return;
    setIsListening((prev) => {
      const next = !prev;
      isListeningRef.current = next;
      if (!next) {
        setInterimTranscript((prevInterim) => {
          let finalVal = "";
          setLiveTranscript((prevLive) => {
            const trimmedLive = prevLive.trim();
            const trimmedInterim = prevInterim.trim();
            finalVal = trimmedLive ? `${trimmedLive} ${trimmedInterim}` : trimmedInterim;
            
            // Only stop recording, don't auto-submit. The user will use "Submit Argument".
            // We transfer the transcript to the typedArgument field for them to review/edit
            if (finalVal.trim()) {
              setTypedArgument(prevTyped => (prevTyped ? `${prevTyped} ${finalVal}` : finalVal));
            }
            return "";
          });
          return "";
        });
        committedIndexRef.current = 0;
      } else {
        setTranscriptionError(null);
      }
      return next;
    });
  }, [isSubmitting]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Left for backwards compatibility, but we use setTypedArgument now
    const val = e.target.value;
    setTypedArgument(val);
  }, []);

  /* ── Debounced AI Coach Evaluation ──────────────── */
  useEffect(() => {
    if (courtTurn !== "USER_ARGUMENT") return;
    const textToEvaluate = liveTranscript || typedArgument;
    if (!textToEvaluate.trim() || isSubmitting) return;

    const delayDebounce = setTimeout(async () => {
      // Evaluate passively without locking the interface or causing a full turn response
      const bundleContext = `
Active Charge Sheet: ${activeChargeText}
Active Witness Statements: ${activeWitnessText}
Exhibit A uploaded text: ${exhibitAFile?.content || "None"}
Exhibit B uploaded text: ${exhibitBFile?.content || "None"}
Extra Context: ${activeSimulationContext}
      `.trim();

      try {
        const response = await fetch("/api/coach/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: textToEvaluate,
            documents: bundleContext,
            courtTurn: "USER_ARGUMENT",
            caseNature
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.warnings && data.warnings.length > 0) {
            setWarnings([data.warnings[0]]);
          }
          if (typeof data.legalAccuracy === "number") {
            setLegalAccuracy(data.legalAccuracy);
          }
          if (typeof data.demeanorScore === "number") {
            setDemeanor(data.demeanorScore);
          }
          const lower = textToEvaluate.toLowerCase();
          let count = 0;
          if (lower.includes("res ipsa")) count++;
          if (lower.includes("necessity") || lower.includes("necessitas")) count++;
          if (lower.includes("homicide") || lower.includes("actus reus")) count++;
          setMaximCount(count);
        }
      } catch (e) {
        console.error(e);
      }
    }, 3000);

    return () => clearTimeout(delayDebounce);
  }, [liveTranscript, typedArgument, courtTurn, isSubmitting, activeChargeText, activeWitnessText, exhibitAFile, exhibitBFile, activeSimulationContext]);

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
      try { recognitionRef.current.abort(); } catch(e) {}
    }
    setIsListening(false);

    const finalPayload = {
      transcriptHistory: argumentHistoryLog,
      chargeSheetContext: activeChargeText,
      witnessStatementContext: activeWitnessText,
      warningsCount: warnings.length,
      accuracy: legalAccuracy,
      demeanor: demeanor,
      caseNature,
      intakeMethod
    };

    localStorage.setItem("legalmouse_coach_session", JSON.stringify(finalPayload));
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

  /* ── Onboarding Wrapper ─────────────────────────── */
  if (!isCaseInitialized) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center py-20 px-4 md:px-8 font-sans">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-2 tracking-tighter uppercase">Initialize Courtroom</h1>
          <p className="text-on-surface-variant mb-12">Configure the simulation parameters to calibrate the active trial arena.</p>

          <div className="space-y-12">
            {/* Step A: Nature of the Case */}
            <section>
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary">A</span>
                Nature of the Case
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['CRIMINAL', 'CIVIL', 'HYBRID'] as const).map(nature => (
                  <button
                    key={nature}
                    onClick={() => {
                      setCaseNature(nature);
                      setIntakeMethod(null);
                      setSelectedScenarioId(null);
                    }}
                    className={`p-6 rounded-xl border text-left transition-all ${caseNature === nature ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant'}`}
                  >
                    <h3 className="text-xl font-black text-on-surface mb-2 uppercase">{nature}</h3>
                    <p className="text-xs text-on-surface-variant">
                      {nature === 'CRIMINAL' && 'State v. Suspect - Statutory infractions, homicide, robbery.'}
                      {nature === 'CIVIL' && 'Private disputes - Breach of contract, torts, injunctions.'}
                      {nature === 'HYBRID' && 'Parallel actions - Tortious claims mixed with statutory negligence.'}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Step B: Intake Method */}
            <AnimatePresence>
              {caseNature && (
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary">B</span>
                    Scenario Intake Method
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {(['AI_SCENARIO', 'CUSTOM_UPLOAD'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => {
                          setIntakeMethod(method);
                          setSelectedScenarioId(null);
                        }}
                        className={`p-6 rounded-xl border text-left transition-all ${intakeMethod === method ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant'}`}
                      >
                        <h3 className="text-lg font-black text-on-surface mb-2 uppercase">
                          {method === 'AI_SCENARIO' ? 'AI Generation Suite' : 'Custom Briefcase Upload'}
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                          {method === 'AI_SCENARIO' ? 'Load a pre-configured scenario tailored to the selected case nature.' : 'Upload your own raw documents to populate the active panels.'}
                        </p>
                      </button>
                    ))}
                  </div>

                  {intakeMethod === 'AI_SCENARIO' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-surface-container rounded-xl border border-outline-variant/10">
                      {PREDEFINED_SCENARIOS[caseNature].map(scenario => (
                        <button
                          key={scenario.id}
                          onClick={() => setSelectedScenarioId(scenario.id)}
                          className={`p-4 rounded-lg border text-left transition-all ${selectedScenarioId === scenario.id ? 'border-primary bg-primary/10' : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/50'}`}
                        >
                          <span className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1 block">{scenario.stage}</span>
                          <h4 className="font-bold text-on-surface mb-2">{scenario.title}</h4>
                          <p className="text-xs text-on-surface-variant line-clamp-2">{scenario.chargeSheet}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {intakeMethod === 'CUSTOM_UPLOAD' && (
                    <div className="p-8 bg-surface-container rounded-xl border border-outline-variant/10 border-dashed text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <FileText className="w-12 h-12 text-on-surface-variant opacity-50" />
                        <p className="text-sm font-bold text-on-surface">Upload Custom Briefcase Files</p>
                        <p className="text-xs text-on-surface-variant mb-4">Your documents will be parsed directly into the active dashboard.</p>
                        <input 
                          type="file" 
                          id="onboarding-upload" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, "A")} 
                        />
                        <label 
                          htmlFor="onboarding-upload" 
                          className="px-6 py-2 bg-surface-container-high border border-outline-variant/20 rounded cursor-pointer hover:bg-surface-container-highest transition-colors text-xs font-bold uppercase tracking-widest text-on-surface"
                        >
                          Select File
                        </label>
                        {exhibitAFile && (
                          <p className="text-[10px] text-green-500 font-bold uppercase mt-2">Ready: {exhibitAFile.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            {/* Step C: Initialize */}
            <AnimatePresence>
              {(selectedScenarioId || intakeMethod === 'CUSTOM_UPLOAD') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 border-t border-outline-variant/10 flex justify-end">
                  <button
                    onClick={() => {
                      if (intakeMethod === 'AI_SCENARIO' && selectedScenarioId && caseNature) {
                        const scenario = PREDEFINED_SCENARIOS[caseNature].find(s => s.id === selectedScenarioId);
                        if (scenario) {
                          setCaseTitle(scenario.title);
                          setCaseStage(scenario.stage);
                          setActiveChargeText(scenario.chargeSheet);
                          setActiveWitnessText(scenario.witnessStatement);
                        }
                      } else if (intakeMethod === 'CUSTOM_UPLOAD') {
                         setCaseTitle("Custom Imported Case");
                         setCaseStage("PRE-TRIAL CONFERENCE");
                         if (exhibitAFile) {
                           setActiveChargeText(exhibitAFile.content.slice(0, 500) + "...");
                           setActiveWitnessText("Pending formal deposition entry...");
                         }
                      }
                      setIsCaseInitialized(true);
                    }}
                    className="px-8 py-4 bg-primary text-on-primary font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-primary/90 transition-all flex items-center gap-3"
                  >
                    Initialize Courtroom <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                          value={activeChargeText}
                          onChange={(e) => setActiveChargeText(e.target.value)}
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
                          value={activeWitnessText}
                          onChange={(e) => setActiveWitnessText(e.target.value)}
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
                <motion.div
                  animate={{ scale }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden bg-surface-dim shadow-2xl shadow-primary/10 relative z-10 flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/mouse-avatar.png"
                    alt="Justice LegalMouse"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                {/* Status Indicator Badge */}
                <div
                  className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface z-20 ${
                    coachState === "DELIVERING RULING..." || coachState === "RULING..."
                      ? "bg-red-500"
                      : coachState === "EVALUATING..."
                      ? "bg-amber-400"
                      : "bg-primary"
                  }`}
                >
                  <span className="text-white text-[10px] font-bold">
                    {coachState === "DELIVERING RULING..." || coachState === "RULING..." ? "⚖" : coachState === "EVALUATING..." ? "👁" : "👂"}
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

          {/* Live Transcription Display Tray & Manual Input Box */}
          <div className="px-4 md:px-8 pb-6 w-full max-w-2xl mx-auto">
            <div className={`glass-panel p-5 md:p-6 rounded-xl border relative transition-colors ${isSubmitting ? 'border-outline-variant/20 opacity-60 pointer-events-none' : 'border-amber-500/20'}`}>
              <div className="absolute -top-3 left-6 px-2 bg-surface-container text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                Argument Input & History
              </div>
              
              {/* History Log Tracking */}
              {argumentHistoryLog.length > 0 && (
                <div className="mb-4 max-h-[120px] overflow-y-auto space-y-3 border-b border-outline-variant/10 pb-4">
                  {argumentHistoryLog.map((log, idx) => (
                    <div key={idx} className={`text-sm ${log.role === 'advocate' ? 'text-primary text-right pl-12' : 'text-amber-500 text-left pr-12'}`}>
                      <span className="font-bold uppercase tracking-wider text-[10px] block opacity-70 mb-0.5">{log.role === 'advocate' ? 'You' : 'Opponent'}</span> 
                      <span className="font-serif italic leading-relaxed">{log.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {transcriptionError && (
                <p className="text-base md:text-lg leading-relaxed font-serif mb-3">
                  <span className="text-red-400 font-sans text-xs md:text-sm not-italic flex items-center gap-1.5">
                    <span className="shrink-0">⚠️</span> {transcriptionError}
                  </span>
                </p>
              )}

              {isListening && (
                <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-[10px] text-primary mb-1 uppercase tracking-wider font-bold animate-pulse">Listening...</p>
                  <p className="w-full text-base md:text-lg text-on-surface italic leading-relaxed font-serif min-h-[40px]">
                    {liveTranscript + (interimTranscript ? (liveTranscript ? " " : "") + interimTranscript : "") || "Speak your address now..."}
                  </p>
                </div>
              )}

              {/* Manual Text Input Component */}
              <div className="flex flex-col md:flex-row items-end gap-3 mt-2">
                <textarea
                  value={typedArgument}
                  onChange={(e) => setTypedArgument(e.target.value)}
                  disabled={isSubmitting || isListening}
                  placeholder={isListening ? "Pause microphone to type..." : "Type your argument manually here or use voice..."}
                  className="w-full md:flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm md:text-base text-on-surface font-sans resize-none min-h-[80px]"
                />
                <button
                  onClick={() => submitArgument(typedArgument)}
                  disabled={!typedArgument.trim() || isSubmitting || isListening}
                  className="w-full md:w-auto h-[50px] md:h-[80px] px-6 rounded-lg bg-primary text-on-primary font-bold shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex md:flex-col items-center justify-center gap-2 md:gap-1"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span className="text-xs md:text-[10px] uppercase tracking-wider">Submit Argument</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            PANEL 3: AI COACH ANALYSIS (RIGHT)
            ───────────────────────────────────────────── */}
        <aside className="lg:col-span-3 border-l border-outline-variant/10 bg-surface-container-low flex flex-col overflow-y-auto">
          {/* Top 40%: The Coach Region */}
          <div className="p-6 border-b border-outline-variant/10 h-[40%] flex flex-col animate-in fade-in duration-300">
            <span className="text-[10px] tracking-widest uppercase font-bold text-primary mb-4 block">
              AI Coach Analysis
            </span>

            {/* Core Score Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
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
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between mt-auto">
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
          </div>

          {/* Bottom 60%: The Opponent Region */}
          <div className="p-6 flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-widest uppercase font-bold text-on-surface-variant">
                OPPOSING COUNSEL DESK
              </span>
              <div 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isOpponentSpeaking ? "bg-red-500 animate-pulse shadow-[0_0_8px_#EF4444]" : "bg-neutral-600"
                }`} 
              />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {opponentOptions.length > 0 ? (
                opponentOptions.map((option, idx) => (
                  <div
                    key={option.id || `opt_${idx}`}
                    className="p-4 rounded-lg border-l-4 shadow-lg bg-[#131417] border-amber-500/80 transition-all duration-300 hover:bg-surface-container/50 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black uppercase tracking-tighter text-amber-500">
                        Option {idx + 1}: {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-tight mb-4 flex-1">
                      {option.description}
                    </p>
                    <button
                      onClick={() => deployObjection(option)}
                      className="w-full py-2 mt-auto bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-[#131417] text-[10px] font-black uppercase tracking-widest rounded transition-all"
                    >
                      Deploy This Objection
                    </button>
                  </div>
                ))
              ) : warnings.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">No objections logged yet. Make your argument.</p>
              ) : (
                warnings.map((warning) => (
                  <div
                    key={warning.id}
                    className={`p-4 rounded-lg border-l-4 shadow-lg bg-[#131417] transition-all duration-300 ${
                      warning.type === "error"
                        ? "border-red-500/80"
                        : "border-amber-500/80"
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
                        {warning.role || opponentRole}: {warning.label}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {warning.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-tight">
                      {warning.description.startsWith("Coach: ")
                        ? warning.description.replace(/^Coach:\s*/, "")
                        : warning.description}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Tactical Advice */}
            <div className="mt-8 border-t border-outline-variant/10 pt-6 shrink-0">
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
