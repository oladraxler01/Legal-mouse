"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, FileText, X } from "lucide-react";

interface Statute {
  id: string;
  title: string;
  year: string;
  category: string;
  pdfUrl: string;
}

const mockStatutes: Statute[] = [
  {
    id: "s1",
    title: "Evidence Act",
    year: "2011",
    category: "Criminal",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "s2",
    title: "Constitution of the Federal Republic",
    year: "1999",
    category: "Constitutional",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "s3",
    title: "Labour Act",
    year: "2004",
    category: "Labour",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "s4",
    title: "Criminal Code Act",
    year: "1990",
    category: "Criminal",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

const categories = ["All", "Constitutional", "Criminal", "Labour", "Health", "Commercial"];

export default function StatutesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  const filteredStatutes = mockStatutes.filter((statute) => {
    const matchesSearch = statute.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || statute.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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

      {/* Main List Area */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
        {filteredStatutes.length > 0 ? (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-black/50">
            <div className="divide-y divide-white/10">
              {filteredStatutes.map((statute) => (
                <button
                  key={statute.id}
                  onClick={() => setSelectedPdf(statute.pdfUrl)}
                  className="w-full text-left flex items-center justify-between p-5 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary/20 transition-all flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {statute.title}
                      </span>
                      <span className="font-label text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
                        {statute.category} Law
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-gray-400 font-medium text-sm">
                      {statute.year}
                    </span>
                    <span className="text-primary text-sm font-label font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline-block">
                      View PDF
                    </span>
                  </div>
                </button>
              ))}
            </div>
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

      {/* PDF Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10">
          <div className="w-full h-full max-w-6xl bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-serif text-lg font-bold text-white">Document Viewer</span>
              </div>
              <button
                onClick={() => setSelectedPdf(null)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                src={selectedPdf}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
