"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, Send, ArrowLeft, Users, LogOut, Share2, Check, FileText, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { timeAgo } from "@/lib/community";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
}

interface Member {
  id: string;
  full_name: string;
  year_of_study: string | null;
  role: string;
}

interface Material {
  id: string;
  title: string;
  storage_path: string | null;
  external_url: string | null;
  uploaded_by: string;
  created_at: string;
}

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  invite_code: string | null;
}

interface PresenceState {
  user_id: string;
  name: string;
  typing: boolean;
}

type Access = "loading" | "member" | "can-join" | "no-access";

const MAX_FILE_MB = 25;

export default function GroupChatPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const supabaseRef = useRef(createClient());

  const [access, setAccess] = useState<Access>("loading");
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [online, setOnline] = useState<Record<string, PresenceState>>({});
  const [message, setMessage] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"members" | "materials">("members");
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const nameOf = useCallback(
    (userId: string) => members.find((m) => m.id === userId)?.full_name || online[userId]?.name || "Member",
    [members, online]
  );

  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  /* ── Load group, membership and history ─────────── */
  const loadGroup = useCallback(async () => {
    const supabase = supabaseRef.current;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=/groups/${groupId}`);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    setMe({ id: user.id, name: profile?.full_name || user.email?.split("@")[0] || "Me" });

    const { data: g } = await supabase
      .from("study_groups")
      .select("id, name, description, is_private, invite_code")
      .eq("id", groupId)
      .maybeSingle();
    if (!g) {
      setAccess("no-access");
      return;
    }
    setGroup(g as GroupInfo);

    const { data: mine } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!mine) {
      setAccess(g.is_private ? "no-access" : "can-join");
      return;
    }

    const [{ data: memberRows }, { data: messageRows }, { data: materialRows }] = await Promise.all([
      supabase.from("group_members").select("user_id, role").eq("group_id", groupId),
      supabase.from("group_messages").select("id, content, created_at, user_id").eq("group_id", groupId).order("created_at", { ascending: true }).limit(200),
      supabase.from("group_materials").select("id, title, storage_path, external_url, uploaded_by, created_at").eq("group_id", groupId).order("created_at", { ascending: false }),
    ]);

    const ids = (memberRows || []).map((m: { user_id: string }) => m.user_id);
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("id, full_name, year_of_study").in("id", ids)
      : { data: [] };
    const profileMap = new Map((profiles || []).map((p: { id: string; full_name: string | null; year_of_study: string | null }) => [p.id, p]));
    setMembers(
      (memberRows || []).map((m: { user_id: string; role: string | null }) => ({
        id: m.user_id,
        full_name: profileMap.get(m.user_id)?.full_name || "Member",
        year_of_study: profileMap.get(m.user_id)?.year_of_study || null,
        role: m.role || "member",
      }))
    );
    setMessages(
      (messageRows || []).map((m: { id: string; content: string; created_at: string; user_id: string }) => ({
        id: m.id,
        content: m.content,
        created_at: m.created_at,
        sender_id: m.user_id,
      }))
    );
    setMaterials((materialRows || []) as Material[]);
    setAccess("member");
    scrollToBottom();
  }, [groupId, router]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  /* ── Live: new messages, materials, presence and typing ── */
  useEffect(() => {
    if (access !== "member" || !me) return;
    const supabase = supabaseRef.current;
    const channel = supabase.channel(`group:${groupId}`, { config: { presence: { key: me.id } } });

    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${groupId}` }, (payload) => {
        const m = payload.new as { id: string; content: string; created_at: string; user_id: string };
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, { id: m.id, content: m.content, created_at: m.created_at, sender_id: m.user_id }]));
        scrollToBottom();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_materials", filter: `group_id=eq.${groupId}` }, (payload) => {
        const mat = payload.new as Material;
        setMaterials((prev) => (prev.some((x) => x.id === mat.id) ? prev : [mat, ...prev]));
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceState>();
        const next: Record<string, PresenceState> = {};
        Object.entries(state).forEach(([key, metas]) => {
          if (metas[0]) next[key] = metas[0];
        });
        setOnline(next);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        // Someone new arrived: refresh the member list if we don't know them yet.
        setMembers((prev) => {
          if (!prev.some((m) => m.id === key)) loadGroup();
          return prev;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ user_id: me.id, name: me.name, typing: false });
      });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [access, me, groupId, loadGroup]);

  const setTyping = (typing: boolean) => {
    if (!me || !channelRef.current || isTypingRef.current === typing) return;
    isTypingRef.current = typing;
    channelRef.current.track({ user_id: me.id, name: me.name, typing });
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
    setTyping(value.trim().length > 0);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(false), 2500);
  };

  /* ── Actions ─────────────────────────────────────── */
  const postMessage = async (content: string) => {
    if (!me) return false;
    const { data, error } = await supabaseRef.current
      .from("group_messages")
      .insert({ group_id: groupId, user_id: me.id, content })
      .select("id, content, created_at, user_id")
      .single();
    if (error || !data) {
      console.error("Error sending message:", error);
      return false;
    }
    setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, { id: data.id, content: data.content, created_at: data.created_at, sender_id: data.user_id }]));
    scrollToBottom();
    return true;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessage("");
    setTyping(false);
    if (!(await postMessage(text))) {
      setMessage(text);
      setNotice("Your message couldn't be sent. Please try again.");
    }
  };

  const handleJoin = async () => {
    if (!me) return;
    const { error } = await supabaseRef.current.from("group_members").insert({ group_id: groupId, user_id: me.id });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      setNotice("Couldn't join this group. Please try again.");
      return;
    }
    setAccess("loading");
    loadGroup();
  };

  const handleLeave = async () => {
    if (!me || !confirm("Leave this group? You can rejoin with an invite link.")) return;
    await supabaseRef.current.from("group_members").delete().eq("group_id", groupId).eq("user_id", me.id);
    router.push("/groups");
  };

  const handleShareLink = async () => {
    if (!group?.invite_code) {
      setNotice("Invite links will work once the database update has been applied.");
      return;
    }
    await navigator.clipboard.writeText(`${window.location.origin}/groups/join/${group.invite_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = async (file: File) => {
    if (!me) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setNotice(`Files must be ${MAX_FILE_MB} MB or smaller.`);
      return;
    }
    setUploading(true);
    const supabase = supabaseRef.current;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${groupId}/${Date.now()}_${safeName}`;
    const { error: uploadError } = await supabase.storage.from("group-materials").upload(path, file, { contentType: file.type || undefined });
    if (uploadError) {
      console.error("Upload failed:", uploadError);
      setNotice("The file couldn't be uploaded. Please try again.");
      setUploading(false);
      return;
    }
    const { error: rowError } = await supabase.from("group_materials").insert({ group_id: groupId, title: file.name, storage_path: path, uploaded_by: me.id });
    if (rowError) console.error("Saving material failed:", rowError);
    await postMessage(`📎 Shared a file: ${file.name}`);
    setUploading(false);
    setSidebarTab("materials");
  };

  const openMaterial = async (mat: Material) => {
    if (mat.external_url) return window.open(mat.external_url, "_blank", "noopener");
    if (!mat.storage_path) return;
    const { data, error } = await supabaseRef.current.storage.from("group-materials").createSignedUrl(mat.storage_path, 60 * 10);
    if (error || !data) return setNotice("That file couldn't be opened.");
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const typers = Object.values(online).filter((p) => p.typing && p.user_id !== me?.id);
  const typingLabel =
    typers.length === 0 ? "" : typers.length === 1 ? `${typers[0].name} is typing…` : typers.length === 2 ? `${typers[0].name} and ${typers[1].name} are typing…` : "Several people are typing…";
  const onlineCount = Object.keys(online).length;

  /* ── Gate screens ────────────────────────────────── */
  if (access === "loading") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant font-serif italic gap-3">
        <Loader2 className="w-5 h-5 animate-spin" /> Opening group…
      </div>
    );
  }
  if (access === "no-access") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-8 text-center">
        <Lock className="w-10 h-10 text-on-surface-variant/50" />
        <p className="text-lg font-bold text-on-surface">This group is private or no longer exists.</p>
        <p className="text-on-surface-variant">Ask a member for an invite link to join.</p>
        <Link href="/groups" className="text-primary font-bold">Back to Study Groups</Link>
      </div>
    );
  }
  if (access === "can-join" && group) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">{group.name}</h1>
        {group.description && <p className="text-on-surface-variant max-w-md">{group.description}</p>}
        <button onClick={handleJoin} className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20">
          Join group
        </button>
        {notice && <p className="text-sm text-red-600">{notice}</p>}
      </div>
    );
  }

  /* ── Chat ────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-surface text-on-surface overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 border-r border-outline-variant/10">
        <header className="h-20 flex items-center justify-between px-6 bg-surface-container border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/groups" className="p-2.5 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h2 className="font-headline font-bold text-xl leading-tight text-on-surface truncate flex items-center gap-2">
                {group?.name}
                {group?.is_private && <Lock className="w-4 h-4 text-on-surface-variant/50" />}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <p className="text-[11px] text-on-surface-variant font-bold">
                  {onlineCount} online · {members.length} member{members.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleShareLink}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full text-xs font-bold transition-all border border-primary/10 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? "Invite link copied!" : "Copy invite link"}
          </button>
        </header>

        {notice && (
          <button onClick={() => setNotice(null)} className="bg-amber-50 text-amber-900 text-sm px-6 py-2 text-left border-b border-amber-200">
            {notice} <span className="opacity-60">(dismiss)</span>
          </button>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar bg-surface">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-on-surface-variant gap-2">
              <Users className="w-10 h-10 opacity-40" />
              <p className="font-serif italic text-lg">No messages yet. Start the discussion!</p>
              <p className="text-sm">Use “Copy invite link” to bring classmates in.</p>
            </div>
          )}
          {messages.map((m) => {
            const isMine = m.sender_id === me?.id;
            return (
              <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                {!isMine && <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 mb-1.5 ml-1">{nameOf(m.sender_id)}</span>}
                <div
                  className={`max-w-[80%] md:max-w-[70%] px-5 py-3.5 rounded-2xl shadow-sm ${
                    isMine ? "bg-primary text-white rounded-tr-none" : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/5"
                  }`}
                >
                  <p className="leading-relaxed text-[15px] whitespace-pre-wrap break-words">{m.content}</p>
                  <span className={`text-[10px] font-bold mt-1.5 block opacity-50 ${isMine ? "text-right" : "text-left"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-6 pt-2 pb-6 bg-surface-container border-t border-outline-variant/10 shrink-0">
          <p className="h-5 text-xs text-primary font-semibold mb-1 max-w-5xl mx-auto">{typingLabel}</p>
          <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-5xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Share a file"
              className="p-3.5 hover:bg-surface-container-high rounded-2xl text-on-surface-variant transition-colors border border-outline-variant/10 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={() => setTyping(false)}
              placeholder="Share your legal insights..."
              className="flex-1 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl py-4 px-6 text-[15px] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-on-surface"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              aria-label="Send"
              className="p-4 bg-primary hover:bg-primary-container rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col bg-surface-container-low shrink-0">
        <div className="p-8 border-b border-outline-variant/10 text-center">
          <div className="w-20 h-20 mx-auto rounded-[1.75rem] bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Users className="w-9 h-9" />
          </div>
          <h2 className="font-headline font-bold text-xl mb-1 text-on-surface">{group?.name}</h2>
          {group?.description && <p className="text-sm text-on-surface-variant/70 mb-5">{group.description}</p>}
          <button
            onClick={handleLeave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-outline-variant/20 text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-all"
          >
            <LogOut className="w-4 h-4" /> Leave group
          </button>
        </div>

        <div className="flex gap-1 m-4 p-1 bg-surface-container rounded-xl">
          {(["members", "materials"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSidebarTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize ${sidebarTab === tab ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant"}`}
            >
              {tab} ({tab === "members" ? members.length : materials.length})
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar space-y-1.5">
          {sidebarTab === "members" &&
            [...members]
              .sort((a, b) => Number(!!online[b.id]) - Number(!!online[a.id]))
              .map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-primary">
                      {member.full_name.charAt(0).toUpperCase()}
                    </div>
                    {online[member.id] && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-low" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-on-surface">
                      {member.full_name}
                      {member.id === me?.id && <span className="text-on-surface-variant font-normal"> (you)</span>}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {online[member.id]?.typing ? "typing…" : online[member.id] ? "online" : member.year_of_study || "offline"}
                      {member.role === "owner" && " · owner"}
                    </p>
                  </div>
                </div>
              ))}

          {sidebarTab === "materials" && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full mb-2 py-3 rounded-xl border-2 border-dashed border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "+ Share a file"}
              </button>
              {materials.length === 0 && <p className="text-sm text-on-surface-variant/70 text-center py-6">No materials shared yet.</p>}
              {materials.map((mat) => (
                <button key={mat.id} onClick={() => openMaterial(mat)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate text-on-surface">{mat.title}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {nameOf(mat.uploaded_by)} · {timeAgo(mat.created_at)}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
