"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  MessageSquare, 
  ArrowUp, 
  CheckCircle, 
  Plus,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { loadAuthors, timeAgo } from "@/lib/community";

interface Topic {
  id: string;
  name: string;
}

interface Question {
  id: string;
  title: string;
  author: {
    name: string;
    is_top_contributor: boolean;
    avatar_initial: string;
  };
  tags: string[];
  topic: Topic;
  upvotes: number;
  answer_count: number;
  is_resolved: boolean;
  created_at: string;
}

const filterCategories = ["All Courses", "Contract", "Tort", "Criminal", "Constitutional"];



export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Courses");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      
      const { data: dbQuestions, error } = await supabase
        .from("questions")
        .select("id, title, upvotes, answer_count, is_resolved, tags, created_at, author_id")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load questions:", error);
        setLoadError(true);
        setQuestions([]);
      } else {
        const rows = (dbQuestions || []) as {
          id: string; title: string; upvotes: number | null; answer_count: number | null;
          is_resolved: boolean | null; tags: string[] | null; created_at: string; author_id: string | null;
        }[];
        const authorOf = await loadAuthors(supabase, rows.map((r) => r.author_id));
        setQuestions(
          rows.map((q) => {
            const tags = q.tags || [];
            const author = authorOf(q.author_id);
            return {
              id: q.id,
              title: q.title,
              upvotes: q.upvotes ?? 0,
              answer_count: q.answer_count ?? 0,
              is_resolved: !!q.is_resolved,
              created_at: q.created_at,
              tags: tags.slice(1),
              topic: { id: tags[0] || "general", name: tags[0] || "General" },
              author: { ...author, is_top_contributor: false },
            };
          })
        );
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      activeFilter === "All Courses" || 
      q.topic.name.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32 transition-colors duration-300">
      {/* Header Area */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight mb-2 text-on-surface">Community Q&A</h1>
          <p className="font-body text-on-surface-variant text-lg opacity-70">Get help from fellow students</p>
        </div>
        <Link 
          href="/community/ask"
          className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/30"
        >
          <Plus className="h-6 w-6 text-on-primary" />
        </Link>
      </header>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-on-surface-variant/40" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions..." 
          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-5 pl-14 pr-6 text-base font-label focus:border-primary/50 transition-all outline-none text-on-surface shadow-sm"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {filterCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all duration-300 border whitespace-nowrap ${
              activeFilter === category 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                : "bg-surface-container-low border-outline-variant/10 text-on-surface-variant/60 hover:border-outline-variant/30 active:scale-95"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <Link 
            key={q.id}
            href={`/community/${q.id}`}
            className="flex gap-6 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 md:p-8 hover:bg-surface-container-low hover:border-primary/30 transition-all group shadow-sm"
          >
            {/* Voting Column */}
            <div className="flex flex-col items-center gap-1 min-w-[40px]">
              <ArrowUp className="h-6 w-6 text-on-surface-variant/20 group-hover:text-primary transition-colors" />
              <span className="font-headline font-bold text-lg text-primary">{q.upvotes}</span>
            </div>

            {/* Main Content Column */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-headline text-lg md:text-xl font-bold group-hover:text-primary transition-colors leading-tight text-on-surface">
                  {q.title}
                </h3>
                {q.is_resolved && (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                )}
              </div>

              {/* Author Row */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface">
                  {q.author.avatar_initial}
                </div>
                <span className="text-sm font-medium text-on-surface-variant">{q.author.name}</span>
                {q.author.is_top_contributor && (
                  <span className="bg-primary/20 text-primary text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                    Top Contributor
                  </span>
                )}
              </div>

              {/* Tags Row */}
              <div className="flex flex-wrap gap-2">
                {q.tags.map(tag => (
                  <span key={tag} className="bg-surface-container-high text-on-surface-variant/70 px-3 py-1 rounded-full text-[10px] font-bold border border-outline-variant/5">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta Row */}
              <div className="flex items-center gap-6 text-on-surface-variant/50 text-xs font-bold">
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-primary/10">
                  {q.topic.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {q.answer_count} answers
                </div>
                <span>{timeAgo(q.created_at)}</span>
              </div>
            </div>
            
            {/* Mobile Chevron */}
            <div className="flex items-center md:hidden">
              <ChevronRight className="h-5 w-5 text-on-surface-variant/20" />
            </div>
          </Link>
        ))}

        {loading && (
          <p className="text-center py-20 text-on-surface-variant/50 font-serif italic">Loading questions...</p>
        )}

        {!loading && filteredQuestions.length === 0 && (
          <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
            <p className="text-on-surface-variant/60 font-serif italic text-lg mb-6">
              {loadError
                ? "We couldn't load questions right now. Please try again shortly."
                : questions.length === 0
                ? "No questions yet. Be the first to ask the community."
                : "No questions found matching your search."}
            </p>
            {!loadError && (
              <Link href="/community/ask" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Ask a question
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
