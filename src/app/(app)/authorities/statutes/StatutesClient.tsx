"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, FileText, ExternalLink, Download } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";

export interface Statute {
  id: string;
  title: string;
  type: string;
  sub_type?: string | null;
  file_url: string;
  created_at?: string;
}

interface StatutesClientProps {
  initialStatutes?: Statute[];
}

export default function StatutesClient({ initialStatutes = [] }: StatutesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statutes, setStatutes] = useState<Statute[]>(initialStatutes);
  const [loading, setLoading] = useState(initialStatutes.length === 0);

  // Modal viewer state
  const [activeDocument, setActiveDocument] = useState<{ title: string; url: string } | null>(null);

  // Client-side fetch on component mount: ensures fresh data from Supabase without stale cache
  useEffect(() => {
    async function fetchStatutes() {
      try {
        const supabase = createClient();
        
        // Exclude non-statute authorities ('Case', 'Dictionary') to pull all statutory resources
        const { data, error } = await supabase
          .from("authorities")
          .select("*")
          .not("type", "in", '("Case","Dictionary")')
          .order("title", { ascending: true });

        if (!error && data) {
          setStatutes(data);
        }
      } catch (err) {
        console.error("Error fetching statutory resources on mount:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStatutes();
  }, []);

  // Determine unique categories dynamically from the 'type' column
  const availableCategories = Array.from(
    new Set(statutes.map((s) => s.type).filter(Boolean))
  ).sort();
  const categories = ["All", ...availableCategories];

  // Filter statutes using the 'type' column and search query
  const filteredStatutes = statutes.filter((statute) => {
    const matchesSearch = statute.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      statute.type?.toLowerCase() === activeCategory.toLowerCase() ||
      (statute.type === "Statute" &&
        statute.sub_type &&
        activeCategory.toLowerCase().includes(statute.sub_type.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  // Group filtered statutes by category/type
  const groupedStatutes = filteredStatutes.reduce((acc, statute) => {
    const category =
      statute.type && statute.type !== "Statute"
        ? statute.type
        : statute.sub_type
        ? `${statute.sub_type} Law`
        : statute.type || "Statutory Resources";

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(statute);
    return acc;
  }, {} as Record<string, Statute[]>);

  // Sort groups alphabetically
  const sortedGroups = Object.keys(groupedStatutes).sort();

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-40 transition-colors duration-300">
      {/* Header */}
      <header className="mb-10 animate-in fade-in duration-500">
        <Link
          href="/authorities"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-label font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Authorities
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-on-surface">
          Statutory Resources
        </h1>
        <p className="font-body text-on-surface-variant text-lg">
          Browse, filter, and review legislative acts and frameworks.
        </p>
      </header>

      {/* Top Bar Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {/* Search */}
        <div className="relative w-full lg:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-on-surface-variant/70" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search statutes (e.g., 'Evidence Act')"
            className="w-full bg-surface-container border border-outline-variant/10 rounded-xl py-3 pl-12 pr-4 text-base font-label focus:border-primary/50 transition-all outline-none text-on-surface shadow-sm placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Categories (Filter tabs driven by the 'type' column) */}
        <div className="flex-1 overflow-x-auto pb-2 -mb-2">
          <div className="flex items-center gap-3 w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-3 rounded-xl font-label text-sm font-bold transition-all whitespace-nowrap border ${
                  activeCategory === cat
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-surface-container text-on-surface-variant border-outline-variant/10 hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List Area with Groupings */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
        {loading ? (
          <div className="text-center py-20 text-on-surface-variant animate-pulse font-serif text-xl">
            Loading statutory resources...
          </div>
        ) : filteredStatutes.length > 0 ? (
          <div className="space-y-12">
            {sortedGroups.map((group) => (
              <div key={group} className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-on-surface border-b border-outline-variant/10 pb-2">
                  {group}
                </h2>
                <div className="bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-outline-variant/10">
                    {groupedStatutes[group].map((statute) => (
                      <div
                        key={statute.id}
                        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-surface-container-high transition-colors group gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-all flex-shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            {/* Title column mapped for display name */}
                            <span className="font-serif text-xl font-bold text-on-surface">
                              {statute.title}
                            </span>
                            <span className="font-label text-xs text-on-surface-variant font-medium uppercase tracking-wider mt-1">
                              {statute.type || (statute.sub_type ? `${statute.sub_type} Law` : "Statute")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {/* file_url column mapped for download href attribute */}
                          <a
                            href={statute.file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary font-label font-bold text-sm bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                            title={`Download ${statute.title}`}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                          {/* In-app document viewer modal preview */}
                          <button
                            onClick={() => setActiveDocument({ title: statute.title, url: statute.file_url })}
                            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-label font-bold text-sm bg-surface-container-high hover:bg-outline-variant/20 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-16 text-center flex flex-col items-center justify-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6">
              <FileText className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-3 text-on-surface">No Statutes Found</h3>
            <p className="font-body text-on-surface-variant max-w-sm mx-auto">
              {searchQuery
                ? `We couldn't find any results matching "${searchQuery}".`
                : "More statutory materials coming soon for this category."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 text-primary hover:text-primary-container font-label font-bold text-sm transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Document Viewer Modal Overlay */}
      <AnimatePresence>
        {activeDocument && (
          <DocumentViewerModal
            isOpen={!!activeDocument}
            onClose={() => setActiveDocument(null)}
            title={activeDocument.title}
            fileUrl={activeDocument.url}
            resourceType="FileText"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

