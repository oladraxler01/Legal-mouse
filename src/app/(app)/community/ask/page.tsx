"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { COURSE_OPTIONS } from "@/lib/community";

export default function AskQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [course, setCourse] = useState(COURSE_OPTIONS[0]);
  const [tagText, setTagText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 10) return setError("Please give your question a clear title (at least 10 characters).");
    if (body.trim().length < 20) return setError("Please add a little more detail (at least 20 characters).");

    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return setError("Please log in to ask a question.");
    }

    // The first tag is the course; the rest are optional topic tags.
    const extraTags = tagText.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5);
    const { data, error: insertError } = await supabase
      .from("questions")
      .insert({
        title: title.trim(),
        body: body.trim(),
        tags: [course, ...extraTags],
        author_id: user.id,
        upvotes: 0,
        answer_count: 0,
        is_resolved: false,
      })
      .select("id")
      .single();

    if (insertError || !data) {
      console.error("Failed to post question:", insertError);
      setSubmitting(false);
      return setError("Your question couldn't be posted. Please try again.");
    }
    router.push(`/community/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32">
      <Link href="/community" className="inline-flex items-center gap-2 text-on-surface-variant/60 hover:text-primary text-sm mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Community
      </Link>
      <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Ask the community</h1>
      <p className="text-on-surface-variant mb-10">Fellow students will see your question and can answer it.</p>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <label className="block">
          <span className="text-sm font-bold">Question</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Can silence constitute acceptance in contract law?"
            className="mt-2 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold">Details</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            placeholder="Explain what you're stuck on, and mention any cases or statutes you've looked at."
            className="mt-2 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50 resize-y"
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-sm font-bold">Course</span>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="mt-2 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50"
            >
              {COURSE_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold">Tags (optional)</span>
            <input
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              placeholder="Acceptance, Felthouse v Bindley"
              className="mt-2 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary/50"
            />
          </label>
        </div>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post question"}
        </button>
      </form>
    </div>
  );
}
