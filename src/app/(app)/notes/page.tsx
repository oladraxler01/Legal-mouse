"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Folder, 
  ChevronRight, 
  CheckCircle2, 
  Book
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Topic {
  id: string;
  name: string;
  is_verified: boolean;
  note_count: number;
}

interface Course {
  id: string;
  name: string;
  topics: Topic[];
}

const mockCourses: Course[] = [
  {
    id: "1",
    name: "Contract Law",
    topics: [
      { id: "t1", name: "Offer & Acceptance", is_verified: true, note_count: 12 },
      { id: "t2", name: "Consideration", is_verified: true, note_count: 8 },
      { id: "t3", name: "Breach of Contract", is_verified: false, note_count: 15 },
    ],
  },
  {
    id: "2",
    name: "Criminal Law",
    topics: [
      { id: "t4", name: "Actus Reus", is_verified: true, note_count: 10 },
      { id: "t5", name: "Mens Rea", is_verified: true, note_count: 14 },
    ],
  },
  {
    id: "3",
    name: "Constitutional Law",
    topics: [
      { id: "t6", name: "Separation of Powers", is_verified: true, note_count: 9 },
      { id: "t7", name: "Fundamental Rights", is_verified: true, note_count: 18 },
    ],
  },
];

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      
      // Attempt to fetch from Supabase
      const { data: dbCourses, error } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          topics (
            id,
            name,
            is_verified,
            notes (count)
          )
        `);

      if (error || !dbCourses || dbCourses.length === 0) {
        console.log("Using mock data for Notes directory");
        setCourses(mockCourses);
      } else {
        // Transform the DB data to match our interface
        const transformed: Course[] = dbCourses.map((c: { id: string; name: string; topics: { id: string; name: string; is_verified: boolean; notes: { count: number }[] }[] }) => ({
          id: c.id,
          name: c.name,
          topics: c.topics.map((t: { id: string; name: string; is_verified: boolean; notes: { count: number }[] }) => ({
            id: t.id,
            name: t.name,
            is_verified: t.is_verified,
            note_count: t.notes?.[0]?.count || 0
          }))
        }));
        setCourses(transformed);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredCourses = courses.map(course => ({
    ...course,
    topics: course.topics.filter(topic => 
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(course => course.topics.length > 0);

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 pb-40">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Smart Notes</h1>
        <p className="font-body text-zinc-500 text-lg">Organized, verified legal knowledge</p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-600" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes by topic..." 
          className="w-full bg-[#111111] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-base font-label focus:border-primary/50 transition-all outline-none"
        />
      </div>

      {/* Course List */}
      <div className="space-y-12">
        {filteredCourses.map((course) => (
          <section key={course.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6 px-2">
              <div className="flex items-center gap-3">
                <Folder className="h-5 w-5 text-primary" />
                <h3 className="font-headline text-xl font-bold">{course.name}</h3>
              </div>
              <span className="text-sm font-label text-zinc-600 font-bold uppercase tracking-wider">{course.topics.length} topics</span>
            </div>

            <div className="bg-[#0A0A0A]/50 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {course.topics.map((topic) => (
                <Link 
                  key={topic.id}
                  href={`/notes/topic/${topic.id}`}
                  className="flex items-center justify-between p-6 hover:bg-[#111111] transition-all group"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-lg group-hover:text-primary transition-colors">{topic.name}</span>
                      {topic.is_verified && (
                        <span className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-primary/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-label text-zinc-500">{topic.note_count} notes available</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-700 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        ))}

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-zinc-500 font-serif italic text-lg">No topics found matching your search.</p>
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
          Contribute Your Notes
        </Link>
      </div>
    </div>
  );
}
