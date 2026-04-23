"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowUp, 
  CheckCircle, 
  Share2,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Topic {
  id: string;
  name: string;
}

interface Author {
  name: string;
  is_top_contributor: boolean;
  avatar_initial: string;
}

interface Comment {
  id: string;
  body: string;
  author: Author;
  created_at: string;
}

interface Answer {
  id: string;
  body: string;
  upvotes: number;
  is_accepted: boolean;
  author: Author;
  comments: Comment[];
  created_at: string;
}

interface QuestionDetail {
  id: string;
  title: string;
  body: string;
  author: Author;
  topic: Topic;
  tags: string[];
  created_at: string;
}

const mockQuestion: QuestionDetail = {
  id: "q1",
  title: "Can silence constitute acceptance in contract law?",
  body: "I'm studying the case of Felthouse v Bindley. The uncle stated 'If I hear no more about him, I consider the horse mine at that price'. Does this mean silence can never be acceptance, or are there exceptions in modern law?",
  author: { name: "Sarah Chen", is_top_contributor: true, avatar_initial: "S" },
  topic: { id: "1", name: "Contract Law" },
  tags: ["Acceptance", "Contract Formation", "Felthouse v Bindley"],
  created_at: "2024-04-23T10:00:00Z"
};

const mockAnswers: Answer[] = [
  {
    id: "a1",
    body: "The general rule from Felthouse v Bindley is that silence does not constitute acceptance. However, modern law has established some exceptions. For example, if there's a prior course of dealing where silence has been treated as acceptance, it might be valid.",
    upvotes: 18,
    is_accepted: true,
    author: { name: "James Miller", is_top_contributor: false, avatar_initial: "J" },
    created_at: "2024-04-23T11:30:00Z",
    comments: [
      {
        id: "c1",
        body: "Good point about the prior course of dealing. Selectmove Ltd is also a relevant case here.",
        author: { name: "Emma Wilson", is_top_contributor: true, avatar_initial: "E" },
        created_at: "2024-04-23T12:00:00Z"
      }
    ]
  },
  {
    id: "a2",
    body: "Another exception is where the offeree themselves suggests that silence shall be recorded as acceptance. If the offeree is the one setting the terms for their own silence, the court is more likely to enforce it.",
    upvotes: 12,
    is_accepted: false,
    author: { name: "David Lee", is_top_contributor: false, avatar_initial: "D" },
    created_at: "2024-04-23T14:45:00Z",
    comments: []
  }
];

export default function QuestionDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState("");

  useEffect(() => {
    async function fetchData() {
      // Logic for Supabase fetch would go here
      // For now using high-fidelity mocks
      setTimeout(() => {
        setQuestion({ ...mockQuestion, id: String(id) });
        setAnswers(mockAnswers);
        setLoading(false);
      }, 500);
    }
    fetchData();
  }, [id]);

  if (loading || !question) {
    return (
      <div className="min-h-screen bg-[#000000] p-12 flex items-center justify-center text-zinc-500 font-serif italic">
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
            {question.author.is_top_contributor && (
              <span className="bg-primary/20 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-primary/20">
                Top Contributor
              </span>
            )}
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/20 hidden md:block" />
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/10">
            {question.topic.name}
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
          <div className="flex justify-end mt-4 pt-4 border-t border-outline-variant/10">
            <button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
              Post Answer
            </button>
          </div>
        </div>
      </section>

      {/* Answers Feed */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface">{answers.length} Answers</h2>
          <div className="flex items-center gap-2 text-on-surface-variant/40 text-sm font-label font-bold uppercase tracking-widest">
            Sort by: <span className="text-primary hover:underline cursor-pointer">Votes</span>
          </div>
        </div>

        <div className="space-y-8">
          {answers.map((answer) => (
            <div key={answer.id} className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex gap-6">
                {/* Voting Left */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button className="text-on-surface-variant/20 hover:text-primary transition-colors">
                    <ArrowUp className="h-6 w-6" />
                  </button>
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
                        <div className="text-[10px] text-on-surface-variant/40 font-bold">POSTED 2 HOURS AGO</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-on-surface-variant/20">
                      <Share2 className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                      <MoreVertical className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
                    </div>
                  </div>

                  <div className="text-on-surface/90 leading-relaxed font-body text-base mb-8">
                    {answer.body}
                  </div>

                  {/* Nested Comments */}
                  {answer.comments.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-outline-variant/10 space-y-6">
                      {answer.comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 pl-4 border-l-2 border-primary/20">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-primary uppercase">{comment.author.name}</span>
                              <span className="text-[10px] text-on-surface-variant/40 font-bold">• 1 HOUR AGO</span>
                            </div>
                            <p className="text-sm text-on-surface-variant/80 font-body">{comment.body}</p>
                          </div>
                        </div>
                      ))}
                      <button className="text-xs font-bold text-on-surface-variant/40 hover:text-primary transition-colors pl-4">
                        + Add a comment
                      </button>
                    </div>
                  )}

                  {answer.comments.length === 0 && (
                     <button className="text-xs font-bold text-on-surface-variant/30 hover:text-primary transition-colors">
                      + Add a comment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
