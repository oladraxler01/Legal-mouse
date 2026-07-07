"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Folder, 
  ChevronRight, 
  Book,
  Briefcase,
  FileText,
  X
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";

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

interface EmploymentNote {
  id: string;
  title: string;
  summary: string;
  core_content?: string;
  file_url: string;
  topic_order?: number;
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

const mockEmploymentNotes: EmploymentNote[] = [
  { id: "e1", topic_order: 1, title: "Formation of Employment Contracts", summary: "Offer, acceptance, consideration, and the intention to create legal relations in work context.", file_url: "https://example.com/formation.pdf" },
  { id: "e2", topic_order: 2, title: "Worker Classification", summary: "Distinguishing employees, workers, and independent contractors under the law.", file_url: "https://example.com/classification.pdf" },
  { id: "e3", topic_order: 3, title: "Implied Duties of Employees", summary: "Duties of obedience, competence, and the duty of fidelity/good faith.", file_url: "https://example.com/employee_duties.pdf" },
  { id: "e4", topic_order: 4, title: "Implied Duties of Employers", summary: "Duty to provide work, safe environment, and mutual trust and confidence.", file_url: "https://example.com/employer_duties.pdf" },
  { id: "e5", topic_order: 5, title: "Statutory Rights & Working Time", summary: "Holiday pay, maximum weekly working hours, and rest breaks regulations.", file_url: "https://example.com/statutory_rights.pdf" },
  { id: "e6", topic_order: 6, title: "Minimum Wage & Remuneration", summary: "National minimum wage legislation and deductions from wages limits.", file_url: "https://example.com/minimum_wage.pdf" },
  { id: "e7", topic_order: 7, title: "Collective Bargaining & Trade Unions", summary: "Trade union recognition, rights of members, and collective agreements status.", file_url: "https://example.com/collective_bargaining.pdf" },
  { id: "e8", topic_order: 8, title: "Industrial Action & Strikes", summary: "Legal requirements for official industrial action and strike immunity.", file_url: "https://example.com/industrial_action.pdf" },
  { id: "e9", topic_order: 9, title: "Redundancy & Reorganisation", summary: "Consultation rules, selection criteria, and statutory redundancy pay.", file_url: "https://example.com/redundancy.pdf" },
  { id: "e10", topic_order: 10, title: "Unfair Dismissal Claims", summary: "Qualifying periods, fair reasons for dismissal, and the reasonableness test.", file_url: "https://example.com/unfair_dismissal.pdf" },
  { id: "e11", topic_order: 11, title: "Wrongful Dismissal", summary: "Breach of contract claims, notice periods, and common law damages.", file_url: "https://example.com/wrongful_dismissal.pdf" },
  { id: "e12", topic_order: 12, title: "Equality & Direct Discrimination", summary: "Protected characteristics and less favourable treatment claims.", file_url: "https://example.com/direct_discrimination.pdf" },
  { id: "e13", topic_order: 13, title: "Indirect Discrimination & Harassment", summary: "Provisions, criteria or practices (PCPs) and hostile environment claims.", file_url: "https://example.com/indirect_discrimination.pdf" },
  { id: "e14", topic_order: 14, title: "Health and Safety at Work", summary: "Employers' common law duties and statutory health safety regulations.", file_url: "https://example.com/health_safety.pdf" },
];

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [employmentNotes, setEmploymentNotes] = useState<EmploymentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployment, setLoadingEmployment] = useState(false);
  const [selectedCourseModal, setSelectedCourseModal] = useState<string | null>(null);
  const [activeViewerDoc, setActiveViewerDoc] = useState<{ title: string; fileUrl: string } | null>(null);

  // Fetch courses on initial load
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      const supabase = createClient();
      
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
        const transformed: Course[] = dbCourses.map((c: any) => ({
          id: c.id,
          name: c.name,
          topics: c.topics.map((t: any) => ({
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

    fetchCourses();
  }, []);

  // On-demand fetch of employment notes when modal opens
  useEffect(() => {
    if (selectedCourseModal !== "employment") return;

    async function fetchEmploymentNotes() {
      setLoadingEmployment(true);
      const supabase = createClient();
      
      const { data: dbEmployment, error: empError } = await supabase
        .from("employment_notes")
        .select("*")
        .order("topic_order", { ascending: true });

      if (empError || !dbEmployment || dbEmployment.length === 0) {
        console.log("Using mock data for Employment Law");
        setEmploymentNotes(mockEmploymentNotes);
      } else {
        setEmploymentNotes(dbEmployment);
      }
      setLoadingEmployment(false);
    }

    fetchEmploymentNotes();
  }, [selectedCourseModal]);

  const filteredCourses = courses.map(course => ({
    ...course,
    topics: course.topics.filter(topic => 
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(course => course.topics.length > 0);

  const showEmploymentLaw = 
    !searchQuery || 
    "employment law".includes(searchQuery.toLowerCase()) ||
    employmentNotes.some(note => note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    mockEmploymentNotes.some(note => note.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render main skeletal loader for courses
  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-40">
        <header className="mb-10">
          <div className="h-12 w-64 bg-surface-container-high rounded-lg animate-pulse mb-3" />
          <div className="h-6 w-80 bg-surface-container-high rounded-md animate-pulse" />
        </header>

        <div className="h-16 w-full bg-surface-container border border-outline-variant/10 rounded-2xl animate-pulse mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-surface-container border border-outline-variant/10 rounded-2xl p-8 space-y-6 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
                <div className="w-20 h-6 rounded-full bg-surface-container-high" />
              </div>
              <div className="space-y-3">
                <div className="h-8 w-3/4 bg-surface-container-high rounded-lg" />
                <div className="h-4 w-1/2 bg-surface-container-high rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      {/* Course Grid */}
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

        {/* Employment Law Course Card */}
        {showEmploymentLaw && (
          <div
            onClick={() => setSelectedCourseModal("employment")}
            className="group block bg-surface-container border border-outline-variant/10 hover:border-[#9D4EDD]/40 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-[#9D4EDD]/20 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${filteredCourses.length * 100}ms`, animationFillMode: "both" }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/20 flex items-center justify-center text-[#9D4EDD] group-hover:scale-110 group-hover:bg-[#9D4EDD]/20 transition-all duration-300">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-xs font-label text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container-high px-3 py-1 rounded-full">
                {employmentNotes.length > 0 ? `${employmentNotes.length} topics` : "14 topics"}
              </span>
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-on-surface mb-2 group-hover:text-[#9D4EDD] transition-colors">
              Employment Law
            </h3>
            <div className="flex items-center gap-2 text-[#9D4EDD] font-label text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Course <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        )}

        {filteredCourses.length === 0 && !showEmploymentLaw && (
          <div className="text-center py-20 col-span-full">
            <p className="text-on-surface-variant/50 font-serif italic text-lg">No topics found matching your search.</p>
          </div>
        )}
      </div>

      {/* Sub-topics Glassmorphic Modal Overlay */}
      {selectedCourseModal === "employment" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedCourseModal(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          {/* Modal Container */}
          <div className="relative bg-[#121316]/95 backdrop-blur-md border border-white/5 max-w-2xl w-full p-6 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/20 flex items-center justify-center text-[#9D4EDD]">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-on-surface">Employment Law</h3>
                  <p className="text-xs text-on-surface-variant font-label">COURSE INDEX</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCourseModal(null)}
                className="w-10 h-10 rounded-full bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sub-topics Stack / Dynamic list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {loadingEmployment ? (
                <div className="space-y-4 py-8">
                  {[1, 2, 3].map((n) => (
                    <div 
                      key={n}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5 animate-pulse"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-white/[0.04] shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-5 w-1/3 bg-white/[0.04] rounded-md" />
                          <div className="h-4 w-2/3 bg-white/[0.04] rounded-md" />
                        </div>
                      </div>
                      <div className="w-24 h-9 bg-white/[0.04] rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                employmentNotes.map((note) => (
                  <div 
                    key={note.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-[200px] flex-1">
                      <div className="w-9 h-9 rounded-lg bg-[#9D4EDD]/15 border border-[#9D4EDD]/20 flex items-center justify-center text-[#9D4EDD] shrink-0 mt-0.5">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-base mb-1">{note.title}</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{note.summary}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveViewerDoc({ title: note.title, fileUrl: note.file_url })}
                      className="shrink-0 self-end sm:self-center flex items-center justify-center gap-2 bg-[#9D4EDD] hover:bg-[#8B3DCD] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      View Notes
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Integrate with dynamic Document Viewer Modal */}
      {activeViewerDoc && (
        <DocumentViewerModal
          isOpen={!!activeViewerDoc}
          onClose={() => setActiveViewerDoc(null)}
          title={activeViewerDoc.title}
          fileUrl={activeViewerDoc.fileUrl}
          resourceType="FileText"
        />
      )}

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
