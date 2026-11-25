"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Scale, Book, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { recordActivity, type ActivityKind } from "@/lib/activity";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
  resourceType?: "Scale" | "Book" | "FileText" | "default";
  /** What kind of item this is, for activity tracking. Defaults to a guess from the current page. */
  activity?: { kind: ActivityKind; subtitle?: string | null };
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  title,
  fileUrl,
  resourceType = "default",
  activity,
}: DocumentViewerModalProps) {
  // Record what was opened, for "Continue learning", streaks and profile stats.
  const pathname = usePathname();
  useEffect(() => {
    if (!isOpen || !fileUrl) return;
    const kind: ActivityKind = activity?.kind ?? (pathname.startsWith("/notes")
      ? "note"
      : pathname.startsWith("/authorities/cases")
      ? "case"
      : pathname.startsWith("/authorities/blacks-law")
      ? "dictionary"
      : pathname.startsWith("/authorities")
      ? "statute"
      : "template");
    const section = { note: "Summary Notes", case: "Case law", dictionary: "Black's Law Dictionary", statute: "Statutes", template: "Templates" }[kind as string];
    recordActivity({ kind, title, subtitle: activity?.subtitle ?? section, href: activity ? undefined : pathname, fileUrl, itemKey: fileUrl });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fileUrl, title, pathname]);

  // Stop the page behind the viewer from scrolling while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const main = document.querySelector("main");
    const prevMain = main?.style.overflow ?? "";
    const prevBody = document.body.style.overflow;
    if (main) main.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      if (main) main.style.overflow = prevMain;
      document.body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine which icon to render on the top left
  const renderIcon = () => {
    switch (resourceType) {
      case "Scale":
        return <Scale className="h-5 w-5" />;
      case "Book":
        return <Book className="h-5 w-5" />;
      case "FileText":
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Determine iframe source URL
  const isOfficeDoc = 
    fileUrl.endsWith(".docx") || 
    fileUrl.endsWith(".doc") || 
    fileUrl.endsWith(".xlsx") || 
    fileUrl.endsWith(".pptx");

  const embedUrl = isOfficeDoc
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
    : `${fileUrl}#toolbar=1`;

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center md:p-8">
      {/* Semi-transparent dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full h-[100dvh] md:h-[85vh] md:max-w-5xl bg-surface-container-low md:border border-outline-variant/10 md:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Top Control Header */}
        <div className="px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:p-6 border-b border-outline-variant/10 flex justify-between items-center gap-3 bg-surface-container-low">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="hidden sm:flex w-10 h-10 rounded-lg bg-primary/10 items-center justify-center text-primary flex-shrink-0">
              {renderIcon()}
            </div>
            <h2 className="font-serif text-base md:text-2xl font-bold text-on-surface leading-snug line-clamp-2">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Open Full Page Button */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              title="Open Full Page"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 min-h-0 bg-white relative overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          <iframe
            src={embedUrl}
            className="w-full h-full border-none"
            title={title}
            allowFullScreen
          />
        </div>

        {/* Bottom Utility Anchor */}
        <div className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:p-4 bg-surface-container-low border-t border-outline-variant/10 flex justify-between items-center gap-3 text-xs font-label">
          <span className="hidden md:inline text-on-surface-variant">Source: Legal Mouse Authorities Hub</span>
          {/* On phones, documents read best full screen in the browser's own viewer */}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden flex-1 text-center bg-primary text-on-primary font-bold rounded-xl py-3 text-sm"
          >
            Open full screen
          </a>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="text-primary hover:underline font-bold flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download Original
          </a>
        </div>
      </motion.div>
    </div>
  );
}
