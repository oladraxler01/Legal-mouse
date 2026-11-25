"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Folder, FolderOpen, ChevronRight, Book, Briefcase, FileText, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";
import { NOTE_FOLDERS, allNoteTags, folderForTag } from "@/lib/noteFolders";

interface NoteItem {
  id: string;
  title: string;
  summary: string;
  file_url: string | null;
  topic_order?: number;
}

interface FolderView {
  slug: string;
  name: string;
  icon: typeof Folder;
  notes: NoteItem[];
}

const EMPLOYMENT = "employment-law";

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [folderNotes, setFolderNotes] = useState<Record<string, NoteItem[]>>({});
  const [employmentNotes, setEmploymentNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [activeViewerDoc, setActiveViewerDoc] = useState<{ title: string; fileUrl: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: notes, error }, { data: employment }] = await Promise.all([
        supabase
          .from("notes")
          .select("id, title, summary, core_content, file_url, course_tag, created_at")
          .in("course_tag", allNoteTags())
          .order("created_at", { ascending: true }),
        supabase.from("employment_notes").select("id, title, summary, file_url, topic_order").order("topic_order", { ascending: true }),
      ]);
      if (error) console.error("Failed to load notes:", error);

      const grouped: Record<string, NoteItem[]> = {};
      (notes || []).forEach((n: { id: string; title: string; summary: string | null; core_content: string | null; file_url: string | null; course_tag: string }) => {
        const folder = folderForTag(n.course_tag);
        if (!folder) return;
        (grouped[folder.slug] ||= []).push({
          id: n.id,
          title: n.title,
          summary: n.summary || n.core_content || "",
          file_url: n.file_url,
        });
      });
      setFolderNotes(grouped);
      setEmploymentNotes((employment || []) as NoteItem[]);
      setLoading(false);
    }
    load();
  }, []);

  const folders: FolderView[] = useMemo(
    () => [
      ...NOTE_FOLDERS.map((f) => ({ slug: f.slug, name: f.name, icon: Folder, notes: folderNotes[f.slug] || [] })),
      { slug: EMPLOYMENT, name: "Employment Law", icon: Briefcase, notes: employmentNotes },
    ],
    [folderNotes, employmentNotes]
  );

  const q = searchQuery.trim().toLowerCase();
  const visibleFolders = folders.filter(
    (f) => !q || f.name.toLowerCase().includes(q) || f.notes.some((n) => n.title.toLowerCase().includes(q))
  );
  const current = folders.find((f) => f.slug === openFolder);

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-40 transition-colors duration-300">
      <header className="mb-10">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-2 text-on-surface">Summary Notes</h1>
        <p className="font-body text-on-surface-variant text-lg">Course notes, organised by subject</p>
      </header>

      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-on-surface-variant/40" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses or notes..."
          className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl py-5 pl-14 pr-6 text-base font-label focus:border-primary/50 transition-all outline-none text-on-surface shadow-sm placeholder:text-on-surface-variant/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
        {loading &&
          [1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-surface-container border border-outline-variant/10 rounded-2xl p-8 h-44 animate-pulse" />
          ))}

        {!loading &&
          visibleFolders.map((folder, idx) => {
            const Icon = folder.icon;
            return (
              <button
                key={folder.slug}
                onClick={() => setOpenFolder(folder.slug)}
                className="group text-left bg-surface-container border border-outline-variant/10 hover:border-primary/50 rounded-2xl p-7 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-label text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container-high px-3 py-1 rounded-full">
                    {folder.notes.length} {folder.notes.length === 1 ? "note" : "notes"}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">{folder.name}</h3>
                <div className="flex items-center gap-2 text-primary font-label text-sm mt-3">
                  Open folder <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}

        {!loading && visibleFolders.length === 0 && (
          <div className="text-center py-20 col-span-full">
            <p className="text-on-surface-variant/50 font-serif italic text-lg">No courses or notes match your search.</p>
          </div>
        )}
      </div>

      {/* Folder contents */}
      {current && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center sm:p-6 animate-in fade-in duration-200">
          <div onClick={() => setOpenFolder(null)} className="absolute inset-0 bg-black/60 cursor-pointer" />
          <div className="relative bg-surface-container-low border border-outline-variant/10 w-full sm:max-w-2xl p-5 sm:p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85dvh] pb-[calc(env(safe-area-inset-bottom)+1.25rem)] animate-in slide-in-from-bottom-8 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/10 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-on-surface truncate">{current.name}</h3>
                  <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider">
                    {current.notes.length} {current.notes.length === 1 ? "note" : "notes"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpenFolder(null)}
                aria-label="Close folder"
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain space-y-3 pr-1">
              {current.notes.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant">
                  <Folder className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-serif italic text-lg">No notes in this folder yet.</p>
                  <p className="text-sm mt-1">Notes added by the Legal Mouse team will appear here.</p>
                </div>
              )}
              {current.notes
                .filter((n) => !q || current.name.toLowerCase().includes(q) || n.title.toLowerCase().includes(q))
                .map((note) => (
                  <div
                    key={note.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant/10"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-on-surface text-base mb-1">{note.title}</h4>
                        {note.summary && <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{note.summary}</p>}
                      </div>
                    </div>
                    {note.file_url && (
                      <button
                        onClick={() => setActiveViewerDoc({ title: note.title, fileUrl: note.file_url! })}
                        className="shrink-0 self-end sm:self-center bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
                      >
                        View Notes
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeViewerDoc && (
        <DocumentViewerModal
          isOpen={!!activeViewerDoc}
          onClose={() => setActiveViewerDoc(null)}
          title={activeViewerDoc.title}
          fileUrl={activeViewerDoc.fileUrl}
          resourceType="FileText"
        />
      )}

      {/* Contribute button: sits above the mobile bottom bar */}
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-10 left-6 right-24 md:left-auto md:right-12 md:w-80 z-20">
        <Link
          href="/contribute"
          className="flex items-center justify-center gap-3 w-full bg-primary py-4 md:py-5 rounded-2xl text-white font-bold text-base md:text-lg shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Book className="h-5 w-5" />
          Contribute Your Notes
        </Link>
      </div>
    </div>
  );
}
