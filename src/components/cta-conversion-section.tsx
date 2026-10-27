"use client";

import React from "react";
import { ArrowRight, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

interface CtaConversionSectionProps {
  onScrollToCatalog: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
}

export function CtaConversionSection({ onScrollToCatalog, onOpenAuth }: CtaConversionSectionProps) {
  return (
    <section className="w-full py-14 sm:py-20 relative overflow-hidden">
      {/* Ambient Glowing Gradient Orbs for Frosted Glass Refraction */}
      <div className="absolute top-1/2 -left-10 w-96 h-96 rounded-full bg-[#58816D]/20 blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 -right-10 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Main Banner Box with Frosted Glassmorphism like Dashboard */}
        <div className="relative rounded-[36px] sm:rounded-[44px] glass-panel text-[#1F382B] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl border border-white/90">

          {/* Internal Ambient Light Highlights */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#58816D]/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Kolom Kiri: Judul, Deskripsi, Tombol Aksi */}
            <div className="lg:col-span-7 space-y-6">
              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-[#1F382B]">
                Siap Tingkatkan Keterampilan Kerja &amp; Kembangkan Usaha Anda?
              </h2>

              {/* Subhead */}
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl font-medium">
                Pelajari materi praktis siap pakai di hari pertama, selesaikan modul berurutan, taklukkan kuis terstandar tanpa bocoran kunci, dan dapatkan sertifikat kelulusan resmi ber-nomor registrasi unik.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onScrollToCatalog}
                  className="px-7 py-3.5 rounded-full text-sm font-bold bg-[#58816D] hover:bg-[#456655] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 group cursor-pointer border border-[#456655]"
                >
                  <span>Pilih Course Sekarang</span>
                  <span className="w-6 h-6 rounded-full bg-white text-[#58816D] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                <button
                  onClick={() => onOpenAuth("register")}
                  className="px-6 py-3.5 rounded-full text-sm font-bold bg-white/80 hover:bg-white text-[#58816D] border-2 border-[#58816D] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Daftar Akun Peserta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Kolom Kanan: Kartu Keunggulan & Peringatan Kuota Terakhir */}
            <div className="lg:col-span-5 space-y-4">
              {/* Value checklist card */}
              <div className="p-6 rounded-3xl bg-white/65 backdrop-blur-md border border-white/85 shadow-md space-y-3.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#58816D] pb-1 border-b border-zinc-200/60">
                  Keunggulan Belajar di Pijar Aksara
                </div>
                <div className="space-y-3 text-xs sm:text-sm font-semibold text-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#58816D]/15 flex items-center justify-center text-[#58816D] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Kelas Kecil Terbatas (12–40 Peserta per Batch)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#58816D]/15 flex items-center justify-center text-[#58816D] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Materi Praktis Siap Pakai di Hari Pertama</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#58816D]/15 flex items-center justify-center text-[#58816D] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Evaluasi Kuis Objektif Tanpa Kunci Bocor</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#58816D]/15 flex items-center justify-center text-[#58816D] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Sertifikat Resmi Format PA-2026-XXXX</span>
                  </div>
                </div>
              </div>

              {/* Urgency Seat Alert (Frosted Glass Theme) */}
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-300/80 backdrop-blur-md flex items-center gap-3 text-xs shadow-md">
                <div className="w-8 h-8 rounded-full bg-amber-200/90 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-amber-800" />
                </div>
                <div className="flex-1">
                  <strong className="text-amber-950 font-bold block">Peringatan Kuota Terakhir:</strong>
                  <span className="text-amber-900 font-medium">
                    Course <em>Dasar Pembukuan untuk UMKM</em> saat ini hanya tersisa <strong>1 kursi</strong> lagi!
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
