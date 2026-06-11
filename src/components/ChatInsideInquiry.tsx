import React, { useState, useEffect, useRef } from "react";
import { Send, User, MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface Message {
  id: string;
  inquiry_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatInsideInquiryProps {
  inquiryId: string;
  currentUserId: string;
  recipientName: string;
}

export const ChatInsideInquiry: React.FC<ChatInsideInquiryProps> = ({
  inquiryId,
  currentUserId,
  recipientName
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatsEndRef = useRef<HTMLDivElement>(null);

  // Fetch thread messages from Supabase
  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data as Message[]);
      }
    } catch (err) {
      console.error("Error fetching message history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Setup an interval for smooth polling to simulate instant messaging inside active conversation
    const interval = setInterval(() => {
      syncMessages();
    }, 4500);

    return () => clearInterval(interval);
  }, [inquiryId]);

  // Scroll to bottom on updates
  useEffect(() => {
    chatsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const syncMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });
      if (!error && data) {
        setMessages(data as Message[]);
      }
    } catch (e) {
      console.warn("Message sync fail:", e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const contentToSend = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          inquiry_id: inquiryId,
          sender_id: currentUserId,
          content: contentToSend
        })
        .select();

      if (error) throw error;
      
      if (data) {
        setMessages(prev => [...prev, ...data as Message[]]);
      }
    } catch (err) {
      console.error("Failed sending secure message:", err);
      // restore text on fail
      setNewMessage(contentToSend);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/65 rounded-2xl flex flex-col h-[400px] overflow-hidden shadow-xs hover:shadow-sm transition-all text-start">
      
      {/* Dynamic Header */}
      <div className="bg-slate-50 border-b border-slate-150 px-5 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-xs font-extrabold text-slate-700 tracking-tight">
            Chat with {recipientName}
          </span>
        </div>

        <button 
          onClick={syncMessages}
          className="text-slate-400 hover:text-green-mid p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          title="Refresh Feed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Render list of messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFCFA]">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs gap-1.5 font-medium">
            <div className="w-3 h-3 rounded-full border border-slate-300 border-t-slate-500 animate-spin" />
            Recalling communication logs...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center space-y-1.5 select-none">
            <MessageCircle className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <span className="text-xs font-bold text-slate-500">No Messages Yet</span>
            <p className="text-[10px] text-slate-400">Ask about rent terms, amenities, or negotiate viewing slots.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            return (
              <div 
                key={m.id} 
                className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div 
                  className={`py-2 px-3.5 rounded-2xl text-[12.5px] leading-relaxed shadow-xs ${
                    isMe 
                      ? "bg-green-mid text-white rounded-tr-none" 
                      : "bg-white text-slate-800 border border-slate-200/60 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                  {new Date(m.created_at).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatsEndRef} />
      </div>

      {/* Reply input control */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-3 shrink-0 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write secure message..."
          required
          maxLength={800}
          className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-mid text-slate-800 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="p-2 py-2 px-4 bg-green-mid hover:bg-green-dark text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
