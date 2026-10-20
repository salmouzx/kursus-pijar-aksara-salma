import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, Mail, Phone, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-zinc-200/80 mt-16 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-950 flex items-center justify-center text-[#bef264]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-zinc-950">
                Pijar Aksara
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Lembaga Kursus singkat untuk pekerja kantor dan pelaku UMKM di Depok dan seluruh Indonesia.
            </p>
            <div className="text-[11px] text-zinc-600 space-y-1 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Kota Depok, Jawa Barat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>kontak@pijaraksara.test</span>
              </div>
            </div>
          </div>

          {/* Published Courses Sitemap (SEO BR-01) */}
          <div>
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-3">
              Kursus Terbit (Sitemap)
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li>
                <Link href="/kursus/excel-administrasi-perkantoran" className="hover:text-sky-600 transition-colors">
                  Excel Administrasi Kantor
                </Link>
              </li>
              <li>
                <Link href="/kursus/desain-konten-canva" className="hover:text-sky-600 transition-colors">
                  Desain Konten Canva (Gratis)
                </Link>
              </li>
              <li>
                <Link href="/kursus/bahasa-inggris-percakapan-kerja" className="hover:text-sky-600 transition-colors">
                  Bahasa Inggris Kerja
                </Link>
              </li>
              <li>
                <Link href="/kursus/dasar-pembukuan-umkm" className="hover:text-sky-600 transition-colors">
                  Dasar Pembukuan UMKM
                </Link>
              </li>
            </ul>
          </div>

          {/* Aturan & Kepatuhan LMS */}
          <div>
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-3">
              Kepatuhan PRD & ERD
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>BR-01 s/d BR-12 Terpenuhi</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Row Level Security (RLS) Database</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Anti Race Condition (FOR UPDATE)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Audit Log Transaksi Sensitif</span>
              </li>
            </ul>
          </div>

          {/* Stack & Sertifikasi */}
          <div>
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-3">
              Standar Capstone
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed mb-3">
              Dibangun dengan Next.js App Router (TypeScript), Supabase (Auth, Postgres, RLS, Storage), dan Tailwind CSS/shadcn.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Sertifikat Format PA-2026-XXXX</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div>
            © 2026 Lembaga Kursus Pijar Aksara. Hak cipta dilindungi undang-undang.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Capstone Project Bootcamp AI Web Programming</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
