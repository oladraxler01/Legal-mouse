"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function CourseTopicsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 pb-40">
      <header className="mb-12 animate-in fade-in duration-700">
        <Link 
          href="/notes" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-label font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Course Topics
        </h1>
        <p className="font-body text-gray-400 text-lg">
          Detailed breakdown for Course ID: <span className="text-white font-mono">{courseId}</span>
        </p>
      </header>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-3 text-white">Topics Loading...</h2>
        <p className="font-body text-gray-400 max-w-md mx-auto">
          This is a placeholder view for the specific topics nested within this course. Data integration will be wired up shortly.
        </p>
      </div>
    </div>
  );
}
