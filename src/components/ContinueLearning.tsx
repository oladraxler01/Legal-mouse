"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Scale, BookOpen, PlaySquare, Gavel, MessageSquare, UsersRound, ArrowRight, Sparkles } from "lucide-react";
import { loadRecentActivity, type ActivityItem, type ActivityKind } from "@/lib/activity";
import { timeAgo } from "@/lib/community";
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";

const ICONS: Record<ActivityKind, typeof FileText> = {
  note: FileText,
  template: FileText,
  case: Scale,
  statute: Scale,
  dictionary: BookOpen,
  video: PlaySquare,
  coach: Gavel,
  question: MessageSquare,
  group: UsersRound,
};

const SUGGESTIONS = [
  { title: "Try a moot court hearing", subtitle: "Argue a case before the AI judge", href: "/coach", icon: Gavel },
  { title: "Open your Summary Notes", subtitle: "Course notes by subject", href: "/notes", icon: FileText },
  { title: "Browse statutes and cases", subtitle: "Authorities hub", href: "/authorities", icon: Scale },
];

/** "Continue learning": the user's own most recent items, newest first. */
export default function ContinueLearning() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [openDoc, setOpenDoc] = useState<ActivityItem | null>(null);

  useEffect(() => {
    loadRecentActivity(5).then(setItems);
  }, []);

  if (items === null) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 rounded-2xl bg-surface-container-low animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
        <p className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <Sparkles className="h-4 w-4 text-primary" /> Nothing here yet. Things you open will show up here so you can pick up where you left off.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {SUGGESTIONS.map(({ title, subtitle, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl bg-surface-container p-4 hover:bg-surface-container-high transition-colors">
              <Icon className="h-5 w-5 text-primary shrink-0" />
              <span>
                <span className="block text-sm font-bold text-on-surface">{title}</span>
                <span className="block text-xs text-on-surface-variant">{subtitle}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = ICONS[item.kind] || FileText;
          const body = (
            <>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-bold text-on-surface truncate">{item.title}</p>
                <p className="text-xs text-on-surface-variant truncate">
                  {item.subtitle ? `${item.subtitle} · ` : ""}
                  {timeAgo(item.created_at)}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-primary shrink-0">
                Resume <ArrowRight className="h-4 w-4" />
              </span>
            </>
          );
          const className =
            "w-full flex items-center gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4 hover:bg-surface-container-high hover:border-primary/20 transition-all";
          return item.file_url ? (
            <button key={item.item_key} onClick={() => setOpenDoc(item)} className={className}>
              {body}
            </button>
          ) : (
            <Link key={item.item_key} href={item.href || "/dashboard"} className={className}>
              {body}
            </Link>
          );
        })}
      </div>
      {openDoc && (
        <DocumentViewerModal
          isOpen
          onClose={() => setOpenDoc(null)}
          title={openDoc.title}
          fileUrl={openDoc.file_url!}
          resourceType="FileText"
          activity={{ kind: openDoc.kind, subtitle: openDoc.subtitle }}
        />
      )}
    </>
  );
}
