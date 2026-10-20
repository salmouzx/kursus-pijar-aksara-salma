"use client";

import React, { useState } from "react";
import { X, CheckCircle, Clock, ShieldCheck, ArrowRight, CreditCard, Banknote, Sparkles } from "lucide-react";
import { Kursus } from "@/data/courses";

interface EnrollmentDialogProps {
  kursus: Kursus | null;
  isOpen: boolean;
  currentUser: { nama: string; email: string; peran: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrollmentDialog({ kursus, isOpen, currentUser, onClose, onSuccess }: EnrollmentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"transfer_manual" | "mayar">("transfer_manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen || !kursus) return null;

  const isFree = kursus.harga === 0;

  const handleConfirmEnrollment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-[32px] border border-zinc-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-zinc-900">Konfirmasi Pendaftaran Kursus</span>
          </div>
          <button
            onClick={() => { setIsCompleted(false); onClose(); }}
            className="w-7 h-7 rounded-full border border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {isCompleted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-zinc-950">
                {isFree ? "Pendaftaran Berhasil Aktif!" : "Menunggu Pembayaran (Batas 24 Jam)"}
              </h3>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                {isFree ? (
                  <>Kursus gratis Anda langsung berstatus <strong>Aktif</strong> (BR-07). Anda dapat langsung membuka Modul 1 di Ruang Belajar.</>
                ) : (
                  <>Pendaftaran berhasil dicatat dengan status <strong>Menunggu Bayar</strong> (BR-07). Selesaikan konfirmasi sebelum batas waktu 24 jam agar kursi Anda tidak kedaluwarsa.</>
                )}
              </p>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-left text-xs space-y-1.5 mt-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kursus:</span>
                  <span className="font-bold text-zinc-900">{kursus.judul}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Peserta:</span>
                  <span className="font-semibold text-zinc-900">{currentUser?.nama || "Peserta"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Nominal:</span>
                  <span className="font-bold text-zinc-900">
                    {isFree ? "Rp 0 (Gratis)" : `Rp ${kursus.harga.toLocaleString("id-ID")}`}
                  </span>
                </div>
                {!isFree && (
                  <div className="flex justify-between pt-1 border-t border-zinc-200">
                    <span className="text-zinc-500">Batas Waktu:</span>
                    <span className="font-mono font-bold text-amber-700">24 Jam dari Sekarang</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setIsCompleted(false);
                  onSuccess();
                  onClose();
                }}
                className="w-full py-3 rounded-full text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white shadow-md transition-all mt-4"
              >
                Lihat di Kursus Saya
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{kursus.kategori}</span>
                <h3 className="text-lg font-extrabold text-zinc-950 mt-0.5">{kursus.judul}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Instruktur: {kursus.instrukturNama} · {kursus.modul.length} Modul · Sisa {kursus.sisaKursi} Kursi
                </p>
              </div>

              {/* Price Tag */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-600">Total Investasi Kursus:</span>
                <span className="text-base font-black text-zinc-950">
                  {isFree ? "Rp 0 (Gratis)" : `Rp ${kursus.harga.toLocaleString("id-ID")}`}
                </span>
              </div>

              {/* Payment Methods (if not free) */}
              {!isFree && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">Pilih Metode Pembayaran (BR-07 / Fitur Mayar):</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer_manual")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === "transfer_manual"
                          ? "border-zinc-950 bg-zinc-900 text-white shadow-xs"
                          : "border-zinc-200 hover:border-zinc-400 bg-white text-zinc-800"
                      }`}
                    >
                      <Banknote className="w-4 h-4 mb-1" />
                      <div className="text-xs font-bold">Transfer Bank</div>
                      <div className="text-[10px] opacity-75">Konfirmasi Admin</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mayar")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === "mayar"
                          ? "border-sky-600 bg-sky-600 text-white shadow-xs"
                          : "border-zinc-200 hover:border-zinc-400 bg-white text-zinc-800"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1" />
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>Mayar Gateway</span>
                        <Sparkles className="w-3 h-3 text-[#bef264]" />
                      </div>
                      <div className="text-[10px] opacity-75">QRIS / VA Otomatis</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Business Rule Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-tight">
                <strong>Aturan Pendaftaran (BR-05 & BR-06):</strong> 1 akun peserta hanya boleh memiliki 1 pendaftaran aktif per kursus. Sisa kursi dijamin aman dari bentrok saat mendaftar bersamaan.
              </div>

              <button
                onClick={handleConfirmEnrollment}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full text-xs font-bold bg-[#bef264] hover:bg-[#a3e635] text-zinc-950 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Memproses Pendaftaran...</span>
                ) : (
                  <>
                    <span>Konfirmasi Pendaftaran Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
