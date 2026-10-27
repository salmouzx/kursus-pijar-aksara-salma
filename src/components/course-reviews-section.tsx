"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Award,
  ChevronDown,
  X,
  Send,
  ThumbsUp,
  UserCheck,
} from "lucide-react";
import {
  CourseReviewItem,
  getCourseReviews,
  getCourseRatingStats,
  submitCourseReview,
  fetchCourseReviewsFromDB,
} from "@/lib/course-reviews";
import { useAuth } from "@/lib/auth-context";

interface CourseReviewsSectionProps {
  courseId: string;
  courseJudul: string;
}

export function CourseReviewsSection({ courseId, courseJudul }: CourseReviewsSectionProps) {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<CourseReviewItem[]>([]);
  const [stats, setStats] = useState(getCourseRatingStats(courseId));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [nameInput, setNameInput] = useState(currentUser?.nama || "");
  const [roleInput, setRoleInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Load reviews on mount and listen to updates
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      // 1. Tampilkan dari cache cepat
      const cached = getCourseReviews(courseId);
      if (isMounted) {
        setReviews(cached);
        setStats(getCourseRatingStats(courseId));
      }

      // 2. Sinkronisasi data ulasan terbaru dari Supabase
      const fromDB = await fetchCourseReviewsFromDB(courseId);
      if (isMounted && fromDB && fromDB.length > 0) {
        setReviews(fromDB);
        // Hitung ulang statistik dari review server
        const total = fromDB.length;
        const starsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let sum = 0;
        fromDB.forEach((r) => {
          sum += r.rating;
          const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
          starsCount[star] = (starsCount[star] || 0) + 1;
        });
        setStats({
          average: Number((sum / total).toFixed(1)),
          total,
          starsCount,
        });
      }
    };
    load();

    const handleUpdate = () => load();
    window.addEventListener("course_review_added", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("course_review_added", handleUpdate);
    };
  }, [courseId]);

  // Sync logged in user name
  useEffect(() => {
    if (currentUser?.nama && !nameInput) {
      setNameInput(currentUser.nama);
    }
  }, [currentUser, nameInput]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !nameInput.trim()) return;

    setIsSubmitting(true);

    submitCourseReview({
      courseId,
      userId: currentUser?.id || "anon-" + Math.random().toString(36).substring(2, 7),
      userName: nameInput,
      userRole: roleInput.trim() || (currentUser?.peran === "peserta" ? "Alumni Terverifikasi" : "Peserta Kursus"),
      rating: ratingInput,
      komentar: commentInput,
      kursusJudul: courseJudul,
    });

    setIsSubmitting(false);
    setCommentInput("");
    setIsFormOpen(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 4000);
  };

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-zinc-200/90 shadow-sm space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#58816D]">
              Ulasan & Rating Peserta
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#1F382B]">
            Ulasan Lulusan & Kepuasan Kursus
          </h3>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#456655] shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>{isFormOpen ? "Tutup Form Ulasan" : "Tulis Ulasan & Beri Rating"}</span>
        </button>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Terima kasih! Ulasan dan rating Anda telah berhasil dipublikasikan untuk kursus ini.</span>
        </div>
      )}

      {/* Form Input Review Interaktif */}
      {isFormOpen && (
        <form onSubmit={handleSubmitReview} className="p-5 sm:p-6 bg-zinc-50/80 rounded-2xl border border-zinc-200/90 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1F382B] uppercase tracking-wider">
              Formulir Penilaian Kursus
            </h4>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Star Rating Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              Pilih Bintang Kepuasan (1 - 5)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || ratingInput) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRatingInput(star)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        active
                          ? "fill-amber-400 text-amber-500 drop-shadow-xs"
                          : "text-zinc-300"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-zinc-700 ml-2 font-mono">
                {ratingInput} dari 5 Bintang
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Profesi / Pekerjaan (Opsional)</label>
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="Contoh: Staf Administrasi / Pemilik Usaha"
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Ulasan Pengalaman Belajar</label>
            <textarea
              required
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Ceritakan bagaimana materi kursus ini membantu pekerjaan atau usaha Anda..."
              className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Mengirim..." : "Kirim Ulasan Sekarang"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Overview Rating Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-6 bg-zinc-50/70 rounded-2xl border border-zinc-200/70 items-center">
        {/* Left: Overall Big Score */}
        <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-zinc-200/80 pb-4 md:pb-0 md:pr-6">
          <div className="text-4xl sm:text-5xl font-black text-[#1F382B] tracking-tight">
            {stats.average.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(stats.average)
                    ? "fill-amber-400 text-amber-500"
                    : "text-zinc-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            Berdasarkan <strong>{stats.total} ulasan</strong> peserta resmi
          </span>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.starsCount[star as 1 | 2 | 3 | 4 | 5] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : star === 5 ? 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-zinc-600 font-bold flex items-center gap-1 shrink-0">
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-zinc-500 text-[11px] font-mono shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
          Ulasan Terbaru Peserta ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs">
            Belum ada ulasan untuk kursus ini. Jadilah yang pertama memberikan penilaian!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs hover:border-[#58816D]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#58816D]/15 text-[#1F382B] font-bold text-xs flex items-center justify-center shrink-0 border border-[#58816D]/30 overflow-hidden relative">
                        {rev.userAvatar ? (
                          <Image
                            src={rev.userAvatar}
                            alt={rev.userName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{rev.userName.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                          <span>{rev.userName}</span>
                          {rev.isVerifiedStudent && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#58816D] bg-[#58816D]/10 px-1.5 py-0.2 rounded-full border border-[#58816D]/20">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#58816D]" />
                              Terverifikasi
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {rev.userRole || "Alumni Kursus"}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badges */}
                    <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 px-2 py-1 rounded-full border border-amber-200/60">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-500"
                              : "text-zinc-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment text */}
                  <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                    &ldquo;{rev.komentar}&rdquo;
                  </p>
                </div>

                {/* Footer date */}
                <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>{new Date(rev.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="flex items-center gap-1 text-[#58816D] font-semibold">
                    <Award className="w-3 h-3" />
                    Sertifikat PA-2026
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
