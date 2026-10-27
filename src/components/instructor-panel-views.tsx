"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
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
  Layers,
  Users,
  FileText,
  Eye,
  Check,
  X,
  Plus,
  Lock,
  Unlock,
  Send,
  HelpCircle,
  Video,
  ChevronRight,
  AlertCircle,
  Upload,
} from "lucide-react";
import { CourseCardSkeleton, TableSkeleton } from "@/components/skeleton";

interface ModulItem {
  id: string;
  urutan: number;
  judul: string;
  durasi_menit: number;
  isi_materi: string;
  video_url: string | null;
  lampiran_path: string | null;
  soal?: any[];
}

interface CourseItem {
  id: string;
  instruktur_id: string;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string;
  deskripsi: string;
  harga: number;
  kuota: number;
  nilai_lulus: number;
  status: "draf" | "ditinjau" | "terbit" | "ditutup";
  catatan_tinjauan: string | null;
  diajukan_pada: string | null;
  diterbitkan_pada: string | null;
  dibuat_pada: string;
  modul?: ModulItem[];
}

interface InstructorPanelViewsProps {
  activeTab: "kelola_kursus" | "peserta_nilai";
  instrukturId: string;
  instrukturNama: string;
  onRefreshParent?: () => void;
}

export function InstructorPanelViews({
  activeTab,
  instrukturId,
  instrukturNama,
  onRefreshParent,
}: InstructorPanelViewsProps) {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Course Modal state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [courseForm, setCourseForm] = useState({
    judul: "",
    kategori: "Perkantoran",
    ringkasan: "",
    deskripsi: "",
    harga: 0,
    kuota: 20,
    nilaiLulus: 70,
  });

  // Module Modal state
  const [activeCourseForModules, setActiveCourseForModules] = useState<CourseItem | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModulItem | null>(null);
  const [previewModule, setPreviewModule] = useState<ModulItem | null>(null);
  const [isPreviewModuleOpen, setIsPreviewModuleOpen] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    urutan: 1,
    judul: "",
    isiMateri: "",
    videoUrl: "",
    lampiranPath: "",
    durasiMenit: 15,
  });

  // Questions Modal state
  const [activeModuleForQuestions, setActiveModuleForQuestions] = useState<ModulItem | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    pertanyaan: "",
    pilihanA: "",
    pilihanB: "",
    pilihanC: "",
    pilihanD: "",
    kunciJawaban: "A",
  });

  // Submit Modal state
  const [submittingCourse, setSubmittingCourse] = useState<CourseItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Students data state
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch kursus milik instruktur
  const fetchCourses = async () => {
    if (!instrukturId) return;
    setIsLoadingCourses(true);
    try {
      const res = await fetch(`/api/instruktur/kursus?instrukturId=${instrukturId}`);
      const data = await res.json();
      if (res.ok && data.courses) {
        setCourses(data.courses);
      }
    } catch (err: any) {
      console.error("Error fetching courses:", err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Fetch data peserta untuk kursus yang diampu
  const fetchStudents = async () => {
    if (!instrukturId) return;
    setIsLoadingStudents(true);
    try {
      const res = await fetch(
        `/api/instruktur/peserta?instrukturId=${instrukturId}&kursusId=${selectedCourseFilter}`
      );
      const data = await res.json();
      if (res.ok && data.enrollments) {
        setStudentsData(data.enrollments);
      }
    } catch (err: any) {
      console.error("Error fetching students:", err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (instrukturId) {
      fetchCourses();
      fetchStudents();
    }
  }, [instrukturId]);

  useEffect(() => {
    if (activeTab === "peserta_nilai" && instrukturId) {
      fetchStudents();
    }
  }, [activeTab, selectedCourseFilter]);

  // Fetch questions for a module
  const fetchQuestions = async (modulId: string) => {
    setIsLoadingQuestions(true);
    try {
      const res = await fetch(`/api/instruktur/soal?modulId=${modulId}`);
      const data = await res.json();
      if (res.ok && data.soal) {
        setQuestionsList(data.soal);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Simpan / Buat Kursus
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrukturId) return;

    setActionLoading(true);
    try {
      if (editingCourse) {
        const res = await fetch("/api/instruktur/kursus", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kursusId: editingCourse.id,
            instrukturId,
            judul: courseForm.judul,
            kategori: courseForm.kategori,
            ringkasan: courseForm.ringkasan,
            deskripsi: courseForm.deskripsi,
            harga: courseForm.harga,
            kuota: courseForm.kuota,
            nilaiLulus: courseForm.nilaiLulus,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          showNotification("error", data.error || "Gagal memperbarui kursus.");
        } else {
          showNotification("success", "Kursus berhasil diperbarui!");
          setIsCourseModalOpen(false);
          await fetchCourses();
          if (onRefreshParent) onRefreshParent();
        }
      } else {
        const res = await fetch("/api/instruktur/kursus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instrukturId,
            judul: courseForm.judul,
            kategori: courseForm.kategori,
            ringkasan: courseForm.ringkasan,
            deskripsi: courseForm.deskripsi,
            harga: courseForm.harga,
            kuota: courseForm.kuota,
            nilaiLulus: courseForm.nilaiLulus,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          showNotification("error", data.error || "Gagal membuat kursus.");
        } else {
          showNotification("success", "Draf kursus baru berhasil dibuat!");
          setIsCourseModalOpen(false);
          await fetchCourses();
          if (onRefreshParent) onRefreshParent();
        }
      }
    } catch (err: any) {
      showNotification("error", err.message || "Terjadi kesalahan server.");
    } finally {
      setActionLoading(false);
    }
  };

  // Hapus Kursus Draf
  const handleDeleteCourse = async (course: CourseItem) => {
    if (!confirm(`Hapus draf kursus "${course.judul}"? Semua modul dan kuis di dalamnya akan dihapus permanen.`)) {
      return;
    }

    try {
      const res = await fetch(
        `/api/instruktur/kursus?kursusId=${course.id}&instrukturId=${instrukturId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        showNotification("error", data.error || "Gagal menghapus kursus.");
      } else {
        showNotification("success", data.message || "Kursus berhasil dihapus.");
        await fetchCourses();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  // Upload PDF ke Supabase Storage (PRD Bab 8 & 10.4)
  const handleUploadPdfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showNotification("error", "Harap pilih file berformat PDF (.pdf)!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification("error", "Ukuran file PDF maksimal 10 MB (PRD Bab 10.4)!");
      return;
    }

    setIsUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseSlug", activeCourseForModules?.slug || "kursus");
      formData.append("modulUrutan", String(moduleForm.urutan));

      const res = await fetch("/api/materi/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification("error", data.error || "Gagal mengunggah file PDF.");
      } else {
        setModuleForm((prev) => ({ ...prev, lampiranPath: data.path }));
        showNotification("success", `File ${file.name} berhasil diunggah ke Supabase Storage!`);
      }
    } catch (err: any) {
      showNotification("error", "Error upload: " + err.message);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Simpan Modul
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseForModules || !instrukturId) return;

    setActionLoading(true);
    try {
      if (editingModule) {
        const res = await fetch("/api/instruktur/modul", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modulId: editingModule.id,
            kursusId: activeCourseForModules.id,
            instrukturId,
            urutan: moduleForm.urutan,
            judul: moduleForm.judul,
            isiMateri: moduleForm.isiMateri,
            videoUrl: moduleForm.videoUrl,
            lampiranPath: moduleForm.lampiranPath,
            durasiMenit: moduleForm.durasiMenit,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showNotification("error", data.error || "Gagal mengubah modul.");
        } else {
          showNotification("success", "Modul berhasil diperbarui!");
          setEditingModule(null);
          setModuleForm({ urutan: 1, judul: "", isiMateri: "", videoUrl: "", lampiranPath: "", durasiMenit: 15 });
          await fetchCourses();
        }
      } else {
        const res = await fetch("/api/instruktur/modul", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kursusId: activeCourseForModules.id,
            instrukturId,
            urutan: moduleForm.urutan,
            judul: moduleForm.judul,
            isiMateri: moduleForm.isiMateri,
            videoUrl: moduleForm.videoUrl,
            lampiranPath: moduleForm.lampiranPath,
            durasiMenit: moduleForm.durasiMenit,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showNotification("error", data.error || "Gagal menambah modul.");
        } else {
          showNotification("success", "Modul baru berhasil ditambahkan!");
          setModuleForm({
            urutan: (activeCourseForModules.modul?.length || 0) + 2,
            judul: "",
            isiMateri: "",
            videoUrl: "",
            lampiranPath: "",
            durasiMenit: 15,
          });
          await fetchCourses();
        }
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Hapus Modul
  const handleDeleteModule = async (modulId: string) => {
    if (!confirm("Hapus modul ini beserta seluruh soal kuis di dalamnya?")) return;
    try {
      const res = await fetch(
        `/api/instruktur/modul?modulId=${modulId}&kursusId=${activeCourseForModules?.id}&instrukturId=${instrukturId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        showNotification("error", data.error || "Gagal menghapus modul.");
      } else {
        showNotification("success", "Modul berhasil dihapus.");
        await fetchCourses();
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  // Simpan Soal Kuis
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleForQuestions || !activeCourseForModules || !instrukturId) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/instruktur/soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modulId: activeModuleForQuestions.id,
          kursusId: activeCourseForModules.id,
          instrukturId,
          pertanyaan: questionForm.pertanyaan,
          pilihanA: questionForm.pilihanA,
          pilihanB: questionForm.pilihanB,
          pilihanC: questionForm.pilihanC,
          pilihanD: questionForm.pilihanD,
          kunciJawaban: questionForm.kunciJawaban,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification("error", data.error || "Gagal menambah soal.");
      } else {
        showNotification("success", "Soal kuis berhasil ditambahkan!");
        setQuestionForm({
          pertanyaan: "",
          pilihanA: "",
          pilihanB: "",
          pilihanC: "",
          pilihanD: "",
          kunciJawaban: "A",
        });
        await fetchQuestions(activeModuleForQuestions.id);
        await fetchCourses();
      }
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Hapus Soal Kuis
  const handleDeleteQuestion = async (soalId: string) => {
    if (!confirm("Hapus butir soal ini?")) return;
    try {
      const res = await fetch(
        `/api/instruktur/soal?soalId=${soalId}&kursusId=${activeCourseForModules?.id}&instrukturId=${instrukturId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        showNotification("error", data.error || "Gagal menghapus soal.");
      } else {
        showNotification("success", "Soal kuis berhasil dihapus.");
        if (activeModuleForQuestions) {
          await fetchQuestions(activeModuleForQuestions.id);
        }
        await fetchCourses();
      }
    } catch (err: any) {
      showNotification("error", err.message);
    }
  };

  // Ajukan Kursus untuk Ditinjau (BR-02 & BR-03)
  const handleSubmitForReview = async () => {
    if (!submittingCourse || !instrukturId) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/instruktur/ajukan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kursusId: submittingCourse.id,
          instrukturId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification("error", data.error || "Pengajuan gagal.");
      } else {
        showNotification("success", data.message || "Kursus berhasil diajukan untuk ditinjau!");
        setIsSubmitModalOpen(false);
        setSubmittingCourse(null);
        await fetchCourses();
        if (onRefreshParent) onRefreshParent();
      }
    } catch (err: any) {
      showNotification("error", err.message || "Terjadi kesalahan server.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter kursus
  const filteredCourses = courses.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        c.judul.toLowerCase().includes(q) ||
        c.kategori.toLowerCase().includes(q) ||
        c.ringkasan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Metrik Statistik Instruktur
  const totalCoursesCount = courses.length;
  const draftCoursesCount = courses.filter((c) => c.status === "draf").length;
  const reviewCoursesCount = courses.filter((c) => c.status === "ditinjau").length;
  const publishedCoursesCount = courses.filter((c) => c.status === "terbit").length;

  return (
    <div className="space-y-6">

      {/* Toast Notifikasi */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs font-medium leading-relaxed">{notification.message}</div>
            <button
              onClick={() => setNotification(null)}
              className="text-zinc-400 hover:text-zinc-600 p-0.5 ml-auto cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: KELOLA KURSUS & SILABUS (PRD US-06, BR-02, BR-03, BR-04) */}
      {/* ========================================================= */}
      {activeTab === "kelola_kursus" && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Header Executive Bar (Judul, Deskripsi, Tombol Aksi) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-xs flex flex-col gap-4 sm:gap-5 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                  Kelola Kursus & Modul Pembelajaran
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-3xl leading-relaxed">
                  Susun draf kursus, tambahkan modul materi praktis, serta siapkan bank soal pilihan ganda.
                  Setelah memenuhi prasyarat (2–10 modul dan min 3 butir soal per modul), ajukan ke Admin untuk ditinjau.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCourse(null);
                  setCourseForm({
                    judul: "",
                    kategori: "Perkantoran",
                    ringkasan: "",
                    deskripsi: "",
                    harga: 0,
                    kuota: 20,
                    nilaiLulus: 70,
                  });
                  setIsCourseModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer border border-[#456655] shrink-0"
              >
                <Plus className="w-4 h-4 text-[#EBF3EF]" />
                <span>Buat Kursus Baru (Draf)</span>
              </button>
            </div>
          </div>

          {/* 4 Flashcards Metrik Instruktur (Sama Persis Format & Kualitas dengan Dashboard Analitik Admin) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Card 1: Total Kursus */}
            <div
              onClick={() => setStatusFilter("all")}
              className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:border-[#58816D]/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#58816D]/15 text-[#58816D] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5 text-[#58816D]" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300/60 backdrop-blur-xs">
                  Katalog Anda
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Total Kursus
              </span>
              <div className="text-xl sm:text-2xl 2xl:text-3xl font-black text-[#1F382B] mt-1 tracking-tight">
                {totalCoursesCount}{" "}
                <span className="text-sm font-semibold text-zinc-400">Kelas</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                <span className="flex items-center gap-1 text-[#58816D]">
                  <span className="w-2 h-2 rounded-full bg-[#58816D]" />
                  {publishedCoursesCount} Terbit
                </span>
                <span className="flex items-center gap-1 text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  {draftCoursesCount} Draf
                </span>
              </div>
            </div>

            {/* Card 2: Draf Belum Diajukan */}
            <div
              onClick={() => setStatusFilter("draf")}
              className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:border-amber-400/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Edit className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-800 border border-amber-300/60 backdrop-blur-xs">
                  Perlu Dilengkapi
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Draf Belum Diajukan
              </span>
              <div className="text-xl sm:text-2xl 2xl:text-3xl font-black text-[#1F382B] mt-1 tracking-tight">
                {draftCoursesCount}{" "}
                <span className="text-sm font-semibold text-zinc-400">Draf</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                <span>Prasyarat:</span>
                <span className="font-bold text-amber-800">2–10 Modul & Kuis</span>
              </div>
            </div>

            {/* Card 3: Sedang Ditinjau Admin */}
            <div
              onClick={() => setStatusFilter("ditinjau")}
              className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:border-amber-400/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-800 border border-amber-300/60 backdrop-blur-xs">
                  Antrean Review
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Sedang Ditinjau Admin
              </span>
              <div className="text-xl sm:text-2xl 2xl:text-3xl font-black text-[#1F382B] mt-1 tracking-tight">
                {reviewCoursesCount}{" "}
                <span className="text-sm font-semibold text-zinc-400">Kursus</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                <span>Status Verifikasi:</span>
                <span className="font-bold text-zinc-700">Pemeriksaan Kurikulum</span>
              </div>
            </div>

            {/* Card 4: Terbit Resmi (Katalog) */}
            <div
              onClick={() => setStatusFilter("terbit")}
              className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:border-emerald-400/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-[#58816D]" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300/60 backdrop-blur-xs">
                  Aktif di Publik
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Terbit Resmi (Katalog)
              </span>
              <div className="text-xl sm:text-2xl 2xl:text-3xl font-black text-[#58816D] mt-1 tracking-tight">
                {publishedCoursesCount}{" "}
                <span className="text-sm font-semibold text-zinc-400">Kelas</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                <span>Siap Daftar:</span>
                <span className="font-bold text-emerald-700">Buka untuk Peserta</span>
              </div>
            </div>

          </div>

          {/* Bar Filter Status & Pencarian */}
          <div className="glass-panel p-4 rounded-3xl border border-white/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul atau kategori kursus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/70 border border-white/80 text-xs text-zinc-900 focus:outline-none focus:border-[#58816D] focus:bg-white transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-zinc-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {["all", "draf", "ditinjau", "terbit", "ditutup"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer shrink-0 ${statusFilter === status
                      ? "bg-[#58816D] text-white shadow-2xs border border-[#456655]"
                      : "bg-white/60 hover:bg-white text-zinc-600 border border-white/70"
                    }`}
                >
                  {status === "all" ? "Semua Status" : status}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Kartu Kursus */}
          {isLoadingCourses ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#58816D]/10 text-[#58816D] mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Belum Ada Kursus Ditemukan</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Tidak ada kursus yang cocok dengan filter atau kata kunci pencarian."
                  : "Anda belum menyusun kursus. Klik tombol 'Buat Kursus Baru' untuk mulai menyusun draf pertama Anda."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map((course) => {
                const modulCount = course.modul?.length || 0;
                const totalSoal = (course.modul || []).reduce(
                  (sum, m) => sum + (m.soal?.length || 0),
                  0
                );

                const hasMinModules = modulCount >= 2 && modulCount <= 10;
                const allModulesHaveMinSoal =
                  modulCount >= 2 &&
                  (course.modul || []).every((m) => (m.soal?.length || 0) >= 3);
                const isReadyForSubmit =
                  course.status === "draf" && hasMinModules && allModulesHaveMinSoal;

                return (
                  <div
                    key={course.id}
                    className="glass-card rounded-3xl p-6 border border-white/80 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">

                      {/* Top Badge & Status Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold">
                            {course.kategori}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border flex items-center gap-1 ${course.status === "terbit"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : course.status === "ditinjau"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : course.status === "ditutup"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-[#58816D]/10 text-[#1F382B] border-[#58816D]/30"
                              }`}
                          >
                            {course.status === "terbit" && <Check className="w-3 h-3 text-emerald-600" />}
                            {course.status === "ditinjau" && <Clock className="w-3 h-3 text-amber-600" />}
                            {course.status === "draf" && <Edit className="w-3 h-3 text-[#58816D]" />}
                            {course.status === "ditutup" && <Lock className="w-3 h-3 text-rose-600" />}
                            Status: {course.status}
                          </span>
                        </div>

                        <span className="text-xs font-black text-zinc-900">
                          {course.harga === 0 ? "Gratis (Rp0)" : `Rp${course.harga.toLocaleString("id-ID")}`}
                        </span>
                      </div>

                      {/* Title & Summary */}
                      <div>
                        <h3 className="text-lg font-black text-[#1F382B] tracking-tight leading-snug">
                          {course.judul}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                          {course.ringkasan}
                        </p>
                      </div>

                      {/* Catatan Pengembalian Admin Banner (BR-02) */}
                      {course.status === "draf" && course.catatan_tinjauan && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Catatan Perbaikan dari Admin:</span>
                          </div>
                          <p className="italic text-zinc-700 pl-5">
                            "{course.catatan_tinjauan}"
                          </p>
                        </div>
                      )}

                      {/* Lock Notice jika bukan Draf (BR-04) */}
                      {course.status !== "draf" && (
                        <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-zinc-600 text-[11px] flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>
                            Isi kursus terkunci karena berstatus{" "}
                            <strong className="text-zinc-800">{course.status}</strong>. Pengeditan materi hanya dapat dilakukan saat berstatus draf.
                          </span>
                        </div>
                      )}

                      {/* Bar Informasi Kuota, Modul, Soal */}
                      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-zinc-100 text-center">
                        <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                          <span className="text-[10px] text-zinc-400 block font-bold">Kuota</span>
                          <span className="text-xs font-black text-zinc-800">{course.kuota} kursi</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                          <span className="text-[10px] text-zinc-400 block font-bold">Modul</span>
                          <span className="text-xs font-black text-zinc-800">{modulCount} Modul</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                          <span className="text-[10px] text-zinc-400 block font-bold">Total Soal</span>
                          <span className="text-xs font-black text-zinc-800">{totalSoal} Soal</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                          <span className="text-[10px] text-zinc-400 block font-bold">Pass Grade</span>
                          <span className="text-xs font-black text-zinc-800">{course.nilai_lulus}%</span>
                        </div>
                      </div>

                      {/* Checklist Kelayakan Pengajuan (BR-03) jika status draf */}
                      {course.status === "draf" && (
                        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1.5 text-[11px]">
                          <span className="font-bold text-zinc-700 block">Syarat Pengajuan:</span>
                          <div className="flex items-center gap-2">
                            {hasMinModules ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            <span className={hasMinModules ? "text-zinc-700" : "text-rose-700 font-semibold"}>
                              Memiliki 2–10 modul ({modulCount} modul dibuat)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {allModulesHaveMinSoal ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            <span className={allModulesHaveMinSoal ? "text-zinc-700" : "text-rose-700 font-semibold"}>
                              Setiap modul minimal 3 butir soal kuis
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">

                        {/* Tombol Kelola Modul */}
                        <button
                          onClick={() => {
                            setActiveCourseForModules(course);
                            setIsModuleModalOpen(true);
                            setModuleForm({
                              urutan: (course.modul?.length || 0) + 1,
                              judul: "",
                              isiMateri: "",
                              videoUrl: "",
                              lampiranPath: "",
                              durasiMenit: 15,
                            });
                          }}
                          className="px-4 py-2 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Layers className="w-3.5 h-3.5 text-white" />
                          <span>Kelola Modul, Materi & Kuis ({modulCount})</span>
                        </button>

                        {/* Tombol Edit Draf Kursus */}
                        {course.status === "draf" ? (
                          <button
                            onClick={() => {
                              setEditingCourse(course);
                              setCourseForm({
                                judul: course.judul,
                                kategori: course.kategori,
                                ringkasan: course.ringkasan,
                                deskripsi: course.deskripsi,
                                harga: course.harga,
                                kuota: course.kuota,
                                nilaiLulus: course.nilai_lulus,
                              });
                              setIsCourseModalOpen(true);
                            }}
                            className="p-2 rounded-2xl border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                            title="Edit Informasi Kursus"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-2 rounded-2xl border border-zinc-200 text-zinc-300 cursor-not-allowed"
                            title="Isi terkunci karena bukan draf"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Tombol Hapus Kursus */}
                        {course.status === "draf" && (
                          <button
                            onClick={() => handleDeleteCourse(course)}
                            className="p-2 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Draf Kursus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Tombol Ajukan Kursus untuk Ditinjau (BR-02) */}
                      {course.status === "draf" && (
                        <button
                          onClick={() => {
                            setSubmittingCourse(course);
                            setIsSubmitModalOpen(true);
                          }}
                          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${isReadyForSubmit
                              ? "bg-[#58816D] hover:bg-[#456655] text-white shadow-xs border border-[#456655]"
                              : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
                            }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Ajukan ke Admin</span>
                        </button>
                      )}

                      {course.status === "terbit" && (
                        <Link
                          href={`/kursus/${course.slug}`}
                          target="_blank"
                          className="px-3.5 py-2 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span>Buka di Publik</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PESERTA & NILAI KUIS (PRD US-07, BR-12)             */}
      {/* ========================================================= */}
      {activeTab === "peserta_nilai" && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Header Peserta & Nilai */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-zinc-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                  Peserta & Nilai Kuis
                </h2>
                <p className="text-xs text-zinc-500 font-medium max-w-xl">
                  Pantau kemajuan peserta pada kursus milik Anda. Instruktur hanya dapat melihat data peserta dari kursus yang diampunya sendiri.
                </p>
              </div>

              {/* Filter Kursus yang Diampu */}
              <div className="sm:w-72 space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 block">
                  Pilih Kursus:
                </label>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#58816D]"
                >
                  <option value="all">Semua Kursus Saya ({courses.length})</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.judul}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4 Flashcards Rekap Peserta (Glassmorphic Cards Senada Admin Analitik) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Card 1: Total Peserta */}
            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:border-[#58816D]/60 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#58816D]/15 text-[#58816D] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 text-[#58816D]" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300/60 backdrop-blur-xs">
                  Semua Kelas
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Total Peserta
              </span>
              <div className="text-xl sm:text-2xl 2xl:text-3xl font-black text-[#1F382B] mt-1 tracking-tight">
                {studentsData.length}{" "}
                <span className="text-sm font-semibold text-zinc-400">Siswa</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                <span>Data:</span>
                <span className="font-bold text-[#58816D]">Kursus Anda</span>
              </div>
            </div>

            {/* Card 2: Sedang Belajar Aktif */}
            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:border-[#58816D]/60 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#58816D]/15 text-[#58816D] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5 text-[#58816D]" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300/60 backdrop-blur-xs">
                  Akses Modul
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Sedang Belajar Aktif
              </span>
              <div className="text-xl sm:text-2xl 2xl:text-3xl font-black text-[#58816D] mt-1 tracking-tight">
                {studentsData.filter((s) => s.status === "aktif").length}{" "}
                <span className="text-sm font-semibold text-zinc-400">Siswa</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                <span>Aktivitas:</span>
                <span className="font-bold text-emerald-700">Mempelajari Materi</span>
              </div>
            </div>

            {/* Card 3: Selesai & Lulus */}
            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:border-[#58816D]/60 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#58816D]/15 text-[#58816D] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-[#58816D]" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300/60 backdrop-blur-xs">
                  Tuntas Kuis
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Selesai & Lulus
              </span>
              <div className="text-xl sm:text-2xl 2xl:text-3xl font-black text-[#1F382B] mt-1 tracking-tight">
                {studentsData.filter((s) => s.status === "selesai").length}{" "}
                <span className="text-sm font-semibold text-zinc-400">Siswa</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                <span>Kriteria Lulus:</span>
                <span className="font-bold text-emerald-700">Nilai &ge; 70</span>
              </div>
            </div>

            {/* Card 4: Sertifikat Terbit */}
            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-lg hover:border-amber-400/60 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-800 border border-amber-300/60 backdrop-blur-xs">
                  Sertifikat Sah
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Sertifikat Terbit
              </span>
              <div className="text-xl sm:text-2xl 2xl:text-3xl font-black text-amber-900 mt-1 tracking-tight">
                {studentsData.filter((s) => s.sertifikat !== null).length}{" "}
                <span className="text-sm font-semibold text-zinc-400">Lembar</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-600">
                <span>Penerbitan:</span>
                <span className="font-bold text-amber-800">Resmi Pijar Aksara</span>
              </div>
            </div>

          </div>

          {/* Tabel Rekap Peserta & Nilai */}
          <div className="bg-white rounded-[32px] border border-zinc-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                Daftar Peserta Terdaftar ({studentsData.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Peserta</th>
                    <th className="py-3 px-4">Kursus</th>
                    <th className="py-3 px-4">Status Pendaftaran</th>
                    <th className="py-3 px-4">Progres Modul</th>
                    <th className="py-3 px-4">Nilai Kuis (Percobaan)</th>
                    <th className="py-3 px-4">Sertifikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isLoadingStudents ? (
                    <TableSkeleton rows={4} cols={6} />
                  ) : studentsData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs text-zinc-400 font-medium">
                        Belum ada peserta yang mendaftar pada kursus ini.
                      </td>
                    </tr>
                  ) : (
                    studentsData.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-900">
                            {item.peserta?.nama_lengkap || "Tanpa Nama"}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {item.peserta?.email}
                          </div>
                          {item.peserta?.no_hp && (
                            <div className="text-[10px] text-zinc-400">
                              HP: {item.peserta?.no_hp}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-700">
                          {item.kursus?.judul}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${item.status === "aktif"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : item.status === "selesai"
                                  ? "bg-[#58816D]/10 text-[#1F382B] border-[#58816D]/30"
                                  : "bg-zinc-100 text-zinc-700 border-zinc-200"
                              }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-zinc-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-[#58816D] h-full rounded-full transition-all"
                                style={{ width: `${item.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-zinc-700">
                              {item.passedModules}/{item.totalModules} ({item.progressPercent}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {Object.keys(item.modulScores || {}).length === 0 ? (
                            <span className="text-zinc-400 text-[11px] italic">
                              Belum ada kuis
                            </span>
                          ) : (
                            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 max-w-[280px]">
                              {Object.entries(item.modulScores).map(([mId, score]: any, idx) => (
                                <div
                                  key={mId}
                                  className="text-[11px] flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200/60"
                                >
                                  <span className="text-zinc-600 font-bold text-[10px]">M{score.urutan || (idx + 1)}:</span>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`font-black px-1 rounded text-[10px] ${score.passed
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-rose-100 text-rose-800"
                                        }`}
                                    >
                                      {score.bestScore}
                                    </span>
                                    <span className="text-[9px] text-zinc-400 font-medium">
                                      ({score.attempts}x)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.sertifikat ? (
                            <Link
                              href={`/sertifikat/${item.sertifikat.nomor_sertifikat}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#58816D] hover:underline"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{item.sertifikat.nomor_sertifikat}</span>
                            </Link>
                          ) : (
                            <span className="text-zinc-400 text-[11px]">-</span>
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
      {/* MODAL 1: FORMULIR BUAT / EDIT KURSUS (DRAF)               */}
      {/* ========================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-lg font-black text-[#1F382B]">
                {editingCourse ? "Edit Informasi Draf Kursus" : "Buat Draf Kursus Baru"}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Judul Kursus *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Python untuk Analisis Data"
                  value={courseForm.judul}
                  onChange={(e) => setCourseForm({ ...courseForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Kategori *</label>
                  <select
                    value={courseForm.kategori}
                    onChange={(e) => setCourseForm({ ...courseForm, kategori: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                  >
                    <option value="Perkantoran">Perkantoran</option>
                    <option value="Desain">Desain</option>
                    <option value="Bahasa">Bahasa</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Pengembangan Diri">Pengembangan Diri</option>
                    <option value="Teknologi">Teknologi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Harga (Rp0 = Gratis) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={courseForm.harga}
                    onChange={(e) => setCourseForm({ ...courseForm, harga: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                  />
                  <span className="text-[10px] text-zinc-400 block">Rp0 atau Rp50.000–Rp5.000.000</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Kuota Peserta *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={courseForm.kuota}
                    onChange={(e) => setCourseForm({ ...courseForm, kuota: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                  />
                  <span className="text-[10px] text-zinc-400 block">1 sampai 100 peserta</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Nilai Kelulusan Kuis (%) *</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={courseForm.nilaiLulus}
                    onChange={(e) => setCourseForm({ ...courseForm, nilaiLulus: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                  />
                  <span className="text-[10px] text-zinc-400 block">50 sampai 100, default 70</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Ringkasan Singkat (1-2 Kalimat) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ringkasan untuk kartu katalog..."
                  value={courseForm.ringkasan}
                  onChange={(e) => setCourseForm({ ...courseForm, ringkasan: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Deskripsi Lengkap *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan silabus, target peserta, dan hasil belajar kursus ini..."
                  value={courseForm.deskripsi}
                  onChange={(e) => setCourseForm({ ...courseForm, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                />
              </div>

              {/* Shortcut langsung ke Pengelolaan Modul, Video, PDF & Kuis */}
              {editingCourse && (
                <div className="p-4 rounded-2xl bg-[#58816D]/10 border border-[#58816D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-xs text-[#234e36] block">
                      Isi Materi Teks, Video, PDF & Soal Kuis
                    </span>
                    <span className="text-[11px] text-zinc-600 block">
                      Telah dibuat {editingCourse.modul?.length || 0} modul pada draf kursus ini.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCourseModalOpen(false);
                      setActiveCourseForModules(editingCourse);
                      setIsModuleModalOpen(true);
                      setModuleForm({
                        urutan: (editingCourse.modul?.length || 0) + 1,
                        judul: "",
                        isiMateri: "",
                        videoUrl: "",
                        lampiranPath: "",
                        durasiMenit: 15,
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Buka Modul, Materi & Kuis →</span>
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border border-[#456655]"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingCourse ? "Perbarui Draf" : "Simpan Draf"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: KELOLA MODUL & MATERI (BR-03 & BR-04)            */}
      {/* ========================================================= */}
      {isModuleModalOpen && activeCourseForModules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-bold text-[#58816D] uppercase tracking-wider block">
                  Kelola Modul Pembelajaran
                </span>
                <h3 className="text-lg font-black text-[#1F382B]">
                  {activeCourseForModules.judul}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModuleModalOpen(false);
                  setActiveCourseForModules(null);
                }}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Modul yang Ada */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-700">
                  Daftar Modul Saat Ini ({(activeCourseForModules.modul || []).length} Modul)
                </h4>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Wajib 2–10 modul berurutan tanpa lompatan
                </span>
              </div>

              {(activeCourseForModules.modul || []).length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500">
                  Belum ada modul yang ditambahkan ke kursus ini. Silakan buat modul pertama di formulir bawah.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(activeCourseForModules.modul || [])
                    .sort((a, b) => a.urutan - b.urutan)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 hover:bg-zinc-100/70 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#58816D] text-white font-black text-xs flex items-center justify-center shrink-0">
                            {m.urutan}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-zinc-900 block truncate">
                              {m.judul}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                {m.durasi_menit} Menit
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1 font-bold text-[#58816D]">
                                <HelpCircle className="w-3 h-3" />
                                {(m.soal || []).length} Butir Soal Kuis
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Tombol Lihat Pratinjau Materi */}
                          <button
                            onClick={() => {
                              setPreviewModule(m);
                              setIsPreviewModuleOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Pratinjau Materi Modul"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-600" />
                            <span>Lihat Materi</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveModuleForQuestions(m);
                              fetchQuestions(m.id);
                              setIsQuestionsModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#58816D]/10 hover:bg-[#58816D]/20 text-[#58816D] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-[#58816D]" />
                            <span>Kuis ({(m.soal || []).length})</span>
                          </button>

                          {activeCourseForModules.status === "draf" && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingModule(m);
                                  setModuleForm({
                                    urutan: m.urutan,
                                    judul: m.judul,
                                    isiMateri: m.isi_materi,
                                    videoUrl: m.video_url || "",
                                    lampiranPath: m.lampiran_path || "",
                                    durasiMenit: m.durasi_menit,
                                  });
                                }}
                                className="p-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-200 text-zinc-600 cursor-pointer"
                                title="Edit Modul"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteModule(m.id)}
                                className="p-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                                title="Hapus Modul"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Formulir Tambah / Edit Modul */}
            {activeCourseForModules.status === "draf" ? (
              <form
                onSubmit={handleSaveModule}
                className="p-5 rounded-3xl bg-[#58816D]/5 border border-[#58816D]/20 space-y-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-zinc-900 text-sm">
                    {editingModule ? `Edit Modul ${editingModule.urutan}` : "+ Tambah Modul Baru"}
                  </h4>
                  {editingModule && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModule(null);
                        setModuleForm({
                          urutan: (activeCourseForModules.modul?.length || 0) + 1,
                          judul: "",
                          isiMateri: "",
                          videoUrl: "",
                          lampiranPath: "",
                          durasiMenit: 15,
                        });
                      }}
                      className="text-zinc-500 hover:text-zinc-800 text-[11px] font-bold cursor-pointer"
                    >
                      Batal Edit (Buat Baru)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3 space-y-1">
                    <label className="font-bold text-zinc-700">Nomor Urut *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={moduleForm.urutan}
                      onChange={(e) => setModuleForm({ ...moduleForm, urutan: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D] font-bold"
                    />
                  </div>

                  <div className="col-span-6 space-y-1">
                    <label className="font-bold text-zinc-700">Judul Modul *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pengenalan Formula Dasar"
                      value={moduleForm.judul}
                      onChange={(e) => setModuleForm({ ...moduleForm, judul: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                    />
                  </div>

                  <div className="col-span-3 space-y-1">
                    <label className="font-bold text-zinc-700">Durasi (Menit) *</label>
                    <input
                      type="number"
                      min="5"
                      required
                      value={moduleForm.durasiMenit}
                      onChange={(e) => setModuleForm({ ...moduleForm, durasiMenit: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Tautan Video Materi (YouTube / Embed - Opsional)</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={moduleForm.videoUrl}
                      onChange={(e) => setModuleForm({ ...moduleForm, videoUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-zinc-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#58816D]" />
                        <span>Dokumen Materi PDF (Maks 10 MB - PRD Bab 10.4)</span>
                      </label>
                      {moduleForm.lampiranPath && (
                        <button
                          type="button"
                          onClick={() => setModuleForm({ ...moduleForm, lampiranPath: "" })}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                        >
                          Hapus File
                        </button>
                      )}
                    </div>

                    {/* Drag-and-drop / Upload Picker */}
                    <div className="p-3 rounded-2xl bg-white border border-dashed border-zinc-300 hover:border-[#58816D] transition-colors space-y-2">
                      <div className="flex items-center gap-2">
                        <label className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                          isUploadingPdf
                            ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                            : "bg-[#58816D] hover:bg-[#456655] text-white shadow-xs"
                        }`}>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingPdf ? "Mengunggah..." : "Pilih File PDF"}</span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            disabled={isUploadingPdf}
                            onChange={handleUploadPdfFile}
                            className="hidden"
                          />
                        </label>

                        {moduleForm.lampiranPath ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{moduleForm.lampiranPath}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">
                            Belum ada file PDF diunggah
                          </span>
                        )}
                      </div>

                      {/* Manual input fallback */}
                      <input
                        type="text"
                        placeholder="Atau ketik path file manual (contoh: materi/excel/modul-1.pdf)"
                        value={moduleForm.lampiranPath}
                        onChange={(e) => setModuleForm({ ...moduleForm, lampiranPath: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 focus:outline-none focus:border-[#58816D]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Isi Teks Materi Modul *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tuliskan materi pembelajaran modul ini..."
                    value={moduleForm.isiMateri}
                    onChange={(e) => setModuleForm({ ...moduleForm, isiMateri: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border border-[#456655]"
                  >
                    {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{editingModule ? "Simpan Perubahan Modul" : "Tambahkan Modul Ini"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-zinc-400" />
                <span>Modul tidak dapat ditambah atau diubah karena kursus ini berstatus <strong>{activeCourseForModules.status}</strong>.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: KELOLA SOAL KUIS PER MODUL (BR-03 & BR-09)       */}
      {/* ========================================================= */}
      {isQuestionsModalOpen && activeModuleForQuestions && activeCourseForModules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-bold text-[#58816D] uppercase tracking-wider block">
                  Bank Soal Kuis · Modul {activeModuleForQuestions.urutan}
                </span>
                <h3 className="text-lg font-black text-[#1F382B]">
                  {activeModuleForQuestions.judul}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsQuestionsModalOpen(false);
                  setActiveModuleForQuestions(null);
                }}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Syarat BR-03 Banner */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs flex items-center justify-between">
              <span className="text-zinc-900 font-bold">
                Total Soal Modul Ini: {questionsList.length} Butir
              </span>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${questionsList.length >= 3 && questionsList.length <= 20
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
                }`}>
                {questionsList.length >= 3 && questionsList.length <= 20
                  ? "✓ Memenuhi Syarat (3–20 soal)"
                  : `Kurang ${Math.max(0, 3 - questionsList.length)} soal lagi (min 3)`}
              </span>
            </div>

            {/* List Soal Saat Ini */}
            <div className="space-y-3">
              {isLoadingQuestions ? (
                <div className="p-6 text-center text-xs text-zinc-400 font-bold">
                  Memuat butir soal...
                </div>
              ) : questionsList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500">
                  Belum ada soal pada modul ini. Tambahkan minimal 3 butir soal agar kursus dapat diajukan.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {questionsList.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-black text-zinc-900">
                          {idx + 1}. {q.pertanyaan}
                        </span>
                        {activeCourseForModules.status === "draf" && (
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className={`p-2 rounded-xl border ${q.kunci_jawaban === "A" ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-white border-zinc-200"}`}>
                          A. {q.pilihan_a} {q.kunci_jawaban === "A" && "✓ (Kunci)"}
                        </div>
                        <div className={`p-2 rounded-xl border ${q.kunci_jawaban === "B" ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-white border-zinc-200"}`}>
                          B. {q.pilihan_b} {q.kunci_jawaban === "B" && "✓ (Kunci)"}
                        </div>
                        <div className={`p-2 rounded-xl border ${q.kunci_jawaban === "C" ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-white border-zinc-200"}`}>
                          C. {q.pilihan_c} {q.kunci_jawaban === "C" && "✓ (Kunci)"}
                        </div>
                        <div className={`p-2 rounded-xl border ${q.kunci_jawaban === "D" ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-white border-zinc-200"}`}>
                          D. {q.pilihan_d} {q.kunci_jawaban === "D" && "✓ (Kunci)"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Tambah Soal Baru */}
            {activeCourseForModules.status === "draf" ? (
              <form
                onSubmit={handleSaveQuestion}
                className="p-5 rounded-3xl bg-zinc-50 border border-zinc-200 space-y-3.5 text-xs"
              >
                <h4 className="font-black text-zinc-900 text-sm">
                  + Tambah Butir Soal Baru
                </h4>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Pertanyaan Soal *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Tuliskan pertanyaan kuis..."
                    value={questionForm.pertanyaan}
                    onChange={(e) => setQuestionForm({ ...questionForm, pertanyaan: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D] font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Pilihan A *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jawaban A"
                      value={questionForm.pilihanA}
                      onChange={(e) => setQuestionForm({ ...questionForm, pilihanA: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Pilihan B *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jawaban B"
                      value={questionForm.pilihanB}
                      onChange={(e) => setQuestionForm({ ...questionForm, pilihanB: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Pilihan C *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jawaban C"
                      value={questionForm.pilihanC}
                      onChange={(e) => setQuestionForm({ ...questionForm, pilihanC: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">Pilihan D *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jawaban D"
                      value={questionForm.pilihanD}
                      onChange={(e) => setQuestionForm({ ...questionForm, pilihanD: e.target.value })}
                      className="w-full px-3 py-2 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:border-[#58816D]"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="font-bold text-zinc-700">Kunci Jawaban Benar (Dirahasiakan dari Peserta) *</label>
                  <div className="flex items-center gap-4">
                    {["A", "B", "C", "D"].map((key) => (
                      <label key={key} className="flex items-center gap-1.5 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="kunciJawaban"
                          value={key}
                          checked={questionForm.kunciJawaban === key}
                          onChange={(e) => setQuestionForm({ ...questionForm, kunciJawaban: e.target.value })}
                          className="text-[#58816D] focus:ring-[#58816D]"
                        />
                        <span>Pilihan {key}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border border-[#456655]"
                  >
                    {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Tambahkan Soal Ini</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-zinc-400" />
                <span>Bank soal terkunci dan tidak dapat diubah karena kursus ini berstatus <strong>{activeCourseForModules.status}</strong>.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: KONFIRMASI AJUKAN KURSUS KE ADMIN (BR-02 & BR-03) */}
      {/* ========================================================= */}
      {isSubmitModalOpen && submittingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-lg font-black text-[#1F382B]">
                Ajukan Kursus untuk Ditinjau
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-600">
                Anda akan mengajukan kursus <strong>"{submittingCourse.judul}"</strong> kepada Admin untuk diverifikasi dan diterbitkan ke katalog publik.
              </p>

              {/* Checklist Pemenuhan Syarat BR-03 */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <span className="font-black text-zinc-800 block text-xs">
                  Pengecekan Kepatuhan Syarat Pengajuan:
                </span>

                {/* 1. Modul 2-10 */}
                {(() => {
                  const modulCount = submittingCourse.modul?.length || 0;
                  const validModul = modulCount >= 2 && modulCount <= 10;
                  return (
                    <div className="flex items-center gap-2">
                      {validModul ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className={validModul ? "text-zinc-700" : "text-rose-700 font-bold"}>
                        Jumlah modul: {modulCount} (Wajib 2 sampai 10 modul)
                      </span>
                    </div>
                  );
                })()}

                {/* 2. Soal per modul */}
                {(() => {
                  const modules = submittingCourse.modul || [];
                  const invalidModule = modules.find((m) => (m.soal?.length || 0) < 3);
                  const validSoal = modules.length >= 2 && !invalidModule;
                  return (
                    <div className="flex items-center gap-2">
                      {validSoal ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className={validSoal ? "text-zinc-700" : "text-rose-700 font-bold"}>
                        {validSoal
                          ? "Semua modul memiliki minimal 3 butir soal kuis"
                          : invalidModule
                            ? `Modul ${invalidModule.urutan} baru memiliki ${invalidModule.soal?.length || 0} soal (min 3)`
                            : "Soal kuis belum lengkap"}
                      </span>
                    </div>
                  );
                })()}

                {/* 3. Harga */}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-zinc-700">
                    Harga: {submittingCourse.harga === 0 ? "Gratis" : `Rp${submittingCourse.harga.toLocaleString("id-ID")}`}
                  </span>
                </div>

                {/* 4. Kuota */}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-zinc-700">
                    Kuota: {submittingCourse.kuota} Peserta (1–100)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Catatan Penting:</strong> Setelah diajukan, status kursus akan berubah menjadi <strong>"ditinjau"</strong> dan seluruh modul, materi, serta bank soal akan <strong>terkunci</strong> dari pengeditan.
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={actionLoading}
                className="px-5 py-2 rounded-2xl bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border border-[#456655]"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Konfirmasi Ajukan Kursus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL LIHAT PRATINJAU MATERI MODUL UNTUK PENGAJAR/INSTRUKTUR */}
      {/* ========================================================= */}
      {isPreviewModuleOpen && previewModule && activeCourseForModules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#58816D] text-white font-bold flex items-center justify-center text-xs">
                  {previewModule.urutan}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Modul {previewModule.urutan} · {previewModule.durasi_menit} Menit
                  </span>
                  <h3 className="font-black text-zinc-900 text-base">
                    {previewModule.judul}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModuleOpen(false)}
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Tautan Video & PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Tautan Video Materi
                </span>
                {previewModule.video_url ? (
                  <a
                    href={previewModule.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#58816D] font-bold hover:underline flex items-center gap-1.5 truncate"
                  >
                    <Video className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{previewModule.video_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-zinc-400 italic">Tidak ada tautan video</span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Lampiran Dokumen PDF
                </span>
                {previewModule.lampiran_path ? (
                  <div className="text-xs text-zinc-800 font-mono flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{previewModule.lampiran_path}</span>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 italic">Tidak ada lampiran file</span>
                )}
              </div>
            </div>

            {/* Isi Teks Bacaan Materi */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 block">
                Isi Teks Pembelajaran Modul:
              </label>
              <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 text-xs text-zinc-700 leading-relaxed font-normal whitespace-pre-wrap max-h-60 overflow-y-auto">
                {previewModule.isi_materi || "Materi teks belum diisi."}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-500 font-medium">
                Tersedia {(previewModule.soal || []).length} butir soal kuis evaluasi.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/belajar/${activeCourseForModules.slug}/${previewModule.urutan}`}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka di Ruang Belajar (Preview)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
