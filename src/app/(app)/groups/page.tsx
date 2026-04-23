/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Users, 
  Plus, 
  Lock, 
  Globe, 
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  member_count: number;
  is_private: boolean;
  last_active: string;
  is_member?: boolean;
}

export default function StudyGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [yourGroups, setYourGroups] = useState<StudyGroup[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<StudyGroup[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchGroups = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch Your Groups
    const { data: memberGroups, error: memberError } = await supabase
      .from("group_members")
      .select("group_id, study_groups(*)")
      .eq("user_id", user.id);

    if (memberError) console.error("Error fetching member groups:", memberError);

    const formattedYourGroups = (memberGroups || []).map((item: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(item.study_groups as any),
      is_member: true,
      last_active: "Active 2h ago"
    }));

    setYourGroups(formattedYourGroups);

    // Fetch Discover Groups (not a member of)
    const memberGroupIds = formattedYourGroups.map(g => g.id);
    const { data: allGroups, error: allError } = await supabase
      .from("study_groups")
      .select("*")
      .not("id", "in", `(${memberGroupIds.length > 0 ? memberGroupIds.join(",") : "0"})`)
      .limit(10);

    if (allError) console.error("Error fetching all groups:", allError);

    setDiscoverGroups((allGroups || []).map(g => ({ 
      id: g.id,
      name: g.name,
      description: g.description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topic: (g as any).topic || "Legal",
      member_count: g.member_count,
      is_private: g.is_private,
      last_active: "Active 5h ago" 
    })));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = async (groupId: string) => {
    setJoiningId(groupId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
      // 1. Join Group
      const { error: joinError } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: user.id });

      if (joinError) throw joinError;

      // 2. Increment member count
      const groupToJoin = discoverGroups.find(g => g.id === groupId);
      if (groupToJoin) {
        await supabase
          .from("study_groups")
          .update({ member_count: (groupToJoin.member_count || 0) + 1 })
          .eq("id", groupId);
      }

      await fetchGroups();
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setJoiningId(null);
    }
  };

  // Mock data if DB is empty
  const mockYourGroups: StudyGroup[] = [
    { id: "g1", name: "Contract Law Study Circle", description: "In-depth discussions on contracts", topic: "Contract Law", member_count: 12, is_private: true, last_active: "Active 2h ago", is_member: true },
    { id: "g2", name: "Tort Law Discussion", description: "Breaking down negligence cases", topic: "Tort Law", member_count: 8, is_private: true, last_active: "Active 5h ago", is_member: true },
  ];

  const mockDiscoverGroups: StudyGroup[] = [
    { id: "g3", name: "Criminal Law Mastery", description: "In-depth discussions on criminal law principles and cases", topic: "Criminal Law", member_count: 24, is_private: false, last_active: "Active 5h ago" },
    { id: "g4", name: "Constitutional Law Study Group", description: "Weekly sessions on constitutional principles and landmark cases", topic: "Constitutional Law", member_count: 18, is_private: false, last_active: "Active 1d ago" },
    { id: "g5", name: "Bar Exam Prep 2026", description: "Collaborative preparation for the bar examination", topic: "Multiple Courses", member_count: 35, is_private: false, last_active: "Active 3h ago" },
  ];

  const displayYourGroups = yourGroups.length > 0 ? yourGroups : mockYourGroups;
  const displayDiscoverGroups = discoverGroups.length > 0 ? discoverGroups : mockDiscoverGroups;

  const filteredYour = displayYourGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDiscover = displayDiscoverGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 pb-32">
      {/* Header */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">Study Groups</h1>
          <p className="text-muted-foreground">Collaborate and learn together</p>
        </div>
        <button className="w-12 h-12 rounded-full bg-[#7C3AED] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
          <Plus className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* Search */}
      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study groups..."
          className="w-full bg-[#111111] border border-zinc-800 rounded-2xl py-5 pl-12 pr-6 outline-none focus:border-[#7C3AED]/50 transition-colors"
        />
      </div>

      {/* Your Groups */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-6">Your Groups</h2>
        <div className="space-y-4">
          {filteredYour.map(group => (
            <Link 
              key={group.id} 
              href={`/groups/${group.id}`}
              className="bg-[#0A0A0A] border border-zinc-900 rounded-2xl p-6 flex items-center justify-between group hover:border-[#7C3AED]/30 transition-all hover:bg-[#111111]"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[#7C3AED]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg group-hover:text-[#7C3AED] transition-colors">{group.name}</h3>
                    {group.is_private && <Lock className="w-3.5 h-3.5 text-zinc-500" />}
                  </div>
                  <p className="text-sm text-zinc-500">
                    {group.member_count} members <span className="mx-2">•</span> {group.last_active}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-zinc-800 group-hover:text-[#7C3AED] transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Discover Groups */}
      <section>
        <h2 className="text-xl font-bold mb-6">Discover Groups</h2>
        <div className="space-y-6">
          {filteredDiscover.map(group => (
            <div 
              key={group.id} 
              className="bg-[#0A0A0A] border border-zinc-900 rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[#7C3AED]">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl">{group.name}</h3>
                    {!group.is_private && <Globe className="w-4 h-4 text-zinc-500" />}
                  </div>
                  <p className="text-zinc-500 mb-4 max-w-2xl">{group.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-[#7C3AED]/10 text-[#7C3AED] px-3 py-1 rounded-full text-xs font-bold">
                      {group.topic}
                    </span>
                    <span className="text-xs text-zinc-500 mt-1">
                      {group.member_count} members
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleJoin(group.id)}
                disabled={joiningId === group.id}
                className="w-full bg-[#7C3AED] py-4 rounded-xl font-bold text-lg hover:bg-[#6D28D9] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {joiningId === group.id ? "Joining..." : "Join Group"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
