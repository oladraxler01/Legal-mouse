"use client";

import React from "react";
import { X, ExternalLink, Scale, Book, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
  resourceType?: "Scale" | "Book" | "FileText" | "default";
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  title,
  fileUrl,
  resourceType = "default"
}: DocumentViewerModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Semi-transparent dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl h-[85vh] bg-surface-container-low border border-outline-variant/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Top Control Header */}
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
          <div className="flex items-center gap-4 truncate">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              {renderIcon()}
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-on-surface truncate pr-4">
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
        <div className="flex-1 bg-white relative">
          <iframe
            src={embedUrl}
            className="w-full h-full border-none"
            title={title}
            allowFullScreen
          />
        </div>

        {/* Bottom Utility Anchor */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/10 flex justify-between items-center text-xs font-label">
          <span className="text-on-surface-variant">Source: Legal Mouse Authorities Hub</span>
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
