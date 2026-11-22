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
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [yourGroups, setYourGroups] = useState<StudyGroup[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<StudyGroup[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupPrivate, setNewGroupPrivate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [inviteInput, setInviteInput] = useState("");

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
      last_active: "Active now"
    }));

    setYourGroups(formattedYourGroups);

    // Fetch Discover Groups (not a member of)
    const memberGroupIds = formattedYourGroups.map(g => g.id);
    const { data: allGroups, error: allError } = await supabase
      .from("study_groups")
      .select("*")
      .eq("is_private", false)
      .not("id", "in", `(${memberGroupIds.length > 0 ? memberGroupIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (allError) console.error("Error fetching all groups:", allError);

    setDiscoverGroups((allGroups || []).map(g => ({ 
      id: g.id,
      name: g.name,
      description: g.description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topic: (g as any).topic || "Legal",
      member_count: g.member_count,
      is_private: g.is_private,
      last_active: "Active recently" 
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

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      // 1. Join Group
      const { error: joinError } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: user.id });

      if (joinError && !joinError.message.includes("unique")) {
        throw joinError;
      }

      // Member count is kept up to date by the database.
      // 2. Redirect to chat
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || isCreating) return;

    setIsCreating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { setIsCreating(false); return; }

    setCreateError(null);
    const { data, error } = await supabase.rpc("create_study_group", {
      p_name: newGroupName.trim(),
      p_description: newGroupDesc.trim(),
      p_is_private: newGroupPrivate,
    });
    const created = Array.isArray(data) ? data[0] : data;
    if (error || !created) {
      console.error("Error creating group:", error);
      setCreateError("The group couldn't be created. Please try again.");
      setIsCreating(false);
      return;
    }
    setIsModalOpen(false);
    setIsCreating(false);
    router.push(`/groups/${created.id}`);
  };

  const openInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inviteInput.trim().split("/").filter(Boolean).pop();
    if (code) router.push(`/groups/join/${code}`);
  };

  const matches = (g: StudyGroup) =>
    `${g.name} ${g.description || ""}`.toLowerCase().includes(searchQuery.toLowerCase());
  const displayYourGroups = yourGroups.filter(matches);
  const displayDiscoverGroups = discoverGroups.filter(matches);

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-32">
      {/* Header */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="font-headline text-4xl font-bold mb-2">Study Groups</h1>
          <p className="text-on-surface-variant/60 font-body">Collaborate and learn together</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-surface-container-high border border-outline-variant/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="font-headline text-2xl font-bold mb-6">Create New Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant/40 mb-2 uppercase tracking-[0.2em] px-1">Group Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Constitutional Law Study Circle"
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 outline-none focus:border-primary/50 transition-all text-on-surface"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant/40 mb-2 uppercase tracking-[0.2em] px-1">Description</label>
                <textarea 
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="What is this group all about?"
                  rows={3}
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 outline-none focus:border-primary/50 transition-all resize-none text-on-surface"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer select-none px-1">
                <input
                  type="checkbox"
                  checked={newGroupPrivate}
                  onChange={(e) => setNewGroupPrivate(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[var(--primary)]"
                />
                <span>
                  <span className="block text-sm font-bold text-on-surface">Private group</span>
                  <span className="block text-xs text-on-surface-variant/70">Hidden from Discover. People can only join with your invite link.</span>
                </span>
              </label>
              {createError && <p className="text-sm text-red-600 font-medium px-1">{createError}</p>}
              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-outline-variant/10 font-bold hover:bg-surface-container-low transition-all text-on-surface-variant"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newGroupName.trim() || isCreating}
                  className="flex-[2] px-8 py-4 bg-primary rounded-xl font-bold text-white hover:bg-primary-container transition-all disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study groups..."
          className="w-full bg-surface-container-low border border-outline-variant/5 rounded-2xl py-5 pl-12 pr-6 outline-none focus:border-primary/30 transition-colors text-on-surface"
        />
      </div>

      {/* Join with an invite link */}
      <form onSubmit={openInvite} className="flex gap-3 mb-12 -mt-6">
        <input
          value={inviteInput}
          onChange={(e) => setInviteInput(e.target.value)}
          placeholder="Have an invite link? Paste it here"
          className="flex-1 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 outline-none focus:border-primary/30 text-sm text-on-surface"
        />
        <button type="submit" disabled={!inviteInput.trim()} className="px-5 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm disabled:opacity-40">
          Join
        </button>
      </form>

      {/* Your Groups */}
      <section className="mb-16">
        <h2 className="font-headline text-xl font-bold mb-6 text-on-surface">Your Groups</h2>
        <div className="space-y-4">
          {displayYourGroups.length === 0 ? (
            <p className="text-on-surface-variant/40 text-sm italic ml-4 font-body">You haven&apos;t joined any groups yet.</p>
          ) : (
            displayYourGroups.map(group => (
              <Link 
                key={group.id} 
                href={`/groups/${group.id}`}
                className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex items-center justify-between group hover:border-primary/30 transition-all hover:bg-surface-container-low shadow-sm"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors text-on-surface">{group.name}</h3>
                      {group.is_private && <Lock className="w-3.5 h-3.5 text-on-surface-variant/40" />}
                    </div>
                    <p className="text-sm text-on-surface-variant/60 font-body">
                      {group.member_count} members <span className="mx-2 text-on-surface-variant/20">•</span> {group.last_active}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-outline-variant/40 group-hover:text-primary transition-colors" />
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Discover Groups */}
      <section>
        <h2 className="font-headline text-xl font-bold mb-6 text-on-surface">Discover Groups</h2>
        <div className="space-y-6">
          {displayDiscoverGroups.length === 0 && (
            <p className="text-on-surface-variant/40 text-sm italic ml-4 font-body">
              No public groups to discover yet. Create one with the + button.
            </p>
          )}
          {displayDiscoverGroups.map(group => (
            <div 
              key={group.id} 
              className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 md:p-10 shadow-sm hover:border-primary/20 transition-all"
            >
              <div className="flex items-start gap-8 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5 shrink-0">
                  <Users className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-headline font-bold text-2xl text-on-surface">{group.name}</h3>
                    {!group.is_private && <Globe className="w-4 h-4 text-on-surface-variant/40" />}
                  </div>
                  <p className="text-on-surface-variant/60 mb-6 max-w-2xl font-body text-lg leading-relaxed">{group.description}</p>
                  <div className="flex items-center gap-4">
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                      {group.topic}
                    </span>
                    <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
                      {group.member_count} members
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleJoin(group.id)}
                disabled={joiningId === group.id}
                className="w-full bg-primary py-5 rounded-2xl font-bold text-lg text-white hover:bg-primary-container shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
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
