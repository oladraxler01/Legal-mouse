"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Scale, 
  ChevronRight, 
  Filter,
  Book
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Topic {
  id: string;
  name: string;
}

interface Case {
  id: string;
  title: string;
  court: string;
  year: string;
  topic: Topic;
  tags: string[];
}

const filterCategories = ["All", "Contract", "Tort", "Criminal", "Constitutional"];

const mockCases: Case[] = [
  {
    id: "c1",
    title: "Carlill v. Carbolic Smoke Ball Co.",
    court: "Court of Appeal",
    year: "1893",
    topic: { id: "1", name: "Contract Law" },
    tags: ["Offer", "Acceptance", "Unilateral Contract"],
  },
  {
    id: "c2",
    title: "Donoghue v. Stevenson",
    court: "House of Lords",
    year: "1932",
    topic: { id: "2", name: "Tort Law" },
    tags: ["Negligence", "Duty of Care", "Neighbor Principle"],
  },
  {
    id: "c3",
    title: "R v. Brown",
    court: "House of Lords",
    year: "1993",
    topic: { id: "3", name: "Criminal Law" },
    tags: ["Consent", "ABH", "Policy"],
  },
  {
    id: "c4",
    title: "A v. Secretary of State for Home Dept",
    court: "House of Lords",
    year: "2004",
    topic: { id: "4", name: "Constitutional Law" },
    tags: ["Human Rights", "Public Law", "Terrorism"],
  },
];

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      
      const { data: dbCases, error } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          court,
          year,
          tags,
          topic:topics (
            id,
            name
          )
        `);

      if (error || !dbCases || dbCases.length === 0) {
        setCases(mockCases);
      } else {
        setCases(dbCases as unknown as Case[]);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.year.includes(searchQuery);

    const matchesCategory = 
      activeFilter === "All" || 
      c.topic.name.toLowerCase().includes(activeFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 pb-32">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-2 text-white">Case Law Library</h1>
        <p className="font-body text-zinc-500 text-lg">Search landmark judgments</p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-8 text-white">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-600" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cases by name, court, or year..." 
          className="w-full bg-[#111111] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-base font-label focus:border-primary/50 transition-all outline-none text-white"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {filterCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all duration-300 border ${
              activeFilter === category 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                : "bg-[#111111] border-white/5 text-zinc-500 hover:border-white/20 active:scale-95"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Case List */}
      <div className="space-y-6">
        {filteredCases.map((c) => (
          <Link 
            key={c.id}
            href={`/cases/${c.id}`}
            className="block bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-[#111111] hover:border-white/10 transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline text-xl md:text-2xl font-bold group-hover:text-primary transition-colors max-w-[90%] text-white">
                {c.title}
              </h3>
              <ChevronRight className="h-5 w-5 text-zinc-700 group-hover:text-primary transition-colors mt-1" />
            </div>

            <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6">
              <Scale className="h-4 w-4" />
              <span className="font-label font-medium">{c.court} • {c.year}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-primary/20">
                {c.topic.name}
              </span>
              {c.tags.map(tag => (
                <span key={tag} className="bg-[#1A1A1A] text-zinc-500 px-3 py-1.5 rounded-full text-[11px] font-label font-bold border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Link>
        ))}

        {filteredCases.length === 0 && !loading && (
          <div className="text-center py-20 bg-[#0A0A0A] rounded-3xl border border-white/5">
            <Filter className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 font-serif italic text-lg">No cases found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Contribute Button */}
      <div className="fixed bottom-10 left-6 right-6 md:left-auto md:right-12 md:w-80 z-20">
        <Link 
          href="/contribute"
          className="flex items-center justify-center gap-3 w-full bg-primary py-5 rounded-2xl text-white font-bold text-lg shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Book className="h-5 w-5" />
          Contribute Your Case
        </Link>
      </div>
    </div>
  );
}
