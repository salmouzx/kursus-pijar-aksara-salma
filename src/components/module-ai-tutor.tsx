"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ModuleAiTutorProps {
  modulJudul: string;
  modulMateri: string;
  courseTitle: string;
  courseSlug: string;
  modulUrutan: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export function ModuleAiTutor({
  modulJudul,
  modulMateri,
  courseTitle,
  courseSlug,
  modulUrutan,
}: ModuleAiTutorProps) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text: `Halo ${currentUser?.nama || "Sobat Pijar"}! 👋\n\nSaya Tutor AI Pijar Aksara. Saya siap membantu Anda memahami konsep, rumus, atau studi kasus pada Modul ${modulUrutan}: ${modulJudul}.\n\nAda yang ingin Anda tanyakan seputar materi ini?`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [modulJudul, modulUrutan, currentUser?.nama, messages.length]);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          modulJudul,
          modulMateri,
          courseTitle,
          userName: currentUser?.nama || "Peserta",
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "Maaf, Tutor AI sedang memproses jawaban. Silakan coba ajukan pertanyaan kembali.";

      setMessages((prev) => [
        ...prev,
        {
          id: "ai-" + Date.now(),
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "ai-err-" + Date.now(),
          sender: "ai",
          text: "Terjadi gangguan saat menghubungi Tutor AI. Namun materi modul di atas tetap dapat Anda pelajari langsung.",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Saran pertanyaan cepat berdasarkan topik
  const quickSuggestions = [
    "Jelaskan rumus/konsep penting di modul ini",
    "Beda format Accounting dan Currency apa?",
    "Shortcut keyboard paling berguna",
    "Tips praktis agar lulus kuis modul ini",
  ];

  return (
    <>
      {/* Floating Action Button (Pojok Kanan Bawah) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-[#1F382B] via-[#58816D] to-[#1F382B] text-white font-bold text-xs shadow-2xl hover:shadow-[#58816D]/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-white/25 cursor-pointer group"
          title="Tanya Tutor AI seputar materi modul ini"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          </div>
          <span>Tanya Tutor AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Floating Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 sm:right-6 z-50 w-[calc(100vw-2.5rem)] sm:w-[420px] max-h-[600px] h-[82vh] bg-white rounded-[28px] shadow-2xl border border-zinc-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1F382B] to-[#58816D] text-white p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs text-white truncate">Tutor AI Pijar Aksara</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[9px] font-bold">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100/80 truncate">
                  Pendamping Modul {modulUrutan}: {modulJudul}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
              title="Tutup Obrolan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-[#58816D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 shadow-2xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#58816D] text-white rounded-br-xs font-medium"
                      : "bg-white text-zinc-800 border border-zinc-200/80 rounded-bl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {/* Render clean formatting without raw asterisks */}
                    {m.text.split("\n").map((line, i) => {
                      if (!line.trim()) {
                        return <div key={i} className="h-1.5" />;
                      }
                      if (line.startsWith("### ")) {
                        return (
                          <h4 key={i} className="font-extrabold text-sm text-[#1F382B] mt-2 mb-1">
                            {line.replace("### ", "")}
                          </h4>
                        );
                      }

                      // Parse inline bold (**kata**) dan inline code (`rumus`)
                      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
                      return (
                        <p key={i} className="my-0.5">
                          {parts.map((part, pIdx) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return (
                                <strong key={pIdx} className="font-extrabold text-zinc-950">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            if (part.startsWith("`") && part.endsWith("`")) {
                              return (
                                <code
                                  key={pIdx}
                                  className="px-1.5 py-0.5 rounded bg-zinc-100 text-emerald-800 font-mono text-[11px] font-bold border border-zinc-200/60"
                                >
                                  {part.slice(1, -1)}
                                </code>
                              );
                            }
                            return part;
                          })}
                        </p>
                      );
                    })}
                  </div>
                  <span
                    className={`text-[9px] block text-right ${
                      m.sender === "user" ? "text-emerald-100/70" : "text-zinc-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-[#58816D] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-zinc-200/80 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58816D] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58816D] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58816D] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-zinc-400 font-bold ml-1.5">Tutor AI sedang mengetik...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 pt-2 pb-1.5 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
            <span className="text-zinc-400 font-bold shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Tanya:
            </span>
            {quickSuggestions.map((s, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(s)}
                className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-[#58816D]/10 hover:text-[#58816D] text-zinc-700 whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-zinc-200/60"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-zinc-200/70 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan rumus atau materi ini..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-zinc-100 border border-transparent focus:border-[#58816D] focus:bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-9 h-9 rounded-2xl bg-[#58816D] hover:bg-[#456655] disabled:bg-zinc-200 text-white disabled:text-zinc-400 flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
              title="Kirim Peserta"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
