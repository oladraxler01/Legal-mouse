/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Paperclip, 
  Send, 
  MoreVertical, 
  ArrowLeft,
  Users,
  LogOut
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

export default function GroupChatPage() {
  const params = useParams();
  const groupId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("Loading...");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Fetch Group Info
      const { data: group } = await supabase
        .from("study_groups")
        .select("name")
        .eq("id", groupId)
        .single();
      if (group) setGroupName(group.name);

      // Fetch Members
      const { data: memberData } = await supabase
        .from("group_members")
        .select("profiles(id, full_name, year_of_study)")
        .eq("group_id", groupId);

      if (memberData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMembers(memberData.map((m: any) => ({
          id: (m as any).profiles.id,
          full_name: (m as any).profiles.full_name,
          year_of_study: (m as any).profiles.year_of_study,
          is_online: true // Mocked
        })));
      }

      // Fetch Messages history
      const { data: messageData } = await supabase
        .from("group_messages")
        .select(`
          id, 
          content, 
          created_at, 
          sender_id,
          profiles(full_name)
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (messageData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMessages(messageData.map((m: any) => ({
          id: m.id,
          content: m.content,
          created_at: m.created_at,
          sender_id: m.sender_id,
          sender_name: (m as any).profiles.full_name
        })));
      } else {
        // Mock some history if empty
        setMessages([
          { id: "m1", content: "Hey everyone! Does anyone have notes on the Donoghue v Stevenson ratio?", created_at: new Date().toISOString(), sender_id: "other1", sender_name: "Sarah Jenkins" },
          { id: "m2", content: "I have the summary from last week's lecture, sending it now.", created_at: new Date().toISOString(), sender_id: "other2", sender_name: "Mark Wood" },
        ]);
      }
    };

    fetchInitialData();
    const supabase = createClient();
    
    // Subscribe to messages
    const channel = supabase
      .channel(`group:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newMessage = payload.new as { id: string; content: string; created_at: string; sender_id: string };
          setMessages((prev) => [...prev, {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            sender_id: newMessage.sender_id,
            sender_name: "User" 
          }]);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-[#000000] text-white overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-900">
        {/* Chat Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#0A0A0A] border-b border-zinc-900 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/groups" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="font-bold text-lg leading-tight">{groupName}</h2>
              <p className="text-xs text-[#7C3AED] font-medium uppercase tracking-wider">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-zinc-500" />
          </button>
        </header>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] to-[#000000]">
          {messages.map((m) => {
            const isMine = m.sender_id === currentUserId;
            return (
              <div 
                key={m.id} 
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                {!isMine && (
                  <span className="text-xs text-zinc-500 mb-1 ml-1 font-medium">{m.sender_name}</span>
                )}
                <div 
                  className={`max-w-[70%] p-4 rounded-2xl shadow-lg relative ${
                    isMine 
                      ? "bg-[#7C3AED] text-white rounded-tr-none" 
                      : "bg-[#1A1A1A] text-zinc-200 rounded-tl-none"
                  }`}
                >
                  <p className="font-serif leading-relaxed text-[17px] tracking-wide" style={{ fontFamily: 'var(--font-crimson)' }}>
                    {m.content}
                  </p>
                  <span className={`text-[10px] mt-2 block opacity-50 ${isMine ? "text-right" : "text-left"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-[#0A0A0A] border-t border-zinc-900 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-6xl mx-auto">
            <button type="button" className="p-3 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-[#000000] border border-zinc-800 rounded-xl py-3.5 px-5 text-sm outline-none focus:border-[#7C3AED]/50 transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="p-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex w-80 flex-col bg-[#0A0A0A] shrink-0">
        <div className="p-8 border-b border-zinc-900">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 text-center">About Group</h3>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#1A1A1A] flex items-center justify-center text-[#7C3AED] mb-4 shadow-2xl">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="font-bold text-xl mb-1">{groupName}</h2>
            <p className="text-sm text-zinc-500 mb-6">{members.length} Members total</p>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
              Leave Group
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-4 px-4">Members</h3>
          <div className="space-y-1">
            {members.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 rounded-2xl transition-all group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center font-bold text-sm text-[#7C3AED] border border-zinc-800">
                    {member.full_name.charAt(0)}
                  </div>
                  {member.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate">{member.full_name}</h4>
                  <span className="inline-block bg-[#7C3AED]/10 text-[#7C3AED] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter mt-1">
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
