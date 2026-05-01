"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Quote, Info } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface LegalInsight {
  id: string;
  latin_term: string;
  meaning: string;
  principle: string;
}

export default function InsightsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [insights, setInsights] = useState<LegalInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('legal_insights')
        .select('*')
        .order('latin_term', { ascending: true });

      if (!error && data) {
        setInsights(data);
      }
      setLoading(false);
    }
    
    fetchInsights();
  }, []);

  const filteredInsights = insights.filter((insight) =>
    insight.latin_term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insight.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insight.principle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-40 transition-colors duration-300">
      {/* Header */}
      <header className="mb-10 animate-in fade-in duration-500">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-label font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-on-surface">
          Legal Insights & Maxims
        </h1>
        <p className="font-body text-on-surface-variant text-lg">
          A comprehensive collection of Latin maxims, their meanings, and foundational legal principles.
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
            placeholder="Search maxims or principles..."
            className="w-full bg-surface-container border border-outline-variant/10 rounded-xl py-3 pl-12 pr-4 text-base font-label focus:border-primary/50 transition-all outline-none text-on-surface shadow-sm placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Main List Area */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
        {loading ? (
          <div className="text-center py-20 text-on-surface-variant animate-pulse font-serif text-xl">
            Loading legal insights...
          </div>
        ) : filteredInsights.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-surface-container border border-outline-variant/10 rounded-3xl p-8 hover:border-primary/20 transition-all group flex flex-col h-full"
              >
                <div className="flex items-center gap-3 text-primary mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Quote className="h-5 w-5" />
                  </div>
                  <span className="font-label text-xs font-bold uppercase tracking-widest">Legal Maxim</span>
                </div>
                
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">
                  {insight.latin_term}
                </h3>
                
                <div className="space-y-4 flex-1">
                  <p className="font-serif text-lg text-on-surface-variant leading-relaxed italic">
                    "{insight.meaning}"
                  </p>
                  <div className="pt-4 border-t border-outline-variant/5 flex gap-3">
                    <Info className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                    <p className="font-body text-sm text-on-surface-variant/70 leading-relaxed">
                      {insight.principle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-16 text-center flex flex-col items-center justify-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6">
              <Quote className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-3 text-on-surface">No Insights Found</h3>
            <p className="font-body text-on-surface-variant max-w-sm mx-auto">
              {searchQuery 
                ? `We couldn't find any results matching "${searchQuery}".`
                : "More legal insights coming soon."}
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
