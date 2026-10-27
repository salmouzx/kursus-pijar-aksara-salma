"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  CornerDownRight,
  ShieldCheck,
  Award,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  PlusCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  DiscussionItem,
  DiscussionAnswer,
  getDiscussionsByModule,
  fetchDiscussionsFromDB,
  createDiscussionQuestion,
  createDiscussionAnswer,
  toggleUpvoteDiscussion,
} from "@/lib/module-discussions";
import { useAuth } from "@/lib/auth-context";

interface ModuleDiscussionForumProps {
  modulId: string;
  courseSlug: string;
  modulUrutan: number;
  modulJudul: string;
}

export function ModuleDiscussionForum({
  modulId,
  courseSlug,
  modulUrutan,
  modulJudul,
}: ModuleDiscussionForumProps) {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);

  // Form State
  const [judulInput, setJudulInput] = useState("");
  const [isiInput, setIsiInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply State
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Upvoted IDs in session
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Load discussions and listen to updates
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      // Muat instan dari cache lokal dulu
      const cached = getDiscussionsByModule(modulId, courseSlug, modulUrutan);
      if (isMounted && cached.length > 0) {
        setDiscussions(cached);
      }
      // Sinkronkan data terbaru dari server / database Supabase
      const fromDB = await fetchDiscussionsFromDB(modulId, courseSlug, modulUrutan);
      if (isMounted && fromDB && fromDB.length > 0) {
        setDiscussions(fromDB);
      }
    };
    load();

    const handleUpdate = () => load();
    window.addEventListener("discussion_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("discussion_updated", handleUpdate);
    };
  }, [modulId, courseSlug, modulUrutan]);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulInput.trim() || !isiInput.trim()) return;

    setIsSubmitting(true);
    await createDiscussionQuestion({
      modulId,
      courseSlug,
      modulUrutan,
      userId: currentUser?.id || "user-" + Math.random().toString(36).substring(2, 7),
      userName: currentUser?.nama || "Peserta Pijar",
      userRole: currentUser?.peran || "peserta",
      judul: judulInput,
      isi: isiInput,
    });

    setIsSubmitting(false);
    setJudulInput("");
    setIsiInput("");
    setIsQuestionFormOpen(false);
  };

  const handlePostAnswer = async (discussionId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    setIsSubmittingReply(true);
    const isStaff = currentUser?.peran === "instruktur" || currentUser?.peran === "admin";
    await createDiscussionAnswer({
      discussionId,
      userId: currentUser?.id || "user-" + Math.random().toString(36).substring(2, 7),
      userName: currentUser?.nama || (isStaff ? "Instruktur Resmi" : "Peserta Pijar"),
      userRole: currentUser?.peran || "peserta",
      isOfficialAnswer: isStaff,
      isi: replyInput,
    });

    setIsSubmittingReply(false);
    setReplyInput("");
    setReplyOpenId(null);
  };

  const handleUpvote = (id: string) => {
    if (upvotedIds.has(id)) return;
    toggleUpvoteDiscussion(id);
    setUpvotedIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="bg-white rounded-[28px] border border-zinc-200/90 shadow-sm p-5 sm:p-7 space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="p-1 rounded-md bg-[#58816D]/15 text-[#58816D]">
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#58816D]">
              Forum Tanya Jawab Modul {modulUrutan}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#1F382B]">
            Diskusi Materi & Tanya Instruktur
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ajukan pertanyaan terkait materi {modulJudul} atau diskusikan studi kasus bersama rekan belajar.
          </p>
        </div>

        <button
          onClick={() => setIsQuestionFormOpen(!isQuestionFormOpen)}
          className="px-4 py-2 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-[#456655]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{isQuestionFormOpen ? "Tutup Form" : "Tanya Instruktur"}</span>
        </button>
      </div>

      {/* Form Input Pertanyaan Baru */}
      {isQuestionFormOpen && (
        <form onSubmit={handlePostQuestion} className="p-4 sm:p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200/90 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1F382B] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#58816D]" />
              Ajukan Pertanyaan Baru Seputar Modul {modulUrutan}
            </span>
            <span className="text-[11px] text-zinc-400">
              Bertanya sebagai: <strong className="text-zinc-700">{currentUser?.nama || "Tamu"}</strong>
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
              Judul Pokok Pertanyaan
            </label>
            <input
              type="text"
              required
              value={judulInput}
              onChange={(e) => setJudulInput(e.target.value)}
              placeholder="Contoh: Kapan harus menggunakan rumus VLOOKUP daripada XLOOKUP?"
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
              Rincian Pertanyaan / Kendala yang Dihadapi
            </label>
            <textarea
              required
              rows={3}
              value={isiInput}
              onChange={(e) => setIsiInput(e.target.value)}
              placeholder="Jelaskan langkah yang sudah Anda coba atau bagian materi video yang kurang dipahami..."
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsQuestionFormOpen(false)}
              className="px-4 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-1.5 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Mengirim..." : "Kirim Pertanyaan"}</span>
            </button>
          </div>
        </form>
      )}

      {/* List Diskusi */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-8 p-6 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-zinc-500 text-xs space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="font-semibold text-zinc-700">Belum ada diskusi di modul ini</p>
            <p className="text-[11px] text-zinc-400">Jadilah yang pertama mengajukan pertanyaan kepada pengajar!</p>
          </div>
        ) : (
          discussions.map((disc) => {
            const isUpvoted = upvotedIds.has(disc.id);
            const isReplyOpen = replyOpenId === disc.id;

            return (
              <div
                key={disc.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50/60 border border-zinc-200/80 space-y-3.5 hover:border-[#58816D]/40 transition-all"
              >
                {/* Header User Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#58816D]/15 text-[#1F382B] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#58816D]/20 overflow-hidden relative">
                      {disc.userAvatar ? (
                        <Image
                          src={disc.userAvatar}
                          alt={disc.userName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span>{disc.userName.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">{disc.userName}</span>
                        {disc.userRole === "instruktur" ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            👨‍🏫 Instruktur
                          </span>
                        ) : disc.userRole === "admin" ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            🛡️ Admin
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700">
                            Peserta
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {new Date(disc.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Upvote Button */}
                  <button
                    type="button"
                    onClick={() => handleUpvote(disc.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                      isUpvoted
                        ? "bg-[#58816D] text-white border-[#58816D]"
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-[#58816D]"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{disc.upvotes}</span>
                  </button>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
                    {disc.judul}
                  </h4>
                  <p className="text-xs text-zinc-700 mt-1 leading-relaxed whitespace-pre-line">
                    {disc.isi}
                  </p>
                </div>

                {/* Action button row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setReplyOpenId(isReplyOpen ? null : disc.id)}
                    className="text-xs font-bold text-[#58816D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>{disc.jawaban.length > 0 ? `${disc.jawaban.length} Tanggapan` : "Beri Balasan"}</span>
                  </button>
                </div>

                {/* Nested Answers List */}
                {disc.jawaban.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-zinc-200/60 pl-3 sm:pl-5 border-l-2 border-l-[#58816D]/30">
                    {disc.jawaban.map((ans) => (
                      <div
                        key={ans.id}
                        className={`p-3 sm:p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          ans.isOfficialAnswer
                            ? "bg-emerald-50/70 border-emerald-200/90 text-emerald-950"
                            : "bg-white border-zinc-200/80 text-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{ans.userName}</span>
                            {ans.isOfficialAnswer && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                Jawaban Resmi Instruktur
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(ans.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line text-zinc-700">
                          {ans.isi}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Form */}
                {isReplyOpen && (
                  <form
                    onSubmit={(e) => handlePostAnswer(disc.id, e)}
                    className="pt-2 flex items-center gap-2 animate-in fade-in"
                  >
                    <input
                      type="text"
                      required
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder={
                        currentUser?.peran === "instruktur"
                          ? "Tulis balasan resmi instruktur..."
                          : "Tulis balasan atau saran Anda..."
                      }
                      className="flex-1 px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReply}
                      className="px-4 py-2 bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>Balas</span>
                    </button>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
