"use client";

import React from "react";
import Image from "next/image";
import { Award, BookOpen, Users, CheckCircle2, ArrowUpRight } from "lucide-react";
import { MENTORS, Mentor, Kursus } from "@/data/courses";

interface MentorsSectionProps {
  onSelectCourseByTitle?: (courseTitle: string) => void;
}

export function MentorsSection({ onSelectCourseByTitle }: MentorsSectionProps) {
  return (
    <section id="mentor" className="w-full py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1F382B] tracking-tight leading-tight">
            Belajar Langsung dari Pengajar & Praktisi Berpengalaman
          </h2>
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
            Materi tidak bersifat teoritis belaka. Kurikulum disusun langsung oleh praktisi aktif yang memahami tantangan nyata pekerjaan kantor dan operasional UMKM.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {MENTORS.map((mentor) => (
            <div
              key={mentor.id}
              className="glass-card rounded-[30px] border border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 group"
            >
              <div>
                {/* Mentor Header: Photo & Status Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-zinc-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <Image
                      src={mentor.avatar}
                      alt={mentor.nama}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Aktif Mengajar
                  </span>
                </div>

                {/* Name & Title */}
                <h3 className="text-lg font-black text-[#1F382B] leading-snug">
                  {mentor.nama}
                </h3>
                <div className="text-xs font-bold text-[#58816D] mt-0.5">
                  {mentor.gelar}
                </div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
                  {mentor.bidang}
                </div>

                {/* Bio */}
                <p className="text-xs text-zinc-600 mt-3 leading-relaxed">
                  {mentor.bio}
                </p>
              </div>

              {/* Courses Taught Pill List */}
              <div className="mt-6 pt-4 border-t border-zinc-200/50">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Course Asuhan:
                </span>
                <div className="flex flex-col gap-1.5">
                  {mentor.kursusDiajar.map((cTitle, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-medium text-zinc-800 bg-white/60 border border-white/80 px-2.5 py-1 rounded-xl flex items-center justify-between"
                    >
                      <span className="truncate">{cTitle}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
