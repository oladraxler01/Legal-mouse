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
  BookMarked,
  Flame
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
  const userId = session?.user?.id;

  // Fetch profile for streak
  const { data: profile } = userId 
    ? await supabase.from("profiles").select("current_streak").eq("id", userId).single()
    : { data: null };

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
      initials: userMetadata?.full_name ? userMetadata.full_name.charAt(0) : "S",
      streak: profile?.current_streak || 0
    },
    dailyInsight
  };
}

export default async function DashboardPage() {
  const { user, dailyInsight } = await getDashboardData();

  const quickAccess = [
    { title: "AI Assistant", icon: MessageSquare, href: "/assistant" },
    { title: "Smart Notes", icon: FileText, href: "/notes" },
    { title: "Case Law", icon: Scale, href: "/cases" },
    { title: "Study Groups", icon: Users, href: "/community" },
    { title: "Q&A Forum", icon: HelpCircle, href: "/forum" },
    { title: "Contribute", icon: Upload, href: "/contribute" },
  ];

  const learningProgress = [
    { title: "Contract Law", progress: 75 },
    { title: "Criminal Law", progress: 60 },
    { title: "Constitutional Law", progress: 45 },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32 md:pb-12 transition-colors duration-300">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight mb-1 text-on-surface">Legal Mouse</h1>
          <div className="flex items-center gap-3">
            <p className="font-body text-on-surface-variant/70 text-sm">Welcome back, {user.name}</p>
            {user.streak >= 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20 group animate-pulse hover:animate-none transition-all">
                <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tight">{user.streak} Day Streak</span>
              </div>
            )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-lg text-on-primary shadow-lg shadow-primary/20">
          {user.initials}
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-12 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-on-surface-variant/40" />
        </div>
        <input 
          type="text" 
          placeholder="Search cases, notes, or topics..." 
          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-label focus:border-primary/50 transition-all outline-none text-on-surface"
        />
      </div>

      {/* Daily Legal Insight Card */}
      <section className="mb-12">
        <div className="bg-primary rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500">
           <div className="relative z-10 text-on-primary">
              <div className="flex items-center gap-2 text-on-primary/80 text-xs font-bold uppercase tracking-widest mb-6">
                <BookMarked className="h-4 w-4" />
                Daily Legal Insight
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4 leading-tight">
                {dailyInsight.title}
              </h2>
              <p className="font-serif text-lg md:text-xl text-on-primary/90 leading-relaxed max-w-4xl mb-8">
                {dailyInsight.ratio_decidendi}
              </p>
              <Link href="/cases" className="inline-flex items-center gap-2 text-sm font-bold border-b border-on-primary/30 pb-0.5 hover:border-on-primary transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-on-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-on-primary/20 transition-colors duration-500" />
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="mb-16">
        <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-8">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccess.map((item) => (
            <Link 
              key={item.title} 
              href={item.href}
              className="bg-surface-container-low border border-outline-variant/5 p-6 rounded-2xl flex items-center gap-6 hover:bg-surface-container-high hover:border-primary/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                <item.icon className="h-6 w-6" />
              </div>
              <span className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{item.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Continue Learning */}
      <section>
        <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-8">Continue Learning</h3>
        <div className="space-y-10">
          {learningProgress.map((subject) => (
            <div key={subject.title}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-headline text-lg font-bold text-on-surface">{subject.title}</span>
                <span className="font-label text-sm font-bold text-on-surface-variant/40">{subject.progress}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/10">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-1000"
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
