"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Award,
  ShieldCheck,
  BookOpen,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { EnrollmentDialog } from "@/components/enrollment-dialog";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface EnrollmentActionProps {
  kursus: {
    id: string;
    judul: string;
    slug: string;
    harga: number;
    kuota: number;
    kategori: string;
    sisa_kursi: number;
    instruktur_id?: string;
  };
}

interface EnrollmentRecord {
  id: string;
  status: "menunggu_bayar" | "aktif" | "selesai" | "kedaluwarsa" | "dibatalkan";
  didaftarkan_pada: string;
  batas_bayar?: string;
  mayar_invoice_id?: string;
  nominal?: number;
}

export function EnrollmentAction({ kursus }: EnrollmentActionProps) {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [enrollment, setEnrollment] = useState<EnrollmentRecord | null>(null);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);

  const isFull = kursus.sisa_kursi <= 0;
  const isFree = kursus.harga === 0;

  // Fungsi fetch status pendaftaran peserta secara live dari Supabase & Mayar
  const checkEnrollmentStatus = useCallback(async (manualAlert = false) => {
    if (!currentUser?.id || currentUser.peran !== "peserta") {
      setEnrollment(null);
      return;
    }

    try {
      setIsCheckingEnrollment(true);
      const { data, error } = await supabase
        .from("pendaftaran")
        .select("id, status, didaftarkan_pada, batas_bayar, mayar_invoice_id, nominal")
        .eq("kursus_id", kursus.id)
        .eq("peserta_id", currentUser.id)
        .in("status", ["aktif", "selesai", "menunggu_bayar"])
        .order("didaftarkan_pada", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        // Jika status masih menunggu_bayar, sinkronkan langsung dengan Mayar
        if (data.status === "menunggu_bayar") {
          try {
            const mayarRes = await fetch(`/api/pembayaran/mayar?pendaftaranId=${data.id}`);
            if (mayarRes.ok) {
              const mayarData = await mayarRes.json();
              if (mayarData.status === "aktif") {
                setEnrollment({ ...(data as EnrollmentRecord), status: "aktif" });
                if (manualAlert) {
                  alert("Pembayaran Mayar berhasil diverifikasi! Kursus Anda telah aktif.");
                }
                return;
              }
            }
          } catch (mErr) {
            console.warn("Gagal cek status Mayar di background:", mErr);
          }
        }

        setEnrollment(data as EnrollmentRecord);
        if (manualAlert) {
          if (data.status === "menunggu_bayar") {
            alert("Status pembayaran di Mayar belum terdeteksi lunas. Silakan selesaikan pembayaran terlebih dahulu.");
          } else {
            alert(`Status kursus: ${data.status}`);
          }
        }
      } else {
        setEnrollment(null);
      }
    } catch (err) {
      console.error("Gagal memeriksa status pendaftaran:", err);
      if (manualAlert) {
        alert("Gagal memeriksa status pendaftaran.");
      }
    } finally {
      setIsCheckingEnrollment(false);
    }
  }, [currentUser?.id, currentUser?.peran, kursus.id]);

  // Listener live: Supabase Realtime + Polling bila menunggu bayar
  useEffect(() => {
    checkEnrollmentStatus();

    if (!currentUser?.id || currentUser.peran !== "peserta") return;

    // 1. Setup Supabase Realtime subscription
    const channel = supabase
      .channel(`pendaftaran_live_${currentUser.id}_${kursus.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pendaftaran",
          filter: `peserta_id=eq.${currentUser.id}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.kursus_id === kursus.id) {
            setEnrollment(payload.new as EnrollmentRecord);
          }
        }
      )
      .subscribe();

    // 2. Polling interval jika sedang dalam status menunggu bayar (untuk deteksi webhook Mayar otomatis)
    let pollInterval: NodeJS.Timeout | null = null;
    if (enrollment?.status === "menunggu_bayar") {
      pollInterval = setInterval(() => {
        checkEnrollmentStatus();
      }, 4000);
    }

    return () => {
      supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentUser?.id, currentUser?.peran, kursus.id, enrollment?.status, checkEnrollmentStatus]);

  const handleEnrollClick = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setIsEnrollOpen(true);
    }
  };

  // 1. TAMPILAN KHUSUS INSTRUKTUR (BR-05 & PRD Bab 7)
  if (currentUser && currentUser.peran === "instruktur") {
    const isOwner =
      currentUser.id === kursus.instruktur_id ||
      (currentUser as any).id === kursus.instruktur_id;

    return (
      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-[#58816D]/10 border border-[#58816D]/30 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#234e36]">
            <BookOpen className="w-4 h-4 text-[#58816D]" />
            <span>{isOwner ? "Anda Pengajar Kursus Ini" : "Akun Instruktur"}</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {isOwner
              ? "Anda adalah instruktur yang mengampu kursus ini. Silakan kelola kurikulum, video, modul, dan butir soal kuis di panel instruktur."
              : "Anda saat ini masuk sebagai instruktur. Pendaftaran kursus hanya berlaku untuk akun dengan peran Peserta."}
          </p>
          <Link
            href="/instruktur/kursus"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>{isOwner ? "Kelola Materi & Kuis Kursus" : "Buka Panel Instruktur"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#58816D] shrink-0" />
            <span>Materi dan soal yang Anda buat langsung tampil di Peserta</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#58816D] shrink-0" />
            <span>Pantau riwayat nilai kuis peserta di tab Peserta & Nilai</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. TAMPILAN KHUSUS ADMIN
  if (currentUser && currentUser.peran === "admin") {
    return (
      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Mode Administrator Sistem</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Anda login dengan wewenang admin. Anda dapat meninjau kursus, mengonfirmasi pembayaran, atau melihat daftar peserta.
          </p>
          <Link
            href="/admin/dashboard"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0C0D45] hover:bg-[#181a6f] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>Buka Panel Admin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. TAMPILAN PESERTA DENGAN STATUS AKTIF (SUDAH BAYAR / SELESAI - LIVE)
  if (enrollment && (enrollment.status === "aktif" || enrollment.status === "selesai")) {
    const isCompleted = enrollment.status === "selesai";

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div
          className={`p-5 rounded-2xl border space-y-2.5 ${
            isCompleted
              ? "bg-amber-50/70 border-amber-200 text-amber-900"
              : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              {isCompleted ? (
                <Award className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>{isCompleted ? "Kursus Telah Selesai (Lulus)" : "Pendaftaran Anda Aktif"}</span>
            </div>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isCompleted
                  ? "bg-amber-200/80 text-amber-900"
                  : "bg-emerald-200/80 text-emerald-900"
              }`}
            >
              {isCompleted ? "Selesai" : "Sudah Dibayar"}
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {isCompleted
              ? "Selamat! Anda telah menyelesaikan seluruh modul dan lulus kuis kursus ini. Sertifikat resmi Anda telah terbit."
              : "Pembayaran Anda telah terkonfirmasi. Materi dan kuis ruang belajar kini sudah bisa Anda akses sepenuhnya."}
          </p>

          <Link
            href={`/belajar/${kursus.slug}/1`}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#58816D]/20 cursor-pointer"
          >
            <span>{isCompleted ? "Review Materi Belajar" : "Lanjut Belajar di Ruang Belajar"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {isCompleted && (
            <Link
              href="/peserta/sertifikat"
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Lihat Sertifikat Kelulusan</span>
            </Link>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Status akun tersinkronisasi live</span>
          <button
            onClick={() => checkEnrollmentStatus()}
            className="flex items-center gap-1 text-[#58816D] hover:underline font-bold text-[11px]"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingEnrollment ? "animate-spin" : ""}`} />
            <span>Perbarui Status</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. TAMPILAN PESERTA DENGAN STATUS MENUNGGU BAYAR (LIVE)
  if (enrollment && enrollment.status === "menunggu_bayar") {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Menunggu Pembayaran</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
              Batas 24 Jam
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Anda telah memesan kursi kursus ini. Silakan selesaikan pembayaran Mayar untuk mengaktifkan akses materi dan kuis.
          </p>

          <button
            onClick={() => setIsEnrollOpen(true)}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-600/20 cursor-pointer"
          >
            <span>Selesaikan Pembayaran Sekarang (Mayar)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => checkEnrollmentStatus(true)}
            disabled={isCheckingEnrollment}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingEnrollment ? "animate-spin" : ""}`} />
            <span>{isCheckingEnrollment ? "Mengecek ke Mayar..." : "Cek Status Pembayaran Mayar"}</span>
          </button>

          <Link
            href="/peserta/dashboard"
            className="block text-center text-[11px] text-zinc-500 hover:text-zinc-800 font-semibold pt-1 underline"
          >
            Buka Tagihan di Kursus Saya
          </Link>
        </div>

        <EnrollmentDialog
          isOpen={isEnrollOpen}
          onClose={() => setIsEnrollOpen(false)}
          onSuccess={() => {
            checkEnrollmentStatus();
          }}
          kursus={{
            id: kursus.id,
            judul: kursus.judul,
            slug: kursus.slug,
            kategori: (kursus.kategori || "Perkantoran") as any,
            harga: kursus.harga,
            kuota: kursus.kuota,
            terpakai: Math.max(0, kursus.kuota - kursus.sisa_kursi),
            sisaKursi: kursus.sisa_kursi,
            instrukturId: kursus.instruktur_id || "00000000-0000-4000-a000-000000000011",
            instrukturNama: "Instruktur Pijar Aksara",
            instrukturAvatar: "/mentors/yudha.jpg",
            instrukturGelar: "Trainer Praktisi",
            deskripsi: "",
            ringkasan: "",
            modul: [],
            totalDurasiMenit: 60,
            nilaiLulus: 70,
            status: "terbit",
            image: "/download.jpeg",
          }}
          currentUser={currentUser}
        />
      </div>
    );
  }

  // 5. TAMPILAN DEFAULT PESERTA / PENGUNJUNG BELUM DAFTAR
  return (
    <>
      <div className="space-y-4">
        {isFull ? (
          <div className="w-full py-3.5 px-4 rounded-2xl bg-zinc-100 text-zinc-400 font-bold text-center text-sm border border-zinc-200 cursor-not-allowed flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Pendaftaran Ditutup (Kuota Penuh)</span>
          </div>
        ) : (
          <button
            onClick={handleEnrollClick}
            className="w-full py-4 px-6 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white font-extrabold text-sm sm:text-base shadow-sm hover:shadow-lg hover:shadow-[#58816D]/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{isFree ? "Daftar Sekarang (Gratis)" : "Daftar & Amankan Kursi"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#75CBD1] shrink-0" />
            <span>Akses materi langsung aktif setelah pendaftaran</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#75CBD1] shrink-0" />
            <span>Sertifikat resmi bernomor unik terbit otomatis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#75CBD1] shrink-0" />
            <span>Kuis pilihan ganda interaktif dengan feedback instan</span>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab="login"
        onSuccessLogin={() => {
          setIsAuthOpen(false);
          setIsEnrollOpen(true);
        }}
      />

      <EnrollmentDialog
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
        onSuccess={() => {
          checkEnrollmentStatus();
        }}
        kursus={{
          id: kursus.id,
          judul: kursus.judul,
          slug: kursus.slug,
          kategori: (kursus.kategori || "Perkantoran") as any,
          harga: kursus.harga,
          kuota: kursus.kuota,
          terpakai: Math.max(0, kursus.kuota - kursus.sisa_kursi),
          sisaKursi: kursus.sisa_kursi,
          instrukturId: kursus.instruktur_id || "00000000-0000-4000-a000-000000000011",
          instrukturNama: "Instruktur Pijar Aksara",
          instrukturAvatar: "/mentors/yudha.jpg",
          instrukturGelar: "Trainer Praktisi",
          deskripsi: "",
          ringkasan: "",
          modul: [],
          totalDurasiMenit: 60,
          nilaiLulus: 70,
          status: "terbit",
          image: "/download.jpeg",
        }}
        currentUser={currentUser}
      />
    </>
  );
}
