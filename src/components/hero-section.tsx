"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  FileText,
  Flame,
} from "lucide-react";
import { PUBLISHED_COURSES, Kursus } from "@/data/courses";
import { getCoursePriceInfo } from "@/lib/course-pricing";

interface HeroSectionProps {
  onSelectCourse: (kursus: Kursus) => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onScrollToCatalog: () => void;
}

interface PesertaChat {
  courseId: string;
  nama: string;
  role: string;
  avatar: string;
  waktu: string;
  pesan: string;
  adminBalasan: string;
  adminRule: string;
}

const PESERTA_CHATS: PesertaChat[] = [
  {
    courseId: "00000000-0000-4000-b000-000000000001", // Excel Administrasi
    nama: "Lina Marlina",
    role: "Staf Administrasi",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    waktu: "10.15 WIB",
    pesan: "Sertifikat resmi PA-2026 langsung terbit begitu lulus kuis modul terakhir ya kak? ✨",
    adminBalasan: "Nomor registrasi resmi tanpa dobel",
    adminRule: "Resmi",
  },
  {
    courseId: "00000000-0000-4000-b000-000000000002", // Canva
    nama: "Siti Aminah",
    role: "Owner Fashion Online",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    waktu: "11.20 WIB",
    pesan: "Kelas Canva-nya 100% gratis dan langsung aktif setelah daftar ya min? 🎨",
    adminBalasan: "Langsung aktif tanpa bayar & kuota 40 peserta",
    adminRule: "Gratis",
  },
  {
    courseId: "00000000-0000-4000-b000-000000000003", // Bahasa Inggris
    nama: "Rizky Ramadhan",
    role: "Staf Customer Service",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    waktu: "13.45 WIB",
    pesan: "Latihan meeting kerja & email formal aplikatif banget! Kuisnya ada batasnya kak? 💼",
    adminBalasan: "Evaluasi kuis objektif, batas 3x percobaan",
    adminRule: "Server Kuis",
  },
  {
    courseId: "00000000-0000-4000-b000-000000000004", // Pembukuan UMKM
    nama: "Bagus Santoso",
    role: "Owner Kedai Kopi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    waktu: "14.10 WIB",
    pesan: "Buku kas harian kedai kopi jadi rapi. Kuotanya beneran sisa 1 kursi ya kak? ☕",
    adminBalasan: "Betul Mas Bagus! Sisa 1 kursi lagi, daftar sekarang",
    adminRule: "Sisa 1 Kursi",
  },
];

export function HeroSection({ onSelectCourse, onOpenAuth, onScrollToCatalog }: HeroSectionProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pricingVer, setPricingVer] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Dengarkan event pembaruan diskon dari admin setelah client mount
  useEffect(() => {
    setIsMounted(true);
    const onPriceChange = () => setPricingVer((v) => v + 1);
    window.addEventListener("admin_price_updated", onPriceChange);
    return () => window.removeEventListener("admin_price_updated", onPriceChange);
  }, []);

  // Dukung harga awal dan diskon dinamis oleh Admin (100% hydration-safe)
  const publishedCourses = useMemo(() => {
    return PUBLISHED_COURSES.map((c) => {
      const pInfo = getCoursePriceInfo(c.id, c.harga, isMounted);
      return {
        ...c,
        harga: pInfo.hargaFinal,
        hargaAwal: pInfo.hargaAwal,
        diskonPersen: pInfo.diskonPersen,
        isDiscounted: pInfo.isDiscounted,
      };
    });
  }, [pricingVer, isMounted]);

  const currentCourse = publishedCourses[currentSlideIndex] || publishedCourses[0];
  const currentPriceInfo = getCoursePriceInfo(currentCourse.id, currentCourse.harga, isMounted);
  const currentChat = PESERTA_CHATS[currentSlideIndex % PESERTA_CHATS.length];

  // Auto-slide setiap 3 detik (3000ms) mengikuti Pratinjau Course Terbit
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % publishedCourses.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, publishedCourses.length]);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? publishedCourses.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev === publishedCourses.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full pt-6 sm:pt-10 lg:pt-12 pb-12 sm:pb-16 relative overflow-hidden">
      {/* Ambient Glowing Gradient Orbs for Frosted Glass Effect */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#58816D]/15 blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

          {/* Left Column: Bold Typography & Content */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">

            {/* Main Editorial Headline dengan jeda 3 baris terstruktur */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1F382B] leading-[1.22] sm:leading-[1.18]">
              <span className="block">Kembangkan Usaha &amp;</span>
              <span className="block">Keterampilan Kerja</span>
              <span className="block">dengan Praktik Nyata</span>
            </h1>

            {/* Value Proposition Description */}
            <p className="text-sm text-zinc-600 font-medium leading-relaxed max-w-xl">
              Tingkatkan efisiensi kerja kantor dan kembangkan omzet usaha Anda melalui modul praktis (Excel, Desain Canva, Bahasa Inggris Kerja, dan Pembukuan UMKM) dengan sertifikat resmi ber-nomor registrasi unik.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onScrollToCatalog}
                className="px-6 py-3 rounded-full text-sm font-bold bg-[#58816D] hover:bg-[#456655] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer border border-[#456655]"
              >
                <span>Lihat Katalog Course</span>
                <span className="w-6 h-6 rounded-full bg-white text-[#58816D] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => onOpenAuth("register")}
                className="px-5 py-3 rounded-full text-sm font-semibold border-2 border-[#58816D] bg-white/80 hover:bg-white text-[#58816D] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                Daftar Akun Peserta
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Mini Thumbnail Carousel (inspired by download.jpeg) */}
            <div
              className="pt-4 border-t border-zinc-100"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Katalog Kursus Pilihan
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-zinc-700 mr-2">
                    {currentSlideIndex + 1}/{publishedCourses.length}
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
                {publishedCourses.map((course, idx) => {
                  const isActive = idx === currentSlideIndex;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${isActive
                        ? "glass-card border-[#58816D]/60 shadow-md scale-[1.03] text-[#1F382B]"
                        : "bg-white/50 hover:bg-white/80 backdrop-blur-md text-zinc-700 border-white/80 hover:border-zinc-300"
                        }`}
                    >
                      <div className={`text-[10px] uppercase font-bold tracking-wider truncate ${isActive ? "text-[#58816D] font-extrabold" : "text-zinc-500"}`}>
                        {course.kategori}
                      </div>
                      <div className="text-xs font-bold truncate mt-0.5 text-[#1F382B]">
                        {course.judul.split(" ")[0]} {course.judul.split(" ")[1] || ""}
                      </div>
                      <div className="text-[10px] mt-1 font-mono font-semibold flex items-center gap-1" suppressHydrationWarning>
                        {course.harga === 0 ? (
                          <span className="text-[#58816D] font-bold">Gratis</span>
                        ) : (
                          <span className={isActive ? "text-[#1F382B] font-bold" : "text-zinc-600"}>{(course.harga / 1000).toLocaleString("id-ID")}k</span>
                        )}
                        {course.diskonPersen && course.diskonPersen > 0 ? (
                          <span className="text-[9px] bg-rose-500 text-white px-1.5 rounded-full font-bold">
                            -{course.diskonPersen}%
                          </span>
                        ) : course.sisaKursi <= 2 ? (
                          <span className="text-[9px] bg-red-500 text-white px-1.5 rounded-full font-bold">
                            Sisa {course.sisaKursi}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: High-Impact Visual Frame with Floating Elements */}
          <div className="lg:col-span-6 relative flex flex-col">
            <div className="relative w-full h-full min-h-[500px] sm:min-h-[580px] lg:min-h-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-zinc-200/90 shadow-2xl group bg-zinc-100">

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
                <div className="glass-panel px-3.5 py-1.5 rounded-full border border-white/80 shadow-md text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#58816D]" />
                  <span>Modul Praktis 2–3 Jam</span>
                </div>
              </div>

              {/* Top Right Stack: Urgent Badge + Course Preview Card (Sliding with currentCourse) */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20 w-[240px] sm:w-[250px]">
                {/* Urgent Seat Badge / Kursus Terpilih */}
                {/* Urgent Seat Badge / Kursus Terpilih */}
                {currentPriceInfo.isDiscounted ? (
                  <div className="w-full bg-gradient-to-r from-rose-600 to-amber-600 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-rose-300 shadow-md text-xs font-black text-white flex items-center justify-center gap-1.5 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-200" />
                    <span className="truncate">DISKON {currentPriceInfo.diskonPersen}%: {currentCourse.judul.split(" ")[0]} {currentCourse.judul.split(" ")[1] || ""}</span>
                  </div>
                ) : currentCourse.sisaKursi <= 2 ? (
                  <div className="w-full bg-red-500/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-300 shadow-md text-xs font-bold text-white flex items-center justify-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white shrink-0"></span>
                    <span className="truncate">Sisa {currentCourse.sisaKursi} Kursi: {currentCourse.judul.split(" ")[0]} {currentCourse.judul.split(" ")[1] || ""}</span>
                  </div>
                ) : currentCourse.harga === 0 ? (
                  <div className="w-full bg-[#58816D]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 shadow-md text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#EBF3EF]" />
                    <span className="truncate">Course Gratis 100% · Kuota {currentCourse.kuota}</span>
                  </div>
                ) : (
                  <div className="w-full glass-panel px-3.5 py-1.5 rounded-full border border-white/80 shadow-md text-xs font-bold text-[#1F382B] flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#58816D]" />
                    <span className="truncate">Modul Praktis · Sertifikat PA-2026</span>
                  </div>
                )}

                {/* Course Preview Card (Sliding on key change) */}
                <div key={currentCourse.id} className="w-full animate-card-slide">
                  <button
                    onClick={() => onSelectCourse(currentCourse)}
                    className="w-full glass-card p-3.5 rounded-[22px] border border-white/90 shadow-xl hover:scale-[1.02] transition-all text-left group/card cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#58816D] uppercase tracking-wider">{currentCourse.kategori}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#1F382B] group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-transform" />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 leading-snug line-clamp-2">
                      {currentCourse.judul}
                    </h4>
                    <div className="mt-2.5 pt-2 border-t border-zinc-200/50 flex items-center justify-between text-[11px]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-[#1F382B]">
                          {currentPriceInfo.isFree ? "Gratis" : `Rp ${currentPriceInfo.hargaFinal.toLocaleString("id-ID")}`}
                        </span>
                        {currentPriceInfo.isDiscounted && (
                          <span className="text-[10px] text-zinc-400 line-through font-semibold">
                            Rp {currentPriceInfo.hargaAwal.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                      {currentPriceInfo.isDiscounted ? (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-amber-200" />
                          -{currentPriceInfo.diskonPersen}%
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-medium">Sisa {currentCourse.sisaKursi}</span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Conversational Floating Chat Bubbles (Sliding with participant testimonials) */}
              <div className="absolute bottom-16 left-4 right-4 sm:right-auto sm:max-w-xs space-y-2 pointer-events-none">
                <div key={currentChat.nama + currentSlideIndex} className="animate-chat-slide space-y-2">
                  {/* Chat Bubble 1: Peserta Testimoni */}
                  <div className="glass-card p-3 rounded-2xl rounded-bl-xs border border-white/80 shadow-lg text-xs space-y-1.5 pointer-events-auto">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-zinc-200">
                          <Image
                            src={currentChat.avatar}
                            alt={currentChat.nama}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-semibold text-zinc-800">{currentChat.nama}</span>
                        <span className="text-zinc-400 truncate max-w-[80px]">({currentChat.role})</span>
                      </div>
                      <span>{currentChat.waktu}</span>
                    </div>
                    <p className="text-zinc-700 leading-snug">
                      {currentChat.pesan}
                    </p>
                  </div>

                  {/* Chat Bubble 2 (Admin reply with audio snippet) */}
                  <div className="glass-panel p-2.5 rounded-2xl rounded-tl-xs border border-white/80 shadow-lg text-xs text-zinc-900 flex items-center gap-2.5 pointer-events-auto">
                    <div className="w-7 h-7 rounded-full bg-[#1F382B] text-white flex items-center justify-center shrink-0 font-bold text-[10px] shadow-2xs">
                      PA
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#1F382B]">Admin Pijar Aksara</span>
                        <span className="text-[9px] text-[#1F382B] bg-white/80 px-1.5 py-0.5 rounded border border-white/90 font-mono font-medium">{currentChat.adminRule}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-700 mt-0.5">
                        <Volume2 className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                        <span>{currentChat.adminBalasan}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Tag Cloud Pill Row (4 Kategori Resmi) */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {["Perkantoran", "Desain", "Bahasa", "Keuangan"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/25 backdrop-blur-md text-white border border-white/35 whitespace-nowrap shadow-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>


            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
