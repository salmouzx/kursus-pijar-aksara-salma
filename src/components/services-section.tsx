"use client";

import React from "react";
import { Building2, Store, Award, FileCheck2, CheckCircle2, ArrowUpRight, Sparkles, MessageSquare } from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      id: "b2b",
      badge: "Perusahaan & Instansi",
      title: "In-House Training Perusahaan",
      desc: "Program pelatihan privat untuk staf kantor pemerintahan dan swasta. Materi disesuaikan dengan studi kasus laporan dan alur kerja riil institusi Anda.",
      features: [
        "Jadwal fleksibel (On-site / Hybrid di Depok & Jabodetabek)",
        "Studi kasus menggunakan dataset internal perusahaan",
        "Laporan evaluasi performa & kuis tiap peserta",
        "Sertifikat resmi terdaftar PA-2026",
      ],
      icon: Building2,
      popular: true,
      color: "sky",
    },
    {
      id: "umkm",
      badge: "Wirausaha & UMKM",
      title: "Pendampingan Bisnis & Pembukuan",
      desc: "Mentoring intensif untuk pemilik usaha mikro dan kecil. Memisahkan keuangan pribadi vs usaha, menyusun laporan kas harian, dan branding visual media sosial.",
      features: [
        "Bimbingan 1-on-1 dengan praktisi keuangan UMKM",
        "Template buku kas & laba rugi siap pakai",
        "Optimalisasi konten feed Instagram & WhatsApp Business",
        "Akses konsultasi pasca-pelatihan",
      ],
      icon: Store,
      popular: false,
      color: "emerald",
    },
    {
      id: "sertifikasi",
      badge: "Standardisasi Keahlian",
      title: "Uji Kompetensi & Sertifikasi",
      desc: "Ujian evaluasi keterampilan praktis berbasis server aman Pijar Aksara. Mengukur penguasaan software perkantoran dan desain kerja secara objektif.",
      features: [
        "Sistem kuis pilihan ganda aman tanpa kebocoran kunci",
        "Nilai kelulusan standar 70/100 dengan batas 3x remedial",
        "Penerbitan nomor registrasi unik PA-2026-XXXX otomatis",
        "Verifikasi keaslian sertifikat digital secara instan",
      ],
      icon: Award,
      popular: false,
      color: "purple",
    },
    {
      id: "sop",
      badge: "Efisiensi Kantor",
      title: "Konsultasi Tata Kelola Administrasi",
      desc: "Membantu tim administrasi merapikan SOP surat-menyurat dinas, mail merge massal, dan dashboard rekapitulasi data agar operasional kantor bebas hambatan.",
      features: [
        "Audit alur dokumentasi dan arsip kerja",
        "Standarisasi format surat resmi & nota dinas",
        "Otomatisasi formula Excel multi-lembar kerja",
        "Panduan SOP tertulis untuk staf baru",
      ],
      icon: FileCheck2,
      popular: false,
      color: "amber",
    },
  ];

  return (
    <section id="layanan" className="w-full py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1F382B] tracking-tight leading-tight">
              Layanan Pelatihan & Konsultasi Profesional
            </h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Selain course reguler, kami menyediakan program khusus untuk kebutuhan instansi, perusahaan lokal Depok, dan komunitas wirausaha.
            </p>
          </div>

          <a
            href="#kontak"
            className="self-start md:self-auto px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#58816D] hover:bg-[#456655] shadow-xs transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Konsultasi Kebutuhan Anda</span>
          </a>
        </div>

        {/* Services 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`rounded-[30px] p-6 sm:p-7 border border-white/80 glass-card shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group ${item.popular
                  ? "ring-2 ring-[#58816D]/30"
                  : ""
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#1F382B] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#EBF3EF]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/80 text-zinc-700 border border-white/90">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#1F382B] leading-snug group-hover:text-[#58816D] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-2.5 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="mt-5 pt-4 border-t border-zinc-200/50 space-y-2">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-[11px] text-zinc-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#58816D] shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <a
                    href="#kontak"
                    className="w-full py-2.5 rounded-full text-xs font-bold text-center border border-white/80 hover:border-[#58816D] bg-white/70 hover:bg-[#58816D] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Hubungi Tim Layanan</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
