"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Folder, 
  ChevronRight, 
  CheckCircle2, 
  Book,
  PlaySquare
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
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-40 transition-colors duration-300">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-serif text-5xl font-bold tracking-tight mb-2 text-on-surface">Smart Notes</h1>
        <p className="font-body text-on-surface-variant text-lg">Organized, verified legal knowledge</p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-on-surface-variant/40" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses..." 
          className="w-full bg-surface-container border border-outline-variant/10 rounded-2xl py-5 pl-14 pr-6 text-base font-label focus:border-primary/50 transition-all outline-none text-on-surface shadow-sm placeholder:text-on-surface-variant/50"
        />
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course, idx) => (
          <Link
            key={course.id}
            href={`/notes/${course.id}`}
            className="group block bg-surface-container border border-outline-variant/10 hover:border-primary/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: "both" }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Folder className="h-6 w-6" />
              </div>
              <span className="text-xs font-label text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container-high px-3 py-1 rounded-full">
                {course.topics.length} topics
              </span>
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
              {course.name}
            </h3>
            <div className="flex items-center gap-2 text-primary font-label text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Course <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        ))}

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-on-surface-variant/50 font-serif italic text-lg">No topics found matching your search.</p>
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
