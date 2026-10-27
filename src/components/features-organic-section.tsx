"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Check, Sparkles, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { Kursus, PUBLISHED_COURSES } from "@/data/courses";

interface FeaturesOrganicSectionProps {
  onSelectCourse: (kursus: Kursus) => void;
  onScrollToCatalog: () => void;
}

export function FeaturesOrganicSection({ onSelectCourse, onScrollToCatalog }: FeaturesOrganicSectionProps) {
  const excelCourse = PUBLISHED_COURSES.find((c) => c.slug === "excel-administrasi-perkantoran")!;
  const canvaCourse = PUBLISHED_COURSES.find((c) => c.slug === "desain-konten-canva")!;
  const umkmCourse = PUBLISHED_COURSES.find((c) => c.slug === "dasar-pembukuan-umkm")!;

  return (
    <section id="keunggulan" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Section Header with Pill Badges (inspired by download (1).jpeg) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1F382B] leading-tight">
            Membantu staf kantor & pelaku UMKM menguasai keahlian siap pakai.
          </h2>
        </div>

        <button
          onClick={onScrollToCatalog}
          className="self-start md:self-auto px-5 py-2.5 rounded-full text-xs font-bold text-zinc-900 border border-zinc-300 hover:border-[#58816D] bg-white hover:bg-zinc-50 shadow-xs transition-all flex items-center gap-2 group"
        >
          <span>Lihat Semua Kursus</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* 3 Organic Cards Grid (inspired by download (1).jpeg lower section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

        {/* Card 01 - Sky Blue Theme */}
        <div className="relative rounded-[32px] p-6 sm:p-7 glass-card border border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#1F382B] border border-[#58816D]/30 shadow-xs">
                Administrasi & Laporan
              </span>
              <button
                onClick={() => onSelectCourse(excelCourse)}
                aria-label="Buka detail Excel"
                className="w-8 h-8 rounded-full bg-white border border-[#58816D]/30 flex items-center justify-center text-zinc-800 group-hover:bg-[#58816D] group-hover:text-white transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Organic Mask Image */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden my-3 border border-[#58816D]/25 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
              <Image
                src="/images/card_perkantoran.jpg"
                alt="Excel Administrasi Perkantoran"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#1F382B]">
                155 Menit · 3 Modul
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-[#1F382B] mt-4 leading-snug">
              01/ Rekap Data & Rumus Otomatis Excel
            </h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Kuasai pembuatan tabel data, rumus logika IF bersarang, lookup, dan grafik laporan bulanan kantor bebas salah hitung.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-[#58816D]/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Biaya Course</span>
              <span className="text-sm font-bold text-[#1F382B]">Rp 350.000</span>
            </div>
            <button
              onClick={() => onSelectCourse(excelCourse)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white hover:bg-[#58816D] hover:text-white text-[#1F382B] hover:border-[#58816D] border border-zinc-300 shadow-xs transition-all cursor-pointer"
            >
              Eksplorasi Modul
            </button>
          </div>
        </div>

        {/* Card 02 - Soft Eucalyptus Jade Theme */}
        <div className="relative rounded-[32px] p-6 sm:p-7 glass-card border border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/80 backdrop-blur-xs text-[#1F382B] border border-white/80 shadow-xs">
                Konten & Branding
              </span>
              <button
                onClick={() => onSelectCourse(canvaCourse)}
                aria-label="Buka detail Canva"
                className="w-8 h-8 rounded-full bg-white/80 border border-white/80 flex items-center justify-center text-zinc-800 group-hover:bg-[#58816D] group-hover:text-white transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Organic Mask Image */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden my-3 border border-white/70 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
              <Image
                src="/images/card_canva.jpg"
                alt="Desain Canva Media Sosial"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute bottom-2 left-2 bg-[#58816D] px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-xs">
                Gratis 100% · Tanpa Biaya
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-[#1F382B] mt-4 leading-snug">
              02/ Desain Media Sosial dengan Canva
            </h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Rancang feed, carousel edukatif, dan promosi produk Instagram yang rapi menggunakan template siap pakai dan brand kit.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-zinc-200/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Status Pendaftaran</span>
              <span className="text-sm font-bold text-[#58816D]">Langsung Aktif</span>
            </div>
            <button
              onClick={() => onSelectCourse(canvaCourse)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#58816D] text-white hover:bg-[#456655] shadow-xs transition-all cursor-pointer"
            >
              Mulai Belajar
            </button>
          </div>
        </div>

        {/* Card 03 - Warm Amber / Sand Theme (Sisa 1 Kursi Alert!) */}
        <div className="relative rounded-[32px] p-6 sm:p-7 glass-card border border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 shadow-xs animate-pulse">
                ⚡ Sisa 1 Kursi Saja!
              </span>
              <button
                onClick={() => onSelectCourse(umkmCourse)}
                aria-label="Buka detail Pembukuan UMKM"
                className="w-8 h-8 rounded-full bg-white border border-amber-200 flex items-center justify-center text-zinc-800 group-hover:bg-amber-600 group-hover:text-white transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Organic Mask Image */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden my-3 border border-amber-200/80 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
              <Image
                src="/images/card_pembukuan.jpg"
                alt="Dasar Pembukuan UMKM"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                Kuota 12 · Terpakai 11
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-[#1F382B] mt-4 leading-snug">
              03/ Pembukuan Kas & Laba Rugi UMKM
            </h3>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              Panduan memisahkan uang pribadi dan operasional usaha, mencatat arus kas harian, dan membaca laporan profitabilitas.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-amber-200/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Biaya Course</span>
              <span className="text-sm font-bold text-[#1F382B]">Rp 300.000</span>
            </div>
            <button
              onClick={() => onSelectCourse(umkmCourse)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#58816D] text-white hover:bg-[#456655] shadow-xs transition-all"
            >
              Amankan Kursi
            </button>
          </div>
        </div>

      </div>

    </section>
  );
}
