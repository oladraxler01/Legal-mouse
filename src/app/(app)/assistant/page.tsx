"use client";

import { useChat } from "ai/react";
import { 
  Send, 
  Sparkles, 
  User, 
  ArrowLeft,
  Search,
  BookOpen,
  Scale,
  BrainCircuit,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function AssistantPage() {
  const { messages, input, handleInputChange, handleSubmit, setInput, append } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestions = [
    "Explain promissory estoppel",
    "What is the neighbor principle?",
    "Difference between murder and manslaughter"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    append({
      role: 'user',
      content: suggestion,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 bg-surface-container border-b border-outline-variant/10 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2.5 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline font-bold text-xl leading-tight text-on-surface">AI Legal Assistant</h1>
              <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">Ask anything about law</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <BrainCircuit className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-tight">Gemini 1.5 Flash</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-surface pb-40">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/5 flex items-center justify-center shadow-inner relative">
               <Sparkles className="w-10 h-10 text-primary opacity-40" />
               <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] animate-pulse" />
            </div>
            <div>
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-3">Hello, I'm your Legal AI</h2>
              <p className="text-on-surface-variant/60 font-body leading-relaxed">
                I can help you analyze cases, explain legal principles, or break down complex statutes in simple terms.
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div 
              key={m.id} 
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in ${isUser ? "slide-in-from-right-4" : "slide-in-from-left-4"} duration-300`}
            >
              <div className="flex items-center gap-3 mb-2 px-1">
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
                  {isUser ? "You" : "Legal Mouse AI"}
                </span>
                {isUser && (
                   <div className="w-6 h-6 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-on-surface-variant/60" />
                  </div>
                )}
              </div>

              <div 
                className={`max-w-[85%] md:max-w-[75%] p-6 rounded-2xl shadow-sm ${
                  isUser 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-[#0A0A0A] text-on-surface rounded-tl-none border border-outline-variant/10"
                }`}
              >
                <div 
                  className={`leading-relaxed text-lg whitespace-pre-wrap ${!isUser ? "font-serif" : "font-body"}`}
                  style={!isUser ? { fontFamily: 'var(--font-crimson)' } : {}}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface z-20">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-3 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant/40 w-full mb-1 ml-1">Suggested questions:</span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="bg-surface-container-low border border-outline-variant/10 px-6 py-3 rounded-2xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high hover:border-primary/20 hover:text-primary transition-all duration-300 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <form 
            onSubmit={handleSubmit}
            className="relative group h-[72px]"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-40 transition-opacity" />
            <div className="relative h-full bg-[#0A0A0A] border border-outline-variant/10 rounded-3xl flex items-center px-6 gap-4 shadow-2xl transition-all focus-within:border-primary/50">
               <HelpCircle className="w-6 h-6 text-on-surface-variant/20" />
               <input 
                type="text" 
                value={input}
                onChange={handleInputChange}
                placeholder="Ask a legal question..." 
                className="flex-1 bg-transparent border-none outline-none text-on-surface text-base font-body placeholder:text-on-surface-variant/40"
               />
               <button 
                type="submit"
                disabled={!input.trim()}
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
               >
                 <Send className="w-5 h-5" />
               </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-[0.3em]">
                AI responses are for educational purposes only
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
