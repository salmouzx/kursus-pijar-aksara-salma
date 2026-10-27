"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Edit,
  Trash2,
  Sparkles,
  RefreshCw,
  CreditCard,
  Layers,
  Users,
  FileText,
  Eye,
  Check,
  X,
  Gift,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  Tag,
  Flame,
} from "lucide-react";
import {
  getPointSettings,
  savePointSettings,
  getCourseClaims,
  fetchCourseClaimsFromDB,
  reviewCourseClaim,
  getCoursePointConfig,
  saveCoursePointConfig,
  PengaturanPoin,
  KlaimKursusItem,
  KursusPoinConfig,
} from "@/lib/point-system";
import {
  getCoursePriceInfo,
  saveCourseDiscount,
} from "@/lib/course-pricing";
import { TableSkeleton } from "@/components/skeleton";

interface AdminPanelViewsProps {
  activeTab:
    | "pendaftaran"
    | "kursus"
    | "pembayaran"
    | "sertifikat"
    | "pengguna"
    | "audit_log"
    | "klaim_poin"
    | "pengaturan_poin";
  enrollments: any[];
  onRefreshEnrollments: () => void;
  adminName?: string;
}

export function AdminPanelViews({
  activeTab,
  enrollments,
  onRefreshEnrollments,
  adminName,
}: AdminPanelViewsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State untuk Data Kursus & Tinjauan (BR-02)
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [rejectingCourseId, setRejectingCourseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editingQuotaId, setEditingQuotaId] = useState<string | null>(null);
  const [newQuotaValue, setNewQuotaValue] = useState<number>(20);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);
  const [discountModalCourse, setDiscountModalCourse] = useState<any | null>(null);
  const [modalHargaAwal, setModalHargaAwal] = useState<number>(350000);
  const [modalDiskonPersen, setModalDiskonPersen] = useState<number>(50);

  // State untuk Aksi Pendaftaran (BR-07)
  const [cancellingEnrollmentId, setCancellingEnrollmentId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // State untuk Audit Log (BR-12)
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // State untuk Pengguna (BR-12)
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // State untuk Sistem Poin & Klaim Hadiah
  const [pointSettings, setPointSettings] = useState<PengaturanPoin>(getPointSettings());
  const [claimsList, setClaimsList] = useState<KlaimKursusItem[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>("all");
  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [claimRejectReason, setClaimRejectReason] = useState("");
  const [claimSuccessAlert, setClaimSuccessAlert] = useState<string | null>(null);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // Load claims data
  const fetchClaims = async () => {
    setIsLoadingClaims(true);
    try {
      const data = getCourseClaims();
      setClaimsList(data);
      const fromDB = await fetchCourseClaimsFromDB();
      if (fromDB && fromDB.length > 0) {
        setClaimsList(fromDB);
      }
    } finally {
      setIsLoadingClaims(false);
    }
  };

  useEffect(() => {
    if (activeTab === "klaim_poin") {
      fetchClaims();
    } else if (activeTab === "pengaturan_poin") {
      setPointSettings(getPointSettings());
    }
  }, [activeTab]);

  // Handler simpan pengaturan poin
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = savePointSettings(pointSettings);
    setPointSettings(updated);
    setSettingsSavedAlert(true);
    setTimeout(() => setSettingsSavedAlert(false), 3500);
  };

  // Handler review klaim (Setujui / Tolak)
  const handleReviewClaim = (claimId: string, decision: "disetujui" | "ditolak", note?: string) => {
    const adminDisplayName = (adminName || "Administrator");
    const res = reviewCourseClaim(claimId, decision, adminDisplayName, note);
    if (res.success) {
      setClaimSuccessAlert(
        decision === "disetujui"
          ? `Klaim peserta berhasil disetujui! Peserta otomatis didaftarkan ke kursus.`
          : `Klaim berhasil ditolak dan saldo poin telah dikembalikan ke peserta.`
      );
      setRejectingClaimId(null);
      setClaimRejectReason("");
      fetchClaims();
      setTimeout(() => setClaimSuccessAlert(null), 4000);
    } else {
      alert("Gagal memproses klaim: " + res.error);
    }
  };

  // Fetch Kursus untuk Tinjauan Admin
  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const { data, error } = await supabase
        .from("kursus")
        .select(`
          id,
          judul,
          slug,
          kategori,
          harga,
          kuota,
          nilai_lulus,
          status,
          catatan_tinjauan,
          diajukan_pada,
          diterbitkan_pada,
          instruktur:instruktur_id (
            nama_lengkap,
            email
          )
        `)
        .order("dibuat_pada", { ascending: true });

      let resultCourses: any[] = [];
      if (!error && data) {
        resultCourses = data;
      } else {
        // Fallback default sample courses
        resultCourses = [
          {
            id: "00000000-0000-4000-b000-000000000001",
            judul: "Excel untuk Administrasi Perkantoran",
            slug: "excel-administrasi-perkantoran",
            kategori: "Perkantoran",
            harga: 350000,
            kuota: 25,
            status: "terbit",
            instruktur: { nama_lengkap: "Budi Santoso, S.Kom." },
          },
          {
            id: "00000000-0000-4000-b000-000000000002",
            judul: "Desain Konten Media Sosial dengan Canva",
            slug: "desain-konten-canva",
            kategori: "Desain",
            harga: 0,
            kuota: 40,
            status: "terbit",
            instruktur: { nama_lengkap: "Siti Rahmawati, S.Ds." },
          },
          {
            id: "00000000-0000-4000-b000-000000000003",
            judul: "Bahasa Inggris untuk Percakapan Kerja",
            slug: "bahasa-inggris-percakapan-kerja",
            kategori: "Bahasa",
            harga: 450000,
            kuota: 20,
            status: "terbit",
            instruktur: { nama_lengkap: "Ahmad Fauzi, M.Hum." },
          },
          {
            id: "00000000-0000-4000-b000-000000000004",
            judul: "Dasar Pembukuan untuk UMKM",
            slug: "dasar-pembukuan-umkm",
            kategori: "Keuangan",
            harga: 300000,
            kuota: 12,
            status: "terbit",
            instruktur: { nama_lengkap: "Budi Santoso, S.Kom." },
          },
          {
            id: "00000000-0000-4000-b000-000000000006",
            judul: "Public Speaking untuk Presentasi Kantor",
            slug: "public-speaking-presentasi-kantor",
            kategori: "Pengembangan Diri",
            harga: 400000,
            kuota: 20,
            status: "ditinjau",
            diajukan_pada: "2026-10-12T16:00:00Z",
            instruktur: { nama_lengkap: "Ahmad Fauzi, M.Hum." },
          },
          {
            id: "00000000-0000-4000-b000-000000000005",
            judul: "Fotografi Produk dengan Ponsel",
            slug: "fotografi-produk-ponsel",
            kategori: "Desain",
            harga: 250000,
            kuota: 15,
            status: "ditutup",
            instruktur: { nama_lengkap: "Siti Rahmawati, S.Ds." },
          },
          {
            id: "00000000-0000-4000-b000-000000000007",
            judul: "Microsoft Word untuk Surat Dinas",
            slug: "word-surat-dinas",
            kategori: "Perkantoran",
            harga: 200000,
            kuota: 20,
            status: "draf",
            instruktur: { nama_lengkap: "Budi Santoso, S.Kom." },
          },
        ];
      }

      // Terapkan override harga yang telah diubah admin
      if (typeof window !== "undefined") {
        try {
          const overrides = JSON.parse(localStorage.getItem("admin_course_price_overrides") || "{}");
          resultCourses = resultCourses.map((c) =>
            overrides[c.id] !== undefined ? { ...c, harga: Number(overrides[c.id]) } : c
          );
        } catch (e) {}
      }

      setCourses(resultCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Fetch Audit Log
  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await fetch("/api/admin/audit-log");
      const json = await res.json();
      if (res.ok && json.success && json.logs) {
        setAuditLogs(json.logs);
        return;
      }

      const { data, error } = await supabase
        .from("audit_log")
        .select(`
          id,
          aksi,
          nama_tabel,
          dibuat_pada,
          pelaku:pelaku_id (
            nama_lengkap,
            email,
            peran
          ),
          data_sesudah
        `)
        .order("dibuat_pada", { ascending: false })
        .limit(40);

      if (!error && data) {
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Fetch Pengguna & Hak Akses
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/pengguna");
      const json = await res.json();
      if (res.ok && json.success && json.users) {
        setUsersList(json.users);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada")
        .order("dibuat_pada", { ascending: false })
        .limit(50);

      if (!error && data) {
        setUsersList(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "kursus") {
      fetchCourses();
    } else if (activeTab === "audit_log") {
      fetchAuditLogs();
    } else if (activeTab === "pengguna") {
      fetchUsers();
    }
  }, [activeTab]);

  // BR-02: Aksi Ubah Status Kursus oleh Admin
  const handleUpdateCourseStatus = async (courseId: string, newStatus: string, reason?: string) => {
    setActionLoadingId(courseId);
    try {
      const updateData: any = {
        status: newStatus,
        diubah_pada: new Date().toISOString(),
      };
      if (newStatus === "terbit") {
        updateData.diterbitkan_pada = new Date().toISOString();
        updateData.catatan_tinjauan = null;
      }
      if (newStatus === "draf" && reason) {
        if (reason.trim().length < 10) {
          alert("Alasan pengembalian wajib minimal 10 karakter.");
          setActionLoadingId(null);
          return;
        }
        updateData.catatan_tinjauan = reason;
      }

      const { error } = await supabase
        .from("kursus")
        .update(updateData)
        .eq("id", courseId);

      if (error) {
        alert("Gagal mengubah status kursus: " + error.message);
      } else {
        // Catat di audit_log
        await supabase.from("audit_log").insert({
          aksi: `UBAH_STATUS_KURSUS_KE_${newStatus.toUpperCase()}`,
          nama_tabel: "kursus",
          id_data: courseId,
          data_sesudah: updateData,
        });

        alert(`Sukses: Status kursus berhasil diubah menjadi "${newStatus}".`);
        setRejectingCourseId(null);
        setRejectReason("");
        await fetchCourses();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // BR-06: Ubah Kuota Kursus oleh Admin
  const handleUpdateQuota = async (courseId: string, currentTerpakai: number) => {
    if (newQuotaValue < currentTerpakai) {
      alert(`Kuota baru (${newQuotaValue}) tidak boleh lebih kecil dari kursi terpakai (${currentTerpakai}).`);
      return;
    }

    setActionLoadingId(courseId);
    try {
      const { error } = await supabase
        .from("kursus")
        .update({ kuota: newQuotaValue, diubah_pada: new Date().toISOString() })
        .eq("id", courseId);

      if (error) {
        alert("Gagal memperbarui kuota: " + error.message);
      } else {
        alert(`Sukses: Kuota kelas diperbarui menjadi ${newQuotaValue} kursi.`);
        setEditingQuotaId(null);
        await fetchCourses();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Ubah Harga Kursus oleh Admin (Bisa Gratis Rp 0 atau nominal berapa pun)
  const handleUpdatePrice = async (courseId: string) => {
    if (newPriceValue < 0) {
      alert("Harga kursus tidak boleh bernilai negatif.");
      return;
    }

    setActionLoadingId(courseId);
    try {
      // 1. Simpan via API Admin server-side (bypass RLS dan catat audit log)
      const res = await fetch("/api/admin/kursus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          harga: newPriceValue,
        }),
      });

      if (!res.ok) {
        // Fallback langsung ke Supabase client jika API rute mengalami kendala
        const { error } = await supabase
          .from("kursus")
          .update({ harga: newPriceValue, diubah_pada: new Date().toISOString() })
          .eq("id", courseId);
        if (error) console.warn("Supabase direct client update fallback:", error);
      }

      // 2. Simpan cache override di localStorage agar langsung aktif di katalog publik & checkout
      try {
        const overrides = JSON.parse(localStorage.getItem("admin_course_price_overrides") || "{}");
        overrides[courseId] = newPriceValue;
        localStorage.setItem("admin_course_price_overrides", JSON.stringify(overrides));
      } catch (e) {}

      // 3. Update state courses lokal agar UI langsung responsif
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, harga: newPriceValue } : c))
      );

      alert(
        `Sukses: Harga kursus berhasil diubah menjadi ${
          newPriceValue === 0 ? "Gratis (Rp 0)" : `Rp ${newPriceValue.toLocaleString("id-ID")}`
        }.`
      );
      setEditingPriceId(null);
      await fetchCourses();
    } catch (err: any) {
      alert("Gagal memperbarui harga: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Live preview harga diskon di panel admin
  const previewFinalPrice = Math.max(0, Math.round(modalHargaAwal * (1 - modalDiskonPersen / 100)));
  const previewHematNominal = Math.max(0, modalHargaAwal - previewFinalPrice);

  // Buka modal pengaturan diskon dengan live preview
  const handleOpenDiscountModal = (c: any) => {
    const info = getCoursePriceInfo(c.id, c.harga, true);
    setDiscountModalCourse(c);
    setModalHargaAwal(info.hargaAwal || c.harga || 350000);
    setModalDiskonPersen(info.diskonPersen || 0);
  };

  // Simpan diskon & harga promosi langsung ke server dan landing page
  const handleSaveDiscount = async () => {
    if (!discountModalCourse) return;
    const courseId = discountModalCourse.id;
    const finalPrice = Math.max(0, previewFinalPrice);

    setActionLoadingId(courseId);
    try {
      // 1. Simpan ke database via PATCH /api/admin/kursus
      await fetch("/api/admin/kursus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          harga: finalPrice,
          harga_awal: modalHargaAwal,
          diskon_persen: modalDiskonPersen,
        }),
      });

      // 2. Simpan ke shared course-pricing storage agar instan di Landing Page
      saveCourseDiscount(courseId, modalHargaAwal, modalDiskonPersen, finalPrice);

      // 3. Update state courses lokal
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, harga: finalPrice, harga_awal: modalHargaAwal, diskon_persen: modalDiskonPersen }
            : c
        )
      );

      alert(
        `Sukses: Diskon ${modalDiskonPersen}% berhasil diterapkan! Harga promosi Rp ${finalPrice.toLocaleString(
          "id-ID"
        )} (Harga normal Rp ${modalHargaAwal.toLocaleString("id-ID")}) langsung tampil di Landing Page.`
      );
      setDiscountModalCourse(null);
      await fetchCourses();
    } catch (err: any) {
      alert("Gagal menyimpan diskon: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // BR-07: Konfirmasi Pembayaran oleh Admin
  const handleConfirmPayment = async (pendaftaranId: string) => {
    if (!confirm("Konfirmasi pembayaran untuk pendaftaran ini? Status akan menjadi aktif.")) {
      return;
    }

    setActionLoadingId(pendaftaranId);
    try {
      const res = await fetch("/api/pembayaran/mayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaranId }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert("Gagal konfirmasi: " + (d.error || "Gagal memproses"));
      } else {
        alert("Pembayaran berhasil dikonfirmasi. Peserta langsung aktif.");
        onRefreshEnrollments();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // BR-07: Batalkan Pendaftaran Aktif oleh Admin (Wajib Alasan >= 10 Karakter)
  const handleCancelEnrollmentAdmin = async (pendaftaranId: string) => {
    if (!cancelReason || cancelReason.trim().length < 10) {
      alert("Pembatalan oleh Admin wajib menyertakan alasan minimal 10 karakter.");
      return;
    }

    setActionLoadingId(pendaftaranId);
    try {
      const { error } = await supabase
        .from("pendaftaran")
        .update({
          status: "dibatalkan",
          alasan_batal: cancelReason,
          dibatalkan_pada: new Date().toISOString(),
        })
        .eq("id", pendaftaranId);

      if (error) {
        alert("Gagal membatalkan: " + error.message);
      } else {
        alert("Pendaftaran berhasil dibatalkan dan kursi telah dikembalikan.");
        setCancellingEnrollmentId(null);
        setCancelReason("");
        onRefreshEnrollments();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter Enrollments
  const filteredEnrollments = enrollments.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchCourse = e.kursus?.judul?.toLowerCase().includes(q);
      const matchInvoice = e.mayar_invoice_id?.toLowerCase().includes(q);
      const matchId = e.id.toLowerCase().includes(q);
      return matchCourse || matchInvoice || matchId;
    }
    return true;
  });

  // Filter Courses
  const filteredCourses = courses.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return c.judul.toLowerCase().includes(q) || c.kategori.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* 1. VIEW PENDAFTARAN PESERTA                               */}
      {/* ========================================================= */}
      {activeTab === "pendaftaran" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                Manajemen Pendaftaran Peserta
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Verifikasi status pendaftaran, batas waktu pembayaran, serta pembatalan pendaftaran.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${statusFilter === "all" ? "bg-[#58816D] text-white shadow-2xs" : "text-zinc-600 hover:text-[#1F382B]"
                    }`}
                >
                  Semua ({enrollments.length})
                </button>
                <button
                  onClick={() => setStatusFilter("menunggu_bayar")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${statusFilter === "menunggu_bayar" ? "bg-[#58816D] text-white shadow-2xs" : "text-zinc-600 hover:text-[#1F382B]"
                    }`}
                >
                  Menunggu Bayar
                </button>
                <button
                  onClick={() => setStatusFilter("aktif")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${statusFilter === "aktif" ? "bg-[#58816D] text-white shadow-2xs" : "text-zinc-600 hover:text-[#1F382B]"
                    }`}
                >
                  Aktif
                </button>
                <button
                  onClick={() => setStatusFilter("selesai")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${statusFilter === "selesai" ? "bg-[#58816D] text-white shadow-2xs" : "text-zinc-600 hover:text-[#1F382B]"
                    }`}
                >
                  Lulus
                </button>
              </div>
            </div>
          </div>

          {/* Modal Pembatalan Pendaftaran Admin (Wajib Alasan >= 10 Karakter) */}
          {cancellingEnrollmentId && (
            <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Pembatalan Pendaftaran oleh Admin</span>
              </div>
              <p className="text-xs text-rose-700">
                Admin wajib menyertakan alasan pembatalan minimal 10 karakter. Kursi peserta akan otomatis dikembalikan ke kuota umum kursus.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tuliskan alasan pembatalan (contoh: Permintaan refund peserta karena bentrok jadwal kantor)..."
                rows={2}
                className="w-full p-3 rounded-2xl border border-rose-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-rose-600 font-bold">
                  Panjang karakter: {cancelReason.trim().length}/10 minimal
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setCancellingEnrollmentId(null); setCancelReason(""); }}
                    className="px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white text-zinc-700 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleCancelEnrollmentAdmin(cancellingEnrollmentId)}
                    disabled={cancelReason.trim().length < 10}
                    className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    Konfirmasi Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabel Pendaftaran */}
          <div className="glass-panel rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">ID & Tanggal</th>
                    <th className="py-3.5 px-4">Kursus & Kategori</th>
                    <th className="py-3.5 px-4">Biaya & Metode</th>
                    <th className="py-3.5 px-4">Status & Progres</th>
                    <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredEnrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold text-zinc-900 block truncate max-w-[130px]">
                          {e.id.slice(0, 8)}...
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          {new Date(e.didaftarkan_pada).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#1F382B] block">
                          {e.kursus?.judul || "Kursus"}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">
                          {e.kursus?.kategori}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-zinc-900 block">
                          {e.nominal === 0 ? "Gratis (Rp 0)" : `Rp ${e.nominal.toLocaleString("id-ID")}`}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono capitalize">
                          {e.metode_bayar} {e.mayar_invoice_id && `· ${e.mayar_invoice_id}`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {e.status === "aktif" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Aktif Belajar
                            </span>
                          )}
                          {e.status === "menunggu_bayar" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Menunggu Bayar
                            </span>
                          )}
                          {e.status === "selesai" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#58816D]/10 text-[#58816D] border border-[#58816D]/30">
                              <Award className="w-3 h-3 text-[#58816D]" />
                              Lulus Selesai
                            </span>
                          )}
                          {e.status === "dibatalkan" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-100 text-zinc-500 border border-zinc-200">
                              <XCircle className="w-3 h-3 text-zinc-400" />
                              Dibatalkan
                            </span>
                          )}
                          {e.status === "kedaluwarsa" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                              Kedaluwarsa
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {e.status === "menunggu_bayar" && (
                            <button
                              onClick={() => handleConfirmPayment(e.id)}
                              disabled={actionLoadingId === e.id}
                              className="px-2.5 py-1 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer border border-[#456655]"
                              title="Konfirmasi Pembayaran Manual / Mayar"
                            >
                              Konfirmasi Bayar
                            </button>
                          )}

                          {e.status === "aktif" && (
                            <button
                              onClick={() => {
                                setCancellingEnrollmentId(e.id);
                                setCancelReason("");
                              }}
                              className="px-2.5 py-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-all cursor-pointer"
                              title="Batalkan Pendaftaran Aktif"
                            >
                              Batal Admin
                            </button>
                          )}

                          {e.status === "selesai" && e.sertifikat && (
                            <Link
                              href={`/sertifikat/${e.sertifikat.nomor_sertifikat}`}
                              className="px-2.5 py-1 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-bold text-[11px] transition-all flex items-center gap-1"
                            >
                              <Award className="w-3 h-3 text-amber-500" />
                              <span>Sertifikat</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VIEW TINJAUAN KURSUS & KUOTA (BR-02 & BR-06)           */}
      {/* ========================================================= */}
      {activeTab === "kursus" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                Panel Tinjauan & Penerbitan Kursus
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Hanya admin yang boleh menerbitkan, mengembalikan ke draf (catatan min 10 karakter), menutup, dan membuka kembali kursus.
              </p>
            </div>
          </div>

          {/* Modal Pengembalian Kursus ke Draf (Catatan min 10 karakter - BR-02) */}
          {rejectingCourseId && (
            <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pengembalian Kursus ke Draf</span>
              </div>
              <p className="text-xs text-amber-800">
                Wajib menyertakan catatan evaluasi minimal 10 karakter agar instruktur pengampu dapat memperbaiki modul atau soal sebelum diajukan kembali.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Tuliskan catatan perbaikan (contoh: Silabus modul 2 belum dilengkapi video tutorial dan soal kuis kurang dari 3)..."
                rows={2}
                className="w-full p-3 rounded-2xl border border-amber-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-amber-700 font-bold">
                  Panjang catatan: {rejectReason.trim().length}/10 minimal
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setRejectingCourseId(null); setRejectReason(""); }}
                    className="px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white text-zinc-700 text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleUpdateCourseStatus(rejectingCourseId, "draf", rejectReason)}
                    disabled={rejectReason.trim().length < 10}
                    className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    Kembalikan ke Draf
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal / Dialog Pengaturan Diskon & Harga Awal dengan Live Preview */}
          {discountModalCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="relative w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#58816D]/15 text-[#1F382B]">
                      <Tag className="w-3 h-3 text-[#58816D]" />
                      Atur Diskon & Harga Promosi
                    </span>
                    <h3 className="text-base font-extrabold text-[#1F382B] mt-1 line-clamp-1">
                      {discountModalCourse.judul}
                    </h3>
                  </div>
                  <button
                    onClick={() => setDiscountModalCourse(null)}
                    className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 1. Input Harga Awal (Normal) */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Harga Awal / Normal (Sebelum Diskon)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={modalHargaAwal}
                        onChange={(e) => setModalHargaAwal(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Harga ini akan dicoret di landing page jika diskon lebih dari 0%.
                    </span>
                  </div>

                  {/* 2. Input Persentase Diskon */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-zinc-700">
                        Besaran Diskon Promosi (%)
                      </label>
                      <span className="text-xs font-extrabold text-[#58816D]">
                        {modalDiskonPersen}% Diskon
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2.5">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={modalDiskonPersen}
                        onChange={(e) => setModalDiskonPersen(parseInt(e.target.value) || 0)}
                        className="flex-1 accent-[#58816D] cursor-pointer"
                      />
                      <div className="relative w-20">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={modalDiskonPersen}
                          onChange={(e) =>
                            setModalDiskonPersen(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                          }
                          className="w-full pl-2 pr-6 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold text-center"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Tombol Preset Cepat */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[0, 10, 20, 30, 50, 70, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setModalDiskonPersen(pct)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            modalDiskonPersen === pct
                              ? "bg-[#58816D] text-white shadow-xs"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {pct === 0 ? "0% (Normal)" : pct === 100 ? "100% (Gratis)" : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. ✨ LIVE PREVIEW CARD TAMPILAN LANDING PAGE */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F382B] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Pratinjau Langsung Tampilan Landing Page
                      </span>
                      {modalDiskonPersen > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                          <Flame className="w-3 h-3 text-amber-300" />
                          DISKON {modalDiskonPersen}%
                        </span>
                      )}
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-semibold block">Harga yang Tampil:</span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xl font-black text-[#1F382B]">
                            {previewFinalPrice === 0 ? "Rp 0 (Gratis)" : `Rp ${previewFinalPrice.toLocaleString("id-ID")}`}
                          </span>
                          {modalDiskonPersen > 0 && modalHargaAwal > previewFinalPrice && (
                            <span className="text-xs text-zinc-400 line-through font-semibold">
                              Rp {modalHargaAwal.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>

                      {modalDiskonPersen > 0 && previewHematNominal > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 font-semibold block">Penghematan Peserta:</span>
                          <span className="text-xs font-black text-emerald-700">
                            Hemat Rp {previewHematNominal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-emerald-900 leading-relaxed font-medium">
                      💡 Begitu Anda klik <strong>Simpan & Terapkan</strong>, harga diskon ini langsung tayang di Katalog Depan, Banner Hero, dan Checkout Pembayaran Mayar.
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => setDiscountModalCourse(null)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveDiscount}
                    disabled={actionLoadingId === discountModalCourse.id}
                    className="px-5 py-2 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{actionLoadingId === discountModalCourse.id ? "Menerapkan..." : "Simpan & Terapkan ke Landing Page"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Daftar Kursus Table */}
          <div className="glass-panel rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Kursus & Instruktur</th>
                    <th className="py-3.5 px-4">Harga & Diskon Promosi</th>
                    <th className="py-3.5 px-4">Kuota Kelas</th>
                    <th className="py-3.5 px-4">Status Kursus</th>
                    <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isLoadingCourses ? (
                    <TableSkeleton rows={4} cols={5} />
                  ) : filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-zinc-400 font-bold">
                        Belum ada kursus yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((c) => {
                    const priceInfo = getCoursePriceInfo(c.id, c.harga, true);
                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-[#1F382B] block">
                            {c.judul}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {c.kategori} · {c.instruktur?.nama_lengkap || "Instruktur Pijar Aksara"}
                          </span>
                          {c.catatan_tinjauan && (
                            <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                              Catatan: {c.catatan_tinjauan}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5 min-w-[150px]">
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className={`font-black text-xs ${priceInfo.isFree ? "text-emerald-700 font-extrabold" : "text-zinc-900"}`}>
                                  {priceInfo.isFree ? "Gratis (Rp 0)" : `Rp ${priceInfo.hargaFinal.toLocaleString("id-ID")}`}
                                </span>
                                {priceInfo.isDiscounted && (
                                  <span className="text-[10px] text-zinc-400 line-through">
                                    Rp {priceInfo.hargaAwal.toLocaleString("id-ID")}
                                  </span>
                                )}
                              </div>
                              {priceInfo.isDiscounted && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200 mt-0.5">
                                  <Flame className="w-2.5 h-2.5" />
                                  Diskon {priceInfo.diskonPersen}% (Hemat Rp {priceInfo.hematNominal.toLocaleString("id-ID")})
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleOpenDiscountModal(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] bg-[#58816D]/15 hover:bg-[#58816D] text-[#1F382B] hover:text-white font-bold transition-all cursor-pointer border border-[#58816D]/30 shadow-2xs"
                              title="Buka Pengaturan Diskon & Harga Awal dengan Live Preview"
                            >
                              <Percent className="w-2.5 h-2.5" />
                              <span>Atur Diskon</span>
                            </button>
                          </div>
                        </td>

                      <td className="py-3.5 px-4">
                        {editingQuotaId === c.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={newQuotaValue}
                              onChange={(e) => setNewQuotaValue(parseInt(e.target.value) || 1)}
                              className="w-16 p-1 rounded-lg border border-zinc-300 text-xs text-center font-bold"
                            />
                            <button
                              onClick={() => handleUpdateQuota(c.id, 10)}
                              className="p-1 rounded-lg bg-[#58816D] hover:bg-[#456655] text-white"
                              title="Simpan Kuota"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingQuotaId(null)}
                              className="p-1 rounded-lg bg-zinc-200 text-zinc-600"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#1F382B]">{c.kuota} Kursi</span>
                            <button
                              onClick={() => {
                                setEditingQuotaId(c.id);
                                setNewQuotaValue(c.kuota);
                              }}
                              className="text-[10px] text-[#58816D] hover:underline font-bold"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {c.status === "terbit" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Terbit (Publik)
                          </span>
                        )}
                        {c.status === "ditinjau" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                            Ditinjau Admin
                          </span>
                        )}
                        {c.status === "draf" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-100 text-zinc-600 border border-zinc-200">
                            Draf Instruktur
                          </span>
                        )}
                        {c.status === "ditutup" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                            Ditutup
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Aksi untuk status Ditinjau */}
                          {c.status === "ditinjau" && (
                            <>
                              <button
                                onClick={() => handleUpdateCourseStatus(c.id, "terbit")}
                                className="px-2.5 py-1 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white font-extrabold text-[11px] shadow-2xs transition-all cursor-pointer"
                              >
                                Terbitkan
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingCourseId(c.id);
                                  setRejectReason("");
                                }}
                                className="px-2.5 py-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Kembalikan (Catatan)
                              </button>
                            </>
                          )}

                          {/* Aksi untuk status Terbit */}
                          {c.status === "terbit" && (
                            <button
                              onClick={() => handleUpdateCourseStatus(c.id, "ditutup")}
                              className="px-2.5 py-1 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-[11px] transition-all cursor-pointer"
                              title="Tutup Pendaftaran"
                            >
                              Tutup Kursus
                            </button>
                          )}

                          {/* Aksi untuk status Ditutup */}
                          {c.status === "ditutup" && (
                            <button
                              onClick={() => handleUpdateCourseStatus(c.id, "terbit")}
                              className="px-2.5 py-1 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer border border-[#456655]"
                            >
                              Buka Kembali
                            </button>
                          )}

                          <Link
                            href={`/kursus/${c.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-[#1F382B] transition-colors"
                            title="Buka Halaman Publik Kursus"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VIEW VERIFIKASI PEMBAYARAN & MAYAR                     */}
      {/* ========================================================= */}
      {activeTab === "pembayaran" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                Verifikasi Transaksi & Invoice Mayar
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Konfirmasi pelunasan manual atau simulasi webhook Mayar <code className="font-mono text-zinc-800">payment.received</code>.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Invoice Mayar / ID</th>
                    <th className="py-3.5 px-4">Kursus</th>
                    <th className="py-3.5 px-4">Nominal</th>
                    <th className="py-3.5 px-4">Metode Bayar</th>
                    <th className="py-3.5 px-4">Status Transaksi</th>
                    <th className="py-3.5 px-4 text-right">Aksi Konfirmasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredEnrollments.filter((e) => e.nominal > 0).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-zinc-400 font-bold">
                        Tidak ada transaksi pembayaran berbayar ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments
                      .filter((e) => e.nominal > 0)
                      .map((e) => (
                      <tr key={e.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-zinc-900 block">
                            {e.mayar_invoice_id || e.id.slice(0, 12)}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(e.didaftarkan_pada).toLocaleDateString("id-ID")}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#1F382B]">
                          {e.kursus?.judul}
                        </td>

                        <td className="py-3.5 px-4 font-black text-[#1F382B]">
                          Rp {e.nominal.toLocaleString("id-ID")}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-700">
                            {e.metode_bayar}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {e.status === "aktif" || e.status === "selesai" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Lunas Tervalidasi
                            </span>
                          ) : e.status === "menunggu_bayar" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                              Menunggu Pelunasan
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500">
                              {e.status}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {e.status === "menunggu_bayar" && (
                            <button
                              onClick={() => handleConfirmPayment(e.id)}
                              className="px-3 py-1 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white font-extrabold text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <CreditCard className="w-3 h-3 text-[#EBF3EF]" />
                              <span>Konfirmasi Lunas</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VIEW SEMUA SERTIFIKAT TERBIT                           */}
      {/* ========================================================= */}
      {activeTab === "sertifikat" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                Daftar Sertifikat Kelulusan Resmi
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Nomor seri unik berurutan per tahun diterbitkan secara otomatis setelah seluruh modul kuis lulus.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments
              .filter((e) => e.sertifikat)
              .map((e) => (
                <div
                  key={e.id}
                  className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:shadow-2xl transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#58816D]/10 text-[#58816D]">
                        Terverifikasi
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-500">
                        {e.sertifikat?.nomor_sertifikat}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-[#1F382B] leading-snug">
                        {e.kursus?.judul}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-700 font-semibold">
                        <span>Penerima:</span>
                        <strong className="text-[#1F382B] font-bold">
                          {e.peserta?.nama_lengkap || e.sertifikat?.nama_peserta || "Peserta Terdaftar"}
                        </strong>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Diterbitkan: {new Date(e.sertifikat?.diterbitkan_pada || e.didaftarkan_pada).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <Link
                      href={`/sertifikat/${e.sertifikat?.nomor_sertifikat || e.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#58816D] hover:text-[#1F382B]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka & Cetak PDF</span>
                    </Link>

                    <Link
                      href={`/sertifikat/${e.sertifikat?.nomor_sertifikat || e.id}`}
                      target="_blank"
                      className="p-1.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-900"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. VIEW KELOLA PENGGUNA & HAK AKSES                       */}
      {/* ========================================================= */}
      {activeTab === "pengguna" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                Kelola Pengguna & Peran Akun
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Kelola akun peserta, instruktur, dan admin. Aturan keamanan melarang admin menurunkan peran akunnya sendiri.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Nama Lengkap & Kontak</th>
                    <th className="py-3.5 px-4">Email Akun</th>
                    <th className="py-3.5 px-4">Peran Pengguna</th>
                    <th className="py-3.5 px-4">Status Akun</th>
                    <th className="py-3.5 px-4 text-right">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isLoadingUsers ? (
                    <TableSkeleton rows={4} cols={5} />
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-zinc-400 font-bold">
                        Belum ada data pengguna.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-[#1F382B] block">
                          {u.nama_lengkap}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {u.no_hp || "Tanpa No HP"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-700">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${u.peran === "admin"
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : u.peran === "instruktur"
                              ? "bg-[#58816D]/15 text-[#1F382B] border border-[#58816D]/30"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                          }`}>
                          {u.peran.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.aktif ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-400 font-bold text-[11px]">
                            Nonaktif
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Pengaturan profil akun ${u.email} dapat disinkronkan langsung via Supabase Auth Admin.`)}
                          className="px-2.5 py-1 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-bold text-[11px] cursor-pointer"
                        >
                          Ubah Akses
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. VIEW AUDIT LOG SISTEM                                  */}
      {/* ========================================================= */}
      {activeTab === "audit_log" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                Audit Log Sistem Pijar Aksara
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Setiap perubahan status kursus, perubahan harga/kuota, konfirmasi bayar, dan pembatalan tercatat permanen di database.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Waktu Kejadian</th>
                    <th className="py-3.5 px-4">Pelaku Aksi</th>
                    <th className="py-3.5 px-4">Aksi Sensitif</th>
                    <th className="py-3.5 px-4">Tabel Terkait</th>
                    <th className="py-3.5 px-4">Data Hasil Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                  {isLoadingAudit ? (
                    <TableSkeleton rows={4} cols={5} />
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-zinc-400 font-bold font-sans">
                        Belum ada log aktivitas tercatat.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                        {new Date(log.dibuat_pada).toLocaleString("id-ID")}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#1F382B] block">
                          {log.pelaku?.nama_lengkap || "Sistem Otomatis"}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {log.pelaku?.email || "internal-engine"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#58816D]">
                        {log.aksi}
                      </td>

                      <td className="py-3.5 px-4 uppercase text-zinc-600">
                        {log.nama_tabel}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 max-w-xs truncate">
                        {JSON.stringify(log.data_sesudah || {})}
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TAB VERIFIKASI KLAIM POIN REWARD KURSUS                 */}
      {/* ========================================================= */}
      {activeTab === "klaim_poin" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {claimSuccessAlert && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{claimSuccessAlert}</span>
              </div>
              <button
                onClick={() => setClaimSuccessAlert(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#1F382B] tracking-tight">
                Persetujuan Klaim Kursus dengan Poin
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Verifikasi pengajuan penukaran poin reward peserta untuk mengamankan kuota dan memastikan kelayakan peserta.
              </p>
            </div>
          </div>

          {/* Filter Status Klaim */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setClaimStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                claimStatusFilter === "all"
                  ? "bg-[#58816D] text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Semua ({claimsList.length})
            </button>
            <button
              onClick={() => setClaimStatusFilter("menunggu_review")}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                claimStatusFilter === "menunggu_review"
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu Verifikasi ({claimsList.filter((c) => c.status === "menunggu_review").length})</span>
            </button>
            <button
              onClick={() => setClaimStatusFilter("disetujui")}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                claimStatusFilter === "disetujui"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              Disetujui ({claimsList.filter((c) => c.status === "disetujui").length})
            </button>
            <button
              onClick={() => setClaimStatusFilter("ditolak")}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                claimStatusFilter === "ditolak"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              Ditolak ({claimsList.filter((c) => c.status === "ditolak").length})
            </button>
          </div>

          {/* Tabel Antrean Klaim Poin */}
          <div className="glass-panel rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Peserta</th>
                    <th className="py-3.5 px-4">Kursus Diminta</th>
                    <th className="py-3.5 px-4">Poin Ditukar</th>
                    <th className="py-3.5 px-4">Catatan Motivasi Peserta</th>
                    <th className="py-3.5 px-4">Status & Waktu</th>
                    <th className="py-3.5 px-4 text-right">Keputusan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isLoadingClaims ? (
                    <TableSkeleton rows={4} cols={6} />
                  ) : claimsList
                    .filter((c) => (claimStatusFilter === "all" ? true : c.status === claimStatusFilter))
                    .length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-zinc-400 font-bold">
                        Belum ada permohonan klaim poin.
                      </td>
                    </tr>
                  ) : (
                    claimsList
                      .filter((c) => (claimStatusFilter === "all" ? true : c.status === claimStatusFilter))
                      .map((claim) => (
                      <tr key={claim.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-bold text-[#1F382B] block text-sm">
                            {claim.penggunaNama}
                          </span>
                          <span className="text-[11px] text-zinc-500 block">
                            {claim.penggunaEmail}
                          </span>
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Award className="w-3 h-3 text-emerald-600" />
                            {claim.totalSertifikatPeserta || 1} Sertifikat Selesai
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <span className="font-bold text-zinc-800 block text-xs">
                            {claim.kursusJudul}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            slug: {claim.kursusSlug}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            {claim.poinDigunakan} Poin
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <p className="text-xs text-zinc-600 italic leading-relaxed">
                            "{claim.catatanPeserta || "Tidak ada catatan motivasi"}"
                          </p>
                          {claim.catatanAdmin && (
                            <p className="text-[11px] text-zinc-500 font-semibold mt-1">
                              <strong>Catatan Admin:</strong> {claim.catatanAdmin}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              claim.status === "disetujui"
                                ? "bg-emerald-100 text-emerald-800"
                                : claim.status === "ditolak"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {claim.status === "menunggu_review"
                              ? "Menunggu Verifikasi"
                              : claim.status}
                          </span>
                          <span className="text-[10px] text-zinc-400 block mt-1">
                            {new Date(claim.dibuatPada).toLocaleDateString("id-ID")}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          {claim.status === "menunggu_review" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleReviewClaim(claim.id, "disetujui")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Setujui dan Daftarkan ke Kursus"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingClaimId(claim.id);
                                  setClaimRejectReason("");
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                title="Tolak dan Kembalikan Poin"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-400 font-medium">
                              Selesai direview
                            </span>
                          )}
                        </td>
                      </tr>
                    )))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Konfirmasi Penolakan Klaim */}
          {rejectingClaimId && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-center gap-3 text-rose-600">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm">
                      Tolak Pengajuan Klaim Poin
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Poin peserta akan otomatis dikembalikan utuh ke saldo mereka.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Alasan Penolakan (Akan Dilihat Peserta):
                  </label>
                  <textarea
                    value={claimRejectReason}
                    onChange={(e) => setClaimRejectReason(e.target.value)}
                    placeholder="Contoh: Kuota klaim poin bulan ini telah terisi penuh, atau mohon tuntaskan modul kursus sebelumnya terlebih dahulu."
                    rows={3}
                    className="w-full text-xs p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setRejectingClaimId(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() =>
                      handleReviewClaim(
                        rejectingClaimId,
                        "ditolak",
                        claimRejectReason || "Pengajuan ditolak oleh Administrator"
                      )
                    }
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                  >
                    Tolak & Kembalikan Poin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. TAB PENGATURAN KETENTUAN POIN OLEH ADMIN                */}
      {/* ========================================================= */}
      {activeTab === "pengaturan_poin" && (
        <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
          {settingsSavedAlert && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan ketentuan poin berhasil disimpan dan aktif di seluruh sistem!</span>
            </div>
          )}

          <div>
            <h2 className="text-lg font-black text-[#1F382B] tracking-tight">
              Pengaturan Nilai & Ketentuan Sistem Poin
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Atur besaran perolehan poin kelulusan kuis, bonus penyelesaian sertifikat, dan standar poin penukaran kursus baru secara dinamis.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Status Fitur Poin */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Status Aktivasi Sistem Penukaran Poin
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Jika dinonaktifkan, peserta tidak dapat mengajukan klaim kursus baru sementara waktu.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pointSettings.fiturAktif}
                    onChange={(e) =>
                      setPointSettings({ ...pointSettings, fiturAktif: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#58816D]"></div>
                </label>
              </div>
            </div>

            {/* Aturan Perolehan Poin */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-5">
              <h3 className="text-sm font-extrabold text-[#1F382B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Aturan Perolehan Poin Belajar (Earning Rules)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Kuis Lulus */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">
                    Lulus Kuis Modul
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Poin saat lulus pertama kali (1x per modul).
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={pointSettings.poinKuisLulus}
                      onChange={(e) =>
                        setPointSettings({
                          ...pointSettings,
                          poinKuisLulus: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full text-sm font-bold p-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#58816D]/20 focus:border-[#58816D]"
                    />
                    <span className="text-xs font-bold text-zinc-500">Poin</span>
                  </div>
                </div>

                {/* 2. Kuis Sempurna */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">
                    Bonus Nilai Sempurna (100)
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Bonus tambahan jika semua jawaban benar.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={pointSettings.poinKuisSempurna}
                      onChange={(e) =>
                        setPointSettings({
                          ...pointSettings,
                          poinKuisSempurna: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full text-sm font-bold p-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#58816D]/20 focus:border-[#58816D]"
                    />
                    <span className="text-xs font-bold text-zinc-500">Poin</span>
                  </div>
                </div>

                {/* 3. Selesai Kursus / Sertifikat */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">
                    Bonus Terbit Sertifikat
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Bonus kelulusan saat seluruh modul kursus tuntas.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={2000}
                      value={pointSettings.poinKursusSelesai}
                      onChange={(e) =>
                        setPointSettings({
                          ...pointSettings,
                          poinKursusSelesai: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full text-sm font-bold p-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#58816D]/20 focus:border-[#58816D]"
                    />
                    <span className="text-xs font-bold text-zinc-500">Poin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aturan Standar Penukaran Kursus */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#1F382B] flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Ketentuan Standar Penukaran (Redemption Rules)</span>
              </h3>

              <div className="max-w-md space-y-2">
                <label className="block text-xs font-bold text-zinc-700">
                  Standar Poin Dibutuhkan untuk Klaim 1 Kursus (Default)
                </label>
                <p className="text-xs text-zinc-500">
                  Nilai default jika kursus belum memiliki pengaturan poin khusus per-kursus.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={100}
                    max={5000}
                    step={50}
                    value={pointSettings.minPoinKlaimDefault}
                    onChange={(e) =>
                      setPointSettings({
                        ...pointSettings,
                        minPoinKlaimDefault: parseInt(e.target.value) || 500,
                      })
                    }
                    className="w-full text-sm font-bold p-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#58816D]/20 focus:border-[#58816D]"
                  />
                  <span className="text-xs font-bold text-zinc-500">Poin</span>
                </div>
              </div>
            </div>

            {/* Tombol Simpan Perubahan */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-zinc-400">
                Terakhir diubah: {new Date(pointSettings.diubahPada).toLocaleString("id-ID")}
              </span>
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer border border-[#456655]"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan Ketentuan</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
