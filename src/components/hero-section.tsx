"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ArrowRight, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Clock, 
  Award,
  Play,
  Volume2,
  FileText
} from "lucide-react";
import { PUBLISHED_COURSES, Kursus } from "@/data/courses";

interface HeroSectionProps {
  onSelectCourse: (kursus: Kursus) => void;
  onOpenAuth: (tab: "login" | "register" | "demo") => void;
  onScrollToCatalog: () => void;
}

export function HeroSection({ onSelectCourse, onOpenAuth, onScrollToCatalog }: HeroSectionProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentCourse = PUBLISHED_COURSES[currentSlideIndex];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? PUBLISHED_COURSES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev === PUBLISHED_COURSES.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full bg-white pt-2 sm:pt-6 pb-12 sm:pb-16 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Bold Typography & Content */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            {/* Main Editorial Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 leading-[1.18]">
              Kuasai Keterampilan Perkantoran & UMKM untuk Karier Nyata.
            </h1>

            {/* Dotted separator with centered oval index (inspired by download.jpeg) */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-dashed border-zinc-300"></div>
              <span className="absolute bg-white px-3 py-0.5 rounded-full border border-zinc-200 text-[11px] font-mono text-zinc-500 font-semibold shadow-xs">
                {String(currentSlideIndex + 1).padStart(2, "0")} / 04
              </span>
            </div>

            {/* Value Proposition Micro Bullets with Directional Arrows */}
            <div className="space-y-2 text-sm text-zinc-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-zinc-900 font-bold">●</span>
                <span>Materi praktis per modul berurutan, video & file PDF terstruktur →</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sky-600 font-bold">↓</span>
                <span>Kuis pilihan ganda otomatis, batas 3 percobaan (BR-09, BR-10)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">&</span>
                <span>Sertifikat bernomor resmi <strong className="text-zinc-900">PA-2026-XXXX</strong> terbit otomatis ↑</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onScrollToCatalog}
                className="px-6 py-3 rounded-full text-sm font-bold bg-[#bef264] hover:bg-[#a3e635] text-zinc-950 shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
              >
                <span>Lihat Katalog Kursus</span>
                <span className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => onOpenAuth("register")}
                className="px-5 py-3 rounded-full text-sm font-semibold border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white text-zinc-900 transition-all flex items-center gap-1.5"
              >
                Daftar Akun Peserta
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Mini Thumbnail Carousel (inspired by download.jpeg) */}
            <div className="pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Pratinjau Kursus Terbit
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-zinc-700 mr-2">
                    {currentSlideIndex + 1}/{PUBLISHED_COURSES.length}
                  </span>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous course"
                    className="w-7 h-7 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-zinc-100 text-zinc-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next course"
                    className="w-7 h-7 rounded-full border border-zinc-300 flex items-center justify-center hover:bg-zinc-100 text-zinc-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="grid grid-cols-4 gap-2">
                {PUBLISHED_COURSES.map((course, idx) => {
                  const isActive = idx === currentSlideIndex;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`text-left p-2 rounded-2xl border transition-all ${
                        isActive
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-md scale-[1.02]"
                          : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold tracking-wider truncate text-zinc-400">
                        {course.kategori}
                      </div>
                      <div className="text-xs font-bold truncate mt-0.5">
                        {course.judul.split(" ")[0]} {course.judul.split(" ")[1] || ""}
                      </div>
                      <div className="text-[10px] mt-1 font-mono font-semibold flex items-center gap-1">
                        {course.harga === 0 ? (
                          <span className={isActive ? "text-[#bef264]" : "text-emerald-600"}>Gratis</span>
                        ) : (
                          <span>{(course.harga / 1000).toLocaleString("id-ID")}k</span>
                        )}
                        {course.sisaKursi <= 2 && (
                          <span className="text-[9px] bg-red-500 text-white px-1 rounded-full">
                            Sisa {course.sisaKursi}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: High-Impact Visual Frame with Floating Elements */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-[28px] sm:rounded-[36px] overflow-hidden border border-zinc-200/90 shadow-2xl group bg-zinc-100">
              
              {/* Photo Image */}
              <Image
                src="/images/hero_learning_desk.jpg"
                alt="Ruang Belajar Digital Pijar Aksara"
                fill
                priority
                loading="eager"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/20"></div>

              {/* Top Floating Badges (inspired by Vespa tag pills) */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-200/80 shadow-md text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Modul Praktis 2–3 Jam</span>
                </div>
              </div>

              {/* Top Right Urgent Seat Badge (BR-06 Highlight) */}
              <div className="absolute top-4 right-4">
                <div className="bg-red-500/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-300 shadow-md text-xs font-bold text-white flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>Sisa 1 Kursi: Dasar Pembukuan</span>
                </div>
              </div>

              {/* Conversational Floating Chat Bubbles (inspired by Prospera download (1).jpeg) */}
              <div className="absolute bottom-16 left-4 right-4 sm:right-auto sm:max-w-xs space-y-2 pointer-events-none">
                
                {/* Chat Bubble 1 */}
                <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl rounded-bl-xs border border-white/60 shadow-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-semibold text-zinc-800">Lina Marlina (Peserta)</span>
                    <span>10.15 WIB</span>
                  </div>
                  <p className="text-zinc-700 leading-snug">
                    Sertifikat resmi <strong className="text-zinc-900">PA-2026</strong> langsung terbit begitu lulus kuis modul terakhir ya kak? ✨
                  </p>
                </div>

                {/* Chat Bubble 2 (Admin reply with audio snippet) */}
                <div className="bg-zinc-950/90 backdrop-blur-md p-2.5 rounded-2xl rounded-tl-xs border border-zinc-800 shadow-lg text-xs text-white flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#bef264] text-zinc-950 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    PA
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-200">Admin Pijar Aksara</span>
                      <span className="text-[9px] text-[#bef264] font-mono">Resmi</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-300">
                      <Volume2 className="w-3.5 h-3.5 text-[#bef264]" />
                      <span>Nomor otomatis tanpa dobel (BR-11)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Tag Cloud Pill Row (inspired by download.jpeg landscape tags) */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {["Excel Perkantoran", "Canva Instagram", "Inggris Rapat", "Laba Rugi UMKM", "Kuis Server"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bottom Right CTA Trigger Card */}
              <div className="absolute top-1/2 -translate-y-1/2 right-4 hidden sm:block">
                <button
                  onClick={() => onSelectCourse(currentCourse)}
                  className="bg-white/95 backdrop-blur-md p-3.5 rounded-3xl border border-zinc-200/80 shadow-xl hover:scale-105 transition-all text-left max-w-[190px] group/card"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-sky-700 uppercase">{currentCourse.kategori}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-950 group-hover/card:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 leading-tight line-clamp-2">
                    {currentCourse.judul}
                  </h4>
                  <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-zinc-950">
                      {currentCourse.harga === 0 ? "Gratis" : `Rp ${currentCourse.harga.toLocaleString("id-ID")}`}
                    </span>
                    <span className="text-zinc-500 font-medium">Sisa {currentCourse.sisaKursi}</span>
                  </div>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
