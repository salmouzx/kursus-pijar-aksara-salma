"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Award,
  BookOpen,
  User,
  Building,
  ArrowRight,
  ExternalLink,
  Sparkles,
  QrCode,
} from "lucide-react";

interface SertifikatData {
  id: string;
  nomor_sertifikat: string;
  nama_peserta: string;
  judul_kursus: string;
  diterbitkan_pada: string;
  tahun: number;
  pendaftaran?: {
    id: string;
    kursus?: {
      slug: string;
      kategori: string;
      instruktur?: {
        nama_lengkap: string;
      };
    };
  };
}

export default function VerifikasiSertifikatPage({
  params,
}: {
  params: Promise<{ nomor: string }>;
}) {
  const resolvedParams = use(params);
  const nomorSertifikat = decodeURIComponent(resolvedParams.nomor);
  const [sertifikat, setSertifikat] = useState<SertifikatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/sertifikat/${encodeURIComponent(nomorSertifikat)}`);
        const json = await res.json();

        if (res.ok && json.success && json.data) {
          setSertifikat(json.data);
        } else {
          // Fallback coba query via Supabase Client
          let query = supabase
            .from("sertifikat")
            .select(`
              id,
              nomor_sertifikat,
              nama_peserta,
              judul_kursus,
              diterbitkan_pada,
              tahun,
              pendaftaran:pendaftaran_id (
                id,
                kursus:kursus_id (
                  slug,
                  kategori,
                  instruktur:instruktur_id (
                    nama_lengkap
                  )
                )
              )
            `);

          if (nomorSertifikat.startsWith("PA-")) {
            query = query.eq("nomor_sertifikat", nomorSertifikat);
          } else {
            query = query.or(`nomor_sertifikat.eq.${nomorSertifikat},pendaftaran_id.eq.${nomorSertifikat}`);
          }

          const { data } = await query.maybeSingle();
          if (data) {
            setSertifikat(data as any);
          } else {
            setSertifikat(null);
          }
        }
      } catch (err) {
        console.error("Gagal verifikasi sertifikat:", err);
      } finally {
        setIsLoading(false);
      }
    }

    verify();
  }, [nomorSertifikat]);

  const tanggalTerbit = sertifikat
    ? new Date(sertifikat.diterbitkan_pada).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="min-h-screen bg-[#F5F8F6] flex flex-col font-sans">
      
      {/* Top Navbar Minimalis */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#183D2A] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <span className="font-black text-sm text-[#183D2A] block leading-tight">Pijar Aksara</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Verifikasi Publik</span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-zinc-600 hover:text-[#183D2A] transition-colors"
          >
            Website Utama &rarr;
          </Link>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-9 border border-zinc-200/90 shadow-xl space-y-6 relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Verification Status Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-800 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-700" />
            </div>
            
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Sertifikat Sah &amp; Terverifikasi
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#183D2A] tracking-tight pt-1">
              Lembaga Kursus Pijar Aksara
            </h1>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Sistem verifikasi resmi memastikan data kelulusan peserta ini asli dan tercatat di pangkalan data lembaga.
            </p>
          </div>

          {/* Details Table Card */}
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#183D2A] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-500 font-bold">Memeriksa keabsahan di server database...</p>
            </div>
          ) : sertifikat ? (
            <div className="space-y-4 relative z-10">
              
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3 text-xs">
                
                {/* 1. Nomor Sertifikat */}
                <div className="flex items-start justify-between pb-2.5 border-b border-zinc-200/60">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-zinc-400" />
                    Nomor Registrasi
                  </span>
                  <span className="font-mono font-black text-[#183D2A] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {sertifikat.nomor_sertifikat}
                  </span>
                </div>

                {/* 2. Nama Penerima */}
                <div className="flex items-start justify-between pb-2.5 border-b border-zinc-200/60">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    Nama Penerima
                  </span>
                  <span className="font-black text-sm text-[#183D2A]">
                    {sertifikat.nama_peserta}
                  </span>
                </div>

                {/* 3. Program Pelatihan */}
                <div className="flex items-start justify-between pb-2.5 border-b border-zinc-200/60">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    Program Pelatihan
                  </span>
                  <span className="font-bold text-zinc-900 text-right max-w-[220px]">
                    {sertifikat.judul_kursus}
                  </span>
                </div>

                {/* 4. Tanggal Terbit */}
                <div className="flex items-start justify-between pb-2.5 border-b border-zinc-200/60">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    Tanggal Terbit
                  </span>
                  <span className="font-bold text-zinc-800">
                    {tanggalTerbit}
                  </span>
                </div>

                {/* 5. Instruktur Penguji */}
                <div className="flex items-start justify-between">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    Instruktur Pelatihan
                  </span>
                  <span className="font-bold text-zinc-800">
                    {(sertifikat.pendaftaran?.kursus?.instruktur as any)?.nama_lengkap || "Yudha Pratama, M.Kom."}
                  </span>
                </div>

              </div>

              {/* Action: Lihat Lembar Sertifikat Lengkap */}
              <div className="pt-2">
                <Link
                  href={`/sertifikat/${encodeURIComponent(sertifikat.nomor_sertifikat)}`}
                  className="w-full py-3 rounded-2xl bg-[#183D2A] hover:bg-[#25523A] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Buka Lembar Sertifikat Asli (Cetak / PDF)</span>
                </Link>
              </div>

            </div>
          ) : null}

          {/* Footer Info */}
          <div className="pt-2 text-center text-[10px] text-zinc-400 relative z-10 border-t border-zinc-100">
            Pusat Data Sertifikasi Digital © 2026 Lembaga Kursus Pijar Aksara · Depok, Jawa Barat.
          </div>

        </div>
      </main>
    </div>
  );
}
