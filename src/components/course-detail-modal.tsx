"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  Lock,
  FileText,
  Award,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Flame,
  Star,
} from "lucide-react";
import { Kursus } from "@/data/courses";
import { getCoursePriceInfo } from "@/lib/course-pricing";
import { getCourseRatingStats } from "@/lib/course-reviews";

interface CourseDetailModalProps {
  kursus: Kursus | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (kursus: Kursus) => void;
}

export function CourseDetailModal({ kursus, isOpen, onClose, onEnroll }: CourseDetailModalProps) {
  if (!isOpen || !kursus) return null;

  // Cek harga terkini dan diskon dari admin
  const priceInfo = getCoursePriceInfo(kursus.id, kursus.harga, true);
  const effectivePrice = priceInfo.hargaFinal;
  const ratingStats = getCourseRatingStats(kursus.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#58816D]/60 backdrop-blur-sm animate-in fade-in duration-200">

      {/* Modal Dialog (shadcn/ui style with rounded-[32px]) */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-[32px] border border-zinc-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#58816D]/15 text-[#1F382B]">
              {kursus.kategori}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{ratingStats.average.toFixed(1)} ({ratingStats.total} Ulasan)</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">

          {/* Headline & Overview */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F382B] tracking-tight leading-snug">
              {kursus.judul}
            </h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              {kursus.deskripsi}
            </p>
          </div>

          {/* Key Metrics Pill Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Biaya Investasi</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-[#1F382B]">
                  {priceInfo.isFree ? "Gratis 100%" : `Rp ${priceInfo.hargaFinal.toLocaleString("id-ID")}`}
                </span>
                {priceInfo.isDiscounted && (
                  <span className="text-[10px] text-zinc-400 line-through">
                    Rp {priceInfo.hargaAwal.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              {priceInfo.isDiscounted && (
                <span className="text-[9px] font-black text-rose-600 block mt-0.5">
                  Hemat Rp {priceInfo.hematNominal.toLocaleString("id-ID")} ({priceInfo.diskonPersen}%)
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Sisa Kursi</span>
              <span className={`text-sm font-extrabold ${kursus.sisaKursi <= 2 ? "text-red-600" : "text-[#1F382B]"}`}>
                {kursus.sisaKursi} dari {kursus.kuota}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Total Durasi</span>
              <span className="text-sm font-extrabold text-[#1F382B]">{kursus.totalDurasiMenit} Menit</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Nilai Lulus</span>
              <span className="text-sm font-extrabold text-[#58816D]">Min. {kursus.nilaiLulus}/100</span>
            </div>
          </div>

          {/* Instructor Box */}
          <div className="flex items-center gap-3 p-3.5 bg-[#58816D]/10 rounded-2xl border border-[#58816D]/20">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-200 shrink-0">
              <Image
                src={kursus.instrukturAvatar}
                alt={kursus.instrukturNama}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">{kursus.instrukturNama}</div>
              <div className="text-[11px] text-zinc-500">{kursus.instrukturGelar} · Instruktur Pijar Aksara</div>
            </div>
          </div>

          {/* Syllabus / Module List (BR-03 & BR-08 compliance) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1F382B] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#58816D]" />
                <span>Silabus & Struktur Modul ({kursus.modul.length} Modul)</span>
              </h3>
              <span className="text-[11px] text-zinc-500 font-medium">
                Berurutan per modul
              </span>
            </div>

            <div className="space-y-2.5">
              {kursus.modul.map((mod, idx) => {
                const isFirst = idx === 0;
                return (
                  <div
                    key={mod.id}
                    className="p-4 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isFirst
                          ? "bg-[#58816D] text-white"
                          : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}>
                        {mod.urutan}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                          <span>{mod.judul}</span>
                          {isFirst ? (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                              Terbuka Pertama
                            </span>
                          ) : (
                            <span className="text-[9px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Lulus Kuis Modul {idx}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">{mod.isiMateri}</p>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium mt-2">
                          <span>⏱ {mod.durasiMenit} Menit</span>
                          <span>•</span>
                          <span>📝 Kuis {mod.soalCount} Soal (Passing Grade 60)</span>
                          {mod.videoUrl && (
                            <>
                              <span>•</span>
                              <span>🎬 Termasuk Video Pembelajaran</span>
                            </>
                          )}
                          {mod.hasPdf && (
                            <>
                              <span>•</span>
                              <span>📄 Dokumen PDF Materi</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rules and Certificate Guarantee */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950">
            <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Jaminan Sertifikat Resmi Pijar Aksara</strong>
              <span>
                Peserta yang menyelesaikan seluruh modul dan lulus kuis langsung mendapatkan sertifikat bernomor seri unik format <code>PA-2026-XXXX</code>.
              </span>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50/70 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-zinc-500 block">Biaya Course</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-[#1F382B]">
                {priceInfo.isFree ? "Gratis" : `Rp ${priceInfo.hargaFinal.toLocaleString("id-ID")}`}
              </span>
              {priceInfo.isDiscounted && (
                <>
                  <span className="text-xs text-zinc-400 line-through">
                    Rp {priceInfo.hargaAwal.toLocaleString("id-ID")}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                    -{priceInfo.diskonPersen}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onEnroll(kursus);
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#234e36] hover:bg-[#1a3d29] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Daftar Course Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
