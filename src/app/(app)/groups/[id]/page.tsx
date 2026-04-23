"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Paperclip, 
  Send, 
  MoreVertical, 
  ArrowLeft,
  Users,
  LogOut,
  Share2,
  Check
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
}

interface Member {
  id: string;
  full_name: string;
  year_of_study: string;
  is_online: boolean;
}

interface GroupMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  group_id: string;
}

export default function GroupChatPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("Loading...");
  const [showShareAlert, setShowShareAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // 1. Fetch Group Info
      const { data: group } = await supabase
        .from("study_groups")
        .select("name")
        .eq("id", groupId)
        .single();
      
      if (group) setGroupName(group.name);
      else setGroupName("Study Group"); // Fallback

      // 2. Fetch Members
      const { data: memberData } = await supabase
        .from("group_members")
        .select("profiles(id, full_name, year_of_study)")
        .eq("group_id", groupId);

      if (memberData) {
        setMembers(memberData.map((m: any) => ({
          id: m.profiles.id,
          full_name: m.profiles.full_name,
          year_of_study: m.profiles.year_of_study,
          is_online: true
        })));
      }

      // 3. Logic Task 2: Fetch last 50 messages
      const { data: messageData, error: msgError } = await supabase
        .from("group_messages")
        .select(`id, content, created_at, user_id`)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (msgError) {
        console.error("Error fetching messages:", msgError);
      } else if (messageData && messageData.length > 0) {
        const userIds = Array.from(new Set(messageData.map(m => m.user_id)));
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        
        const profileMap = (profiles || []).reduce((acc: any, p: any) => {
          acc[p.id] = p.full_name;
          return acc;
        }, {});

        setMessages(messageData.map((m: any) => ({
          id: m.id,
          content: m.content,
          created_at: m.created_at,
          sender_id: m.user_id,
          sender_name: profileMap[m.user_id] || "Unknown User"
        })));
      } else {
        setMessages([
          { id: "00000000-0000-0000-0000-000000000003", content: "Welcome to the group! Let's start discussing legal cases.", created_at: new Date().toISOString(), sender_id: "system", sender_name: "Legal Mouse" },
        ]);
      }
    };

    fetchInitialData();
    
    // 4. Realtime Subscription
    const channel = supabase
      .channel(`group-chat:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMessage = payload.new as GroupMessage;
          
          // Fetch sender name for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", newMessage.user_id)
            .single();

          setMessages((prev) => [...prev, {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            sender_id: newMessage.user_id,
            sender_name: profile?.full_name || "New Member"
          }]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || !currentUserId) return;

    const currentMsg = message;
    setMessage(""); // Optimistic clear

    const supabase = createClient();
    const { error } = await supabase
      .from("group_messages")
      .insert({
        group_id: groupId,
        user_id: currentUserId,
        content: currentMsg.trim()
      });

    if (error) {
      console.error("Error sending message:", error);
      alert(`Failed to send message: ${error.message || 'Database error'}. Make sure you are a member of this group.`);
      setMessage(currentMsg); // Restore on error
    } else {
      scrollToBottom();
    }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/groups/${groupId}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowShareAlert(true);
      setTimeout(() => setShowShareAlert(false), 2000);
    });
  };

  return (
    <div className="flex h-screen bg-surface text-on-surface overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-outline-variant/10">
        {/* Chat Header */}
        <header className="h-20 flex items-center justify-between px-6 bg-surface-container border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/groups" className="p-2.5 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="font-headline font-bold text-xl leading-tight text-on-surface">{groupName}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Active Discussion</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full text-xs font-bold transition-all border border-primary/10"
            >
              {showShareAlert ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {showShareAlert ? "Copied!" : "Share Link"}
            </button>
            <button className="p-2.5 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-surface">
          {messages.map((m) => {
            const isMine = m.sender_id === currentUserId;
            return (
              <div 
                key={m.id} 
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                {!isMine && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/40 mb-1.5 ml-1">{m.sender_name}</span>
                )}
                <div 
                  className={`max-w-[80%] md:max-w-[70%] p-5 rounded-2xl shadow-sm relative ${
                    isMine 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/5"
                  }`}
                >
                  <p className="font-serif leading-relaxed text-lg" style={{ fontFamily: 'var(--font-crimson)' }}>
                    {m.content}
                  </p>
                  <span className={`text-[9px] font-bold mt-2.5 block opacity-40 uppercase tracking-tighter ${isMine ? "text-right" : "text-left"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6 bg-surface-container border-t border-outline-variant/10 shrink-0">
          <form 
            onSubmit={handleSendMessage} 
            className="flex items-center gap-4 max-w-5xl mx-auto"
          >
            <button type="button" className="p-3.5 hover:bg-surface-container-high rounded-2xl text-on-surface-variant transition-colors border border-outline-variant/10">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Share your legal insights..."
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl py-4.5 px-6 text-[15px] outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-on-surface"
              />
            </div>
            <button 
              type="submit" 
              disabled={!message.trim()}
              className="p-4 bg-primary hover:bg-primary-container rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex w-85 flex-col bg-surface-container-low shrink-0 border-l border-outline-variant/5">
        <div className="p-10 border-b border-outline-variant/10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 mb-8 text-center">Study Group</h3>
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-xl border border-primary/5">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="font-headline font-bold text-2xl mb-2 text-on-surface">{groupName}</h2>
            <p className="text-sm font-body text-on-surface-variant/60 mb-8">{members.length} Intellectuals active</p>
            <button className="flex items-center gap-3 px-8 py-3 rounded-full border border-outline-variant/20 text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-all">
              <LogOut className="w-4 h-4" />
              Leave Group
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/30">Members List</h3>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{members.length}</span>
          </div>
          <div className="space-y-2">
            {members.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center gap-4 p-4 hover:bg-surface-container rounded-2xl transition-all group border border-transparent hover:border-outline-variant/10"
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center font-headline font-bold text-sm text-primary border border-outline-variant/10">
                    {member.full_name.charAt(0)}
                  </div>
                  {member.is_online && (
                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-surface-container-low shadow-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate text-on-surface">{member.full_name}</h4>
                  <span className="inline-block text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-tighter mt-0.5">
                    {member.year_of_study}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
