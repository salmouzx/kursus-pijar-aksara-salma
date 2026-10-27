"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/80 glass-panel text-zinc-900 relative overflow-hidden shadow-inner">
      {/* Subtle decorative ambient lights matching header */}
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-[#58816D]/15 blur-[120px]"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#B8D4C7]/20 blur-[120px]"></div>

      {/* Main Footer Grid (4 Columns) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

        {/* Col 1: Brand & Bio & Social Pills (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="inline-flex items-center gap-2.5 rounded-2xl bg-[#1F382B] px-3.5 py-2 shadow-xs text-white">
            <div className="w-6 h-6 rounded-xl bg-white/10 flex items-center justify-center text-[#EBF3EF]">
              <Sparkles className="w-3.5 h-3.5 text-[#EBF3EF]" />
            </div>
            <span className="font-black text-base text-white tracking-tight">
              Pijar Aksara
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-sm">
            Lembaga Pelatihan & Course singkat untuk pekerja kantor dan pelaku UMKM di Depok. Menggantikan proses manual dengan LMS terpadu: kuota otomatis, kuis aman server, dan sertifikat digital unik.
          </p>

          {/* Social Pill Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="https://instagram.com/pijaraksara.depok"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-all"
            >
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-[9px] text-white">
                IG
              </span>
              <span>@pijaraksara.depok</span>
            </a>

            <a
              href="https://wa.me/6281290008800"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-[#58816D]/30 bg-[#58816D]/10 hover:bg-[#58816D]/15 px-3 py-1.5 text-xs font-semibold text-[#58816D] shadow-2xs transition-all"
            >
              <span className="w-4 h-4 rounded-full bg-[#58816D] flex items-center justify-center text-[9px] text-white">
                WA
              </span>
              <span>0812-9000-8800</span>
            </a>
          </div>
        </div>

        {/* Col 2: COURSE TERBIT (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <span className="text-xs font-mono font-bold tracking-widest text-[#1F382B] uppercase block">
            KURSUS PILIHAN
          </span>
          <ul className="space-y-2.5 text-xs text-zinc-600">
            <li>
              <a href="#course" className="hover:text-[#1F382B] hover:underline transition-colors block">
                Excel Administrasi Kantor
              </a>
            </li>
            <li>
              <a href="#course" className="hover:text-[#1F382B] transition-colors flex items-center gap-1.5">
                <span className="hover:underline">Desain Canva Instagram</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#78A891] text-white rounded">Gratis</span>
              </a>
            </li>
            <li>
              <a href="#course" className="hover:text-[#1F382B] hover:underline transition-colors block">
                Bahasa Inggris Percakapan Kerja
              </a>
            </li>
            <li>
              <a href="#course" className="hover:text-[#1F382B] transition-colors flex items-center gap-1.5">
                <span className="hover:underline">Dasar Pembukuan UMKM</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-500 text-white rounded">Sisa 1</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: NAVIGASI & LAYANAN (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <span className="text-xs font-mono font-bold tracking-widest text-[#1F382B] uppercase block">
            NAVIGASI
          </span>
          <ul className="space-y-2.5 text-xs text-zinc-600">
            <li>
              <Link href="/#home" className="hover:text-[#1F382B] hover:underline transition-colors block">
                Home
              </Link>
            </li>
            <li>
              <Link href="/#course" className="hover:text-[#1F382B] hover:underline transition-colors block">
                Course
              </Link>
            </li>
            <li>
              <Link href="/#mentor" className="hover:text-[#1F382B] hover:underline transition-colors block">
                Mentor
              </Link>
            </li>
            <li>
              <Link href="/#layanan" className="hover:text-[#1F382B] hover:underline transition-colors block">
                Services
              </Link>
            </li>
            <li>
              <Link href="/#testimoni" className="hover:text-[#1F382B] hover:underline transition-colors block">
                Testimonials
              </Link>
            </li>
            <li>
              <Link href="/#kontak" className="hover:text-[#1F382B] hover:underline transition-colors block">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: KANTOR & MAPS EMBED (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <span className="text-xs font-mono font-bold tracking-widest text-[#1F382B] uppercase block">
            KANTOR DEPOK
          </span>
          <p className="text-xs text-zinc-600 leading-relaxed">
            <strong className="text-[#1F382B] block font-semibold">Pijar Aksara Learning Center</strong>
            Jl. Margonda Raya No. 120, Kemiri Muka, Beji, Kota Depok, Jawa Barat 16423
          </p>

          {/* Embedded Google Maps Box with clean light border */}
          <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100 shadow-inner group">
            <iframe
              src="https://maps.google.com/maps?q=Margonda%20Raya%2C%20Depok&t=&z=14&ie=UTF8&iwloc=&output=embed"
              title="Peta Lokasi Pijar Aksara Depok"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 transition-all opacity-100 group-hover:grayscale group-hover:opacity-85"
            ></iframe>
            <a
              href="https://maps.google.com/?q=Margonda+Raya+Depok"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-[#1F382B] border border-zinc-200 shadow-xs hover:bg-zinc-100 transition-colors flex items-center gap-1"
            >
              <span>Buka Maps</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

        </div>

      </div>

      {/* Bottom Bar: Copyright & Payment verification */}
      <div className="border-t border-zinc-200/80 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © 2026 Pijar Aksara · Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#58816D]" />
              <span>Pembayaran aman diproses via Mayar.id & verifikasi admin</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
