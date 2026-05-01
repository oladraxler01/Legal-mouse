"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Book, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface DictionaryEntry {
  id: string;
  title: string;
  file_url: string;
  created_at?: string;
}

export default function DictionaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('authorities')
        .select('*')
        .eq('type', 'Dictionary')
        .order('title', { ascending: true });

      if (!error && data) {
        setEntries(data);
      }
      setLoading(false);
    }
    
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter((entry) =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Black's Law Dictionary & Reference
        </h1>
        <p className="font-body text-on-surface-variant text-lg">
          The definitive legal lexicon for precise definitions and terminology.
        </p>
      </header>

      {/* Top Bar Search */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-on-surface-variant/70" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference materials..."
            className="w-full bg-surface-container border border-outline-variant/10 rounded-xl py-3 pl-12 pr-4 text-base font-label focus:border-primary/50 transition-all outline-none text-on-surface shadow-sm placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Main List Area */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
        {loading ? (
          <div className="text-center py-20 text-on-surface-variant animate-pulse font-serif text-xl">
            Loading reference materials...
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-outline-variant/10">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="w-full flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-all flex-shrink-0">
                      <Book className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-xl font-bold text-on-surface">
                        {entry.title}
                      </span>
                      <span className="font-label text-xs text-on-surface-variant font-medium uppercase tracking-wider mt-1">
                        Legal Dictionary
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <a
                      href={entry.file_url}
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
        ) : (
          /* Empty State */
          <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-16 text-center flex flex-col items-center justify-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6">
              <Book className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-3 text-on-surface">No References Found</h3>
            <p className="font-body text-on-surface-variant max-w-sm mx-auto">
              {searchQuery 
                ? `We couldn't find any results matching "${searchQuery}".`
                : "More reference materials coming soon."}
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
