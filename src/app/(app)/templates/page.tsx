"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Scale, 
  ExternalLink, 
  FolderSync
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";

interface LegalTemplate {
  id: string;
  title: string;
  slug: string;
  summary: string;
  latin_maxim: string | null;
  maxim_meaning: string | null;
  course_tag: string;
  file_url: string | null;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  
  // Modal viewer state
  const [activeDocument, setActiveDocument] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Query the templates from the 'notes' table, select all columns, and order alphabetically by title
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("title", { ascending: true });

        if (error) {
          console.error("Error fetching templates:", error);
          setTemplates([]);
        } else if (data) {
          // Map database items onto the visual state structure
          const validated: LegalTemplate[] = data.map((item: any) => ({
            id: item.id || "",
            title: item.title || "Untitled Template",
            slug: item.slug || "",
            summary: item.principle || "No descriptive summary provided.",
            course_tag: item.course_tag || "General Law",
            file_url: item.file_url || null,
            latin_maxim: item.latin_term || "Instructional Guide",
            maxim_meaning: item.meaning || "Core study reference materials.",
          }));
          setTemplates(validated);
        }
      } catch (err) {
        console.error("Catch exception fetching templates:", err);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  // Compute filter tags dynamically based on fetched templates
  const dynamicCategories = Array.from(
    new Set(templates.map((t) => t.course_tag).filter(Boolean))
  );
  
  // Ensure we include 'All Resources' as default and merge other default legal categories for a clean look
  const staticCategories = ["All Resources", "Contract Law", "Criminal Law", "Constitutional Law"];
  const categories = Array.from(new Set([...staticCategories, ...dynamicCategories]));

  // Filter templates list based on category
  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === "All Resources") return true;
    return t.course_tag.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-40 transition-colors duration-300">
      
      {/* Header Section */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
            Curated Templates Hub
          </h1>
          <p className="font-body text-on-surface-variant/80 text-sm md:text-base mt-2">
            Structured drafting frameworks and visual legal guides.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center bg-surface-container-low border border-outline-variant/10 px-4 py-2 rounded-2xl">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
            {filteredTemplates.length} Active {filteredTemplates.length === 1 ? "Template" : "Templates"}
          </span>
        </div>
      </header>

      {/* Filter Navigation Track */}
      <nav className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 no-scrollbar scroll-smooth">
        {categories.map((category) => {
          const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full font-label text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/10"
              }`}
            >
              {category}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      {loading ? (
        // Loading State: Skeleton loaders
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-7 flex flex-col justify-between animate-pulse min-h-[360px]"
            >
              <div>
                <div className="w-24 h-6 bg-surface-container-high rounded-full mb-5" />
                <div className="w-3/4 h-8 bg-surface-container-high rounded-lg mb-4" />
                <div className="w-full h-4 bg-surface-container-high rounded mb-2.5" />
                <div className="w-11/12 h-4 bg-surface-container-high rounded mb-2.5" />
                <div className="w-4/5 h-4 bg-surface-container-high rounded mb-6" />
                <div className="w-full h-20 bg-surface-container-high/60 rounded-2xl mb-6" />
              </div>
              <div className="w-full h-12 bg-surface-container-high rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        // Empty State Fallback
        <div className="flex justify-center items-center py-16 px-4 animate-in fade-in duration-500">
          <div className="w-full max-w-2xl bg-surface-container-low/60 backdrop-blur-xl border border-outline-variant/10 rounded-[2.5rem] p-10 md:p-14 text-center shadow-xl">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-on-surface mb-4">
              No Templates Available
            </h3>
            <p className="font-body text-on-surface-variant text-base max-w-md mx-auto leading-relaxed">
              No active templates under this category yet. Contributions from the verification team are currently processing.
            </p>
          </div>
        </div>
      ) : (
        // Template Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, idx) => (
            <div
              key={template.id || idx}
              className="group bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 rounded-[2rem] p-7 md:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 100}ms`, animationFillMode: "both" }}
            >
              <div>
                {/* Course Tag Chip */}
                <div className="flex justify-between items-start mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full">
                    {template.course_tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl font-bold tracking-tight text-on-surface mb-3 group-hover:text-primary transition-colors duration-300">
                  {template.title}
                </h3>

                {/* Summary */}
                <p className="font-body text-on-surface-variant/85 text-sm leading-relaxed mb-6 line-clamp-3">
                  {template.summary}
                </p>

                {/* Latin Maxim Safe-Guard */}
                {template.latin_maxim && (
                  <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4.5 mb-6 transition-all duration-300 hover:bg-surface-container">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Scale className="h-4 w-4 text-primary" />
                      <span className="font-serif italic font-bold text-primary text-[15px] tracking-wide">
                        {template.latin_maxim}
                      </span>
                    </div>
                    {template.maxim_meaning && (
                      <p className="font-body text-xs text-on-surface-variant/80 pl-6 leading-relaxed">
                        {template.maxim_meaning}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button & Safety Handlers */}
              <div className="mt-auto pt-6 border-t border-outline-variant/10">
                {template.file_url ? (
                  <button
                    onClick={() => setActiveDocument({ title: template.title, url: template.file_url! })}
                    className="w-full cursor-pointer flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-white py-3.5 px-4 rounded-xl text-sm font-semibold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    Access Template
                    <ExternalLink className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-surface-container border border-outline-variant/10 text-on-surface-variant/40 py-3.5 px-4 rounded-xl text-sm font-semibold cursor-not-allowed"
                  >
                    Asset Sync Pending
                    <FolderSync className="h-4 w-4 opacity-50" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
