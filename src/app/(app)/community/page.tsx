"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  MessageSquare, 
  ArrowUp, 
  CheckCircle, 
  Plus,
  Eye,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

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
  view_count: number;
  is_resolved: boolean;
  created_at: string;
}

const filterCategories = ["All Courses", "Contract", "Tort", "Criminal", "Constitutional"];

const mockQuestions: Question[] = [
  {
    id: "q1",
    title: "Can silence constitute acceptance in contract law?",
    author: { name: "Sarah Chen", is_top_contributor: true, avatar_initial: "S" },
    tags: ["Acceptance", "Contract Formation"],
    topic: { id: "1", name: "Contract Law" },
    upvotes: 42,
    answer_count: 8,
    view_count: 234,
    is_resolved: true,
    created_at: "2024-04-23T10:00:00Z"
  },
  {
    id: "q2",
    title: "How does the 'but for' test work in negligence?",
    author: { name: "James Miller", is_top_contributor: false, avatar_initial: "J" },
    tags: ["Negligence", "Causation"],
    topic: { id: "2", name: "Tort Law" },
    upvotes: 35,
    answer_count: 12,
    view_count: 189,
    is_resolved: true,
    created_at: "2024-04-22T15:30:00Z"
  },
  {
    id: "q3",
    title: "What's the difference between murder and voluntary manslaughter?",
    author: { name: "Emma Wilson", is_top_contributor: true, avatar_initial: "E" },
    tags: ["Homicide", "Mens Rea"],
    topic: { id: "3", name: "Criminal Law" },
    upvotes: 28,
    answer_count: 6,
    view_count: 156,
    is_resolved: false,
    created_at: "2024-04-21T09:15:00Z"
  },
  {
    id: "q4",
    title: "Explain the Wednesbury unreasonableness principle",
    author: { name: "David Lee", is_top_contributor: false, avatar_initial: "D" },
    tags: ["Judicial Review", "Public Law"],
    topic: { id: "4", name: "Administrative Law" },
    upvotes: 21,
    answer_count: 4,
    view_count: 98,
    is_resolved: true,
    created_at: "2024-04-20T11:45:00Z"
  }
];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Courses");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      
      const { data: dbQuestions, error } = await supabase
        .from('questions')
        .select(`
          id,
          title,
          upvotes,
          answer_count,
          view_count,
          is_resolved,
          tags,
          created_at,
          topic:topics ( id, name )
        `);

      if (error || !dbQuestions || dbQuestions.length === 0) {
        setQuestions(mockQuestions);
      } else {
        // Mocking author for now
        const transformed = dbQuestions.map((q: { 
          id: string; 
          title: string; 
          upvotes: number; 
          answer_count: number; 
          view_count: number; 
          is_resolved: boolean; 
          tags: string[]; 
          created_at: string; 
          topic: { id: string; name: string }[] 
        }) => ({
          ...q,
          topic: q.topic[0] || { id: "0", name: "General" },
          author: { name: "Community User", is_top_contributor: false, avatar_initial: "U" }
        }));
        setQuestions(transformed as Question[]);
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
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 pb-32">
      {/* Header Area */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Community Q&A</h1>
          <p className="font-body text-zinc-500 text-lg">Get help from fellow students</p>
        </div>
        <Link 
          href="/community/ask"
          className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/30"
        >
          <Plus className="h-6 w-6 text-white" />
        </Link>
      </header>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-600" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions..." 
          className="w-full bg-[#111111] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-base font-label focus:border-primary/50 transition-all outline-none"
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
                : "bg-[#111111] border-white/5 text-zinc-500 hover:border-white/20 active:scale-95"
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
            className="flex gap-6 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-[#111111] hover:border-white/10 transition-all group"
          >
            {/* Voting Column */}
            <div className="flex flex-col items-center gap-1 min-w-[40px]">
              <ArrowUp className="h-6 w-6 text-zinc-700 group-hover:text-primary transition-colors" />
              <span className="font-headline font-bold text-lg text-primary">{q.upvotes}</span>
            </div>

            {/* Main Content Column */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-headline text-lg md:text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                  {q.title}
                </h3>
                {q.is_resolved && (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                )}
              </div>

              {/* Author Row */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                  {q.author.avatar_initial}
                </div>
                <span className="text-sm font-medium text-zinc-300">{q.author.name}</span>
                {q.author.is_top_contributor && (
                  <span className="bg-primary/20 text-primary text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                    Top Contributor
                  </span>
                )}
              </div>

              {/* Tags Row */}
              <div className="flex flex-wrap gap-2">
                {q.tags.map(tag => (
                  <span key={tag} className="bg-[#1A1A1A] text-zinc-500 px-3 py-1 rounded-full text-[10px] font-bold border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta Row */}
              <div className="flex items-center gap-6 text-zinc-500 text-xs">
                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-primary/10">
                  {q.topic.name}
                </span>
                <div className="flex items-center gap-1.5 font-medium">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {q.answer_count} answers
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Eye className="h-3.5 w-3.5" />
                  {q.view_count} views
                </div>
              </div>
            </div>
            
            {/* Mobile Chevron */}
            <div className="flex items-center md:hidden">
              <ChevronRight className="h-5 w-5 text-zinc-800" />
            </div>
          </Link>
        ))}

        {filteredQuestions.length === 0 && !loading && (
          <div className="text-center py-20 bg-[#0A0A0A] rounded-3xl border border-white/5">
            <p className="text-zinc-500 font-serif italic text-lg">No questions found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
