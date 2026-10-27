"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/auth-modal";
import EditProfileModal from "@/components/edit-profile-modal";
import NotificationCenter from "@/components/notification-center";
import { EnrollmentDialog } from "@/components/enrollment-dialog";
import { MayarCheckoutModal } from "@/components/mayar-checkout-modal";
import { PUBLISHED_COURSES, Kursus } from "@/data/courses";
import { AdminAnalytics } from "@/components/admin-analytics";
import { AdminPanelViews } from "@/components/admin-panel-views";
import { InstructorPanelViews } from "@/components/instructor-panel-views";
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Award,
  CreditCard,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  LogOut,
  Trash2,
  Edit3,
  Search,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  PlayCircle,
  HelpCircle,
  Bell,
  ArrowUpRight,
  Menu,
  X,
  UserCheck,
  Globe,
  SlidersHorizontal,
  FileCheck,
  Download,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Users as UsersIcon,
  FileText,
  Gift,
  Sliders,
} from "lucide-react";
import {
  calculateRealUserPoints,
  getCourseClaims,
  submitCourseClaim,
  getCoursePointConfig,
  getPointSettings,
  RiwayatPoinItem,
  KlaimKursusItem,
} from "@/lib/point-system";

interface PendaftaranItem {
  id: string;
  status: "menunggu_bayar" | "aktif" | "selesai" | "kedaluwarsa" | "dibatalkan";
  nominal: number;
  metode_bayar: "gratis" | "transfer_manual" | "mayar";
  batas_bayar: string | null;
  didaftarkan_pada: string;
  mayar_invoice_id: string | null;
  peserta?: {
    id: string;
    nama_lengkap: string;
    email: string;
    no_hp?: string | null;
  };
  kursus: {
    id: string;
    judul: string;
    slug: string;
    kategori: string;
    harga: number;
    nilai_lulus: number;
    modul: { id: string; urutan: number; judul: string; durasi_menit: number }[];
  };
  progres_modul: { modul_id: string; lulus_pada: string | null }[];
  sertifikat: { nomor_sertifikat: string; diterbitkan_pada: string } | null;
}

interface DashboardPesertaPageProps {
  initialMenu?:
  | "analitik"
  | "pendaftaran"
  | "kursus"
  | "pembayaran"
  | "sertifikat"
  | "pengguna"
  | "audit_log"
  | "dashboard"
  | "tagihan"
  | "kelola_kursus"
  | "peserta_nilai";
  requiredRole?: "admin" | "instruktur" | "peserta";
}

export default function DashboardPesertaPage({ initialMenu, requiredRole }: DashboardPesertaPageProps = {}) {
  const router = useRouter();
  const { currentUser, logout, deleteAccount, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<PendaftaranItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedEnrollCourse, setSelectedEnrollCourse] = useState<Kursus | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<
    | "analitik"
    | "pendaftaran"
    | "kursus"
    | "pembayaran"
    | "sertifikat"
    | "pengguna"
    | "audit_log"
    | "dashboard"
    | "tagihan"
    | "kelola_kursus"
    | "peserta_nilai"
    | "klaim_poin"
    | "pengaturan_poin"
    | "tukar_poin"
  >(initialMenu || "dashboard");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [simulatingPayId, setSimulatingPayId] = useState<string | null>(null);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<PendaftaranItem | null>(null);

  // State kursus khusus instruktur untuk widget sidebar kanan
  const [instructorCourses, setInstructorCourses] = useState<{
    id: string;
    judul: string;
    slug: string;
    status: "draf" | "ditinjau" | "terbit" | "ditutup";
    kuota: number;
    catatan_tinjauan: string | null;
  }[]>([]);

  // State Sistem Poin Peserta
  const [userRewardPoints, setUserRewardPoints] = useState<number>(450);
  const [pointHistoryList, setPointHistoryList] = useState<RiwayatPoinItem[]>([]);
  const [availableRedemptionCourses, setAvailableRedemptionCourses] = useState<any[]>([]);
  const [claimingCourseId, setClaimingCourseId] = useState<string | null>(null);
  const [claimMotivationNote, setClaimMotivationNote] = useState<string>("");
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);
  const [claimErrorMessage, setClaimErrorMessage] = useState<string | null>(null);

  // Refresh data poin peserta secara real-time dari database Supabase
  const refreshUserPointsData = async () => {
    if (currentUser?.id) {
      try {
        const realData = await calculateRealUserPoints(currentUser.id);
        setUserRewardPoints(realData.balancePoints);
        setPointHistoryList(realData.history);
      } catch (err) {
        console.error("Gagal sinkronisasi poin:", err);
      }
    }
  };

  useEffect(() => {
    refreshUserPointsData();
  }, [currentUser?.id, enrollments]);

  // Sidebar states (desktop toggle + mobile slide-in drawer)
  // Default false: UI awal login peserta, admin, instruktur tertutup (gambar kiri), terbuka saat hamburger diklik (gambar kanan)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle function: di layar desktop toggle sidebar, di mobile toggle drawer
  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileMenuOpen((prev) => !prev);
    }
  };

  // Deteksi rute aktif dan hak akses yang dibutuhkan halaman
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const effectiveRequiredRole: "admin" | "instruktur" | "peserta" | undefined =
    requiredRole ||
    (currentPath.startsWith("/admin")
      ? "admin"
      : currentPath.startsWith("/instruktur")
        ? "instruktur"
        : currentPath.startsWith("/peserta")
          ? "peserta"
          : undefined);

  const activeRole: "admin" | "instruktur" | "peserta" =
    (currentUser?.peran as "admin" | "instruktur" | "peserta") ||
    effectiveRequiredRole ||
    "peserta";

  const isAccessDenied = Boolean(
    currentUser &&
    effectiveRequiredRole &&
    currentUser.peran !== effectiveRequiredRole
  );

  // Dynamic role title
  const roleTitle =
    effectiveRequiredRole === "admin"
      ? "Portal Admin"
      : effectiveRequiredRole === "instruktur"
        ? "Portal Instruktur"
        : effectiveRequiredRole === "peserta"
          ? "Portal Peserta"
          : currentUser?.peran === "admin"
            ? "Portal Admin"
            : currentUser?.peran === "instruktur"
              ? "Portal Instruktur"
              : "Portal Peserta";

  // Helper info route URL & keterangan halaman dinamis
  const getPageInfo = (menu: string, role?: string) => {
    if (role === "admin") {
      switch (menu) {
        case "analitik":
          return { path: "/admin/analitik", label: "Analitik & Laporan", code: "ANALYTICS" };
        case "pendaftaran":
          return { path: "/admin/pendaftaran", label: "Data Pendaftaran", code: "ENROLLMENT" };
        case "kursus":
          return { path: "/admin/kursus", label: "Tinjauan Kursus & Kuota", code: "KURSUS" };
        case "pembayaran":
          return { path: "/admin/pembayaran", label: "Verifikasi Pembayaran Mayar", code: "PAYMENT" };
        case "sertifikat":
          return { path: "/admin/sertifikat", label: "Daftar Sertifikat Terbit", code: "CERTIFICATE" };
        case "pengguna":
          return { path: "/admin/pengguna", label: "Kelola Pengguna", code: "USERS" };
        case "audit_log":
          return { path: "/admin/audit-log", label: "Audit Log Sistem", code: "AUDIT" };
        case "klaim_poin":
          return { path: "/admin/klaim-poin", label: "Persetujuan Klaim Poin Kursus", code: "REWARD" };
        case "pengaturan_poin":
          return { path: "/admin/pengaturan-poin", label: "Pengaturan Ketentuan Poin LMS", code: "SETTINGS" };
        default:
          return { path: "/admin/dashboard", label: "Dashboard Ringkasan Admin", code: "ADMIN" };
      }
    }
    if (role === "instruktur") {
      switch (menu) {
        case "kelola_kursus":
          return { path: "/instruktur/kursus", label: "Kelola Kursus & Modul", code: "KURSUS" };
        case "peserta_nilai":
          return { path: "/instruktur/peserta-nilai", label: "Peserta & Nilai Kuis", code: "PESERTA" };
        default:
          return { path: "/instruktur/kursus", label: "Kelola Kursus & Modul", code: "KURSUS" };
      }
    }
    // Peserta
    switch (menu) {
      case "kursus":
        return { path: "/peserta/kursus", label: "Kursus Saya", code: "KURSUS" };
      case "tagihan":
        return { path: "/peserta/tagihan", label: "Tagihan Mayar", code: "TAGIHAN" };
      case "sertifikat":
        return { path: "/peserta/sertifikat", label: "Sertifikat Saya", code: "SERTIFIKAT" };
      case "tukar_poin":
        return { path: "/peserta/tukar-poin", label: "Poin Reward & Hadiah Kursus", code: "POINTS" };
      default:
        return { path: "/peserta/dashboard", label: "Ringkasan Belajar", code: "PESERTA" };
    }
  };

  // Sinkronisasi URL browser saat user navigasi atau ganti menu
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isAccessDenied) return; // JANGAN ubah URL jika user sedang terkena pembatasan hak akses

      const { path } = getPageInfo(activeMenu, currentUser?.peran);
      if (
        window.location.pathname !== path &&
        (window.location.pathname.startsWith("/admin") ||
          window.location.pathname.startsWith("/instruktur") ||
          window.location.pathname.startsWith("/peserta") ||
          window.location.pathname.startsWith("/dashboard"))
      ) {
        window.history.pushState(null, "", path);
      }
    }
  }, [activeMenu, currentUser?.peran, isAccessDenied]);

  // Fetch data pendaftaran dari Supabase
  const fetchEnrollments = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);

    try {
      // Jika peran admin, ambil seluruh pendaftaran riil dari server API (bypass RLS)
      if (currentUser.peran === "admin") {
        const res = await fetch("/api/admin/pendaftaran");
        const json = await res.json();
        if (res.ok && json.success && json.enrollments) {
          setEnrollments(json.enrollments as PendaftaranItem[]);
          return;
        }
      }

      let query = supabase
        .from("pendaftaran")
        .select(`
          id,
          status,
          nominal,
          metode_bayar,
          batas_bayar,
          didaftarkan_pada,
          mayar_invoice_id,
          peserta:peserta_id (
            id,
            nama_lengkap,
            email,
            no_hp
          ),
          kursus:kursus_id (
            id,
            judul,
            slug,
            kategori,
            harga,
            nilai_lulus,
            modul (
              id,
              urutan,
              judul,
              durasi_menit
            )
          ),
          progres_modul (
            modul_id,
            lulus_pada
          ),
          sertifikat (
            nomor_sertifikat,
            diterbitkan_pada
          )
        `)
        .order("didaftarkan_pada", { ascending: false });

      // Jika role peserta, batasi ke miliknya sendiri dan abaikan yang sudah dibatalkan
      if (currentUser.peran === "peserta") {
        query = query.eq("peserta_id", currentUser.id).neq("status", "dibatalkan");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching enrollments:", error);
      } else if (data) {
        const formatted = data.map((item: any) => ({
          ...item,
          sertifikat: Array.isArray(item.sertifikat) ? item.sertifikat[0] || null : item.sertifikat,
        }));
        setEnrollments(formatted as PendaftaranItem[]);
      }
    } catch (err) {
      console.error("Unexpected error in fetchEnrollments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchEnrollments();
      if (!initialMenu) {
        if (currentUser.peran === "admin") {
          setActiveMenu("analitik");
        } else if (currentUser.peran === "instruktur") {
          setActiveMenu("kelola_kursus");
        }
      } else if (currentUser.peran === "instruktur" && (initialMenu as string) === "dashboard") {
        setActiveMenu("kelola_kursus");
      }
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [currentUser, authLoading, initialMenu]);

  // Fetch kursus milik instruktur untuk ringkasan sidebar kanan
  useEffect(() => {
    if (currentUser?.id && currentUser.peran === "instruktur") {
      supabase
        .from("kursus")
        .select("id, judul, slug, status, kuota, catatan_tinjauan")
        .eq("instruktur_id", currentUser.id)
        .order("dibuat_pada", { ascending: true })
        .then(({ data }) => {
          if (data) setInstructorCourses(data as any);
        });
    }
  }, [currentUser?.id, currentUser?.peran]);

  // BR-07: Batalkan pendaftaran belum bayar
  const handleCancelEnrollment = async (pendaftaranId: string) => {
    if (!confirm("Batalkan pendaftaran ini? Kursi Anda akan dikembalikan ke kuota umum.")) {
      return;
    }

    setCancellingId(pendaftaranId);
    try {
      const { error } = await supabase
        .from("pendaftaran")
        .update({
          status: "dibatalkan",
          alasan_batal: "Dibatalkan oleh peserta sebelum pembayaran",
          dibatalkan_pada: new Date().toISOString(),
        })
        .eq("id", pendaftaranId)
        .eq("status", "menunggu_bayar");

      if (error) {
        alert("Gagal membatalkan: " + error.message);
      } else {
        await fetchEnrollments();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  // Konfirmasi pembayaran Mayar via API
  const handleSimulateMayarPayment = async (pendaftaranId: string) => {
    setSimulatingPayId(pendaftaranId);
    try {
      const res = await fetch("/api/pembayaran/mayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftaranId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Konfirmasi pembayaran Mayar gagal: " + (data.error || "Gagal memproses"));
      } else {
        await fetchEnrollments();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSimulatingPayId(null);
    }
  };

  // Periksa & sinkronkan status pembayaran Mayar langsung ke server Mayar (Live Sync)
  const handleCheckMayarLive = async (pendaftaranId: string) => {
    setSimulatingPayId(pendaftaranId);
    try {
      const res = await fetch(`/api/pembayaran/mayar?pendaftaranId=${pendaftaranId}`);
      const data = await res.json();
      if (res.ok && data.status === "aktif") {
        alert(data.message || "Pembayaran Mayar berhasil diverifikasi! Kursus Anda telah aktif.");
        await fetchEnrollments();
      } else {
        alert(data.message || "Status di Mayar belum lunas (Unpaid). Silakan selesaikan pembayaran terlebih dahulu.");
      }
    } catch (err: any) {
      alert("Gagal memeriksa status Mayar: " + err.message);
    } finally {
      setSimulatingPayId(null);
    }
  };

  // Metrik & Statistik (Hanya hitung pendaftaran valid yang tidak dibatalkan)
  const validEnrollments = enrollments.filter((e) => e.status !== "dibatalkan");
  const totalEnrolled = validEnrollments.length;
  const activeCourses = enrollments.filter((e) => e.status === "aktif");
  const pendingPayments = enrollments.filter((e) => e.status === "menunggu_bayar");
  const completedCourses = enrollments.filter((e) => e.status === "selesai");
  const certificateItems = enrollments.filter((e) => e.sertifikat !== null && e.status !== "dibatalkan");
  const totalCertificates = certificateItems.length;

  // Kursus yang sedang aktif pertama untuk tombol CTA di Hero Banner
  const latestActive = activeCourses[0] || null;

  // Metrik Instruktur untuk Widget Sidebar Kanan
  const myCourseIds = React.useMemo(() => new Set(instructorCourses.map((c) => c.id)), [instructorCourses]);
  const instructorEnrollments = React.useMemo(() => {
    return enrollments.filter((e) => myCourseIds.has(e.kursus?.id) && e.status !== "dibatalkan");
  }, [enrollments, myCourseIds]);
  const instructorActiveStudents = instructorEnrollments.filter((e) => e.status === "aktif").length;
  const instructorCompletedStudents = instructorEnrollments.filter((e) => e.status === "selesai").length;
  const instructorDraftCourses = instructorCourses.filter((c) => c.status === "draf");
  const instructorReviewCourses = instructorCourses.filter((c) => c.status === "ditinjau");
  const instructorPublishedCourses = instructorCourses.filter((c) => c.status === "terbit");

  // Filter daftar kursus untuk tab Dashboard (Abaikan status dibatalkan)
  const filteredEnrollments = enrollments.filter((item) => {
    if (item.status === "dibatalkan") return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.kursus?.judul?.toLowerCase().includes(q);
      const matchCat = item.kursus?.kategori?.toLowerCase().includes(q);
      return matchTitle || matchCat;
    }
    return true;
  });

  // Filter kursus saya (Aktif & Selesai)
  const myCoursesList = enrollments.filter((e) => {
    const isLearning = e.status === "aktif" || e.status === "selesai";
    if (!isLearning) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return e.kursus?.judul?.toLowerCase().includes(q) || e.kursus?.kategori?.toLowerCase().includes(q);
    }
    return true;
  });

  // Kursus yang belum didaftarkan / belum dibeli (Bebas didaftarkan ulang jika pernah dibatalkan)
  const enrolledCourseIds = new Set(validEnrollments.map((e) => e.kursus?.id || (e as any).kursus_id));
  const otherAvailableCourses = PUBLISHED_COURSES.filter((c) => !enrolledCourseIds.has(c.id));

  // Tanggal & Jadwal Belajar Dinamis (Mengikuti tanggal hari ini secara real-time)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  }, []);

  // Hitung 7 hari dalam seminggu (Senin s/d Minggu) berdasarkan pergeseran minggu
  const currentWeekDays = React.useMemo(() => {
    const base = new Date(currentDate);
    // Terapkan offset minggu (0 = minggu ini, -1 = minggu lalu, +1 = minggu depan)
    base.setDate(base.getDate() + weekOffset * 7);

    // Ambil index hari (0: Minggu, 1: Senin, ..., 6: Sabtu)
    const day = base.getDay();
    // Hitung jarak ke hari Senin (standar awal minggu kalender Indonesia)
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const today = new Date();

    return dayLabels.map((label, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);

      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      const isSelected = selectedDate
        ? d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
        : isToday;

      return {
        day: label,
        date: d.getDate(),
        fullDate: d,
        isToday,
        active: isSelected,
      };
    });
  }, [currentDate, weekOffset, selectedDate]);

  // Label Bulan & Tahun Dinamis (contoh: "Okt 2026" atau "Okt - Nov 2026")
  const currentMonthYearLabel = React.useMemo(() => {
    if (!currentWeekDays.length) return "";
    const firstDay = currentWeekDays[0].fullDate;
    const lastDay = currentWeekDays[6].fullDate;

    const firstMonth = firstDay.toLocaleDateString("id-ID", { month: "short" });
    const lastMonth = lastDay.toLocaleDateString("id-ID", { month: "short" });
    const year = lastDay.getFullYear();

    if (firstDay.getMonth() === lastDay.getMonth()) {
      const m = firstMonth.charAt(0).toUpperCase() + firstMonth.slice(1);
      return `${m} ${year}`;
    }

    const fCap = firstMonth.charAt(0).toUpperCase() + firstMonth.slice(1);
    const lCap = lastMonth.charAt(0).toUpperCase() + lastMonth.slice(1);
    if (firstDay.getFullYear() === lastDay.getFullYear()) {
      return `${fCap} - ${lCap} ${year}`;
    }
    return `${fCap} ${firstDay.getFullYear()} - ${lCap} ${year}`;
  }, [currentWeekDays]);

  // =========================================================
  // ACCESS RESTRICTION SCREEN (FULL PAGE CENTER - PRD 3 & 7)
  // Tampil bersih dan penuh di tengah layar tanpa header & sidebar (persis screenshot 2)
  // =========================================================
  if (currentUser && !authLoading && isAccessDenied) {
    return (
      <div className="min-h-screen glass-glow-bg flex items-center justify-center p-4 sm:p-8 selection:bg-[#58816D]/20 selection:text-[#58816D] relative overflow-hidden">
        {/* Ambient Glowing Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#58816D]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl p-8 sm:p-12 text-center rounded-[36px] bg-white/85 backdrop-blur-2xl border border-amber-200/90 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-800 text-[11px] font-black uppercase mb-3.5 border border-amber-300/60">
            <span>Akses Terbatas</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-black text-[#1F382B] mb-2.5 tracking-tight">
            {effectiveRequiredRole === "admin"
              ? "Halaman Ini Hanya Bisa Dibuka oleh Admin"
              : effectiveRequiredRole === "instruktur"
                ? "Halaman Ini Hanya Bisa Dibuka oleh Instruktur"
                : "Halaman Ini Khusus untuk Peserta"}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-600 mb-6 leading-relaxed max-w-md mx-auto">
            {effectiveRequiredRole === "admin" ? (
              <>
                Sesuai aturan hak akses LMS Lembaga Kursus Pijar Aksara, halaman Panel Admin &amp; Dashboard Laporan hanya dapat diakses oleh staf pengelola dengan peran <strong>Admin</strong>.
              </>
            ) : effectiveRequiredRole === "instruktur" ? (
              <>
                Sesuai aturan hak akses LMS Lembaga Kursus Pijar Aksara, halaman Kelola Kursus &amp; Nilai Peserta hanya dapat diakses oleh pengajar dengan peran <strong>Instruktur</strong>.
              </>
            ) : (
              <>
                Sesuai aturan hak akses LMS Lembaga Kursus Pijar Aksara, halaman Portal Belajar Peserta hanya dapat diakses oleh akun dengan peran <strong>Peserta</strong>.
              </>
            )}
            <br />
            <span className="inline-block mt-3 px-3 py-1.5 rounded-xl bg-zinc-100/90 text-zinc-700 text-xs font-medium border border-zinc-200">
              Akun Anda saat ini login sebagai:{" "}
              <strong className="text-[#58816D] capitalize">
                {currentUser.peran}
              </strong>{" "}
              ({currentUser.nama})
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={
                currentUser.peran === "admin"
                  ? "/admin/dashboard"
                  : currentUser.peran === "instruktur"
                    ? "/instruktur/kursus"
                    : "/peserta/dashboard"
              }
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 border border-[#456655]"
            >
              <span>Buka Portal {currentUser.peran === "admin" ? "Admin" : currentUser.peran === "instruktur" ? "Instruktur" : "Peserta"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
              <span>Ganti Akun ({effectiveRequiredRole === "admin" ? "Admin" : effectiveRequiredRole === "instruktur" ? "Instruktur" : "Peserta"})</span>
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialTab="login"
          onSuccessLogin={(acc) => {
            setIsAuthOpen(false);
            if (acc?.peran === "admin") {
              window.location.href = "/admin/dashboard";
            } else if (acc?.peran === "instruktur") {
              window.location.href = "/instruktur/kursus";
            } else {
              window.location.href = "/peserta/dashboard";
            }
          }}
        />
      </div>
    );
  }

  // Guest State pada Protected Role Page (Tampil penuh di tengah)
  if (!currentUser && !authLoading && effectiveRequiredRole) {
    return (
      <div className="min-h-screen glass-glow-bg flex items-center justify-center p-4 sm:p-8 selection:bg-[#58816D]/20 selection:text-[#58816D] relative overflow-hidden">
        <div className="w-full max-w-lg p-8 sm:p-12 text-center rounded-[36px] bg-white/85 backdrop-blur-2xl border border-zinc-200/80 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#58816D]/15 text-[#58816D] mx-auto flex items-center justify-center mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-2">
            {effectiveRequiredRole === "admin"
              ? "Halaman Ini Hanya Bisa Dibuka oleh Admin"
              : effectiveRequiredRole === "instruktur"
                ? "Halaman Ini Hanya Bisa Dibuka oleh Instruktur"
                : "Masuk ke Portal Peserta"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mb-6 leading-relaxed">
            {effectiveRequiredRole === "admin"
              ? "Sesuai aturan hak akses LMS, halaman ini hanya diperuntukkan bagi pengelola dengan peran Admin. Silakan masuk menggunakan akun Admin."
              : effectiveRequiredRole === "instruktur"
                ? "Sesuai aturan hak akses LMS, halaman ini hanya diperuntukkan bagi pengajar dengan peran Instruktur. Silakan masuk menggunakan akun Instruktur."
                : "Silakan masuk ke akun Anda untuk melihat dashboard progres belajar Anda."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer border border-[#456655]"
            >
              Masuk ke Akun
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold transition-all shadow-2xs"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialTab="login"
          onSuccessLogin={(acc) => {
            setIsAuthOpen(false);
            if (acc?.peran === "admin") {
              window.location.href = "/admin/dashboard";
            } else if (acc?.peran === "instruktur") {
              window.location.href = "/instruktur/kursus";
            } else {
              window.location.href = "/peserta/dashboard";
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-glow-bg text-zinc-900 flex font-sans selection:bg-[#58816D]/20 selection:text-[#58816D] relative">

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Desktop - Collapsible)                    */}
      {/* ========================================================= */}
      {sidebarOpen && (
        <aside className="hidden lg:flex w-64 flex-col justify-between glass-panel border-r border-white/70 p-5 sticky top-0 h-screen shrink-0 transition-all duration-300 animate-in fade-in slide-in-from-left-3 duration-200 relative overflow-x-hidden">
          {/* Ambient Glowing Gradient Orbs for Authentic Frosted Glass Refraction */}
          <div className="absolute top-10 -left-10 w-44 h-44 rounded-full bg-[#58816D]/20 blur-3xl pointer-events-none -z-0" />
          <div className="absolute top-1/2 -right-10 w-40 h-40 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-16 left-0 w-48 h-48 rounded-full bg-[#58816D]/15 blur-3xl pointer-events-none -z-0" />

          <div className="space-y-6 relative z-10">

            {/* Logo Brand & Portal Role Header */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#58816D] to-[#456655] flex items-center justify-center text-white border border-white/80 shadow-[0_4px_16px_rgba(88,129,109,0.3)]">
                <Sparkles className="w-5 h-5 text-[#EBF3EF]" />
              </div>
              <div>
                <span className="font-black text-base tracking-tight text-[#1F382B] block leading-tight">
                  Pijar Aksara
                </span>
              </div>
            </div>

            {/* Navigasi Utama Sidebar (Role-Based: Full Admin vs Instruktur vs Peserta) */}
            <nav className="space-y-1.5 pt-2">

              {/* === MENU KHUSUS ADMIN (FULL ADMIN PANEL) === */}
              {activeRole === "admin" ? (
                <>
                  {/* 1. Analitik & Laporan (PRD 9) */}
                  <button
                    onClick={() => { setActiveMenu("analitik"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "analitik"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "analitik" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span>Analitik & Laporan</span>
                    </div>
                  </button>

                  {/* 2. Pendaftaran Peserta (PRD 7) */}
                  <button
                    onClick={() => { setActiveMenu("pendaftaran"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "pendaftaran"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "pendaftaran" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <UsersIcon className="w-4 h-4" />
                      </div>
                      <span>Data Pendaftaran</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeMenu === "pendaftaran" ? "bg-white/25 text-white border border-white/40 backdrop-blur-md" : "bg-[#58816D]/15 text-[#58816D] border border-[#58816D]/25 backdrop-blur-sm"}`}>
                      {enrollments.length}
                    </span>
                  </button>

                  {/* 3. Tinjauan Kursus & Kuota (BR-02 & BR-06) */}
                  <button
                    onClick={() => { setActiveMenu("kursus"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "kursus"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "kursus" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>Tinjauan Kursus</span>
                    </div>
                  </button>

                  {/* 4. Verifikasi Pembayaran & Mayar (PRD 7 & 11) */}
                  <button
                    onClick={() => { setActiveMenu("pembayaran"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "pembayaran"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "pembayaran" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span>Verifikasi Pembayaran</span>
                    </div>
                    {pendingPayments.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeMenu === "pembayaran" ? "bg-amber-400 text-amber-950 font-black shadow-2xs" : "bg-amber-400/20 text-amber-900 border border-amber-400/30 backdrop-blur-sm"}`}>
                        {pendingPayments.length}
                      </span>
                    )}
                  </button>

                  {/* 5. Daftar Sertifikat Terbit (PRD 11) */}
                  <button
                    onClick={() => { setActiveMenu("sertifikat"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "sertifikat"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "sertifikat" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <span>Sertifikat Terbit</span>
                    </div>
                    {totalCertificates > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeMenu === "sertifikat" ? "bg-white/25 text-white border border-white/40 backdrop-blur-md" : "bg-[#58816D]/15 text-[#58816D] border border-[#58816D]/25 backdrop-blur-sm"}`}>
                        {totalCertificates}
                      </span>
                    )}
                  </button>

                  {/* 6. Kelola Pengguna & Hak Akses (BR-12) */}
                  <button
                    onClick={() => { setActiveMenu("pengguna"); setStatusFilter("all"); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "pengguna"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "pengguna" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span>Kelola Pengguna</span>
                  </button>

                  {/* 7. Audit Log Sistem (BR-12) */}
                  <button
                    onClick={() => { setActiveMenu("audit_log"); setStatusFilter("all"); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "audit_log"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "audit_log" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>Audit Log Sistem</span>
                  </button>
                </>
              ) : activeRole === "instruktur" ? (
                /* === MENU KHUSUS INSTRUKTUR (PORTAL INSTRUKTUR) === */
                <>
                  {/* 1. Kelola Kursus & Modul (PRD US-06 & BR-03) */}
                  <button
                    onClick={() => { setActiveMenu("kelola_kursus"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "kelola_kursus"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "kelola_kursus" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>Kelola Kursus</span>
                    </div>
                  </button>

                  {/* 2. Peserta & Nilai Kuis (PRD US-07 & BR-12) */}
                  <button
                    onClick={() => { setActiveMenu("peserta_nilai"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "peserta_nilai"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "peserta_nilai" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <UsersIcon className="w-4 h-4" />
                      </div>
                      <span>Peserta & Nilai</span>
                    </div>
                  </button>
                </>
              ) : (
                /* === MENU KHUSUS PESERTA === */
                <>
                  <button
                    onClick={() => { setActiveMenu("dashboard"); setStatusFilter("all"); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "dashboard"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "dashboard" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span>Dashboard Ringkasan</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("kursus"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "kursus"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "kursus" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span>Kursus Saya</span>
                    </div>
                    {activeCourses.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeMenu === "kursus" ? "bg-white/25 text-white border border-white/40 backdrop-blur-md" : "bg-[#58816D]/15 text-[#58816D] border border-[#58816D]/25 backdrop-blur-sm"}`}>
                        {activeCourses.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveMenu("tagihan"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "tagihan"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "tagihan" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span>Tagihan Mayar</span>
                    </div>
                    {pendingPayments.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeMenu === "tagihan" ? "bg-amber-400 text-amber-950 font-black shadow-2xs" : "bg-amber-400/20 text-amber-900 border border-amber-400/30 backdrop-blur-sm"}`}>
                        {pendingPayments.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => { setActiveMenu("sertifikat"); setStatusFilter("all"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer group ${activeMenu === "sertifikat"
                      ? "glass-nav-active shadow-lg"
                      : "glass-nav-item"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${activeMenu === "sertifikat" ? "bg-white/20 text-white shadow-2xs" : "bg-white/50 border border-white/70 text-zinc-500 group-hover:text-[#58816D] group-hover:bg-white/90"}`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <span>Sertifikat Saya</span>
                    </div>
                    {totalCertificates > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeMenu === "sertifikat" ? "bg-white/25 text-white border border-white/40 backdrop-blur-md" : "bg-[#58816D]/15 text-[#58816D] border border-[#58816D]/25 backdrop-blur-sm"}`}>
                        {totalCertificates}
                      </span>
                    )}
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Bottom Sidebar: Kembali ke Web & Logout */}
          <div className="space-y-1.5 pt-4 border-t border-white/70 relative z-10">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-zinc-600 hover:text-[#1F382B] hover:bg-white/80 hover:backdrop-blur-md hover:border hover:border-white/90 hover:shadow-2xs transition-all"
            >
              <div className="w-7 h-7 rounded-xl bg-white/50 border border-white/70 flex items-center justify-center text-zinc-500">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>Kembali ke Website</span>
            </Link>



            {currentUser && (
              <>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-zinc-600 hover:text-[#1F382B] hover:bg-white/80 transition-all cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#58816D]/15 border border-[#58816D]/25 flex items-center justify-center text-[#58816D]">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <span>Edit Profil (Ganti Nama)</span>
                </button>

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 hover:backdrop-blur-md hover:border hover:border-rose-200/80 hover:shadow-2xs transition-all cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span>Keluar Akun</span>
                </button>
              </>
            )}
          </div>
        </aside>
      )}

      {/* ========================================================= */}
      {/* 2. CENTER WORKSPACE                                       */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header Bar dengan Hamburger Button Selalu Tersedia */}
        <header className="glass-panel border-b border-white/70 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3">

          {/* Hamburger Button (Selalu tampil di mobile & desktop) + Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl min-w-0">

            {/* Hamburger Toggle Button */}
            <button
              onClick={handleToggleSidebar}
              className="p-2 rounded-2xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-[#1F382B] transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={sidebarOpen ? "Tutup Sidebar (Tampilan Penuh)" : "Buka Menu Sidebar"}
              aria-label="Toggle Menu Sidebar"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#1F382B]" /> : <Menu className="w-5 h-5 text-[#1F382B]" />}
            </button>

            {/* Brand Pill saat sidebar desktop ditutup */}
            {!sidebarOpen && (
              <div className="hidden lg:flex items-center gap-2 pl-1.5 pr-3 py-1 bg-zinc-100 rounded-full shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#58816D] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-[#EBF3EF]" />
                </div>
                <span className="text-xs font-black text-[#1F382B]">Pijar Aksara</span>
              </div>
            )}

            {/* Mobile Brand Title */}
            <div className="lg:hidden flex flex-col mr-1 shrink-0">
              <span className="font-black text-xs text-[#1F382B] leading-tight">Pijar Aksara</span>
            </div>

            {/* Search Input */}
            <div className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={currentUser?.peran === "admin" ? "Cari peserta, kursus, invoice Mayar, atau sertifikat..." : "Cari materi, kuis, atau modul belajar..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-zinc-100/70 border border-transparent focus:bg-white focus:border-zinc-300 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Pusat Notifikasi Lonceng */}
            <NotificationCenter enrollments={enrollments} />

            {currentUser && (
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="flex xl:hidden items-center gap-1.5 p-1 sm:pr-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 transition-colors cursor-pointer border border-zinc-200/60"
                title="Profil Pengguna"
              >
                <div className="w-6 h-6 rounded-full bg-[#58816D] text-white flex items-center justify-center text-xs font-black uppercase">
                  {currentUser.nama.charAt(0)}
                </div>
                <span className="text-xs font-bold text-zinc-800 hidden sm:inline max-w-[100px] truncate">
                  {currentUser.nama.split(" ")[0]}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* ========================================================= */}
        {/* RESPONSIF: MOBILE & TABLET SLIDE-IN DRAWER               */}
        {/* ========================================================= */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-In Drawer */}
            <div className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
              <div className="space-y-6">

                {/* Header Drawer */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#58816D] flex items-center justify-center text-white shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#EBF3EF]" />
                    </div>
                    <div>
                      <span className="font-black text-sm text-[#1F382B] block leading-tight">Pijar Aksara</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{roleTitle}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl border border-zinc-200 text-zinc-500 hover:text-[#1F382B] hover:bg-zinc-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profil Singkat di Drawer */}
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#58816D] text-white border border-[#456655] flex items-center justify-center font-black text-xs uppercase shrink-0">
                      {currentUser?.nama ? currentUser.nama.charAt(0) : "P"}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-zinc-900 block truncate">
                        {currentUser?.nama || "Tamu"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block truncate">
                        {currentUser?.email || "Belum Masuk"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsAuthOpen(true); setMobileMenuOpen(false); }}
                    className="text-[10px] font-bold text-zinc-600 px-2.5 py-1 rounded-full border border-zinc-200 hover:bg-zinc-100 shrink-0 cursor-pointer"
                  >
                    Ganti
                  </button>
                </div>

                {/* Menu Navigasi Drawer (Role-Based) */}
                <div className="space-y-1.5">
                  {activeRole === "admin" ? (
                    <>
                      <button
                        onClick={() => {
                          setActiveMenu("analitik");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "analitik"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <BarChart3 className={`w-4 h-4 ${activeMenu === "analitik" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                          <span>Analitik & Laporan</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("pendaftaran");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "pendaftaran"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <UsersIcon className={`w-4 h-4 ${activeMenu === "pendaftaran" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                          <span>Data Pendaftaran</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#1F382B] font-extrabold shadow-2xs">
                          {enrollments.length}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("kursus");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "kursus"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className={`w-4 h-4 ${activeMenu === "kursus" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                          <span>Tinjauan Kursus</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("pembayaran");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "pembayaran"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className={`w-4 h-4 ${activeMenu === "pembayaran" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                          <span>Verifikasi Pembayaran</span>
                        </div>
                        {pendingPayments.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold">
                            {pendingPayments.length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("sertifikat");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "sertifikat"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Award className={`w-4 h-4 ${activeMenu === "sertifikat" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                          <span>Sertifikat Terbit</span>
                        </div>
                        {totalCertificates > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#58816D]/15 text-[#58816D] font-extrabold">
                            {totalCertificates}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("pengguna");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "pengguna"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <UserCheck className={`w-4 h-4 ${activeMenu === "pengguna" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                        <span>Kelola Pengguna</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("audit_log");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "audit_log"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <ShieldCheck className={`w-4 h-4 ${activeMenu === "audit_log" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                        <span>Audit Log Sistem</span>
                      </button>

                      {/* Menu Gamifikasi & Poin Admin */}
                      <button
                        onClick={() => {
                          setActiveMenu("klaim_poin");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "klaim_poin"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Gift className={`w-4 h-4 ${activeMenu === "klaim_poin" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                          <span>Persetujuan Klaim Poin</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold">
                          Baru
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("pengaturan_poin");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "pengaturan_poin"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <Sliders className={`w-4 h-4 ${activeMenu === "pengaturan_poin" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                        <span>Pengaturan Sistem Poin</span>
                      </button>
                    </>
                  ) : activeRole === "instruktur" ? (
                    <>
                      <button
                        onClick={() => {
                          setActiveMenu("kelola_kursus");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "kelola_kursus"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className={`w-4 h-4 ${activeMenu === "kelola_kursus" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                          <span>Kelola Kursus</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("peserta_nilai");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "peserta_nilai"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <UsersIcon className={`w-4 h-4 ${activeMenu === "peserta_nilai" ? "text-[#EBF3EF]" : "text-zinc-400"}`} />
                          <span>Peserta & Nilai</span>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setActiveMenu("dashboard");
                          setStatusFilter("all");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "dashboard"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <LayoutDashboard className={`w-4 h-4 ${activeMenu === "dashboard" ? "text-white" : "text-zinc-400"}`} />
                          <span>Dashboard Ringkasan</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("kursus");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "kursus"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className={`w-4 h-4 ${activeMenu === "kursus" ? "text-white" : "text-zinc-400"}`} />
                          <span>Kursus Saya</span>
                        </div>
                        {activeCourses.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#1F382B] font-extrabold shadow-2xs">
                            {activeCourses.length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("tagihan");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "tagihan"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className={`w-4 h-4 ${activeMenu === "tagihan" ? "text-white" : "text-zinc-400"}`} />
                          <span>Tagihan Mayar</span>
                        </div>
                        {pendingPayments.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold">
                            {pendingPayments.length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenu("sertifikat");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "sertifikat"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Award className={`w-4 h-4 ${activeMenu === "sertifikat" ? "text-white" : "text-zinc-400"}`} />
                          <span>Sertifikat Saya</span>
                        </div>
                        {totalCertificates > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#58816D]/15 text-[#58816D] font-extrabold">
                            {totalCertificates}
                          </span>
                        )}
                      </button>

                      {/* Menu Poin Reward & Tukar Kursus Peserta */}
                      <button
                        onClick={() => {
                          setActiveMenu("tukar_poin");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "tukar_poin"
                          ? "bg-[#58816D] text-white border border-[#456655]"
                          : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Gift className={`w-4 h-4 ${activeMenu === "tukar_poin" ? "text-white" : "text-amber-500"}`} />
                          <span>Poin Reward & Hadiah</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold">
                          {userRewardPoints} Poin
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Drawer Links */}
              <div className="space-y-2 pt-6 border-t border-zinc-100">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-[#1F382B] hover:bg-zinc-100 transition-colors"
                >
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <span>Ke Website Publik</span>
                </Link>



                {currentUser && (
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar Akun</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Content Body */}
        <main className="p-4 sm:p-8 space-y-6">



          {/* ========================================================= */}
          {/* 1. ADMIN PORTAL VIEWS (100% FULL ADMIN - PRD 7, 9, 11)     */}
          {/* ========================================================= */}
          {currentUser && currentUser.peran === "admin" && !isAccessDenied && (
            (activeMenu === "analitik" || activeMenu === "dashboard") ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <AdminAnalytics
                  enrollments={enrollments}
                  onRefresh={fetchEnrollments}
                />
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <AdminPanelViews
                  activeTab={
                    activeMenu === "pendaftaran" ||
                      activeMenu === "kursus" ||
                      activeMenu === "pembayaran" ||
                      activeMenu === "sertifikat" ||
                      activeMenu === "pengguna" ||
                      activeMenu === "audit_log" ||
                      activeMenu === "klaim_poin" ||
                      activeMenu === "pengaturan_poin"
                      ? activeMenu
                      : "pendaftaran"
                  }
                  enrollments={enrollments}
                  onRefreshEnrollments={fetchEnrollments}
                  adminName={currentUser?.nama || "Administrator"}
                />
              </div>
            )
          )}

          {/* ========================================================= */}
          {/* 2. INSTRUCTOR PORTAL VIEWS (PRD 5 US-06 & US-07, BR-02, BR-03, BR-04, BR-12) */}
          {/* ========================================================= */}
          {currentUser && currentUser.peran === "instruktur" && !isAccessDenied && (activeMenu === "kelola_kursus" || activeMenu === "peserta_nilai") && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <InstructorPanelViews
                activeTab={activeMenu === "peserta_nilai" ? "peserta_nilai" : "kelola_kursus"}
                instrukturId={currentUser.id}
                instrukturNama={currentUser.nama}
                onRefreshParent={fetchEnrollments}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 1: TAB DASHBOARD (Hero Banner Senada + 4 Flashcards) */}
          {/* ========================================================= */}
          {currentUser && currentUser.peran === "peserta" && !isAccessDenied && activeMenu === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* HERO WELCOME BANNER (Disesuaikan senada dengan Landing Page: Light, Bersih & Soft Dark Green Mesh) */}
              <div className="relative rounded-[32px] bg-gradient-to-br from-zinc-50/90 via-white to-[#58816D]/10 text-[#1F382B] p-6 sm:p-8 border border-zinc-200/90 shadow-xs overflow-hidden">

                {/* Decorative ambient subtle glow senada Landing Page CTA */}
                <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#58816D]/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#58816D]/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1F382B] tracking-tight leading-tight">
                    Selamat Belajar, {currentUser.nama}!
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
                    {latestActive
                      ? `Kamu sedang aktif di kursus "${latestActive.kursus?.judul}". Selesaikan materi dan kuis untuk meraih sertifikat resmi.`
                      : "Jelajahi kursus praktis kami untuk mengasah keahlian kerja, desain media sosial, dan pembukuan usaha."}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {latestActive ? (
                      <Link
                        href={`/belajar/${latestActive.kursus.slug}/1`}
                        className="px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-black transition-all shadow-xs flex items-center gap-2 border border-[#456655]"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Lanjut Belajar: {latestActive.kursus?.judul.split(" ")[0]}...</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/course"
                        className="px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-black transition-all shadow-xs flex items-center gap-2 border border-[#456655]"
                      >
                        <span>Mulai Kursus Baru</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <button
                      onClick={() => { setActiveMenu("kursus"); }}
                      className="px-4 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Buka Kursus Saya ({activeCourses.length})
                    </button>

                    {(currentUser as any).peran === "instruktur" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setActiveMenu("kelola_kursus"); }}
                          className="px-4 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 border border-[#456655]"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#EBF3EF]" />
                          <span>Kelola Kursus & Modul</span>
                        </button>
                        <button
                          onClick={() => { setActiveMenu("peserta_nilai"); }}
                          className="px-4 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 border border-[#456655]"
                        >
                          <UsersIcon className="w-3.5 h-3.5 text-[#EBF3EF]" />
                          <span>Peserta & Nilai</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5 FLASHCARDS (TERMASUK SALDO POIN REWARD) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">

                {/* 1. Kursus Terdaftar */}
                <div
                  onClick={() => { setActiveMenu("dashboard"); setStatusFilter("all"); }}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-2xs hover:shadow-sm hover:border-zinc-300 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-800 mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5 text-zinc-900" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#1F382B] block">
                    {totalEnrolled}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mt-0.5">
                    Kursus Terdaftar
                  </span>
                </div>

                {/* 2. Aktif Belajar */}
                <div
                  onClick={() => { setActiveMenu("kursus"); }}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
                    <PlayCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 block">
                    {activeCourses.length}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mt-0.5">
                    Aktif Belajar
                  </span>
                </div>

                {/* 3. Menunggu Bayar */}
                <div
                  onClick={() => { setActiveMenu("tagihan"); }}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-amber-700 block">
                    {pendingPayments.length}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mt-0.5">
                    Menunggu Bayar
                  </span>
                </div>

                {/* 4. Sertifikat Resmi */}
                <div
                  onClick={() => { setActiveMenu("sertifikat"); }}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-2xs hover:shadow-sm hover:border-[#58816D]/40 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#58816D]/10 flex items-center justify-center text-[#58816D] mb-3 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5 text-[#58816D]" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#58816D] block">
                    {totalCertificates}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mt-0.5">
                    Sertifikat Resmi
                  </span>
                </div>

                {/* 5. Saldo Poin Reward (Tukar Kursus) */}
                <div
                  onClick={() => { setActiveMenu("tukar_poin"); }}
                  className="col-span-2 sm:col-span-1 xl:col-span-1 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-3 group-hover:scale-105 transition-transform">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black block">
                      {userRewardPoints}
                    </span>
                    <span className="text-xs font-bold opacity-80">Poin</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider block mt-0.5 opacity-90">
                    Klaim Kursus &rarr;
                  </span>
                </div>

              </div>

              {/* TABEL RINGKASAN PROGRES DI DASHBOARD */}
              <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#1F382B] tracking-tight">
                      Ringkasan Aktivitas Kursus
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Status pendaftaran, modul yang sedang berjalan, dan riwayat kelulusan Anda.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-100/80 self-start sm:self-auto overflow-x-auto text-[11px] font-bold">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${statusFilter === "all" ? "bg-white text-[#1F382B] shadow-2xs" : "text-zinc-600 hover:text-[#1F382B]"
                        }`}
                    >
                      Semua ({validEnrollments.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("aktif")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${statusFilter === "aktif" ? "bg-white text-[#1F382B] shadow-2xs" : "text-zinc-600 hover:text-[#1F382B]"
                        }`}
                    >
                      Aktif ({activeCourses.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("menunggu_bayar")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${statusFilter === "menunggu_bayar" ? "bg-white text-[#1F382B] shadow-2xs" : "text-zinc-600 hover:text-[#1F382B]"
                        }`}
                    >
                      Tagihan ({pendingPayments.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter("selesai")}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${statusFilter === "selesai" ? "bg-white text-[#1F382B] shadow-2xs" : "text-zinc-600 hover:text-[#1F382B]"
                        }`}
                    >
                      Lulus ({completedCourses.length})
                    </button>
                  </div>
                </div>

                {/* Table Content */}
                {filteredEnrollments.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <p className="text-xs text-zinc-500">Tidak ada kursus pada filter ini.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {filteredEnrollments.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 sm:p-6 hover:bg-zinc-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 uppercase tracking-wider">
                              {item.kursus?.kategori || "Pelatihan"}
                            </span>
                            {item.status === "aktif" && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Aktif Belajar
                              </span>
                            )}
                            {item.status === "menunggu_bayar" && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                                Menunggu Bayar
                              </span>
                            )}
                            {item.status === "selesai" && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#58816D]/10 text-[#58816D] border border-[#58816D]/25">
                                Lulus
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-[#1F382B] truncate">
                            {item.kursus?.judul}
                          </h3>
                        </div>

                        {/* Action CTA */}
                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === "aktif" && (
                            <Link
                              href={`/belajar/${item.kursus.slug}/1`}
                              className="px-4 py-2 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs border border-[#456655]"
                            >
                              <span>Lanjut Belajar</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          {item.status === "menunggu_bayar" && (
                            <button
                              onClick={() => setActiveMenu("tagihan")}
                              className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all cursor-pointer"
                            >
                              Lihat Tagihan
                            </button>
                          )}
                          {item.status === "selesai" && (
                            <Link
                              href={`/sertifikat/${item.sertifikat?.nomor_sertifikat || item.id}`}
                              className="px-4 py-2 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs transition-all flex items-center gap-1 border border-[#456655]"
                            >
                              <Award className="w-3.5 h-3.5 text-white" />
                              <span>Sertifikat</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: TAB KURSUS SAYA (FOKUS MATERI & BELAJAR - NO CARDS) */}
          {/* ========================================================= */}
          {currentUser && currentUser.peran !== "admin" && !isAccessDenied && activeMenu === "kursus" && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* Header Kursus Saya */}
              <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#58816D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                      Ruang Belajar
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold">
                      Total: {myCoursesList.length} Kursus
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight mt-1">
                    Kursus Saya
                  </h1>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Fokus selesaikan seluruh modul materi dan kuis evaluasi untuk menerbitkan sertifikat resmi.
                  </p>
                </div>

                <Link
                  href="/course"
                  className="px-4 py-2 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-black transition-all shadow-xs self-start sm:self-auto flex items-center gap-1.5 shrink-0 border border-[#456655]"
                >
                  <span className="font-black text-sm leading-none">+</span>
                  <span>Tambah Kursus</span>
                </Link>
              </div>

              {/* Daftar Kursus Saya (Dapat melebar penuh jika sidebar ditutup) */}
              {myCoursesList.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-xs max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">Belum Ada Kursus Aktif</h3>
                  <p className="text-xs text-zinc-500">
                    Anda belum memiliki kursus yang sedang aktif belajar. Daftarkan diri pada kursus gratis atau selesaikan pembayaran tagihan Mayar Anda.
                  </p>
                  <Link
                    href="/course"
                    className="inline-block mt-2 px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold border border-[#456655]"
                  >
                    Jelajahi Katalog Kursus
                  </Link>
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 ${!sidebarOpen ? "xl:grid-cols-3" : ""} gap-5`}>
                  {myCoursesList.map((item) => {
                    const totalModul = item.kursus?.modul?.length || 0;
                    const totalPassedModul = item.progres_modul?.filter((p) => p.lulus_pada !== null).length || 0;
                    const progressPercent = totalModul > 0 ? Math.round((totalPassedModul / totalModul) * 100) : 0;
                    const isCompleted = item.status === "selesai";

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 uppercase tracking-wider">
                              {item.kursus?.kategori}
                            </span>
                            {isCompleted ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#58816D]/10 text-[#58816D] border border-[#58816D]/30 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                <span>Lulus</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                <span>Aktif</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-extrabold text-[#1F382B] leading-snug line-clamp-2">
                            {item.kursus?.judul}
                          </h3>

                          {/* Progres Bar */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs font-semibold text-zinc-600">
                              <span>Progres Modul Lulus</span>
                              <span className="font-bold text-[#1F382B]">
                                {totalPassedModul}/{totalModul} ({progressPercent}%)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#58816D] transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                          <Link
                            href={`/belajar/${item.kursus.slug}/1`}
                            className="flex-1 py-2.5 px-4 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs text-center transition-all shadow-2xs flex items-center justify-center gap-1.5 border border-[#456655]"
                          >
                            <span>{isCompleted ? "Buka Ruang Belajar" : "Lanjut Belajar"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {isCompleted && item.sertifikat && (
                            <Link
                              href={`/sertifikat/${item.sertifikat.nomor_sertifikat}`}
                              className="py-2.5 px-4 rounded-full bg-white hover:bg-zinc-100 border border-zinc-300 text-[#1F382B] font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>Sertifikat</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SECTION: KATALOG KURSUS LAINNYA (BELUM TERDAFTAR / BERBAYAR) */}
              {otherAvailableCourses.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-zinc-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <h2 className="text-sm font-black text-[#1F382B] uppercase tracking-wider">
                        Katalog Kursus Tersedia (Belum Terdaftar / Berbayar)
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Kelas berikut belum Anda miliki. Pilih kursus untuk melihat materi atau selesaikan pembayaran Mayar agar kelas menjadi aktif.
                    </p>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 ${!sidebarOpen ? "xl:grid-cols-3" : ""} gap-5`}>
                    {otherAvailableCourses.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 uppercase tracking-wider">
                              {c.kategori}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                              c.harga === 0
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-900 border-amber-200"
                            }`}>
                              {c.harga === 0 ? "Gratis" : `Rp ${c.harga.toLocaleString("id-ID")}`}
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-[#1F382B] leading-snug line-clamp-2 group-hover:text-[#58816D] transition-colors">
                            {c.judul}
                          </h3>

                          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                            {c.ringkasan}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
                            <span className="flex items-center gap-1 font-semibold text-zinc-600">
                              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                              {c.modul.length} Modul
                            </span>
                            <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 text-[10px]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Sisa {c.sisaKursi} Kursi
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2">
                          <Link
                            href={`/kursus/${c.slug}`}
                            className="py-2.5 px-3 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 font-bold text-xs text-center transition-colors"
                          >
                            Silabus
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEnrollCourse(c);
                              setIsEnrollDialogOpen(true);
                            }}
                            className="py-2.5 px-3 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs text-center transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1 border border-[#456655]"
                          >
                            <span>{c.harga === 0 ? "Daftar Gratis" : "Beli Kursus"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: TAB TAGIHAN MAYAR (FOKUS INVOICE MAYAR - NO CARDS) */}
          {/* ========================================================= */}
          {currentUser && currentUser.peran !== "admin" && !isAccessDenied && activeMenu === "tagihan" && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* Header Tagihan Mayar */}
              <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold text-[10px] uppercase tracking-wider">
                    Mayar Payment Gateway
                  </span>
                  <span className="text-xs text-zinc-500 font-semibold">
                    {pendingPayments.length} Tagihan Menunggu
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight mt-1">
                  Tagihan & Pembayaran Kursus
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Batas waktu pembayaran 24 jam. Konfirmasi pembayaran Mayar akan mengaktifkan kursus secara otomatis.
                </p>
              </div>

              {/* List Invoice Mayar */}
              {pendingPayments.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-xs max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">Tidak Ada Tagihan Menunggu</h3>
                  <p className="text-xs text-zinc-500">
                    Semua kursus Anda telah aktif atau lunas. Tidak ada pembayaran yang tertunda.
                  </p>
                  <button
                    onClick={() => setActiveMenu("kursus")}
                    className="inline-block mt-2 px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold cursor-pointer border border-[#456655]"
                  >
                    Buka Kursus Saya
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                            Mayar Gateway
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500 font-bold">
                            Invoice: {item.mayar_invoice_id?.startsWith("http") ? `INV-MAYAR-${item.id.slice(0, 6).toUpperCase()}` : (item.mayar_invoice_id || `INV-${item.id.slice(0, 8).toUpperCase()}`)}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-[#1F382B]">
                          {item.kursus?.judul}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-zinc-600 flex-wrap">
                          <span>
                            Total Tagihan: <strong className="text-[#1F382B] text-sm">Rp {item.nominal.toLocaleString("id-ID")}</strong>
                          </span>
                          {item.batas_bayar && (
                            <span className="flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Batas: {new Date(item.batas_bayar).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tombol Aksi Tagihan */}
                      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                        {/* 1. Tombol Batalkan Pendaftaran (BR-07) */}
                        <button
                          onClick={() => handleCancelEnrollment(item.id)}
                          disabled={cancellingId === item.id}
                          className="px-4 py-2.5 rounded-full border border-zinc-200 hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                        >
                          {cancellingId === item.id ? "Membatalkan..." : "Batalkan Pendaftaran"}
                        </button>

                        {/* 2. Tombol Utama Mayar: Buka Web Resmi atau Modal Struk Interaktif */}
                        {item.mayar_invoice_id && item.mayar_invoice_id.startsWith("http") ? (
                          <>
                            <a
                              href={item.mayar_invoice_id}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-[#456655]"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-white" />
                              <span>Buka Web Mayar</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCheckMayarLive(item.id)}
                              disabled={simulatingPayId === item.id}
                              className="px-4 py-2.5 rounded-full bg-[#1F382B] hover:bg-[#15271e] text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Periksa apakah invoice ini sudah lunas di Mayar"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${simulatingPayId === item.id ? "animate-spin" : ""}`} />
                              <span>{simulatingPayId === item.id ? "Mengecek..." : "Cek Status Mayar"}</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedInvoiceForModal(item)}
                              className="px-4 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-[#456655]"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-white" />
                              <span>Bayar via Mayar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCheckMayarLive(item.id)}
                              disabled={simulatingPayId === item.id}
                              className="px-4 py-2.5 rounded-full bg-[#1F382B] hover:bg-[#15271e] text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Periksa apakah invoice ini sudah lunas di Mayar"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${simulatingPayId === item.id ? "animate-spin" : ""}`} />
                              <span>{simulatingPayId === item.id ? "Mengecek..." : "Cek Status Mayar"}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: TAB SERTIFIKAT SAYA (FOKUS SERTIFIKAT - NO CARDS) */}
          {/* ========================================================= */}
          {currentUser && currentUser.peran !== "admin" && !isAccessDenied && activeMenu === "sertifikat" && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* Header Sertifikat Saya */}
              <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#58816D]/15 text-[#1F382B] font-extrabold text-[10px] uppercase tracking-wider">
                    Kelulusan Resmi
                  </span>
                  <span className="text-xs text-zinc-500 font-semibold">
                    {totalCertificates} Sertifikat Diraih
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight mt-1">
                  Sertifikat Kelulusan Saya
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Sertifikat resmi berformat PA-2026-XXXX yang diterbitkan setelah Anda menyelesaikan kuis materi dengan nilai memuaskan.
                </p>
              </div>

              {/* List Sertifikat */}
              {totalCertificates === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-xs max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">Belum Ada Sertifikat</h3>
                  <p className="text-xs text-zinc-500">
                    Selesaikan modul belajar dan lulus kuis evaluasi (minimal nilai 70) untuk langsung mendapatkan sertifikat resmi Pijar Aksara.
                  </p>
                  <button
                    onClick={() => setActiveMenu("kursus")}
                    className="inline-block mt-2 px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold cursor-pointer border border-[#456655]"
                  >
                    Buka Kursus Saya
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {certificateItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-6 border border-[#58816D]/25 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#58816D]/10 text-[#58816D] uppercase tracking-wider">
                            Terverifikasi Resmi
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-500">
                            {item.sertifikat?.nomor_sertifikat}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-[#1F382B] leading-snug">
                            {item.kursus?.judul}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            Diterbitkan pada: {item.sertifikat?.diterbitkan_pada ? new Date(item.sertifikat.diterbitkan_pada).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "2026"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                        <Link
                          href={`/sertifikat/${item.sertifikat?.nomor_sertifikat || item.id}`}
                          className="flex-1 py-2.5 px-4 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs text-center transition-all shadow-2xs flex items-center justify-center gap-1.5 border border-[#456655]"
                        >
                          <Award className="w-3.5 h-3.5 text-white" />
                          <span>Lihat & Cetak Sertifikat</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: TAB TUKAR POIN & HADIAH KURSUS PESERTA (BARU)    */}
          {/* ========================================================= */}
          {currentUser && currentUser.peran === "peserta" && !isAccessDenied && activeMenu === "tukar_poin" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Alert Notifikasi */}
              {claimSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{claimSuccessMessage}</span>
                  </div>
                  <button
                    onClick={() => setClaimSuccessMessage(null)}
                    className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {claimErrorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-bold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{claimErrorMessage}</span>
                  </div>
                  <button
                    onClick={() => setClaimErrorMessage(null)}
                    className="text-rose-700 hover:text-rose-950 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Banner Saldo Poin Peserta */}
              <div className="relative rounded-[32px] bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold backdrop-blur-xs">
                    <Gift className="w-3.5 h-3.5" />
                    <span>Gamified Learning Reward</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">
                      {userRewardPoints}
                    </span>
                    <span className="text-base sm:text-lg font-bold opacity-90">
                      Saldo Poin Belajar Aktif
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                    Kumpulkan poin dengan belajar giat: <strong>+{getPointSettings().poinKuisLulus} poin</strong> setiap lulus kuis modul, <strong>+{getPointSettings().poinKuisSempurna} poin</strong> nilai sempurna 100, dan bonus besar <strong>+{getPointSettings().poinKursusSelesai} poin</strong> saat meraih sertifikat kelulusan.
                  </p>
                </div>
              </div>

              {/* Grid 2 Kolom: Katalog Penukaran Kursus & Riwayat Transaksi */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Kolom Kiri: Katalog Kursus yang Bisa Ditukar (2 Kolom) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#1F382B] tracking-tight">
                        Katalog Kursus Hadiah (Klaim dengan Poin)
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Tukar poin Anda untuk mendaftar kursus baru secara gratis setelah diverifikasi oleh Admin.
                      </p>
                    </div>
                  </div>                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        id: "00000000-0000-4000-b000-000000000001",
                        judul: "Excel untuk Administrasi Perkantoran",
                        slug: "excel-administrasi-perkantoran",
                        kategori: "Perkantoran",
                        poin: 1800,
                        hargaAsli: 350000,
                        modulCount: 10,
                      },
                      {
                        id: "00000000-0000-4000-b000-000000000002",
                        judul: "Desain Konten Media Sosial dengan Canva",
                        slug: "desain-konten-canva",
                        kategori: "Desain",
                        poin: 1500,
                        hargaAsli: 250000,
                        modulCount: 8,
                      },
                      {
                        id: "00000000-0000-4000-b000-000000000003",
                        judul: "Bahasa Inggris untuk Percakapan Kerja",
                        slug: "bahasa-inggris-percakapan-kerja",
                        kategori: "Bahasa",
                        poin: 2000,
                        hargaAsli: 400000,
                        modulCount: 12,
                      },
                      {
                        id: "00000000-0000-4000-b000-000000000004",
                        judul: "Pembukuan Sederhana & Arus Kas UMKM",
                        slug: "pembukuan-arus-kas-umkm",
                        kategori: "Keuangan",
                        poin: 1600,
                        hargaAsli: 300000,
                        modulCount: 9,
                      },
                    ].map((course) => {
                      const alreadyEnrolled = enrollments.some(
                        (e) => (e.kursus?.id === course.id || (e as any).kursus_id === course.id) && (e.status === "aktif" || e.status === "selesai")
                      );
                      const canAfford = userRewardPoints >= course.poin;

                      return (
                        <div
                          key={course.id}
                          className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                                {course.kategori}
                              </span>
                              <span className="text-[11px] line-through text-zinc-400 font-medium">
                                Rp {course.hargaAsli.toLocaleString("id-ID")}
                              </span>
                            </div>

                            <h3 className="text-sm font-extrabold text-[#1F382B] leading-snug">
                              {course.judul}
                            </h3>

                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                {course.poin} Poin
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                ({course.modulCount} Modul)
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-zinc-100">
                            {alreadyEnrolled ? (
                              <button
                                disabled
                                className="w-full py-2.5 px-3 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 cursor-not-allowed flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Sudah Terdaftar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!canAfford) {
                                    setClaimErrorMessage(
                                      `Poin Anda belum cukup (${userRewardPoints}/${course.poin} Poin). Nilai minimal klaim adalah 1500 Poin. Belajar dan tuntaskan kuis modul serta sertifikat untuk menambah poin!`
                                    );
                                    setTimeout(() => setClaimErrorMessage(null), 4000);
                                    return;
                                  }
                                  setClaimingCourseId(course.id);
                                  setClaimMotivationNote("");
                                }}
                                className={`w-full py-2.5 px-3 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                                  canAfford
                                    ? "bg-[#58816D] hover:bg-[#456655] text-white border border-[#456655]"
                                    : "bg-zinc-100 text-zinc-400 border border-zinc-200 hover:bg-zinc-200 hover:text-zinc-600"
                                }`}
                              >
                                <Gift className="w-3.5 h-3.5" />
                                <span>{canAfford ? "Klaim Kursus Ini" : "Poin Belum Cukup"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Kolom Kanan: Histori Mutasi Poin Peserta */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#1F382B]">
                      Riwayat Poin Belajar
                    </h3>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-3">
                    {pointHistoryList.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-6">
                        Belum ada riwayat kelulusan kuis atau sertifikat di database.
                      </p>
                    ) : (
                      <div className="divide-y divide-zinc-100 space-y-3">
                        {pointHistoryList.map((item) => (
                          <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-zinc-800 block leading-tight">
                                {item.keterangan}
                              </span>
                              <span className="text-[10px] text-zinc-400 block font-mono">
                                {new Date(item.dibuatPada).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-black whitespace-nowrap px-2 py-0.5 rounded-md ${
                                item.perubahanPoin > 0
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {item.perubahanPoin > 0 ? `+${item.perubahanPoin}` : item.perubahanPoin}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Konfirmasi Pengajuan Klaim */}
              {claimingCourseId && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
                    <div className="flex items-center gap-3 text-[#58816D]">
                      <div className="w-10 h-10 rounded-2xl bg-[#58816D]/15 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-[#58816D]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 text-sm">
                          Konfirmasi Pengajuan Klaim Kursus
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Poin akan ditahan dan tiket klaim akan dikirim ke Admin untuk verifikasi.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Catatan Motivasi untuk Admin (Opsional):
                      </label>
                      <textarea
                        value={claimMotivationNote}
                        onChange={(e) => setClaimMotivationNote(e.target.value)}
                        placeholder="Contoh: Saya sudah menyelesaikan kursus Excel dan ingin belajar Canva untuk kebutuhan desain usaha saya."
                        rows={3}
                        className="w-full text-xs p-3 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#58816D]/20 focus:border-[#58816D]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setClaimingCourseId(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={async () => {
                          const targetCourse = [
                            {
                              id: "00000000-0000-4000-b000-000000000001",
                              judul: "Excel untuk Administrasi Perkantoran",
                              slug: "excel-administrasi-perkantoran",
                              poin: 1800,
                            },
                            {
                              id: "00000000-0000-4000-b000-000000000002",
                              judul: "Desain Konten Media Sosial dengan Canva",
                              slug: "desain-konten-canva",
                              poin: 1500,
                            },
                            {
                              id: "00000000-0000-4000-b000-000000000003",
                              judul: "Bahasa Inggris untuk Percakapan Kerja",
                              slug: "bahasa-inggris-percakapan-kerja",
                              poin: 2000,
                            },
                            {
                              id: "00000000-0000-4000-b000-000000000004",
                              judul: "Pembukuan Sederhana & Arus Kas UMKM",
                              slug: "pembukuan-arus-kas-umkm",
                              poin: 1600,
                            },
                          ].find((c) => c.id === claimingCourseId);

                          if (targetCourse && currentUser) {
                            const res = submitCourseClaim(
                              currentUser.id,
                              currentUser.nama,
                              currentUser.email,
                              targetCourse.id,
                              targetCourse.judul,
                              targetCourse.slug,
                              targetCourse.poin,
                              userRewardPoints,
                              claimMotivationNote,
                              totalCertificates
                            );

                            if (res.success) {
                              setClaimSuccessMessage(
                                `Pengajuan klaim kursus "${targetCourse.judul}" (${targetCourse.poin} Poin) berhasil dikirim! Menunggu persetujuan Admin.`
                              );
                              setClaimingCourseId(null);
                              await refreshUserPointsData();
                              setTimeout(() => setClaimSuccessMessage(null), 5000);
                            } else {
                              alert("Gagal klaim: " + res.error);
                            }
                          }
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#58816D] hover:bg-[#456655] text-white shadow-xs cursor-pointer border border-[#456655]"
                      >
                        Kirim Pengajuan Klaim
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. RIGHT SIDEBAR / PANEL (Desktop XL - Senada Landing Page) */}
      <aside className="hidden xl:flex w-80 flex-col glass-panel border-l border-white/70 p-5 pb-12 space-y-4 shrink-0 h-screen sticky top-0 overflow-y-auto relative overflow-x-hidden">
        {/* Ambient Glowing Gradient Orbs for Authentic Frosted Glass Refraction */}
        <div className="absolute top-10 -right-10 w-48 h-48 rounded-full bg-[#58816D]/20 blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-1/2 -left-12 w-44 h-44 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-16 right-0 w-48 h-48 rounded-full bg-[#58816D]/15 blur-3xl pointer-events-none -z-0" />

        {activeRole === "admin" ? (
          /* ========================================================= */
          /* PANEL OPERASIONAL ADMIN (FULL ADMIN CONTROL & MONITORING) */
          /* ========================================================= */
          <>
            {/* Header Profil Super Admin */}
            <div className="flex items-center justify-between pb-4 border-b border-white/60" suppressHydrationWarning>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#58816D] to-[#456655] text-white border border-white/80 flex items-center justify-center font-black text-sm uppercase shadow-[0_4px_16px_rgba(88,129,109,0.3)]">
                  {currentUser?.nama ? currentUser.nama.charAt(0) : "A"}
                </div>
                <div className="leading-tight">
                  <span className="font-extrabold text-xs text-[#1F382B] block truncate max-w-[130px]">
                    {currentUser?.nama || "Admin LMS"}
                  </span>
                  <span className="text-[10px] text-[#58816D] bg-[#58816D]/15 px-2 py-0.5 rounded-full uppercase font-black tracking-wider inline-block mt-0.5 border border-[#58816D]/30">
                    SUPER ADMIN
                  </span>
                </div>
              </div>


            </div>

            {/* Status Sistem & Database (Realtime Operational Status) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#1F382B]">Status Operasional</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live System
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px] font-semibold">Supabase DB</span>
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Realtime Terhubung
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px] font-semibold">Mayar Webhook</span>
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Siap & Online
                  </span>
                </div>
              </div>
            </div>

            {/* Metrik Cepat Lembaga */}
            <div className="space-y-3">
              <span className="font-extrabold text-xs text-[#1F382B] block">Ringkasan Operasional</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs hover:bg-white/90 transition-all">
                  <span className="text-[10px] font-bold text-[#58816D] uppercase tracking-wider block">Pendaftaran</span>
                  <span className="text-lg font-black text-[#1F382B] mt-0.5 block">{enrollments.length}</span>
                  <span className="text-[9px] text-zinc-500 font-medium">Total peserta</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs hover:bg-white/90 transition-all">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Menunggu Bayar</span>
                  <span className="text-lg font-black text-amber-800 mt-0.5 block">{pendingPayments.length}</span>
                  <span className="text-[9px] text-zinc-500 font-medium">Invoice Mayar</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs hover:bg-white/90 transition-all">
                  <span className="text-[10px] font-bold text-[#58816D] uppercase tracking-wider block">Sertifikat</span>
                  <span className="text-lg font-black text-[#1F382B] mt-0.5 block">{totalCertificates}</span>
                  <span className="text-[9px] text-zinc-500 font-medium">PA-2026-XXXX</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs hover:bg-white/90 transition-all">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Kursus Aktif</span>
                  <span className="text-lg font-black text-emerald-900 mt-0.5 block">4 Kelas</span>
                  <span className="text-[9px] text-zinc-500 font-medium">Publik siap daftar</span>
                </div>
              </div>
            </div>

            {/* Log Aktivitas Operasional */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#1F382B]">Aktivitas Sistem</span>
                <span className="text-[10px] font-bold text-zinc-400">Terbaru</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs text-xs space-y-1 hover:bg-white/90 transition-all">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Audit Role & Hak Akses</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Sistem membatasi akses sensitif hanya untuk admin terverifikasi.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs text-xs space-y-1 hover:bg-white/90 transition-all">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                    <Award className="w-3.5 h-3.5 text-[#58816D] shrink-0" />
                    <span>Penerbitan Sertifikat</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Format otomatis PA-2026-XXXX aktif untuk peserta lulus kuis.
                  </p>
                </div>
              </div>
            </div>

            {/* Aksi Cepat Admin */}
            <div className="mt-auto space-y-2 pt-4 border-t border-zinc-100">
              <button
                onClick={() => { setActiveMenu("analitik"); setStatusFilter("all"); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-[#456655]"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-[#EBF3EF]" />
                  <span>Buka Analitik</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/70" />
              </button>

              <button
                onClick={() => { setActiveMenu("kursus"); setStatusFilter("all"); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Tinjauan Kursus & Kuota</span>
                </div>
              </button>

              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Keluar Akun Admin</span>
              </button>
            </div>
          </>
        ) : activeRole === "instruktur" ? (
          /* ========================================================= */
          /* PANEL RINGKASAN INSTRUKTUR (KELAS & PENGAJARAN)          */
          /* ========================================================= */
          <>
            {/* Header Profil Instruktur */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/70 relative z-10" suppressHydrationWarning>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1F382B] to-[#58816D] text-white border border-white/80 flex items-center justify-center font-black text-sm uppercase shadow-sm">
                  {currentUser?.nama ? currentUser.nama.charAt(0) : "I"}
                </div>
                <div className="leading-tight">
                  <span className="font-extrabold text-xs text-[#1F382B] block truncate max-w-[130px]">
                    {currentUser?.nama || "Instruktur"}
                  </span>
                  <span className="text-[10px] text-[#58816D] bg-[#58816D]/15 px-1.5 py-0.5 rounded-md uppercase font-extrabold tracking-wider inline-block mt-0.5">
                    INSTRUKTUR
                  </span>
                </div>
              </div>


            </div>

            {/* Statistik Ringkas Pengajaran */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#1F382B]">Ringkasan Pengajar</span>
                <span className="text-[10px] font-bold text-[#58816D] bg-white/80 px-2 py-0.5 rounded-full border border-white/90 shadow-2xs">
                  {instructorCourses.length} Kursus Diampu
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-white/75 border border-white/90 shadow-xs">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Siswa Aktif</span>
                  <span className="text-xl font-black text-[#1F382B] mt-0.5 block">{instructorActiveStudents}</span>
                  <span className="text-[9px] text-zinc-500 font-medium">Sedang belajar</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Siswa Lulus</span>
                  <span className="text-xl font-black text-emerald-950 mt-0.5 block">{instructorCompletedStudents}</span>
                  <span className="text-[9px] text-emerald-700 font-medium">Sertifikat terbit</span>
                </div>
              </div>
            </div>

            {/* Status Kursus & Action Items Instruktur */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#1F382B]">Status Kursus Anda</span>
                <span className="text-[10px] font-bold text-zinc-400">Ringkasan</span>
              </div>

              <div className="space-y-2">
                {instructorDraftCourses.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">{instructorDraftCourses[0].judul}</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900 shrink-0 font-extrabold uppercase">
                        Draf
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      Lengkapi 2–10 modul &amp; 3–20 soal per modul sebelum diajukan.
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setActiveMenu("kelola_kursus");
                          setStatusFilter("draf");
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-900 hover:underline cursor-pointer"
                      >
                        <span>Kelola Materi Draf</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {instructorReviewCourses.length > 0 && (
                  <div className="p-3 rounded-2xl bg-sky-50/90 border border-sky-200/80 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-sky-900">
                      <span className="flex items-center gap-1.5 truncate">
                        <AlertCircle className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                        <span className="truncate">{instructorReviewCourses[0].judul}</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-200/80 text-sky-900 shrink-0 font-extrabold uppercase">
                        Ditinjau
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-800 leading-snug">
                      Isi kursus terkunci dan sedang diverifikasi oleh staf Admin.
                    </p>
                  </div>
                )}

                {instructorPublishedCourses.length > 0 && (
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{instructorPublishedCourses.length} Kursus Terbit</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 shrink-0 font-extrabold uppercase">
                        Live
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      Tampil di katalog publik dan menerima pendaftaran peserta baru.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Aktivitas Siswa Terkini di Kelas Instruktur */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#1F382B]">Aktivitas Siswa</span>
                <span className="text-[10px] font-bold text-[#58816D] bg-white/80 px-2 py-0.5 rounded-full border border-white/90 shadow-2xs">Live</span>
              </div>

              <div className="space-y-2">
                {instructorEnrollments.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-2.5 rounded-2xl bg-white/70 border border-white/80 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 truncate max-w-[150px]">
                        {(item as any).peserta?.nama_lengkap || item.kursus?.judul}
                      </span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                        item.status === "selesai" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {item.kursus?.judul}
                    </p>
                  </div>
                ))}

                {instructorEnrollments.length === 0 && (
                  <p className="text-xs text-zinc-400 italic text-center py-2">
                    Belum ada pendaftaran siswa di kelas Anda.
                  </p>
                )}
              </div>
            </div>

            {/* Bantuan & Hubungi Admin */}
            <div className="mt-auto glass-card-deep p-4 rounded-3xl border border-white/95 shadow-xl space-y-2.5 relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#58816D]/15 border border-[#58816D]/25 text-[#58816D] flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#58816D]" />
                </div>
                <span className="font-black text-xs text-[#1F382B]">Koordinasi Pengajar</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Butuh persetujuan kursus lebih cepat atau koordinasi kuota? Hubungi admin via WhatsApp.
              </p>
              <div className="pt-1">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Pijar%20Aksara,%20saya%20instruktur%20ingin%20koordinasi%20kursus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-[11px] font-bold transition-all shadow-[0_4px_14px_rgba(88,129,109,0.25)] hover:shadow-[0_6px_20px_rgba(88,129,109,0.35)] cursor-pointer"
                >
                  <span>Chat Admin Lembaga</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </>
        ) : (
          /* ========================================================= */
          /* PANEL PESERTA (JADWAL BELAJAR & BANTUAN WA)               */
          /* ========================================================= */
          <>
            {/* User Profile Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/70 relative z-10" suppressHydrationWarning>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#58816D] to-[#456655] text-white border border-white/80 flex items-center justify-center font-black text-sm uppercase shadow-sm">
                  {currentUser?.nama ? currentUser.nama.charAt(0) : "P"}
                </div>
                <div className="leading-tight">
                  <span className="font-extrabold text-xs text-[#1F382B] block truncate max-w-[130px]">
                    {currentUser?.nama || "Tamu"}
                  </span>
                  <span className="text-[10px] text-[#58816D] bg-[#58816D]/15 px-2 py-0.5 rounded-full uppercase font-black tracking-wider inline-block mt-0.5 border border-[#58816D]/30">
                    PESERTA AKTIF
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-zinc-400">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="p-1.5 rounded-xl hover:bg-white/80 hover:text-zinc-700 transition-colors cursor-pointer border border-transparent hover:border-white/80 text-zinc-500 hover:text-[#58816D]"
                  title="Edit Profil (Ganti Nama)"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Schedule Calendar Strip */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs text-[#1F382B]">Jadwal Belajar</span>
                  {weekOffset !== 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setWeekOffset(0);
                        setSelectedDate(new Date());
                      }}
                      className="text-[10px] text-[#58816D] font-extrabold hover:underline cursor-pointer bg-white/80 px-2 py-0.5 rounded-full border border-white/90 shadow-2xs"
                      title="Kembali ke minggu hari ini"
                    >
                      Hari Ini
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span
                    suppressHydrationWarning
                    className="text-[11px] font-bold text-zinc-400 capitalize"
                  >
                    {currentMonthYearLabel}
                  </span>
                  <div className="flex items-center gap-0.5 ml-1 text-zinc-400">
                    <button
                      type="button"
                      onClick={() => setWeekOffset((prev) => prev - 1)}
                      className="p-1 rounded-md hover:bg-white/80 hover:text-zinc-700 transition-colors cursor-pointer"
                      title="Minggu sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeekOffset((prev) => prev + 1)}
                      className="p-1 rounded-md hover:bg-white/80 hover:text-zinc-700 transition-colors cursor-pointer"
                      title="Minggu berikutnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 7-Day Frosted Glass Tray */}
              <div className="grid grid-cols-7 gap-1.5 text-center p-1.5 rounded-2xl bg-white/45 backdrop-blur-md border border-white/80 shadow-2xs" suppressHydrationWarning>
                {currentWeekDays.map((item) => (
                  <button
                    key={`${item.day}-${item.date}`}
                    type="button"
                    onClick={() => setSelectedDate(item.fullDate)}
                    className={`py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer relative ${item.active
                      ? "bg-gradient-to-b from-[#58816D] to-[#456655] text-white shadow-md border border-white/90 scale-105"
                      : "bg-white/60 hover:bg-white/95 backdrop-blur-md text-zinc-700 border border-white/80 shadow-2xs hover:scale-102"
                      }`}
                  >
                    <span
                      className={`text-[9px] uppercase font-bold ${item.active ? "text-emerald-100" : "text-zinc-500"
                        }`}
                    >
                      {item.day}
                    </span>
                    <span
                      className={`text-xs font-black ${item.active ? "text-white" : "text-[#1F382B]"
                        }`}
                    >
                      {item.date}
                    </span>
                    {/* Titik indikator penanda 'Hari Ini' saat user klik tanggal lain */}
                    {item.isToday && !item.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#58816D] absolute bottom-1" />
                    )}
                  </button>
                ))}
              </div>

              {/* Info Jadwal Hari Terpilih */}
              <div className="pt-0.5">
                {activeCourses.length > 0 ? (
                  <div className="glass-emerald-card p-3.5 rounded-3xl text-xs space-y-2 shadow-xl border border-white/95">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-[#1F382B] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#58816D] animate-pulse" />
                        {selectedDate &&
                          selectedDate.getDate() === currentDate.getDate() &&
                          selectedDate.getMonth() === currentDate.getMonth() &&
                          selectedDate.getFullYear() === currentDate.getFullYear()
                          ? "Sesi Hari Ini"
                          : `Sesi ${selectedDate?.toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}`}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#1F382B] bg-white/80 px-2 py-0.5 rounded-full border border-white/90 shadow-2xs">
                        {activeCourses.length} Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-800 font-bold truncate">
                      {activeCourses[0].kursus?.judul}
                    </p>
                    <div className="pt-1.5 flex items-center justify-between border-t border-white/70">
                      <Link
                        href={`/kursus/${activeCourses[0].kursus?.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-[10px] font-extrabold transition-all shadow-[0_2px_8px_rgba(88,129,109,0.3)] cursor-pointer"
                      >
                        <span>Lanjutkan Belajar</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        Target 1 Modul/hari
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card-deep p-3 rounded-2xl text-xs space-y-1 text-center shadow-xs">
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Tidak ada jadwal kursus aktif.
                    </p>
                    <Link
                      href="/kursus"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#58816D] hover:underline"
                    >
                      <span>Jelajahi Kursus</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Aktivitas & Notifikasi Terbaru */}
            <div className="space-y-3 pt-2 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#1F382B]">Aktivitas Terkini</span>
                <span className="text-[10px] font-bold text-[#58816D] bg-white/80 px-2 py-0.5 rounded-full border border-white/90 shadow-2xs">Live</span>
              </div>

              <div className="space-y-2.5">
                {pendingPayments.length > 0 && (
                  <div className="glass-card-deep p-3.5 rounded-2xl text-xs space-y-1.5 shadow-md border-amber-300/60">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <span>Jatuh Tempo Pembayaran</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-snug pl-8">
                      Reservasi kursi {pendingPayments[0].kursus?.judul.split(" ")[0]} menunggu konfirmasi Mayar.
                    </p>
                  </div>
                )}

                {completedCourses.length > 0 && (
                  <div className="glass-emerald-card p-3.5 rounded-2xl text-xs space-y-1.5 shadow-md">
                    <div className="flex items-center gap-2 font-bold text-[#1F382B]">
                      <div className="w-6 h-6 rounded-lg bg-[#58816D]/15 border border-[#58816D]/25 flex items-center justify-center text-[#58816D] shrink-0 shadow-2xs">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <span>Sertifikat Siap Cetak</span>
                    </div>
                    <p className="text-[11px] text-[#1F382B] leading-snug pl-8">
                      Kelulusan Anda telah terverifikasi resmi oleh Pijar Aksara.
                    </p>
                  </div>
                )}

                <div className="glass-card-deep p-3.5 rounded-2xl text-xs space-y-1.5 shadow-md">
                  <div className="flex items-center gap-2 font-bold text-zinc-900">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Akun Terverifikasi</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug pl-8">
                    Masuk sebagai {currentUser?.email || "tamu"}.
                  </p>
                </div>
              </div>
            </div>

            {/* Card Bantuan Lembaga */}
            <div className="mt-auto glass-card-deep p-4 rounded-3xl border border-white/95 shadow-xl space-y-2.5 relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#58816D]/15 border border-[#58816D]/25 text-[#58816D] flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#58816D]" />
                </div>
                <span className="font-black text-xs text-[#1F382B]">Butuh Bantuan?</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Hubungi instruktur praktisi atau admin Pijar Aksara melalui WhatsApp resmi.
              </p>
              <div className="pt-1">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Pijar%20Aksara,%20saya%20ingin%20konsultasi%20kursus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-[11px] font-bold transition-all shadow-[0_4px_14px_rgba(88,129,109,0.25)] hover:shadow-[0_6px_20px_rgba(88,129,109,0.35)] cursor-pointer"
                >
                  <span>Chat WhatsApp</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Bottom Safe Area Spacer agar card tidak terpotong tepi bawah */}
            <div className="h-6 shrink-0 pointer-events-none" />
          </>
        )}

      </aside>

      {/* Auth Modal untuk Ganti Akun */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab="login"
        onSuccessLogin={(acc) => {
          setIsAuthOpen(false);
          if (acc?.peran === "admin") {
            window.location.href = "/admin/dashboard";
          } else if (acc?.peran === "instruktur") {
            window.location.href = "/instruktur/kursus";
          } else {
            window.location.href = "/peserta/dashboard";
          }
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Enrollment Dialog untuk Daftar / Beli Kursus */}
      <EnrollmentDialog
        kursus={selectedEnrollCourse}
        isOpen={isEnrollDialogOpen}
        currentUser={currentUser}
        onClose={() => {
          setIsEnrollDialogOpen(false);
          setSelectedEnrollCourse(null);
        }}
        onSuccess={() => {
          setIsEnrollDialogOpen(false);
          setSelectedEnrollCourse(null);
          fetchEnrollments();
        }}
      />

      {/* Modal Struk & Checkout Pembayaran Mayar Gateway */}
      {selectedInvoiceForModal && (
        <MayarCheckoutModal
          isOpen={!!selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
          pendaftaranId={selectedInvoiceForModal.id}
          invoiceId={selectedInvoiceForModal.mayar_invoice_id || `INV-${selectedInvoiceForModal.id.slice(0, 8).toUpperCase()}`}
          judulKursus={selectedInvoiceForModal.kursus?.judul || "Kursus Pijar Aksara"}
          nominal={selectedInvoiceForModal.nominal}
          batasBayar={selectedInvoiceForModal.batas_bayar}
          namaPeserta={currentUser?.nama}
          onPaymentSuccess={async () => {
            await fetchEnrollments();
          }}
        />
      )}

    </div>
  );
}
