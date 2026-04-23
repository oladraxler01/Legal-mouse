"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ChevronRight,
  Info,
  Trophy,
  Activity,
  FileUp
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Submission {
  id: string;
  title: string;
  contribution_type: 'Note' | 'Case Brief';
  status: 'Approved' | 'Under Review' | 'Needs Revision';
  created_at: string;
  file_url?: string;
}

export default function ContributePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userReputation, setUserReputation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchUserSubmissions(user.id);
        fetchUserProfile(user.id);
      } else {
        router.push("/login");
      }
    }
    init();

    // Set up real-time subscription for changes to user's submissions
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        () => {
          if (currentUserId) fetchUserSubmissions(currentUserId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  async function fetchUserSubmissions(userId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, contribution_type, status, created_at, file_url')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data as Submission[]);
    }
    setLoading(false);
  }

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('reputation')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUserReputation(data.reputation || 0);
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUserId) return;

    // Check file type
    const allowedTypes = ['.pdf', '.docx', '.doc'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(extension)) {
      alert("Invalid file type. Please upload a PDF or Word document.");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${currentUserId}/${Date.now()}_${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('contributions')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('contributions')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('notes')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ""), // Use filename as title without extension
          author_id: currentUserId,
          file_url: publicUrl,
          status: 'Under Review',
          contribution_type: 'Note'
        });

      if (dbError) throw dbError;

      alert("Note uploaded successfully! Our team will review it shortly.");
      fetchUserSubmissions(currentUserId);
    } catch (error: any) {
      console.error("Error uploading note:", error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'Under Review': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Needs Revision': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Approved': return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'Under Review': return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'Needs Revision': return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  const stats = {
    submitted: submissions.length,
    approved: submissions.filter(s => s.status === 'Approved').length,
    points: userReputation || (submissions.filter(s => s.status === 'Approved').length * 50)
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Contribute</h1>
        <p className="font-body text-on-surface-variant text-lg opacity-70">Share your knowledge with the community</p>
      </header>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Upload Notes */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative group overflow-hidden bg-primary rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/20 cursor-pointer disabled:opacity-70"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-internal transition-transform group-hover:scale-110">
            <FileUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-headline text-2xl font-bold text-white mb-2">Upload Notes</h3>
          <p className="text-white/60 text-sm font-body">Share study materials (.pdf, .doc, .docx)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.doc,.docx"
          />
          {uploading && (
            <div className="absolute inset-0 bg-primary/95 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-white font-bold tracking-widest uppercase text-xs">Uploading...</span>
              </div>
            </div>
          )}
        </button>

        {/* Case Brief */}
        <Link 
          href="/contribute/case-brief"
          className="relative group overflow-hidden bg-surface-container-high border border-outline-variant/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:border-primary/30 hover:bg-surface-container-highest shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/5 transition-transform group-hover:scale-110">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">Case Brief</h3>
          <p className="text-on-surface-variant/60 text-sm font-body">Summarize a case in detail</p>
        </Link>
      </div>

      {/* Guidelines */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 mb-12 flex gap-4 items-start shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/5">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-headline font-bold text-on-surface mb-1">Contribution Guidelines</h4>
          <p className="text-sm text-on-surface-variant/60 font-body leading-relaxed">
            All submissions are reviewed by our moderation team to ensure accuracy and quality. 
            Approved content earns you contributor badges and reputation points.
          </p>
        </div>
      </div>

      {/* Your Submissions */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Your Submissions</h2>
          <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">{submissions.length} Total</span>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-surface-container-low rounded-2xl animate-pulse border border-outline-variant/5" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant/5 rounded-3xl p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6 text-on-surface-variant/20 border border-outline-variant/5">
                <FileText className="w-10 h-10" />
              </div>
              <p className="text-on-surface-variant/50 font-body text-lg max-w-sm mb-8 italic">
                You haven't made any contributions yet. Start by uploading notes or a case brief!
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary/10 text-primary px-8 py-3 rounded-full font-bold text-sm hover:bg-primary/20 transition-all"
              >
                Start contributing
              </button>
            </div>
          ) : (
            submissions.map(sub => (
              <div 
                key={sub.id}
                className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm group hover:border-primary/20 transition-all"
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center border border-outline-variant/5 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                      {sub.contribution_type === 'Note' ? <FileUp className="w-6 h-6 text-on-surface-variant/60 group-hover:text-primary" /> : <FileText className="w-6 h-6 text-on-surface-variant/60 group-hover:text-primary" />}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{sub.title}</h3>
                      <p className="text-xs text-on-surface-variant/40 font-body mt-1 uppercase tracking-widest">
                        {sub.contribution_type} <span className="mx-2">•</span> {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-on-surface-variant/10 group-hover:text-primary transition-all" />
                </div>
                <div className={`px-6 py-2 border-t border-outline-variant/5 flex items-center gap-3 ${getStatusStyles(sub.status)}`}>
                  {getStatusIcon(sub.status)}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{sub.status}</span>
                  <div className="flex-1 h-[1px] bg-current opacity-10 rounded-full" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Your Stats */}
      <section>
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-8">Your Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="text-4xl font-headline font-bold text-primary mb-1">{stats.submitted}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Submitted</div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 text-center shadow-sm">
             <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="text-4xl font-headline font-bold text-green-500 mb-1">{stats.approved}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Approved</div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 text-center shadow-sm">
             <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
            <div className="text-4xl font-headline font-bold text-yellow-500 mb-1">{stats.points}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Points</div>
          </div>
        </div>
      </section>
    </div>
  );
}
