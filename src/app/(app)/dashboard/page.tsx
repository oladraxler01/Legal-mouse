import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { 
  ArrowRight, 
  MessageSquare, 
  FileText, 
  Scale, 
  Users, 
  HelpCircle, 
  Upload,
  Search,
  BookMarked
} from "lucide-react";

async function getDashboardData() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const userMetadata = session?.user?.user_metadata;

  // Fetch one random verified case
  // Note: Simple random fetch for demonstration. In production, use a more efficient Method.
  const { data: cases } = await supabase
    .from("cases")
    .select("title, ratio_decidendi")
    .eq("is_verified", true)
    .limit(10);

  const dailyInsight = cases && cases.length > 0 
    ? cases[Math.floor(Math.random() * cases.length)]
    : {
        title: "Doctrine of Promissory Estoppel",
        ratio_decidendi: "A promise which the promisor should reasonably expect to induce action by the promisee, which does induce such action, is binding if injustice can only be avoided by enforcement."
      };

  return {
    user: {
      name: userMetadata?.full_name || "Student",
      initials: userMetadata?.full_name ? userMetadata.full_name.charAt(0) : "S"
    },
    dailyInsight
  };
}

export default async function DashboardPage() {
  const { user, dailyInsight } = await getDashboardData();

  const quickAccess = [
    { title: "AI Assistant", icon: MessageSquare, href: "/assistant", color: "text-purple-400" },
    { title: "Smart Notes", icon: FileText, href: "/notes", color: "text-purple-400" },
    { title: "Case Law", icon: Scale, href: "/cases", color: "text-purple-400" },
    { title: "Study Groups", icon: Users, href: "/community", color: "text-purple-400" },
    { title: "Q&A Forum", icon: HelpCircle, href: "/forum", color: "text-purple-400" },
    { title: "Contribute", icon: Upload, href: "/contribute", color: "text-purple-400" },
  ];

  const learningProgress = [
    { title: "Contract Law", progress: 75 },
    { title: "Criminal Law", progress: 60 },
    { title: "Constitutional Law", progress: 45 },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 pb-32 md:pb-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight mb-1">Legal Mouse</h1>
          <p className="font-body text-on-surface-variant/70 text-sm">Welcome back, {user.name}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#8A2BE2] flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20">
          {user.initials}
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-12 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/30" />
        </div>
        <input 
          type="text" 
          placeholder="Search cases, notes, or topics..." 
          className="w-full bg-[#111111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-label focus:border-white/20 transition-all outline-none"
        />
      </div>

      {/* Daily Legal Insight Card */}
      <section className="mb-12">
        <div className="bg-[#8A2BE2] rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500">
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
                <BookMarked className="h-4 w-4" />
                Daily Legal Insight
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4 leading-tight">
                {dailyInsight.title}
              </h2>
              <p className="font-serif text-lg md:text-xl text-white/90 leading-relaxed max-w-4xl mb-8">
                {dailyInsight.ratio_decidendi}
              </p>
              <Link href="/cases" className="inline-flex items-center gap-2 text-sm font-bold border-b border-white/30 pb-0.5 hover:border-white transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
           </div>
           {/* Abstract shapes for background */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-white/20 transition-colors duration-500" />
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="mb-16">
        <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-8">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccess.map((item) => (
            <Link 
              key={item.title} 
              href={item.href}
              className="bg-[#111111] border border-white/5 p-6 rounded-2xl flex items-center gap-6 hover:bg-[#1A1A1A] hover:border-white/10 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-[#8A2BE2] group-hover:scale-110 transition-transform">
                <item.icon className="h-6 w-6" />
              </div>
              <span className="font-headline font-bold text-lg group-hover:text-purple-400 transition-colors">{item.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Continue Learning */}
      <section>
        <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-white/40 mb-8">Continue Learning</h3>
        <div className="space-y-10">
          {learningProgress.map((subject) => (
            <div key={subject.title}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-headline text-lg font-bold">{subject.title}</span>
                <span className="font-label text-sm font-bold text-white/40">{subject.progress}%</span>
              </div>
              <div className="h-2 w-full bg-[#111111] rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#8A2BE2] to-[#B066FF] transition-all duration-1000"
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
