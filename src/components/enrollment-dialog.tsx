"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  Banknote,
  Sparkles,
  AlertCircle,
  QrCode,
  CheckCircle2,
  Flame,
  ExternalLink,
} from "lucide-react";
import { Kursus } from "@/data/courses";
import { getCoursePriceInfo } from "@/lib/course-pricing";
import { MayarCheckoutModal } from "@/components/mayar-checkout-modal";

interface EnrollmentDialogProps {
  kursus: Kursus | null;
  isOpen: boolean;
  currentUser: { id?: string; nama: string; email: string; peran: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrollmentDialog({
  kursus,
  isOpen,
  currentUser,
  onClose,
  onSuccess,
}: EnrollmentDialogProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"mayar" | "transfer_manual">("mayar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Hasil setelah daftar
  const [enrollResult, setEnrollResult] = useState<{
    pendaftaranId?: string;
    isFree: boolean;
    status: string;
    invoiceCode?: string;
    paymentLink?: string | null;
    batasBayar?: string;
    redirectUrl?: string;
  } | null>(null);

  if (!isOpen || !kursus) return null;

  // Cek harga efektif dan diskon (termasuk jika diubah oleh admin)
  const priceInfo = getCoursePriceInfo(kursus.id, kursus.harga, true);
  const effectivePrice = priceInfo.hargaFinal;
  const isFree = effectivePrice === 0;

  // Eksekusi Pendaftaran
  const handleConfirmEnrollment = async () => {
    if (!currentUser?.id) {
      setErrorMessage("Silakan masuk terlebih dahulu untuk mendaftar kursus.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/pendaftaran/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kursusId: kursus.id,
          pesertaId: currentUser.id,
          metodeBayar: isFree ? "gratis" : paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal mendaftar kursus.");
      } else {
        setEnrollResult(data);
        onSuccess();

        // Otomatis buka link pembayaran Mayar di tab baru HANYA jika link invoice resmi
        if (data.paymentLink && data.paymentLink.includes("/invoices/")) {
          window.open(data.paymentLink, "_blank");
        } else if (!data.isFree) {
          setShowCheckoutModal(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEnrollResult(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#58816D]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-[28px] border border-zinc-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#234e36]"></span>
            <span className="text-xs font-bold text-zinc-900">
              {enrollResult ? "Status Pendaftaran Kursus" : "Konfirmasi Pendaftaran Kursus"}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full border border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* 1. TAMPILAN SUKSES / SELESAI */}
          {enrollResult ? (
            <div className="text-center py-1 space-y-4">

              {/* KURSUS GRATIS: PROTOTYPE PRESENTASI */}
              {enrollResult.isFree ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-[#234e36]/15 text-[#234e36] flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="w-7 h-7 text-[#234e36]" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
                      Prototype Mode: Auto-Active
                    </span>
                    <h3 className="text-lg font-black text-[#1F382B] mt-2">
                      Pendaftaran Kursus Gratis Aktif!
                    </h3>
                    <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed mt-1">
                      Kursus langsung aktif tanpa biaya. Anda dapat segera mencoba modul belajar, mengerjakan kuis, dan menerbitkan sertifikat kelulusan resmi.
                    </p>
                  </div>

                  {/* Ringkasan */}
                  <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-left text-xs space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Kursus:</span>
                      <span className="font-bold text-zinc-900">{kursus.judul}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Peserta:</span>
                      <span className="font-semibold text-zinc-900">{currentUser?.nama || "Peserta"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status Akses:</span>
                      <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aktif Belajar</span>
                      </span>
                    </div>
                  </div>

                  {/* CTA Langsung Belajar */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => {
                        handleClose();
                        router.push(`/belajar/${kursus.slug}/1`);
                      }}
                      className="flex-1 py-3 px-4 rounded-full text-xs font-black bg-[#234e36] hover:bg-[#1a3d29] text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Mulai Belajar Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        handleClose();
                        router.push("/dashboard");
                      }}
                      className="py-3 px-4 rounded-full text-xs font-bold border border-zinc-200 hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer"
                    >
                      Kursus Saya
                    </button>
                  </div>
                </>
              ) : (
                /* KURSUS BERBAYAR: MAYAR GATEWAY RESMI */
                <>
                  {enrollResult.status === "aktif" ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-black text-[#1F382B]">
                        Pembayaran Mayar Diterima!
                      </h3>
                      <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                        Konfirmasi dari Mayar Payment Gateway telah berhasil diverifikasi. Kursus Anda kini aktif dan siap dipelajari.
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                          onClick={() => {
                            handleClose();
                            router.push(`/belajar/${kursus.slug}/1`);
                          }}
                          className="flex-1 py-3 px-4 rounded-full text-xs font-black bg-[#234e36] hover:bg-[#1a3d29] text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Masuk ke Ruang Belajar</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            handleClose();
                            router.push("/dashboard");
                          }}
                          className="py-3 px-4 rounded-full text-xs font-bold border border-zinc-200 hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer"
                        >
                          Lihat Kursus Saya
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                        <Clock className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-black text-[#1F382B]">
                        Menunggu Pembayaran Mayar
                      </h3>
                      <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                        Pendaftaran tercatat. Kursi Anda telah diamankan selama <strong>24 jam</strong>.
                      </p>

                      <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-left text-xs space-y-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Nomor Invoice:</span>
                          <span className="font-mono font-bold text-zinc-900">{enrollResult.invoiceCode}</span>
                        </div>
                        {priceInfo.isDiscounted && (
                          <div className="flex justify-between text-zinc-500">
                            <span>Harga Normal:</span>
                            <span className="line-through">Rp {priceInfo.hargaAwal.toLocaleString("id-ID")}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Total Tagihan:</span>
                          <span className="font-extrabold text-[#1F382B]">
                            Rp {priceInfo.hargaFinal.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Metode:</span>
                          <span className="font-bold text-[#58816D]">Mayar (QRIS / VA / E-Wallet)</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-zinc-200">
                          <span className="text-zinc-500">Batas Waktu:</span>
                          <span className="font-bold text-amber-700">24 Jam dari Sekarang</span>
                        </div>
                      </div>

                      {/* Tombol Buka Invoice Resmi Mayar / Modal Checkout */}
                      <div className="space-y-1.5 pt-1">
                        {enrollResult.paymentLink && enrollResult.paymentLink.includes("/invoices/") ? (
                          <a
                            href={enrollResult.paymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-center"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Buka Pembayaran Resmi Mayar (QRIS / VA)</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowCheckoutModal(true)}
                            className="w-full py-3 px-4 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-center"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Buka Struk & Bayar via Mayar (QRIS / VA)</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          handleClose();
                          router.push("/peserta/tagihan");
                        }}
                        className="w-full py-2.5 rounded-full text-xs font-bold border border-zinc-200 hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer mt-1"
                      >
                        Buka di Halaman Tagihan Saya
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            /* 2. FORM PENDAFTARAN AWAL */
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-[#58816D] uppercase tracking-wider">{kursus.kategori}</span>
                <h3 className="text-lg font-extrabold text-[#1F382B] mt-0.5">{kursus.judul}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Instruktur: {kursus.instrukturNama} · {kursus.modul.length} Modul · Sisa {kursus.sisaKursi} Kursi
                </p>
              </div>

              {/* Price Tag with Discount Summary */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-zinc-600 block">Total Investasi Kursus:</span>
                    {isFree && (
                      <span className="text-[11px] text-emerald-600 font-bold">Tersedia untuk Demo Prototype</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-2">
                      <span className="text-lg font-black text-[#1F382B]">
                        {isFree ? "Rp 0 (Gratis)" : `Rp ${priceInfo.hargaFinal.toLocaleString("id-ID")}`}
                      </span>
                      {priceInfo.isDiscounted && (
                        <span className="text-xs text-zinc-400 line-through font-semibold">
                          Rp {priceInfo.hargaAwal.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {priceInfo.isDiscounted && (
                  <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-xs font-bold text-rose-700 bg-rose-50/60 -mx-2 px-3 py-1.5 rounded-xl">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      Diskon Promosi ({priceInfo.diskonPersen}%)
                    </span>
                    <span>- Rp {priceInfo.hematNominal.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              {/* Payment Methods (if not free) */}
              {!isFree && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">Pilih Saluran Pembayaran:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mayar")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${paymentMethod === "mayar"
                          ? "border-[#58816D] bg-[#58816D] text-white shadow-xs"
                          : "border-zinc-200 hover:border-zinc-400 bg-white text-zinc-800"
                        }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1" />
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>Mayar Gateway</span>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                      </div>
                      <div className="text-[10px] opacity-80">QRIS / VA / E-Wallet</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer_manual")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${paymentMethod === "transfer_manual"
                          ? "border-[#58816D] bg-[#58816D] text-white shadow-xs"
                          : "border-zinc-200 hover:border-zinc-400 bg-white text-zinc-800"
                        }`}
                    >
                      <Banknote className="w-4 h-4 mb-1" />
                      <div className="text-xs font-bold">Transfer Bank</div>
                      <div className="text-[10px] opacity-80">Verifikasi Admin</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{errorMessage}</span>
                    {errorMessage.includes("sudah memiliki pendaftaran") && (
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            handleClose();
                            router.push("/dashboard");
                          }}
                          className="px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold"
                        >
                          Buka Kursus Saya
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business Rule Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-tight">
                <strong>Aturan Pendaftaran:</strong> 1 akun peserta hanya boleh memiliki 1 pendaftaran aktif per kursus. Kuota kursi dihitung secara real-time dan terjamin anti-bentrok.
              </div>

              <button
                onClick={handleConfirmEnrollment}
                disabled={isSubmitting}
                className="w-full py-4 rounded-full text-xs sm:text-sm font-extrabold bg-[#234e36] hover:bg-[#1a3d29] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Memproses Pendaftaran...</span>
                ) : (
                  <>
                    <span>{isFree ? "Daftar Sekarang (Akses Langsung)" : "Lanjutkan Pembayaran Mayar"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {showCheckoutModal && enrollResult && (
        <MayarCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          pendaftaranId={enrollResult.pendaftaranId || ""}
          invoiceId={enrollResult.invoiceCode || `INV-${enrollResult.pendaftaranId?.slice(0, 8).toUpperCase()}`}
          judulKursus={kursus.judul}
          nominal={priceInfo.hargaFinal}
          batasBayar={enrollResult.batasBayar}
          namaPeserta={currentUser?.nama}
          onPaymentSuccess={() => {
            setShowCheckoutModal(false);
            handleClose();
            router.push(`/belajar/${kursus.slug}/1`);
          }}
        />
      )}
    </div>
  );
}
