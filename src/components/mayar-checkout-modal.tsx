"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface MayarCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendaftaranId: string;
  invoiceId: string;
  judulKursus: string;
  nominal: number;
  batasBayar?: string | null;
  namaPeserta?: string;
  onPaymentSuccess: () => void;
}

export function MayarCheckoutModal({
  isOpen,
  onClose,
  pendaftaranId,
  invoiceId,
  judulKursus,
  nominal,
  batasBayar,
  namaPeserta,
  onPaymentSuccess,
}: MayarCheckoutModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<"qris" | "va">("qris");
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bni">("bca");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const vaNumbers: Record<string, string> = {
    bca: `3901${pendaftaranId.replace(/[^0-9]/g, "").padEnd(12, "0").slice(0, 12)}`,
    mandiri: `88708${pendaftaranId.replace(/[^0-9]/g, "").padEnd(11, "0").slice(0, 11)}`,
    bni: `988${pendaftaranId.replace(/[^0-9]/g, "").padEnd(13, "0").slice(0, 13)}`,
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/pembayaran/mayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaranId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Konfirmasi pembayaran gagal: " + (data.error || "Gagal memproses"));
      } else {
        onPaymentSuccess();
        onClose();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1F382B]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#58816D] text-white flex items-center justify-center shadow-xs font-bold text-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-[#1F382B]">Mayar Payment Gateway</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                  Verified
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 block">
                {invoiceId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Ringkasan Pesanan & Struk */}
          <div className="bg-zinc-50/90 rounded-2xl p-4 border border-zinc-200/80 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Tagihan Kursus
                </span>
                <h4 className="text-sm font-black text-[#1F382B] mt-0.5">
                  {judulKursus}
                </h4>
                {namaPeserta && (
                  <span className="text-[11px] text-zinc-600 block mt-0.5">
                    Peserta: <strong>{namaPeserta}</strong>
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Total Bayar
                </span>
                <span className="text-base sm:text-lg font-black text-[#1F382B] block">
                  Rp {nominal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {batasBayar && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  Batas Pembayaran: {new Date(batasBayar).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            )}
          </div>

          {/* Pemilihan Saluran Pembayaran Mayar */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-700 block">
              Pilih Metode Pembayaran Mayar:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannel("qris")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${selectedChannel === "qris"
                  ? "border-[#58816D] bg-[#58816D]/10 text-[#1F382B] ring-2 ring-[#58816D]/30"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700"
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedChannel === "qris" ? "bg-[#58816D] text-white" : "bg-zinc-100 text-zinc-600"}`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">QRIS Instant</div>
                  <div className="text-[10px] text-zinc-500">GoPay, OVO, Dana, BCA</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel("va")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${selectedChannel === "va"
                  ? "border-[#58816D] bg-[#58816D]/10 text-[#1F382B] ring-2 ring-[#58816D]/30"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700"
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedChannel === "va" ? "bg-[#58816D] text-white" : "bg-zinc-100 text-zinc-600"}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Virtual Account</div>
                  <div className="text-[10px] text-zinc-500">BCA, Mandiri, BNI</div>
                </div>
              </button>
            </div>
          </div>

          {/* Detail Struk Sesuai Metode Terpilih */}
          {selectedChannel === "qris" ? (
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-center space-y-3 shadow-xs">
              <div className="inline-block p-3 rounded-2xl bg-white border border-zinc-200 shadow-xs">
                {/* Visual QR Code Generator */}
                <div className="w-40 h-40 bg-zinc-900 rounded-xl p-2.5 mx-auto flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="w-full flex justify-between">
                    <div className="w-9 h-9 border-4 border-white rounded-lg flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-white rounded-xs"></div>
                    </div>
                    <div className="w-9 h-9 border-4 border-white rounded-lg flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-white rounded-xs"></div>
                    </div>
                  </div>
                  <div className="w-full flex justify-between items-center px-1">
                    <div className="w-4 h-4 bg-white/80 rounded-xs"></div>
                    <div className="px-2 py-0.5 bg-white text-zinc-900 text-[8px] font-black rounded-sm tracking-widest uppercase">
                      QRIS MAYAR
                    </div>
                    <div className="w-4 h-4 bg-white/80 rounded-xs"></div>
                  </div>
                  <div className="w-full flex justify-between">
                    <div className="w-9 h-9 border-4 border-white rounded-lg flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-white rounded-xs"></div>
                    </div>
                    <div className="w-9 h-9 border-4 border-white/60 rounded-lg flex items-center justify-center">
                      <div className="w-3.5 h-3.5 bg-white/80 rounded-xs"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-800 block">
                  Scan QRIS Menggunakan Aplikasi Pembayaran Favorit
                </span>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Dukung BCA Mobile, GoPay, OVO, Dana, ShopeePay, LinkAja, dan semua mobile banking.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-xs">
              <div className="flex gap-2">
                {(["bca", "mandiri", "bni"] as const).map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${selectedBank === bank
                      ? "border-[#58816D] bg-[#58816D] text-white shadow-2xs"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                      }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                    Nomor Virtual Account {selectedBank.toUpperCase()}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-[#1F382B]">
                    {vaNumbers[selectedBank]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(vaNumbers[selectedBank], selectedBank)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedText === selectedBank ? "Tersalin!" : "Salin"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Security info note */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>Enkripsi 256-Bit Mayar Gateway:</strong> Transaksi Anda terhubung secara real-time. Begitu konfirmasi pembayaran ditekan, sistem otomatis mengaktifkan status kursus dan membuka modul belajar.
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-full text-xs font-bold border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
          >
            Bayar Nanti
          </button>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="flex-1 py-3 px-5 rounded-full text-xs sm:text-sm font-extrabold bg-[#58816D] hover:bg-[#456655] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#456655] disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Memproses Konfirmasi Mayar...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Konfirmasi & Selesaikan Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
