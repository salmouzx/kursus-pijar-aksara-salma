"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, X, Check, Shield, Sparkles, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { currentUser, profile, updateProfile, deleteAccount } = useAuth();
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setNama(currentUser.nama || "");
      setNoHp(currentUser.no_hp || profile?.no_hp || "");
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [currentUser, profile, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setErrorMsg("Nama lengkap tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateProfile({
      nama: nama.trim(),
      no_hp: noHp.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg("Profil berhasil diperbarui!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || "Gagal memperbarui profil.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus akun (${currentUser.email}) secara permanen?\n\nSemua riwayat kursus, sertifikat, dan data Anda akan dihapus dari sistem.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        alert("Akun Anda telah berhasil dihapus. Anda akan dialihkan ke beranda.");
        window.location.href = "/";
      } else {
        alert("Gagal menghapus akun: " + (res.error || "Terjadi kesalahan."));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Suggest clean name from email if name looks like an email prefix
  const emailCleanSuggestion = currentUser.email
    .split("@")[0]
    .replace(/[0-9]+/g, " ")
    .replace(/[._-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F382B]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#58816D] text-white flex items-center justify-center font-bold shadow-md shadow-[#58816D]/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1F382B]">Pengaturan Akun & Profil</h3>
              <p className="text-[11px] text-zinc-500">Sesuaikan nama resmi yang tercetak di sertifikat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-200/60 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Input Nama Lengkap */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#58816D]" />
                  <span>Nama Lengkap</span>
                </label>
                {emailCleanSuggestion && emailCleanSuggestion !== nama && (
                  <button
                    type="button"
                    onClick={() => setNama(emailCleanSuggestion)}
                    className="text-[10px] font-bold text-[#58816D] hover:underline flex items-center gap-1 cursor-pointer"
                    title="Gunakan format nama rapi kapital"
                  >
                    <Sparkles className="w-3 h-3 text-[#58816D]" />
                    <span>Saran: {emailCleanSuggestion}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Salma Maharani"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 focus:border-[#58816D] focus:ring-2 focus:ring-[#58816D]/20 outline-none text-xs font-semibold text-zinc-900 transition-all"
                required
              />
              <p className="text-[10px] text-zinc-400">
                * Nama ini akan otomatis tercantum pada dokumen kelulusan dan Sertifikat Resmi Anda.
              </p>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Alamat Email (Login)</span>
              </label>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-zinc-100/80 border border-zinc-200 text-xs font-mono text-zinc-600">
                <span className="truncate">{currentUser.email}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  Terhubung
                </span>
              </div>
            </div>

            {/* Input No HP */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#58816D]" />
                <span>Nomor WhatsApp / HP</span>
              </label>
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 focus:border-[#58816D] focus:ring-2 focus:ring-[#58816D]/20 outline-none text-xs font-semibold text-zinc-900 transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center gap-2.5 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="px-5 py-2 rounded-2xl bg-[#58816D] hover:bg-[#1F382B] text-white text-xs font-bold transition-all shadow-md shadow-[#58816D]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Zona Berbahaya: Hapus Akun */}
          <div className="p-5 border-t border-rose-100 bg-rose-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Zona Berbahaya</span>
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                  Hapus akun Anda secara permanen. Semua data kursus dan sertifikat akan dihapus.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isSubmitting || isDeleting}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs hover:border-rose-300"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Akun Saya</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
