"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowUp, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { loadAuthors, timeAgo, type AuthorInfo } from "@/lib/community";

interface Answer {
  id: string;
  body: string;
  upvotes: number;
  is_accepted: boolean;
  author: AuthorInfo;
  created_at: string;
}

interface QuestionDetail {
  id: string;
  title: string;
  body: string;
  author: AuthorInfo;
  course: string;
  tags: string[];
  answer_count: number;
  created_at: string;
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  async function loadThread() {
    const supabase = createClient();
    const { data: q, error } = await supabase
      .from("questions")
      .select("id, title, body, tags, answer_count, created_at, author_id")
      .eq("id", String(id))
      .maybeSingle();
    if (error || !q) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const { data: rows } = await supabase
      .from("answers")
      .select("id, body, upvotes, is_accepted, created_at, author_id")
      .eq("question_id", q.id)
      .order("is_accepted", { ascending: false })
      .order("upvotes", { ascending: false });
    const answerRows = (rows || []) as { id: string; body: string; upvotes: number | null; is_accepted: boolean | null; created_at: string; author_id: string | null }[];
    const authorOf = await loadAuthors(supabase, [q.author_id, ...answerRows.map((a) => a.author_id)]);
    const tags: string[] = q.tags || [];
    setQuestion({
      id: q.id,
      title: q.title,
      body: q.body || "",
      author: authorOf(q.author_id),
      course: tags[0] || "General",
      tags: tags.slice(1),
      answer_count: q.answer_count ?? 0,
      created_at: q.created_at,
    });
    setAnswers(
      answerRows.map((a) => ({
        id: a.id,
        body: a.body,
        upvotes: a.upvotes ?? 0,
        is_accepted: !!a.is_accepted,
        author: authorOf(a.author_id),
        created_at: a.created_at,
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function postAnswer() {
    if (!question || newAnswer.trim().length < 10) {
      setPostError("Please write at least a sentence or two.");
      return;
    }
    setPosting(true);
    setPostError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPosting(false);
      setPostError("Please log in to answer.");
      return;
    }
    const { error } = await supabase
      .from("answers")
      .insert({ question_id: question.id, body: newAnswer.trim(), author_id: user.id, upvotes: 0, is_accepted: false });
    if (error) {
      console.error("Failed to post answer:", error);
      setPosting(false);
      setPostError("Your answer couldn't be posted. Please try again.");
      return;
    }
    // Keep the list page's answer count in step (ignored if not permitted).
    await supabase.from("questions").update({ answer_count: question.answer_count + 1 }).eq("id", question.id);
    setNewAnswer("");
    setPosting(false);
    await loadThread();
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface p-12 flex flex-col items-center justify-center gap-4 text-on-surface-variant">
        <p className="font-serif italic text-lg">This question could not be found.</p>
        <Link href="/community" className="text-primary font-bold">Back to Community</Link>
      </div>
    );
  }

  if (loading || !question) {
    return (
      <div className="min-h-screen bg-surface p-12 flex items-center justify-center text-on-surface-variant font-serif italic">
        Loading discussion thread...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32 transition-colors duration-300">
      {/* Back Link */}
      <Link 
        href="/community" 
        className="inline-flex items-center gap-2 text-on-surface-variant/40 hover:text-primary transition-colors text-sm font-label mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Community
      </Link>

      {/* Question Header Section */}
      <article className="mb-12 border-b border-outline-variant/10 pb-10">
        <h1 className="font-headline text-3xl md:text-4xl font-bold mb-6 leading-tight text-on-surface">
          {question.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
              {question.author.avatar_initial}
            </div>
            <span className="font-medium text-on-surface">{question.author.name}</span>
            <span className="text-xs text-on-surface-variant/60">{timeAgo(question.created_at)}</span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/20 hidden md:block" />
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/10">
            {question.course}
          </span>
          <div className="flex gap-2">
            {question.tags.map(tag => (
              <span key={tag} className="bg-surface-container-high text-on-surface-variant/70 px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/5">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 leading-relaxed font-body text-on-surface/80 text-lg shadow-sm">
          {question.body}
        </div>
      </article>

      {/* Post Answer Form */}
      <section className="mb-16">
        <h3 className="font-headline text-xl font-bold mb-6 text-on-surface">Your Answer</h3>
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 focus-within:border-primary/50 transition-all shadow-sm">
          <textarea 
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Share your legal analysis here..."
            className="w-full h-40 bg-transparent resize-none outline-none text-on-surface font-body text-base placeholder:text-on-surface-variant/30"
          />
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-outline-variant/10">
            <p className="text-sm text-red-600 font-medium">{postError}</p>
            <button onClick={postAnswer} disabled={posting} className="disabled:opacity-50 bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
              {posting ? "Posting..." : "Post Answer"}
            </button>
          </div>
        </div>
      </section>

      {/* Answers Feed */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface">{answers.length} Answers</h2>

        </div>

        {answers.length === 0 && (
          <p className="text-on-surface-variant/60 font-serif italic">No answers yet. Share what you know.</p>
        )}
        <div className="space-y-8">
          {answers.map((answer) => (
            <div key={answer.id} className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex gap-6">
                {/* Voting Left */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <ArrowUp className="h-6 w-6 text-on-surface-variant/20" />
                  <span className="font-headline font-bold text-lg text-primary">{answer.upvotes}</span>
                </div>

                {/* Main Answer Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface">
                        {answer.author.avatar_initial}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2 uppercase tracking-wide text-sm text-on-surface">
                          {answer.author.name}
                          {answer.is_accepted && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="text-[10px] text-on-surface-variant/40 font-bold uppercase">Posted {timeAgo(answer.created_at)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-on-surface/90 leading-relaxed font-body text-base mb-8">
                    {answer.body}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
