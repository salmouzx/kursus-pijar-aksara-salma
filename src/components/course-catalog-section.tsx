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
  Sparkles
} from "lucide-react";
import { PUBLISHED_COURSES, Kursus } from "@/data/courses";

interface CourseCatalogSectionProps {
  onSelectCourse: (kursus: Kursus) => void;
  onEnrollCourse: (kursus: Kursus) => void;
}

export function CourseCatalogSection({ onSelectCourse, onEnrollCourse }: CourseCatalogSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const categories = ["Semua", "Perkantoran", "Desain", "Bahasa", "Keuangan"];

  const filteredCourses = useMemo(() => {
    return PUBLISHED_COURSES.filter((course) => {
      const matchCategory = selectedCategory === "Semua" || course.kategori === selectedCategory;
      const matchSearch =
        course.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instrukturNama.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <section id="katalog" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header Container */}
      <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-zinc-200/90 shadow-sm p-6 sm:p-8 lg:p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Pilihan Kursus Praktis Pijar Aksara
            </h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xl">
              Hanya menampilkan kursus berstatus terbit. Kursus draf, ditinjau, dan ditutup terlindungi otomatis dari katalog publik.
            </p>
          </div>

          {/* Search Input (shadcn/ui style) */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kursus, topik, atau instruktur..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-full text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700"
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
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 border border-transparent"
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
        <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200">
          <BookOpen className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900">Tidak ada kursus ditemukan</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Coba kata kunci lain atau pilih kategori &quot;Semua&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Semua");
            }}
            className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 rounded-full"
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
                className="bg-white rounded-[28px] border border-zinc-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
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

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 backdrop-blur-md text-zinc-900 shadow-xs">
                        {course.kategori}
                      </span>
                    </div>

                    {/* Sisa kursi badge */}
                    <div className="absolute top-3 right-3">
                      {isSisaKritis ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs animate-pulse flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Sisa {course.sisaKursi} Kursi</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-950/80 backdrop-blur-md text-zinc-200">
                          Sisa {course.sisaKursi} Kursi
                        </span>
                      )}
                    </div>

                    {/* Price Tag in Thumbnail bottom */}
                    <div className="absolute bottom-3 left-3">
                      {course.harga === 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#bef264] text-zinc-950 shadow-xs">
                          Gratis 100%
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white text-zinc-950 shadow-xs">
                          Rp {course.harga.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-base text-zinc-950 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
                      {course.judul}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {course.ringkasan}
                    </p>

                    {/* Meta info: duration & modules */}
                    <div className="flex items-center gap-3 text-[11px] text-zinc-600 font-medium pt-1 border-t border-zinc-100">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                        {course.modul.length} Modul
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {course.totalDurasiMenit} Menit
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
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isSisaKritis ? "bg-red-500" : "bg-sky-500"
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
                    className="w-full py-2.5 rounded-full text-xs font-semibold border border-zinc-200 hover:border-zinc-950 text-zinc-800 hover:text-zinc-950 bg-white transition-all text-center"
                  >
                    Lihat Silabus
                  </button>
                  <button
                    onClick={() => onEnrollCourse(course)}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      course.harga === 0
                        ? "bg-[#bef264] hover:bg-[#a3e635] text-zinc-950 shadow-xs"
                        : "bg-zinc-950 hover:bg-zinc-800 text-white shadow-xs"
                    }`}
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
