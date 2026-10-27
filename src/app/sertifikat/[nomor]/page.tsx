"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import QRCode from "qrcode";
import {
  Award,
  Printer,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Download,
  Loader2,
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

export default function SertifikatDetailPage({
  params,
}: {
  params: Promise<{ nomor: string }>;
}) {
  const resolvedParams = use(params);
  const nomorSertifikat = decodeURIComponent(resolvedParams.nomor);
  const [sertifikat, setSertifikat] = useState<SertifikatData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCert() {
      setIsLoading(true);
      try {
        // Panggil Server-Side API yang mem-bypass RLS Supabase secara aman
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
        console.error("Gagal memuat sertifikat dari API:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCert();
  }, [nomorSertifikat]);

  // Generate QR Code lokal offline (data URL base64) tanpa ketergantungan API pihak ketiga
  useEffect(() => {
    if (sertifikat) {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://pijaraksara.test";
      const verificationUrl = `${origin}/verifikasi/${encodeURIComponent(sertifikat.nomor_sertifikat)}`;
      QRCode.toDataURL(verificationUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: "#183D2A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Gagal generate QR Code base64:", err));
    }
  }, [sertifikat]);

  // Cetak Dokumen (1 Halaman Penuh Presisi)
  const handlePrint = () => {
    window.print();
  };

  // Unduh Langsung File PDF (Langsung save file PDF ke komputer tanpa dialog print)
  const handleDownloadPDF = async () => {
    if (!certRef.current || !sertifikat) return;
    setIsDownloading(true);
    try {
      // Tunggu hingga font Google Fonts (Alex Brush, Cinzel) siap dirender
      if (typeof document !== "undefined" && (document as any).fonts) {
        await (document as any).fonts.ready;
      }

      const element = certRef.current;
      
      // html-to-image menggunakan engine browser asli (mendukung oklab & oklch Tailwind v4 tanpa error)
      const imgData = await toPng(element, {
        pixelRatio: 2, // Resolusi tinggi A4 tajam
        backgroundColor: "#FAF8F5",
        cacheBust: false,
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Format A4 Landscape: 297mm x 210mm
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210, undefined, "FAST");
      const safeName = (sertifikat.nama_peserta || "Peserta").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`Sertifikat_${sertifikat.nomor_sertifikat}_${safeName}.pdf`);
    } catch (err) {
      console.error("Gagal generate PDF langsung:", err);
      alert("Terjadi kendala saat merender PDF otomatis. Anda dapat menggunakan tombol 'Cetak' -> 'Simpan sebagai PDF'.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/verifikasi/${sertifikat?.nomor_sertifikat || nomorSertifikat}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-3 border-[#183D2A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-600 font-bold">Mempersiapkan Sertifikat Resmi Pijar Aksara...</p>
        </div>
      </div>
    );
  }

  if (!sertifikat) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center border border-zinc-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#1F382B]">Sertifikat Tidak Ditemukan</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Pastikan nomor sertifikat valid atau Anda telah menyelesaikan seluruh kuis kursus.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const tanggalTerbit = new Date(sertifikat.diterbitkan_pada).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const instrukturNama =
    (sertifikat.pendaftaran?.kursus?.instruktur as any)?.nama_lengkap || "Yudha Pratama, M.Kom.";

  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verifikasi/${encodeURIComponent(sertifikat.nomor_sertifikat)}`
      : `https://pijaraksara.test/verifikasi/${sertifikat.nomor_sertifikat}`;

  // QR Code URL via generator online yang andal & cepat
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    verificationUrl
  )}&color=18-61-42&bgcolor=ffffff&qzone=1`;

  return (
    <div className="min-h-screen bg-[#F3F4F1] flex flex-col font-sans print:bg-white print:p-0">
      
      {/* Google Fonts: Alex Brush untuk Nama Kaligrafi & Cinzel / Playfair untuk Kemewahan */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600;1,700&display=swap');
        
        .font-cursive {
          font-family: 'Alex Brush', cursive;
        }
        .font-cinzel {
          font-family: 'Cinzel', serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }

        /* PRINT CONFIGURATION: Tepat 1 Halaman A4 Landscape Tanpa Terpotong */
        @media print {
          @page {
            size: 297mm 210mm;
            margin: 0mm !important;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: white !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-container {
            width: 297mm !important;
            height: 209mm !important;
            max-width: 297mm !important;
            max-height: 209mm !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
            padding: 8mm 14mm 6mm 14mm !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden during Print) */}
      <div className="print-hidden bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[#183D2A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-200"
              title="Salin tautan verifikasi sertifikat"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
              <span>{copied ? "Tautan Tersalin!" : "Salin Tautan"}</span>
            </button>

            <Link
              href={`/verifikasi/${sertifikat.nomor_sertifikat}`}
              target="_blank"
              className="px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cek Validasi Publik</span>
            </Link>

            {/* Tombol Unduh PDF Langsung (300 DPI Resolution) */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-[#456655] disabled:opacity-60"
              title="Unduh langsung file PDF resmi ke komputer Anda"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isDownloading ? "Menyiapkan PDF..." : "Unduh Sertifikat (PDF)"}</span>
            </button>

            {/* Tombol Cetak Dokumen (1 Lembar Kertas A4) */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer border border-zinc-300"
              title="Buka dialog cetak printer"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Certificate Sheet Wrapper */}
      <main className="flex-1 py-8 sm:py-12 px-2 sm:px-4 flex items-center justify-center overflow-x-auto print:p-0 print:m-0">
        
        {/* Certificate Card Container (Ref terpasang untuk Download PDF & Cetak A4 Landscape) */}
        <div
          ref={certRef}
          className="print-container relative w-full max-w-[960px] aspect-[1.414/1] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-zinc-200/80 p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden select-none"
        >
          
          {/* ========================================================= */}
          {/* 1. CORNER GEOMETRIC WAVES (HIJAU TUA & EMAS MEWAH)       */}
          {/* ========================================================= */}
          
          {/* TOP-LEFT CORNER WAVES */}
          <div className="absolute top-0 left-0 w-56 sm:w-80 h-56 sm:h-80 pointer-events-none z-0">
            <svg viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                d="M-20 -20 L240 -20 C180 50 140 100 120 160 C90 240 40 280 -20 310 Z"
                fill="url(#emeraldGrad1)"
              />
              <path
                d="M-20 40 L210 -20 C160 50 130 95 105 150 C80 215 35 250 -20 270 Z"
                fill="url(#goldGrad1)"
                opacity="0.95"
              />
              <path
                d="M-20 80 L180 -20 C140 45 110 85 85 135 C60 190 20 220 -20 235 Z"
                fill="#0F281B"
              />
              <path
                d="M-20 90 Q120 40 100 155 Q80 230 -20 280"
                stroke="url(#goldGrad2)"
                strokeWidth="2.5"
                fill="none"
              />
              <defs>
                <linearGradient id="emeraldGrad1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0B1E14" />
                  <stop offset="45%" stopColor="#183D2A" />
                  <stop offset="100%" stopColor="#2D5A40" />
                </linearGradient>
                <linearGradient id="goldGrad1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="35%" stopColor="#F9E498" />
                  <stop offset="70%" stopColor="#C59B27" />
                  <stop offset="100%" stopColor="#8C6615" />
                </linearGradient>
                <linearGradient id="goldGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FDF2B5" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* BOTTOM-RIGHT CORNER WAVES */}
          <div className="absolute bottom-0 right-0 w-56 sm:w-80 h-56 sm:h-80 pointer-events-none z-0 rotate-180">
            <svg viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                d="M-20 -20 L240 -20 C180 50 140 100 120 160 C90 240 40 280 -20 310 Z"
                fill="url(#emeraldGrad2)"
              />
              <path
                d="M-20 40 L210 -20 C160 50 130 95 105 150 C80 215 35 250 -20 270 Z"
                fill="url(#goldGrad3)"
                opacity="0.95"
              />
              <path
                d="M-20 80 L180 -20 C140 45 110 85 85 135 C60 190 20 220 -20 235 Z"
                fill="#0F281B"
              />
              <path
                d="M-20 90 Q120 40 100 155 Q80 230 -20 280"
                stroke="url(#goldGrad4)"
                strokeWidth="2.5"
                fill="none"
              />
              <defs>
                <linearGradient id="emeraldGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0B1E14" />
                  <stop offset="45%" stopColor="#183D2A" />
                  <stop offset="100%" stopColor="#2D5A40" />
                </linearGradient>
                <linearGradient id="goldGrad3" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="35%" stopColor="#F9E498" />
                  <stop offset="70%" stopColor="#C59B27" />
                  <stop offset="100%" stopColor="#8C6615" />
                </linearGradient>
                <linearGradient id="goldGrad4" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FDF2B5" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* TOP-RIGHT & BOTTOM-LEFT ACCENT GOLD STRIPES */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-80">
            <svg viewBox="0 0 150 150" fill="none" className="w-full h-full">
              <path d="M150 0 L150 45 L45 0 Z" fill="url(#goldCorner)" />
              <path d="M150 0 L150 18 L18 0 Z" fill="#183D2A" />
              <defs>
                <linearGradient id="goldCorner" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F5D77F" />
                  <stop offset="100%" stopColor="#C59B27" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none opacity-80 rotate-180">
            <svg viewBox="0 0 150 150" fill="none" className="w-full h-full">
              <path d="M150 0 L150 45 L45 0 Z" fill="url(#goldCorner)" />
              <path d="M150 0 L150 18 L18 0 Z" fill="#183D2A" />
            </svg>
          </div>

          {/* INNER THIN GOLD DOUBLE BORDER FRAME */}
          <div className="absolute inset-3 sm:inset-5 border border-[#C59B27]/40 pointer-events-none z-10 rounded-2xl" />
          <div className="absolute inset-4 sm:inset-6 border-2 border-[#183D2A]/60 pointer-events-none z-10 rounded-xl" />

          {/* ========================================================= */}
          {/* 2. TOP RIGHT: GOLD EMBOSSED MEDAL SEAL BADGE             */}
          {/* ========================================================= */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-20 pointer-events-none flex flex-col items-center">
            <div className="relative w-16 h-16 sm:w-22 sm:h-22 flex items-center justify-center">
              
              {/* Ribbon Tails Dangling Down */}
              <div className="absolute -bottom-4 flex items-center gap-1.5">
                <svg width="18" height="32" viewBox="0 0 18 32" className="transform -rotate-12 filter drop-shadow-md">
                  <path d="M0 0 L18 0 L18 32 L9 24 L0 32 Z" fill="#183D2A" stroke="#C59B27" strokeWidth="1" />
                </svg>
                <svg width="18" height="32" viewBox="0 0 18 32" className="transform rotate-12 filter drop-shadow-md">
                  <path d="M0 0 L18 0 L18 32 L9 24 L0 32 Z" fill="#183D2A" stroke="#C59B27" strokeWidth="1" />
                </svg>
              </div>

              {/* Sunburst Scalloped Outer Medal */}
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#8C6615] via-[#F9E498] to-[#D4AF37] p-1 shadow-[0_6px_20px_rgba(212,175,55,0.4)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E2BA44] via-[#FFF3B8] to-[#A4791C] p-1 flex items-center justify-center border border-[#8C6615]">
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-[#D4AF37] to-[#8C6615] flex flex-col items-center justify-center text-center p-0.5 border border-white/60 shadow-inner">
                    <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#FFF6D0] drop-shadow-xs" />
                    <span className="text-[5px] sm:text-[7px] font-black font-cinzel uppercase tracking-widest text-[#FFF8D6] leading-none mt-0.5">
                      RESMI
                    </span>
                    <span className="text-[4px] sm:text-[5px] font-bold text-[#FFEDA0] tracking-tighter">
                      TERAKREDITASI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. CERTIFICATE HEADER (LOGO & JUDUL)                      */}
          {/* ========================================================= */}
          <div className="relative z-10 text-center space-y-1 pt-1">
            
            {/* Header Brand Bar: PIJAR AKSARA */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-white/70 backdrop-blur-xs rounded-full border border-[#D4AF37]/50 shadow-2xs">
                <div className="flex items-center gap-0.5 h-3.5">
                  <div className="w-1 h-3 bg-[#183D2A] rounded-full" />
                  <div className="w-1 h-4 bg-[#D4AF37] rounded-full" />
                  <div className="w-1 h-2 bg-[#2D5A40] rounded-full" />
                </div>
                <span className="font-cinzel font-black text-xs sm:text-sm tracking-[0.2em] text-[#183D2A]">
                  PIJAR AKSARA
                </span>
              </div>
            </div>

            <p className="text-[7px] sm:text-[9px] font-bold text-zinc-500 uppercase tracking-[0.25em]">
              Lembaga Kursus &amp; Pelatihan Kerja Terverifikasi
            </p>

            {/* Title: SERTIFIKAT KELULUSAN */}
            <div className="pt-0.5">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-cinzel font-black text-[#183D2A] tracking-[0.18em] uppercase leading-tight drop-shadow-xs">
                SERTIFIKAT
              </h1>
              <span className="block text-xs sm:text-lg lg:text-xl font-cinzel font-extrabold tracking-[0.25em] text-[#A67C1E] uppercase mt-0.5">
                KELULUSAN
              </span>
              <p className="text-[7px] sm:text-[9px] font-semibold text-zinc-400 tracking-[0.3em] uppercase">
                Certificate of Completion &amp; Competence
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. RECIPIENT CONTENT (NAMA & PERNYATAAN)                  */}
          {/* ========================================================= */}
          <div className="relative z-10 text-center space-y-1.5 sm:space-y-2.5 my-auto px-4">
            
            {/* Divider: DIBERIKAN KEPADA: */}
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#C59B27] to-[#C59B27]" />
              <span className="text-[8px] sm:text-[10px] font-cinzel font-extrabold tracking-[0.25em] text-[#183D2A] uppercase">
                Diberikan Kepada:
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#C59B27] to-[#C59B27]" />
            </div>

            {/* Nama Penerima (Font Latin Kaligrafi Mewah Senada Canva Michael Adebayo) */}
            <div className="py-0.5">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-cursive font-normal text-[#183D2A] tracking-normal leading-none px-4 drop-shadow-xs">
                {sertifikat.nama_peserta}
              </h2>
              <div className="w-40 sm:w-64 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-1.5" />
            </div>

            {/* Kalimat Keterangan Resmi */}
            <p className="text-[8px] sm:text-[11px] text-zinc-700 max-w-xl mx-auto leading-relaxed font-sans px-2">
              Atas keberhasilan dan dedikasinya dalam menyelesaikan seluruh modul materi pembelajaran, penugasan studi kasus kerja, serta evaluasi kuis akhir dengan predikat kelulusan <strong className="text-[#183D2A] font-extrabold">Sangat Baik</strong> pada program pelatihan:
            </p>

            {/* Nama Kursus Praktis */}
            <div className="pt-0.5">
              <h3 className="text-sm sm:text-lg lg:text-xl font-cinzel font-extrabold text-[#183D2A] tracking-wider uppercase">
                {sertifikat.judul_kursus}
              </h3>
            </div>

            {/* Pita Badge Tengah: KOMPETENSI TERVERIFIKASI (Senada Ribbon Karyawan Terbaik Canva) */}
            <div className="pt-0.5 flex justify-center">
              <div className="relative inline-flex items-center justify-center px-6 sm:px-8 py-1 sm:py-1.5 bg-gradient-to-r from-[#0F281B] via-[#183D2A] to-[#0F281B] border-y-2 border-[#D4AF37] rounded-sm shadow-md">
                <div className="text-center px-3">
                  <span className="block font-cinzel font-black text-[8px] sm:text-[10px] tracking-[0.2em] text-[#FFF4CC] uppercase">
                    KOMPETENSI TERVERIFIKASI
                  </span>
                  <span className="block text-[6px] sm:text-[7px] font-sans font-bold text-emerald-200 tracking-wider">
                    STANDAR SKKNI · BEBAN PELATIHAN 32 JAM (JP)
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* 5. FOOTER: DUA TANDA TANGAN & QR CODE VERIFIKASI RESMI    */}
          {/* ========================================================= */}
          <div className="relative z-10 pt-1.5 sm:pt-3 border-t border-zinc-300/80 grid grid-cols-3 items-end gap-2 sm:gap-4 px-2 sm:px-6">
            
            {/* Tanda Tangan Kiri: Direktur Lembaga */}
            <div className="text-center space-y-0.5 sm:space-y-1">
              <div className="h-8 sm:h-11 flex items-center justify-center">
                <svg viewBox="0 0 160 50" className="w-20 sm:w-28 h-6 sm:h-10 text-[#183D2A] opacity-90 stroke-current fill-none">
                  <path
                    d="M 15 35 Q 35 10 50 35 T 85 20 Q 95 10 115 30 T 145 15 M 40 28 Q 70 38 120 22"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="w-20 sm:w-28 h-0.5 bg-[#183D2A] mx-auto" />
              <p className="text-[9px] sm:text-[11px] font-bold text-[#183D2A] font-serif">
                Ratna Kusumawati
              </p>
              <p className="text-[7px] sm:text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
                Direktur Lembaga Kursus
              </p>
            </div>

            {/* Tengah: QR Code Validasi Asli & Nomor Registrasi */}
            <div className="text-center flex flex-col items-center justify-center space-y-0.5">
              <div className="p-1 bg-white rounded-lg border border-[#D4AF37]/80 shadow-2xs">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code Verifikasi Sertifikat ${sertifikat.nomor_sertifikat}`}
                    className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-zinc-100 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                  </div>
                )}
              </div>
              <div className="leading-tight">
                <span className="font-mono text-[7px] sm:text-[8px] font-extrabold text-[#183D2A] block">
                  {sertifikat.nomor_sertifikat}
                </span>
                <span className="text-[6px] sm:text-[7px] text-zinc-400 block">
                  Diterbitkan: {tanggalTerbit}
                </span>
              </div>
            </div>

            {/* Tanda Tangan Kanan: Instruktur Kursus */}
            <div className="text-center space-y-0.5 sm:space-y-1">
              <div className="h-8 sm:h-11 flex items-center justify-center">
                <svg viewBox="0 0 160 50" className="w-20 sm:w-28 h-6 sm:h-10 text-[#183D2A] opacity-90 stroke-current fill-none">
                  <path
                    d="M 20 40 Q 30 15 60 25 T 90 15 Q 110 5 130 35 M 35 25 L 140 30"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="w-20 sm:w-28 h-0.5 bg-[#183D2A] mx-auto" />
              <p className="text-[9px] sm:text-[11px] font-bold text-[#183D2A] font-serif truncate max-w-[130px] sm:max-w-none mx-auto">
                {instrukturNama}
              </p>
              <p className="text-[7px] sm:text-[8px] font-bold text-zinc-500 uppercase tracking-wider">
                Instruktur Praktisi Ahli
              </p>
            </div>

          </div>

          {/* Legal Watermark Footnote */}
          <div className="absolute bottom-1.5 inset-x-0 text-center text-[6px] sm:text-[7px] text-zinc-400 pointer-events-none select-none">
            Dokumen elektronik ini sah dan diterbitkan resmi oleh Sistem Informasi LMS Lembaga Kursus Pijar Aksara · Scan QR Code untuk verifikasi keaslian.
          </div>

        </div>

      </main>
    </div>
  );
}
