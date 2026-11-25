"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, Send, ArrowLeft, Users, LogOut, Share2, Check, FileText, Lock, Loader2, Mic, Smile, Reply, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { timeAgo } from "@/lib/community";
import { recordActivity } from "@/lib/activity";
import { EmojiPicker, VoiceNotePlayer, formatDuration } from "./ChatExtras";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  reply_to_id: string | null;
  kind: "text" | "voice";
  media_path: string | null;
  media_duration: number | null;
}

interface MessageRow {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  reply_to_id?: string | null;
  kind?: string | null;
  media_path?: string | null;
  media_duration?: number | null;
}

const MESSAGE_COLUMNS = "id, content, created_at, user_id, reply_to_id, kind, media_path, media_duration";
const BASIC_MESSAGE_COLUMNS = "id, content, created_at, user_id";
const MAX_VOICE_SECONDS = 120;
/** Current time in ms (kept outside the component so it is only ever called from event handlers). */
const nowMs = () => Date.now();

function toMessage(m: MessageRow): Message {
  return {
    id: m.id,
    content: m.content,
    created_at: m.created_at,
    sender_id: m.user_id,
    reply_to_id: m.reply_to_id ?? null,
    kind: m.kind === "voice" ? "voice" : "text",
    media_path: m.media_path ?? null,
    media_duration: m.media_duration ?? null,
  };
}

function snippet(m: Message) {
  return m.kind === "voice" ? "🎤 Voice note" : m.content.length > 90 ? m.content.slice(0, 90) + "…" : m.content;
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
  const [chatClient] = useState(createClient);

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
  // Replies, emoji and voice notes
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [sendingVoice, setSendingVoice] = useState(false);
  const chatV2Ref = useRef(true); // false until the replies/voice SQL has been run
  const inputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef = useRef(0);

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

    const [{ data: memberRows }, { data: firstMessageRows, error: messageError }, { data: materialRows }] = await Promise.all([
      supabase.from("group_members").select("user_id, role").eq("group_id", groupId),
      supabase.from("group_messages").select(MESSAGE_COLUMNS).eq("group_id", groupId).order("created_at", { ascending: true }).limit(200),
      supabase.from("group_materials").select("id, title, storage_path, external_url, uploaded_by, created_at").eq("group_id", groupId).order("created_at", { ascending: false }),
    ]);

    // Before the replies/voice SQL is run, those columns don't exist: fall back to plain messages.
    let messageRows = firstMessageRows as MessageRow[] | null;
    if (messageError) {
      chatV2Ref.current = false;
      const { data } = await supabase.from("group_messages").select(BASIC_MESSAGE_COLUMNS).eq("group_id", groupId).order("created_at", { ascending: true }).limit(200);
      messageRows = data as MessageRow[] | null;
    }

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
    setMessages((messageRows || []).map(toMessage));
    setMaterials((materialRows || []) as Material[]);
    setAccess("member");
    recordActivity({ kind: "group", title: g.name, subtitle: "Study group", href: `/groups/${groupId}`, itemKey: `group:${groupId}` });
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
        const m = toMessage(payload.new as MessageRow);
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
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
  const postMessage = async (
    content: string,
    extra: { reply_to_id?: string | null; kind?: "text" | "voice"; media_path?: string; media_duration?: number } = {}
  ) => {
    if (!me) return false;
    const v2 = chatV2Ref.current;
    const row = v2 ? { group_id: groupId, user_id: me.id, content, ...extra } : { group_id: groupId, user_id: me.id, content };
    const { data, error } = await supabaseRef.current
      .from("group_messages")
      .insert(row)
      .select(v2 ? MESSAGE_COLUMNS : BASIC_MESSAGE_COLUMNS)
      .single();
    if (error || !data) {
      console.error("Error sending message:", error);
      return false;
    }
    const m = toMessage(data as unknown as MessageRow);
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    scrollToBottom();
    return true;
  };

  /* ── Replies ─────────────────────────────────────── */
  const startReply = (m: Message) => {
    if (!chatV2Ref.current) {
      setNotice("Replies will work once the latest group chat database update has been run.");
      return;
    }
    setReplyTo(m);
    setActiveMsgId(null);
    inputRef.current?.focus();
  };

  const jumpTo = (id: string) => {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 1600);
  };

  /* ── Emoji ───────────────────────────────────────── */
  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? message.length;
    const end = el?.selectionEnd ?? message.length;
    const next = message.slice(0, start) + emoji + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  /* ── Voice notes ─────────────────────────────────── */
  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = null;
  };

  const startRecording = async () => {
    if (!chatV2Ref.current) {
      setNotice("Voice notes will work once the latest group chat database update has been run.");
      return;
    }
    if (typeof window === "undefined" || !navigator.mediaDevices || typeof MediaRecorder === "undefined") {
      setNotice("Voice notes aren't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.start(250);
      recorderRef.current = recorder;
      recordStartRef.current = nowMs();
      setRecordSeconds(0);
      setRecording(true);
      recordTimerRef.current = setInterval(() => {
        const secs = Math.floor((nowMs() - recordStartRef.current) / 1000);
        setRecordSeconds(secs);
        if (secs >= MAX_VOICE_SECONDS) finishRecording(true);
      }, 250);
    } catch {
      setNotice("Microphone access was blocked. Allow the microphone in your browser settings to send voice notes.");
      stopTracks();
    }
  };

  const finishRecording = (send: boolean) => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorderRef.current = null;
    const duration = Math.max(1, Math.round((nowMs() - recordStartRef.current) / 1000));
    recorder.onstop = async () => {
      stopTracks();
      setRecording(false);
      if (!send || !me) return;
      const type = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      if (blob.size < 1000) return; // too short to be useful
      setSendingVoice(true);
      const ext = type.includes("mp4") ? "m4a" : "webm";
      const path = `${groupId}/voice/${nowMs()}_${me.id}.${ext}`;
      const { error } = await supabaseRef.current.storage.from("group-materials").upload(path, blob, { contentType: type.split(";")[0] });
      if (error) {
        console.error("Voice upload failed:", error);
        setNotice("The voice note couldn't be sent. Please try again.");
      } else if (!(await postMessage("🎤 Voice note", { kind: "voice", media_path: path, media_duration: duration, reply_to_id: replyTo?.id ?? null }))) {
        setNotice("The voice note couldn't be sent. Please try again.");
      } else {
        setReplyTo(null);
      }
      setSendingVoice(false);
    };
    recorder.stop();
  };

  // Stop the microphone if the user leaves the page mid-recording.
  useEffect(() => () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessage("");
    setTyping(false);
    setShowEmoji(false);
    const replying = replyTo;
    setReplyTo(null);
    if (!(await postMessage(text, replying ? { reply_to_id: replying.id } : {}))) {
      setMessage(text);
      setReplyTo(replying);
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
    <div className="flex h-full bg-surface text-on-surface overflow-hidden">
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
            const original = m.reply_to_id ? messages.find((x) => x.id === m.reply_to_id) : null;
            const showActions = activeMsgId === m.id;
            return (
              <div key={m.id} id={`msg-${m.id}`} className={`group/msg flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                {!isMine && <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 mb-1.5 ml-1">{nameOf(m.sender_id)}</span>}
                <div className={`flex items-center gap-2 max-w-[85%] md:max-w-[70%] ${isMine ? "flex-row-reverse" : ""}`}>
                  <div
                    onClick={() => setActiveMsgId(showActions ? null : m.id)}
                    className={`min-w-0 px-4 py-3 rounded-2xl shadow-sm cursor-pointer transition-shadow ${
                      isMine ? "bg-primary text-white rounded-tr-none" : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/5"
                    } ${highlightId === m.id ? "ring-4 ring-amber-400/70" : ""}`}
                  >
                    {m.reply_to_id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (original) jumpTo(original.id);
                        }}
                        className={`block w-full text-left mb-2 rounded-lg px-3 py-2 border-l-4 ${
                          isMine ? "bg-white/15 border-white/70" : "bg-primary/10 border-primary"
                        }`}
                      >
                        <span className={`block text-[11px] font-bold ${isMine ? "text-white" : "text-primary"}`}>
                          {original ? (original.sender_id === me?.id ? "You" : nameOf(original.sender_id)) : "Message"}
                        </span>
                        <span className="block text-xs opacity-80 truncate">{original ? snippet(original) : "Original message unavailable"}</span>
                      </button>
                    )}
                    {m.kind === "voice" && m.media_path ? (
                      <VoiceNotePlayer path={m.media_path} duration={m.media_duration} supabase={chatClient} mine={isMine} />
                    ) : (
                      <p className="leading-relaxed text-[15px] whitespace-pre-wrap break-words">{m.content}</p>
                    )}
                    <span className={`text-[10px] font-bold mt-1 block opacity-50 ${isMine ? "text-right" : "text-left"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => startReply(m)}
                    aria-label="Reply to this message"
                    title="Reply"
                    className={`shrink-0 p-2 rounded-full bg-surface-container text-on-surface-variant hover:text-primary transition-opacity ${
                      showActions ? "opacity-100" : "opacity-0 group-hover/msg:opacity-100 focus:opacity-100"
                    }`}
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-6 pt-2 pb-6 bg-surface-container border-t border-outline-variant/10 shrink-0">
          <p className="h-5 text-xs text-primary font-semibold mb-1 max-w-5xl mx-auto">{typingLabel}</p>

          {/* Replying-to bar */}
          {replyTo && (
            <div className="max-w-5xl mx-auto mb-2 flex items-center gap-3 rounded-xl bg-surface-container-lowest border-l-4 border-primary px-4 py-2">
              <Reply className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary">Replying to {replyTo.sender_id === me?.id ? "yourself" : nameOf(replyTo.sender_id)}</p>
                <p className="text-xs text-on-surface-variant truncate">{snippet(replyTo)}</p>
              </div>
              <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply" className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 sm:gap-3 max-w-5xl mx-auto">
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

            {recording ? (
              /* Recording bar */
              <div className="flex-1 flex items-center gap-3 rounded-2xl bg-surface-container-lowest border border-red-500/30 px-4 py-3">
                <button type="button" onClick={() => finishRecording(false)} aria-label="Cancel voice note" className="p-2 rounded-full text-on-surface-variant hover:text-red-500">
                  <Trash2 className="w-5 h-5" />
                </button>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono font-bold text-on-surface">{formatDuration(recordSeconds)}</span>
                <span className="text-xs text-on-surface-variant truncate">Recording… max {MAX_VOICE_SECONDS / 60} min</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Share a file"
                  className="p-3 sm:p-3.5 hover:bg-surface-container-high rounded-2xl text-on-surface-variant transition-colors border border-outline-variant/10 disabled:opacity-50 shrink-0"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                </button>
                <div className="flex-1 relative min-w-0">
                  {showEmoji && <EmojiPicker onPick={insertEmoji} onClose={() => setShowEmoji(false)} />}
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onBlur={() => setTyping(false)}
                    placeholder={replyTo ? "Write your reply…" : "Share your legal insights..."}
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl py-3.5 sm:py-4 pl-4 pr-12 text-[15px] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmoji((v) => !v)}
                    aria-label="Add emoji"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${showEmoji ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {recording ? (
              <button
                type="button"
                onClick={() => finishRecording(true)}
                aria-label="Send voice note"
                className="p-3.5 sm:p-4 bg-primary hover:bg-primary-container rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all shrink-0"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            ) : message.trim() ? (
              <button
                type="submit"
                aria-label="Send"
                className="p-3.5 sm:p-4 bg-primary hover:bg-primary-container rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all shrink-0"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={sendingVoice}
                aria-label="Record a voice note"
                className="p-3.5 sm:p-4 bg-primary hover:bg-primary-container rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 shrink-0"
              >
                {sendingVoice ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
            )}
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
