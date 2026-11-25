"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Pencil, 
  Check, 
  X, 
  BookMarked, 
  Star, 
  CheckCircle, 
  Download,
  Book,
  Scale,
  Flame,
  Layout,
  Award,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { loadActiveDays, loadRecentActivity, type ActivityItem } from "@/lib/activity";
import { timeAgo } from "@/lib/community";
import Link from "next/link";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  year_of_study: string;
  current_streak: number;
  longest_streak: number;
  contributions: number;
  reputation: number;
  questions_asked: number;
  answers_given: number;
  notes_read: number;
  cases_reviewed: number;
}

interface SavedResource {
  id: string;
  title: string;
  resource_type: string;
  topic_name: string;
  created_at: string;
}

const ROLES = ['Law Student', 'Lawyer', 'Professor'];
const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Postgraduate'];

interface DbProfile {
  id: string;
  full_name: string | null;
  role: string | null;
  year_of_study: string | null;
  current_streak: number | null;
  longest_streak?: number | null;
  notes_read: number | null;
  cases_reviewed: number | null;
  contributions?: number | null;
  reputation?: number | null;
  questions_asked?: number | null;
  answers_given?: number | null;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [recent, setRecent] = useState<ActivityItem[]>([]);
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [week, setWeek] = useState<{ key: string; label: string }[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    role: "",
    year_of_study: ""
  });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError);
        setLoading(false);
        return;
      }

      if (user) {
        setUserEmail(user.email || "");
        
        try {
          // Fetch Profile 
          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          const profileData = data as DbProfile | null;

          if (profileError) {
            console.error("Profile fetch error detail:", JSON.stringify(profileError, null, 2));
            
            // Handle error gracefully - including 406 which often means RLS or missing columns
            const isNoRows = profileError.code === 'PGRST116';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isRLSOrSchemaError = (profileError as any).status === 406 || profileError.code === 'PGRST105';

            if (isNoRows || isRLSOrSchemaError) {
              const defaultProfile: Profile = {
                id: user.id,
                full_name: user.user_metadata?.full_name || "New Student",
                role: "Law Student",
                year_of_study: "Year 1",
                current_streak: 0,
                longest_streak: 0,
                contributions: 0,
                reputation: 0,
                questions_asked: 0,
                answers_given: 0,
                notes_read: 0,
                cases_reviewed: 0
              };
              setProfile(defaultProfile);
              setFormData({
                full_name: defaultProfile.full_name,
                role: defaultProfile.role,
                year_of_study: defaultProfile.year_of_study
              });
            }
          } else if (profileData) {
            setProfile({
              ...profileData,
              full_name: profileData.full_name || "New Student",
              role: profileData.role || "Law Student",
              year_of_study: profileData.year_of_study || "Year 2",
              current_streak: profileData.current_streak || 0,
              longest_streak: Math.max(profileData.longest_streak || 0, profileData.current_streak || 0),
              notes_read: profileData.notes_read || 0,
              cases_reviewed: profileData.cases_reviewed || 0,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              contributions: (profileData as any).contributions || 0,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              reputation: (profileData as any).reputation || 0,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              questions_asked: (profileData as any).questions_asked || 0,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              answers_given: (profileData as any).answers_given || 0
            } as Profile);
            setFormData({
              full_name: profileData.full_name || "",
              role: profileData.role || "Law Student",
              year_of_study: profileData.year_of_study || "Year 2"
            });
          }

          // Recent activity and the last 7 days
          loadRecentActivity(8).then(setRecent);
          loadActiveDays(7).then(setActiveDays);
          const now = Date.now();
          setWeek(
            Array.from({ length: 7 }, (_, i) => {
              const d = new Date(now - (6 - i) * 86400000);
              return { key: d.toLocaleDateString("en-CA"), label: d.toLocaleDateString(undefined, { weekday: "short" }) };
            })
          );

          // Fetch Saved Resources
          const { data: saved, error: savedError } = await supabase
            .from("saved_resources")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (savedError) console.error("Saved resources fetch error:", savedError);
          setSavedResources(saved || []);
        } catch (err) {
          console.error("Unexpected error:", err);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      try {
        const { error } = await supabase
          .from("profiles")
          // Only the editable fields: counters and streaks are kept up to date by the database.
          .upsert({
            id: user.id,
            full_name: formData.full_name.trim(),
            role: formData.role,
            year_of_study: formData.year_of_study,
          });

        if (error) {
          console.error("Profile save error detail:", JSON.stringify(error, null, 2));
          setNotice("Your changes couldn't be saved. Please try again.");
        } else {
          setNotice("Profile updated.");
          await supabase.auth.updateUser({ data: { full_name: formData.full_name.trim() } });
          if (profile) {
            setProfile({
              ...profile,
              full_name: formData.full_name,
              role: formData.role,
              year_of_study: formData.year_of_study
            });
          }
          setIsEditing(false);
        }
      } catch (err) {
        console.error("Unexpected save error:", err);
      }
    }
    setSaving(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <div className="text-on-surface-variant font-serif italic">Curating your experience...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface">Profile</h1>
        <button
          onClick={async () => {
            const { error } = await createClient().auth.resetPasswordForEmail(userEmail, {
              redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });
            setNotice(error ? "Couldn't send the email. Please try again shortly." : `We've emailed a link to change your password to ${userEmail}.`);
          }}
          title="Change password"
          className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/10 text-sm font-bold"
        >
          <Settings className="h-5 w-5" /> <span className="hidden sm:inline">Change password</span>
        </button>
      </header>
      {notice && (
        <button onClick={() => setNotice(null)} className="w-full mb-6 text-left rounded-xl bg-primary/10 text-primary px-4 py-3 text-sm font-medium">
          {notice} <span className="opacity-60">(dismiss)</span>
        </button>
      )}

      {/* User Identity Card */}
      <section className="mb-12 relative">
        <div className="bg-[#1A0B2E] rounded-[2.5rem] p-8 md:p-10 text-white overflow-hidden relative group">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-4xl font-bold border-4 border-white/10 shadow-2xl">
              {profile.full_name.charAt(0)}
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4 max-w-md">
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Full Name"
                    className="w-full bg-[#0A0A0A] border border-primary/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none font-headline font-bold text-xl"
                  />
                  <div className="flex gap-3">
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm font-label"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select 
                      value={formData.year_of_study}
                      onChange={(e) => setFormData({...formData, year_of_study: e.target.value})}
                      className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm font-label"
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-headline text-3xl font-bold mb-2">{profile.full_name}</h2>
                  <p className="text-white/60 font-body mb-6">{userEmail}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="bg-primary/30 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-white/10">
                      {profile.role}
                    </span>
                    <span className="bg-primary/30 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-white/10">
                      {profile.year_of_study}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 md:mt-0 flex gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
                  >
                    {saving ? "Saving..." : <><Check className="h-5 w-5" /> Save</>}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/5"
                >
                  <Pencil className="h-5 w-5" /> Edit Profile
                </button>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 right-0 p-10 opacity-10 pointer-events-none">
            <Layout className="w-40 h-40" />
          </div>
        </div>
      </section>

      {/* Dashboard Stats Grid */}
      <section className="mb-16">
        <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-8">Study Streak</h3>
        <div className="grid md:grid-cols-[1fr_2fr] gap-6 mb-12">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-[2rem] p-8 flex items-center gap-5">
            <Flame className="h-12 w-12 text-orange-500 fill-orange-500 shrink-0" />
            <div>
              <div className="font-headline text-4xl font-extrabold text-orange-500">{profile.current_streak} {profile.current_streak === 1 ? "day" : "days"}</div>
              <div className="text-sm text-on-surface-variant">Current streak · Best: {profile.longest_streak} {profile.longest_streak === 1 ? "day" : "days"}</div>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-[2rem] p-8">
            <div className="text-sm font-bold text-on-surface mb-4">Last 7 days</div>
            <div className="grid grid-cols-7 gap-2">
              {week.map(({ key, label }) => {
                const active = activeDays.has(key);
                return (
                  <div key={key} className="flex flex-col items-center gap-2">
                    <div className={`w-full aspect-square max-w-12 rounded-xl flex items-center justify-center ${active ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant/40"}`}>
                      {active ? <Check className="h-4 w-4" /> : null}
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">{label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-on-surface-variant mt-4">Open any note, case, video or moot court hearing each day to keep your streak going.</p>
          </div>
        </div>

        <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-8">How You Use Legal Mouse</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Notes Read", value: profile.notes_read, icon: Book },
            { label: "Cases & Moot Sessions", value: profile.cases_reviewed, icon: Scale },
            { label: "Questions Asked", value: profile.questions_asked, icon: MessageSquare },
            { label: "Answers Given", value: profile.answers_given, icon: CheckCircle },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant/10 p-8 rounded-[2rem] shadow-sm group hover:border-primary/30 transition-all">
              <div className="font-headline text-3xl font-extrabold text-primary mb-2 tracking-tight group-hover:scale-110 transition-transform origin-left">{stat.value}</div>
              <div className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements Area */}
      <section className="mb-16">
        <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-8">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'v', label: "Contributor", icon: Award, active: profile.contributions > 0, value: profile.contributions > 0 ? `${profile.contributions} shared` : "Share a note" },
            { id: 'a', label: "Top Answerer", icon: Star, active: profile.answers_given >= 5, value: `${profile.answers_given} / 5 answers` },
            { id: 's', label: "7-Day Streak", icon: Flame, active: profile.longest_streak >= 7, value: `Best ${profile.longest_streak} / 7 days` },
            { id: 'm', label: "Case Master", icon: Scale, active: profile.cases_reviewed >= 10, value: `${profile.cases_reviewed} / 10 cases` },
          ].map((achievement) => (
            <div 
              key={achievement.id} 
              className={`bg-surface-container-lowest border p-8 rounded-[2rem] shadow-sm flex flex-col gap-6 relative transition-all ${
                achievement.active ? "border-primary/20 opacity-100" : "border-outline-variant/10 opacity-40 grayscale"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                achievement.active ? "bg-primary/10 border-primary/20 text-primary" : "bg-surface-container-high border-outline-variant/10 text-on-surface-variant/20"
              }`}>
                <achievement.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface mb-1">{achievement.label}</div>
                {achievement.value && <div className="text-xs font-bold text-primary">{achievement.value}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Resources */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/50">Saved Resources</h3>
          <Download className="h-5 w-5 text-on-surface-variant/20 cursor-pointer hover:text-primary transition-colors" />
        </div>
        <div className="space-y-4">
          {savedResources.length > 0 ? savedResources.map((res) => (
            <div key={res.id} className="bg-surface-container-lowest border border-outline-variant/10 p-6 rounded-2xl flex items-center gap-6 hover:bg-surface-container-low transition-all group">
               <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                 {res.resource_type === 'case' ? <Scale className="h-5 w-5" /> : <BookMarked className="h-5 w-5" />}
               </div>
               <div className="flex-1 min-w-0">
                 <div className="font-headline font-bold text-on-surface truncate group-hover:text-primary transition-colors">{res.title}</div>
                 <div className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">{res.resource_type} • {res.topic_name}</div>
               </div>
               <ArrowRight className="h-5 w-5 text-on-surface-variant/10 group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0" />
            </div>
          )) : (
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-10 rounded-[2rem] text-center border-dashed">
              <p className="text-on-surface-variant/30 font-serif italic">Your saved legal treasures will appear here.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="font-label text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-8">Recent Activity</h3>
        {recent.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/10 border-dashed p-10 rounded-[2rem] text-center">
            <p className="text-on-surface-variant/60 font-serif italic">What you read and practise will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((item) => (
              <Link
                key={item.item_key}
                href={item.href || "/dashboard"}
                className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/10 p-5 rounded-2xl hover:bg-surface-container-low transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-on-surface truncate">{item.title}</div>
                  <div className="text-xs text-on-surface-variant truncate">
                    {item.subtitle ? `${item.subtitle} · ` : ""}
                    {timeAgo(item.created_at)}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-on-surface-variant/30" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
