"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, FileText, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Statute {
  id: string;
  title: string;
  sub_type: string;
  file_url: string;
  created_at?: string;
}

export default function StatutesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatutes() {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('authorities')
        .select('*')
        .eq('type', 'Statute');

      if (!error && data) {
        setStatutes(data);
      }
      setLoading(false);
    }
    
    fetchStatutes();
  }, []);

  // Determine unique categories (sub_types) dynamically
  const availableCategories = Array.from(
    new Set(statutes.map(s => s.sub_type).filter(Boolean))
  ).sort();
  const categories = ["All", ...availableCategories];

  const filteredStatutes = statutes.filter((statute) => {
    const matchesSearch = statute.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || statute.sub_type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered statutes by sub_type
  const groupedStatutes = filteredStatutes.reduce((acc, statute) => {
    const category = statute.sub_type || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(statute);
    return acc;
  }, {} as Record<string, Statute[]>);

  // Sort groups alphabetically
  const sortedGroups = Object.keys(groupedStatutes).sort();

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 pb-40">
      {/* Header */}
      <header className="mb-10 animate-in fade-in duration-500">
        <Link
          href="/authorities"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-label font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Authorities
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Statutory Resources
        </h1>
        <p className="font-body text-gray-400 text-lg">
          Browse, filter, and review legislative acts and frameworks.
        </p>
      </header>

      {/* Top Bar Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {/* Search */}
        <div className="relative w-full lg:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search statutes (e.g., 'Evidence Act')"
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-base font-label focus:border-primary/50 transition-all outline-none text-white shadow-sm placeholder:text-gray-600"
          />
        </div>

        {/* Categories (Scrollable row) */}
        <div className="flex-1 overflow-x-auto pb-2 -mb-2">
          <div className="flex items-center gap-3 w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-3 rounded-xl font-label text-sm font-bold transition-all whitespace-nowrap border ${
                  activeCategory === cat
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-[#0A0A0A] text-gray-400 border-white/5 hover:bg-white/5 hover:text-white"
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
          <div className="text-center py-20 text-gray-500 animate-pulse font-serif text-xl">
            Loading statutory resources...
          </div>
        ) : filteredStatutes.length > 0 ? (
          <div className="space-y-12">
            {sortedGroups.map((group) => (
              <div key={group} className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-white border-b border-white/10 pb-2">
                  {group} Statutes
                </h2>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-black/50">
                  <div className="divide-y divide-white/10">
                    {groupedStatutes[group].map((statute) => (
                      <div
                        key={statute.id}
                        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-all flex-shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif text-xl font-bold text-white">
                              {statute.title}
                            </span>
                            <span className="font-label text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
                              {statute.sub_type || 'Uncategorized'} Law
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <a
                            href={statute.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary font-label font-bold text-sm bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open File
                          </a>
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
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-16 text-center flex flex-col items-center justify-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-6">
              <FileText className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-3 text-white">No Statutes Found</h3>
            <p className="font-body text-gray-400 max-w-sm mx-auto">
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
    </div>
  );
}
