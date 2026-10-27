"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Clock,
  BookOpen,
  Users,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  Star,
} from "lucide-react";
import { PUBLISHED_COURSES, Kursus } from "@/data/courses";
import { getCoursePriceInfo } from "@/lib/course-pricing";

interface CourseCatalogSectionProps {
  onSelectCourse: (kursus: Kursus) => void;
  onEnrollCourse: (kursus: Kursus) => void;
}

export function CourseCatalogSection({ onSelectCourse, onEnrollCourse }: CourseCatalogSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [pricingVer, setPricingVer] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Dengarkan event update harga/diskon dari admin setelah client mount
  React.useEffect(() => {
    setIsMounted(true);
    const onPriceChange = () => setPricingVer((v) => v + 1);
    window.addEventListener("admin_price_updated", onPriceChange);
    return () => window.removeEventListener("admin_price_updated", onPriceChange);
  }, []);

  const categories = ["Semua", "Perkantoran", "Desain", "Bahasa", "Keuangan"];

  const coursesWithOverrides = useMemo(() => {
    return PUBLISHED_COURSES.map((c) => {
      const pInfo = getCoursePriceInfo(c.id, c.harga, isMounted);
      return {
        ...c,
        harga: pInfo.hargaFinal,
        hargaAwal: pInfo.hargaAwal,
        diskonPersen: pInfo.diskonPersen,
      };
    });
  }, [pricingVer, isMounted]);

  const filteredCourses = useMemo(() => {
    return coursesWithOverrides.filter((course) => {
      const matchCategory = selectedCategory === "Semua" || course.kategori === selectedCategory;
      const matchSearch =
        course.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instrukturNama.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory, coursesWithOverrides]);

  return (
    <section id="course" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header Container */}
      <div className="glass-panel rounded-[32px] sm:rounded-[36px] border border-white/80 shadow-xl p-6 sm:p-8 lg:p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F382B] tracking-tight">
              Pilihan Course Praktis Pijar Aksara
            </h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xl">
              Pelajari keterampilan kerja esensial dan praktis bersama instruktur berpengalaman untuk akselerasi karier dan bisnis Anda.
            </p>
          </div>

          {/* Search Input (shadcn/ui style) */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari course, topik, atau instruktur..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-full text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#58816D] focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (inspired by Vespa pill tabs) */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${isSelected
                  ? "bg-[#58816D] text-white shadow-xs"
                  : "bg-white/60 hover:bg-white/90 text-zinc-700 border border-white/70"
                  }`}
              >
                {cat === "Semua" && <Filter className="w-3.5 h-3.5" />}
                <span>{cat}</span>
                {cat === "Semua" && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-700"}`}>
                    {PUBLISHED_COURSES.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/80">
          <BookOpen className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900">Tidak ada course ditemukan</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Coba kata kunci lain atau pilih kategori &quot;Semua&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Semua");
            }}
            className="mt-4 px-4 py-2 bg-white/70 hover:bg-white text-xs font-semibold text-zinc-800 rounded-full border border-white/80 cursor-pointer"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            const isSisaKritis = course.sisaKursi <= 2;
            const percentFilled = Math.round((course.terpakai / course.kuota) * 100);

            return (
              <div
                key={course.id}
                className="glass-card rounded-[28px] border border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Thumbnail */}
                  <div className="relative w-full h-44 overflow-hidden bg-zinc-100">
                    <Image
                      src={course.image}
                      alt={course.judul}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Category & Discount badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-md text-zinc-900 shadow-xs">
                        {course.kategori}
                      </span>
                      {course.diskonPersen && course.diskonPersen > 0 && course.hargaAwal && course.hargaAwal > course.harga ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-md flex items-center gap-1 animate-pulse">
                          <Flame className="w-3 h-3 text-amber-300" />
                          <span>-{course.diskonPersen}%</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Sisa kursi badge */}
                    <div className="absolute top-3 right-3">
                      {isSisaKritis ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs animate-pulse flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Sisa {course.sisaKursi} Kursi</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#58816D]/80 backdrop-blur-md text-zinc-200">
                          Sisa {course.sisaKursi} Kursi
                        </span>
                      )}
                    </div>

                    {/* Price Tag in Thumbnail bottom with strikethrough */}
                    <div className="absolute bottom-3 left-3">
                      {course.harga === 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#78A891] text-white shadow-xs">
                          Gratis 100%
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm">
                          <span className="text-xs font-black text-[#1F382B]">
                            Rp {course.harga.toLocaleString("id-ID")}
                          </span>
                          {course.hargaAwal && course.hargaAwal > course.harga && (
                            <span className="text-[10px] text-zinc-400 line-through font-semibold">
                              Rp {course.hargaAwal.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-base text-[#1F382B] leading-snug line-clamp-2 group-hover:text-[#58816D] transition-colors">
                      {course.judul}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {course.ringkasan}
                    </p>

                    {/* Meta info: duration & modules & star rating */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-600 font-medium pt-1 border-t border-zinc-200/50">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                          {course.modul.length} Modul
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {course.totalDurasiMenit}m
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-amber-800 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shadow-2xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>4.9</span>
                      </span>
                    </div>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-200">
                        <Image
                          src={course.instrukturAvatar}
                          alt={course.instrukturNama}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                      <div className="text-[11px] truncate">
                        <span className="font-bold text-zinc-800 block truncate">{course.instrukturNama}</span>
                        <span className="text-zinc-400 text-[10px] block truncate">{course.instrukturGelar}</span>
                      </div>
                    </div>

                    {/* Capacity progress indicator (BR-06) */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Kapasitas ({course.terpakai}/{course.kuota} terisi)</span>
                        <span className="font-mono font-bold text-zinc-700">{percentFilled}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isSisaKritis ? "bg-red-500" : "bg-[#78A891]"
                            }`}
                          style={{ width: `${percentFilled}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="w-full py-2.5 rounded-full text-xs font-semibold border border-white/80 hover:border-[#58816D]/50 text-zinc-800 hover:text-[#1F382B] bg-white/70 backdrop-blur-xs transition-all text-center cursor-pointer shadow-2xs"
                  >
                    Lihat Silabus
                  </button>
                  <button
                    onClick={() => onEnrollCourse(course)}
                    className="w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 bg-[#58816D] hover:bg-[#456655] text-white shadow-xs cursor-pointer"
                  >
                    <span>Daftar</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}



    </section>
  );
}
