"use client";

import React from "react";
import Image from "next/image";
import { Star, ShieldCheck, Quote, CheckCircle2, Award } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      nama: "Lina Marlina",
      peran: "Staf Administrasi Perkantoran",
      instansi: "Perusahaan Logistik di Margonda, Depok",
      course: "Excel untuk Administrasi Perkantoran",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      testimoni:
        "Materi rumus logika IF bertingkat dan pivot table dari Mas Yudha langsung saya terapkan ke rekap absensi dan klaim kantor. Waktu pengerjaan laporan mingguan terpangkas dari 2 hari menjadi 30 menit saja!",
      badge: "Sertifikat PA-2026-0042",
      skorKuis: "Skor Kuis: 95/100",
    },
    {
      nama: "Bagus Santoso",
      peran: "Owner & Wirausaha Kuliner",
      instansi: "Kedai Kopi & Camilan Depok",
      course: "Dasar Pembukuan untuk UMKM",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      testimoni:
        "Dulu omzet kafe sering terpakai untuk keperluan pribadi karena tidak ada pos buku kas terpisah. Setelah ikut kelas ini, saya bisa catat kas harian dan melihat laporan laba bersih tiap akhir bulan tanpa pusing.",
      badge: "Sertifikat PA-2026-0078",
      skorKuis: "Skor Kuis: 88/100",
    },
    {
      nama: "Rizky Ramadhan",
      peran: "Staf Layanan Pelanggan",
      instansi: "Distributor Retail Depok",
      course: "Bahasa Inggris Percakapan di Tempat Kerja",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      testimoni:
        "Materi latihan email formal dan percakapan telepon kerja dari Mas Michael sangat aplikatif. Saya jadi berani menangani pertanyaan rekanan dan supplier luar negeri tanpa ragu tata bahasa.",
      badge: "Sertifikat PA-2026-0105",
      skorKuis: "Skor Kuis: 90/100",
    },
    {
      nama: "Siti Aminah",
      peran: "Pelaku Usaha Fashion Online",
      instansi: "Depok Digital Market",
      course: "Desain Konten Media Sosial dengan Canva",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      testimoni:
        "Kelas gratis Canva dari Mbak Laras daging semua isinya! Diajarkan psikologi warna, pemilihan font yang rapi, dan template kalender posting seminggu penuh. Tampilan feed Instagram toko jadi rapi dan penjualan naik.",
      badge: "Sertifikat PA-2026-0019",
      skorKuis: "Skor Kuis: 100/100",
    },
  ];

  return (
    <section id="testimoni" className="w-full py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1F382B] tracking-tight leading-tight">
            Dipercaya Alumni Staf Perkantoran & Wirausaha Depok
          </h2>
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
            Cerita nyata dari peserta yang telah menuntaskan seluruh modul, menaklukkan kuis evaluasi, dan menerima sertifikat digital resmi Pijar Aksara.
          </p>

          {/* Social Proof Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-zinc-200/50 text-xs font-bold text-zinc-700">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-black text-[#1F382B] text-sm">4.9 / 5.0</span>
              <span className="text-zinc-500 font-normal">Rata-rata Penilaian</span>
            </div>
            <div className="h-4 w-px bg-zinc-300 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>98% Tingkat Kelulusan Modul</span>
            </div>
            <div className="h-4 w-px bg-zinc-300 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#58816D]" />
              <span>250+ Sertifikat PA-2026 Diterbitkan</span>
            </div>
          </div>
        </div>

        {/* 4 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header: User Info & Rating */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                      <Image
                        src={item.avatar}
                        alt={item.nama}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1F382B] leading-tight">
                        {item.nama}
                      </h3>
                      <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                        {item.peran} · {item.instansi}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {[...Array(item.rating)].map((_, rIdx) => (
                      <Star key={rIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Course reference tag */}
                <div className="inline-block px-2.5 py-1 rounded-lg bg-zinc-100 text-[10px] font-bold text-zinc-700 mb-3">
                  Course: {item.course}
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed italic">
                  &ldquo;{item.testimoni}&rdquo;
                </p>
              </div>

              {/* Bottom Verification Badges */}
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-[#1F382B] bg-[#58816D]/10 px-2 py-0.5 rounded-md border border-[#58816D]/30">
                  {item.badge}
                </span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.skorKuis}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
