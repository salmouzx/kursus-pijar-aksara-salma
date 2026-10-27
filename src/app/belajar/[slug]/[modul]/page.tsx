"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Clock,
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  FileText,
  HelpCircle,
  Award,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Download,
  Eye,
  MessageSquare,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { ALL_COURSES } from "@/data/courses";
import { getPointSettings } from "@/lib/point-system";
import { ModuleDiscussionForum } from "@/components/module-discussion-forum";
import { ModuleAiTutor } from "@/components/module-ai-tutor";

interface ModulData {
  id: string;
  urutan: number;
  judul: string;
  isi_materi: string;
  video_url: string | null;
  lampiran_path: string | null;
  durasi_menit: number;
}

interface SoalItem {
  id: string;
  urutan: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  kunci_jawaban?: string;
}

interface AttemptHistory {
  nomor_percobaan: number;
  nilai: number;
  jumlah_benar: number;
  jumlah_soal: number;
  lulus: boolean;
  jawaban?: Record<string, string>;
  dikerjakan_pada: string;
}

interface EvaluatedQuestion {
  id: string;
  urutan: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  jawaban_user: string;
  teks_user: string;
  benar: boolean;
  hint: string;
}

export default function RuangBelajarPage({
  params,
}: {
  params: Promise<{ slug: string; modul: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentUser, isLoading: authLoading } = useAuth();

  const [kursus, setKursus] = useState<any | null>(null);
  const [modulList, setModulList] = useState<ModulData[]>([]);
  const [activeModul, setActiveModul] = useState<ModulData | null>(null);
  const [pendaftaran, setPendaftaran] = useState<any | null>(null);
  const [progresMap, setProgresMap] = useState<Record<string, { read: boolean; passed: boolean }>>({});
  
  // Quiz state
  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [isRetakingQuiz, setIsRetakingQuiz] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [activeTab, setActiveTab] = useState<"materi" | "kuis" | "diskusi">("materi");
  const [isLoading, setIsLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const currentModulUrutan = parseInt(resolvedParams.modul, 10) || 1;

  // Load course, modules, and user enrollment
  const loadCourseData = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil data kursus & modul
      let activeCourse: any = null;
      try {
        const { data: courseData, error: courseErr } = await supabase
          .from("kursus")
          .select(`
            id, judul, slug, kategori, harga, nilai_lulus, status,
            modul (
              id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit
            )
          `)
          .eq("slug", resolvedParams.slug)
          .single();

        if (courseData && !courseErr) {
          activeCourse = courseData;
        }
      } catch (e) {
        // Lanjutkan ke fallback
      }

      if (!activeCourse) {
        const local = ALL_COURSES.find((c) => c.slug === resolvedParams.slug);
        if (local) {
          activeCourse = {
            id: local.id,
            judul: local.judul,
            slug: local.slug,
            kategori: local.kategori,
            harga: local.harga,
            nilai_lulus: local.nilaiLulus,
            status: local.status,
            modul: local.modul.map((m) => ({
              id: m.id,
              urutan: m.urutan,
              judul: m.judul,
              isi_materi: m.isiMateri,
              video_url: m.videoUrl || null,
              lampiran_path: m.lampiranPath || null,
              durasi_menit: m.durasiMenit,
            })),
          };
        }
      }

      if (!activeCourse) {
        console.error("Course not found in database or local data");
        setIsLoading(false);
        return;
      }

      setKursus(activeCourse);
      const sortedModules = ((activeCourse.modul as any[]) || []).sort((a, b) => a.urutan - b.urutan);
      setModulList(sortedModules);

      const targetModul = sortedModules.find((m) => m.urutan === currentModulUrutan) || sortedModules[0];
      setActiveModul(targetModul);

      // 2. Jika user login, cek pendaftaran & progres modul
      if (currentUser?.id) {
        const { data: enrollData } = await supabase
          .from("pendaftaran")
          .select("id, status, didaftarkan_pada, batas_bayar")
          .eq("kursus_id", activeCourse.id)
          .eq("peserta_id", currentUser.id)
          .order("didaftarkan_pada", { ascending: false })
          .limit(1)
          .maybeSingle();

        setPendaftaran(enrollData);

        if (enrollData?.id) {
          // Ambil progres modul
          const { data: progData } = await supabase
            .from("progres_modul")
            .select("modul_id, materi_dibaca_pada, lulus_pada")
            .eq("pendaftaran_id", enrollData.id);

          const pMap: Record<string, { read: boolean; passed: boolean }> = {};
          (progData || []).forEach((p) => {
            pMap[p.modul_id] = {
              read: p.materi_dibaca_pada !== null,
              passed: p.lulus_pada !== null,
            };
          });
          setProgresMap(pMap);

        }

        // Ambil butir soal modul (selalu dimuat untuk peserta maupun instruktur preview - BR-09)
        if (targetModul) {
          let finalSoalList: SoalItem[] = [];
          const isStaff = currentUser?.peran === "instruktur" || currentUser?.peran === "admin";
          try {
            const tableToQuery = isStaff ? "soal" : "view_soal_peserta";
            const selectFields = isStaff
              ? "id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban"
              : "id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d";

            const { data: soalData } = await supabase
              .from(tableToQuery)
              .select(selectFields)
              .eq("modul_id", targetModul.id)
              .order("urutan", { ascending: true });

            if (soalData && soalData.length > 0) {
              finalSoalList = soalData as unknown as SoalItem[];
            }
          } catch (e) {}

          if (finalSoalList.length === 0) {
            const localMod = ALL_COURSES.find((c) => c.slug === resolvedParams.slug)?.modul.find((m) => m.urutan === targetModul.urutan);
            if (localMod?.soal) {
              finalSoalList = localMod.soal.map((s) => ({
                id: s.id,
                urutan: s.urutan,
                pertanyaan: s.pertanyaan,
                pilihan_a: s.pilihan_a,
                pilihan_b: s.pilihan_b,
                pilihan_c: s.pilihan_c,
                pilihan_d: s.pilihan_d,
                kunci_jawaban: isStaff ? s.kunci_jawaban : undefined,
              }));
            }
          }

          setSoalList(finalSoalList);

          // Ambil riwayat kuis jika ada enrollment
          if (enrollData?.id) {
            const { data: attemptData } = await supabase
              .from("percobaan_kuis")
              .select("nomor_percobaan, nilai, jumlah_benar, jumlah_soal, lulus, jawaban, dikerjakan_pada")
              .eq("pendaftaran_id", enrollData.id)
              .eq("modul_id", targetModul.id)
              .order("nomor_percobaan", { ascending: true });

            setAttempts((attemptData as AttemptHistory[]) || []);

            // Jika ada riwayat pengerjaan sebelumnya, ambil evaluasi resmi dari server (BR-09)
            if (attemptData && attemptData.length > 0) {
              try {
                const revRes = await fetch(`/api/kuis/review?pendaftaranId=${enrollData.id}&modulId=${targetModul.id}`);
                if (revRes.ok) {
                  const revData = await revRes.json();
                  if (revData?.feedback && revData.feedback.length > 0) {
                    setQuizResult(revData);
                  }
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading course:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
    setQuizResult(null);
    setAnswers({});
  }, [resolvedParams.slug, resolvedParams.modul, currentUser]);

  // Identifikasi peran pengajar/admin untuk Mode Pratinjau
  const isInstructorRole = currentUser?.peran === "instruktur";
  const isAdminRole = currentUser?.peran === "admin";
  const isStaffPreview = isInstructorRole || isAdminRole;

  // Cek apakah modul saat ini terkunci (BR-08)
  const isModuleLocked = (targetUrutan: number) => {
    if (isStaffPreview) return false; // Instruktur & admin bisa mengecek seluruh modul kursus
    if (targetUrutan === 1) return false; // Modul 1 selalu terbuka
    // Modul N terbuka hanya jika modul N-1 sudah lulus
    const prevModule = modulList.find((m) => m.urutan === targetUrutan - 1);
    if (!prevModule) return false;
    return !progresMap[prevModule.id]?.passed;
  };

  const currentModulIsLocked = activeModul ? isModuleLocked(activeModul.urutan) : false;
  const isCurrentModulRead = isStaffPreview ? true : (activeModul ? progresMap[activeModul.id]?.read : false);
  const isCurrentModulPassed = isStaffPreview ? true : (activeModul ? progresMap[activeModul.id]?.passed : false);
  const remainingAttempts = Math.max(0, 3 - attempts.length);

  // Skor percobaan pertama & riwayat
  const firstAttempt = attempts.find((a) => a.nomor_percobaan === 1) || (attempts.length > 0 ? attempts[0] : null);
  const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const firstScore = firstAttempt ? firstAttempt.nilai : (quizResult?.skor_pertama ?? (quizResult?.nomor_percobaan === 1 ? quizResult?.nilai : null));

  // Helper identifikasi topik bab materi untuk petunjuk belajar mandiri lintas seluruh kursus
  const getStudyTopic = (pertanyaan: string, urutan: number): string => {
    const p = (pertanyaan || "").toLowerCase();

    // Excel
    if (p.includes("name box") || p.includes("formula bar")) return "Antarmuka Excel & Fungsi Name Box";
    if (p.includes("shortcut") || p.includes("panah") || p.includes("berpindah")) return "Shortcut Navigasi & Perpindahan Sel Cepat";
    if (p.includes("accounting") || p.includes("currency")) return "Pengaturan Format Angka (Accounting vs Currency)";
    if (p.includes("center across selection") || p.includes("merge")) return "Perataan Sel & Alternatif Center Across Selection";
    if (p.includes("pemisah ribuan") || p.includes("rupiah") || p.includes("regional")) return "Format Regional & Karakter Pemisah Angka";
    if (p.includes("sum") || p.includes("penjumlahan") || p.includes("autosum")) return "Rumus Operasi Matematika & Fungsi SUM";
    if (p.includes("average") || p.includes("rata-rata")) return "Kalkulasi Rata-rata Nilai dengan AVERAGE";
    if (p.includes("count") || p.includes("menghitung sel")) return "Perbedaan Fungsi COUNT dan COUNTA";
    if (p.includes("dolar") || p.includes("absolut") || p.includes("referensi")) return "Referensi Rumus Absolut ($) & Relatif";
    if (p.includes("min") || p.includes("max") || p.includes("terendah") || p.includes("tertinggi")) return "Fungsi Ekstrem Nilai (MIN & MAX)";
    if (p.includes("vlookup") || p.includes("vertikal")) return "Pencarian Vertikal Tabel dengan VLOOKUP";
    if (p.includes("xlookup")) return "Pencarian Fleksibel Dua Arah dengan XLOOKUP";
    if (p.includes("index") || p.includes("match")) return "Kombinasi Formula Dinamis INDEX & MATCH";
    if (p.includes("if") || p.includes("kondisi") || p.includes("logika")) return "Logika Percabangan Rumus IF";
    if (p.includes("pivot")) return "Penyusunan Pivot Table & Ringkasan Data";
    if (p.includes("validasi") || p.includes("dropdown")) return "Validasi Input Data & Pembatasan Sel";
    if (p.includes("grafik") || p.includes("chart") || p.includes("dashboard")) return "Visualisasi Data & Dashboard Ringkas";
    if (p.includes("concatenate") || p.includes("string") || p.includes("left") || p.includes("right") || p.includes("mid")) return "Manipulasi Teks & Fungsi String";

    // Desain Canva & Media Sosial
    if (p.includes("piksel") || p.includes("ukuran") || p.includes("kanvas") || p.includes("rasio")) return "Ukuran Kanvas & Rasio Aspek Desain";
    if (p.includes("hirarki visual") || p.includes("ruang negatif") || p.includes("grid")) return "Hirarki Visual & Tata Letak Elemen";
    if (p.includes("font") || p.includes("tipografi") || p.includes("keluarga font")) return "Pemilihan & Padu Padan Tipografi Font";
    if (p.includes("warna") || p.includes("psikologi warna") || p.includes("kontras")) return "Psikologi Warna & Harmoni Visual Brand";
    if (p.includes("logo") || p.includes("transparan") || p.includes("brand kit") || p.includes("png")) return "Identitas Visual & Penggunaan Brand Kit";
    if (p.includes("carousel") || p.includes("seamless") || p.includes("slide")) return "Penyusunan Feed Carousel Edukatif";
    if (p.includes("story") || p.includes("highlight") || p.includes("sorotan")) return "Desain Story & Sampul Highlight Interaktif";
    if (p.includes("spanduk") || p.includes("promo") || p.includes("flash sale") || p.includes("hapus latar")) return "Banner Promosi & Penghapus Latar Belakang";
    if (p.includes("animasi") || p.includes("reels") || p.includes("video") || p.includes("mp4")) return "Animasi Elemen & Video Pendek Reels";
    if (p.includes("kalender") || p.includes("content pillar") || p.includes("jadwal")) return "Perencanaan Pilar Konten & Kalender Unggahan";

    // Bahasa Inggris Kerja
    if (p.includes("introduce") || p.includes("networking") || p.includes("perkenalan")) return "Professional Self-Introduction & Networking";
    if (p.includes("polite") || p.includes("etiquette") || p.includes("colleague") || p.includes("sopan")) return "Office Etiquette & Workplace Politeness";
    if (p.includes("email") || p.includes("subject line") || p.includes("inquiry")) return "Professional Email Writing & Clear Subject Lines";
    if (p.includes("telephone") || p.includes("call") || p.includes("appointment") || p.includes("telepon")) return "Telephone Handling & Appointment Scheduling";
    if (p.includes("meeting") || p.includes("chairperson") || p.includes("agenda") || p.includes("rapat")) return "Leading & Participating in Business Meetings";
    if (p.includes("disagree") || p.includes("opinion") || p.includes("pendapat")) return "Expressing Polite Opinions & Constructive Disagreement";
    if (p.includes("presentation") || p.includes("signposting") || p.includes("presentasi")) return "Signposting Phrases for Business Presentations";
    if (p.includes("negotiation") || p.includes("client") || p.includes("negosiasi")) return "Diplomatic Negotiation & Client Handling";
    if (p.includes("minutes") || p.includes("mom") || p.includes("notula") || p.includes("action items")) return "Official Meeting Minutes (MoM) & Action Items";
    if (p.includes("star") || p.includes("interview") || p.includes("wawancara")) return "The STAR Method for Professional Job Interviews";

    // Pembukuan UMKM
    if (p.includes("pencampuran") || p.includes("dompet") || p.includes("kas bisnis") || p.includes("rekening")) return "Pemisahan Kas Usaha & Keuangan Pribadi";
    if (p.includes("aset") || p.includes("modal awal") || p.includes("inventaris")) return "Klasifikasi Modal Awal & Aset Usaha";
    if (p.includes("kas masuk") || p.includes("kas keluar") || p.includes("buku kas")) return "Pencatatan Buku Kas Harian";
    if (p.includes("hpp") || p.includes("pokok penjualan") || p.includes("biaya bahan")) return "Kalkulasi Harga Pokok Penjualan (HPP)";
    if (p.includes("margin") || p.includes("mark-up") || p.includes("pricing") || p.includes("harga jual")) return "Penetapan Margin Keuntungan & Strategi Harga";
    if (p.includes("piutang") || p.includes("utang") || p.includes("supplier") || p.includes("pelanggan")) return "Pengelolaan Piutang Pelanggan & Utang Usaha";
    if (p.includes("stok opname") || p.includes("gudang") || p.includes("selisih fisik")) return "Manajemen Stok Opname & Rekonsiliasi Barang";
    if (p.includes("laba rugi") || p.includes("pendapatan") || p.includes("beban operasional")) return "Penyusunan Laporan Laba Rugi Sederhana";
    if (p.includes("arus kas") || p.includes("cash flow") || p.includes("boncos") || p.includes("likuiditas")) return "Pengendalian Arus Kas (Cash Flow Management)";
    if (p.includes("kredit") || p.includes("kur") || p.includes("ekspansi") || p.includes("kesehatan")) return "Analisis Kesehatan Finansial & Pengajuan Modal";

    // Fotografi Produk
    if (p.includes("cahaya") || p.includes("jendela") || p.includes("matahari") || p.includes("bayangan")) return "Pemanfaatan Pencahayaan Alami & Diffuser";
    if (p.includes("latar") || p.includes("background") || p.includes("alas")) return "Pemilihan Latar Belakang & Meja Foto Bersih";
    if (p.includes("rule of thirds") || p.includes("garis bantu") || p.includes("tiga kali tiga")) return "Komposisi Rule of Thirds & Grid Kamera";
    if (p.includes("flat lay") || p.includes("sudut") || p.includes("eye level")) return "Sudut Pengambilan Foto (Angle of View)";
    if (p.includes("zoom") || p.includes("tajam") || p.includes("fokus") || p.includes("resolusi")) return "Ketajaman Foto & Pembatasan Zoom Digital";
    if (p.includes("sunting") || p.includes("editing") || p.includes("terang") || p.includes("kontras")) return "Penyuntingan Dasar & Koreksi Warna Realistis";

    // Public Speaking
    if (p.includes("pembuka") || p.includes("tujuan") || p.includes("hook")) return "Teknik Pembukaan Presentasi yang Memikat";
    if (p.includes("poin utama") || p.includes("struktur") || p.includes("alur")) return "Penyusunan Struktur & Poin Kunci Presentasi";
    if (p.includes("penutup") || p.includes("ringkasan") || p.includes("ajakan")) return "Penutup Presentasi & Call to Action (CTA)";
    if (p.includes("gugup") || p.includes("napas") || p.includes("cemas") || p.includes("tenang")) return "Pengendalian Rasa Gugup & Olah Pernapasan";
    if (p.includes("kontak mata") || p.includes("bahasa tubuh") || p.includes("kepercayaan")) return "Kontak Mata & Bahasa Tubuh Profesional";
    if (p.includes("lupa") || p.includes("catatan") || p.includes("jeda") || p.includes("tanya jawab")) return "Manajemen Spontanitas & Sesi Tanya Jawab";

    // Microsoft Word
    if (p.includes("kop surat") || p.includes("instansi") || p.includes("alamat")) return "Format Kepala (Kop) Surat Resmi";
    if (p.includes("nomor surat") || p.includes("penomoran") || p.includes("lampiran") || p.includes("perihal")) return "Tata Naskah & Penomoran Surat Resmi";
    if (p.includes("kertas") || p.includes("a4") || p.includes("margin") || p.includes("ukuran")) return "Pengaturan Margin & Ukuran Kertas Resmi";
    if (p.includes("mail merge") || p.includes("massal") || p.includes("surat banyak")) return "Pemanfaatan Fitur Mail Merge untuk Surat Massal";
    if (p.includes("sumber data") || p.includes("daftar penerima") || p.includes("excel")) return "Integrasi Database Penerima ke Dokumen Word";

    if (activeModul?.judul && activeModul.judul.trim()) {
      return activeModul.judul.trim();
    }

    return `Materi Inti Bagian ${urutan}`;
  };

  // Ambil evaluasi pertanyaan dari percobaan atau quizResult (tanpa bocorkan kunci pada soal salah - BR-09)
  const getEvaluatedQuestions = (): EvaluatedQuestion[] => {
    // 1. Jika ada quizResult realtime (baru saja submit di sesi ini)
    if (quizResult?.feedback && quizResult.feedback.length > 0) {
      return quizResult.feedback;
    }

    const chosenAttempt = latestAttempt || firstAttempt;
    const localMod = ALL_COURSES.find((c) => c.slug === resolvedParams.slug)?.modul.find((m) => m.urutan === currentModulUrutan);
    const rawAnswers = (chosenAttempt?.jawaban as Record<string, string>) || answers || {};

    return soalList.map((soal, idx) => {
      const localSoal = localMod?.soal?.find((s) => s.urutan === soal.urutan || s.id === soal.id);
      const kunci = (soal.kunci_jawaban || localSoal?.kunci_jawaban || "").trim().toUpperCase();

      // Cari jawaban user via ID soal atau indeks pengerjaan
      const userChoice = (rawAnswers[soal.id] || Object.values(rawAnswers)[idx] || answers[soal.id] || "").trim().toUpperCase();

      // Cek apakah benar terhadap kunci
      const isBenar = Boolean(userChoice && kunci && userChoice === kunci);

      const keyUser = userChoice ? userChoice.toLowerCase() : "";
      const teksUser = keyUser
        ? (soal as any)[`pilihan_${keyUser}`] || userChoice
        : "Belum dijawab";
      const topic = getStudyTopic(soal.pertanyaan, soal.urutan);

      return {
        id: soal.id,
        urutan: soal.urutan,
        pertanyaan: soal.pertanyaan,
        pilihan_a: soal.pilihan_a,
        pilihan_b: soal.pilihan_b,
        pilihan_c: soal.pilihan_c,
        pilihan_d: soal.pilihan_d,
        jawaban_user: userChoice || "-",
        teks_user: teksUser,
        benar: isBenar,
        hint: isBenar
          ? `Jawaban Anda tepat! Pemahaman materi pada bab "${topic}" sudah sangat baik.`
          : `💡 Coba pelajari bab "${topic}" pada materi modul di atas untuk memahami konsep yang tepat.`,
      };
    });
  };

  // Aksi: Tandai materi sudah dibaca (BR-08)
  const handleMarkAsRead = async () => {
    if (!pendaftaran?.id || !activeModul) return;
    setMarkingRead(true);

    try {
      const { error } = await supabase
        .from("progres_modul")
        .upsert(
          {
            pendaftaran_id: pendaftaran.id,
            modul_id: activeModul.id,
            materi_dibaca_pada: new Date().toISOString(),
          },
          { onConflict: "pendaftaran_id, modul_id" }
        );

      if (error) {
        alert("Gagal memperbarui progres: " + error.message);
      } else {
        setProgresMap((prev) => ({
          ...prev,
          [activeModul.id]: {
            ...prev[activeModul.id],
            read: true,
          },
        }));
      }
    } finally {
      setMarkingRead(false);
    }
  };

  // Aksi: Unduh Lampiran PDF via Signed URL 60 Menit (PRD Bab 10.4)
  const handleDownloadPdf = async () => {
    if (!pendaftaran?.id || !activeModul?.id) return;
    setIsDownloadingPdf(true);
    try {
      const res = await fetch("/api/materi/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftaranId: pendaftaran.id,
          modulId: activeModul.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Gagal mengunduh materi: " + (data.error || "Akses ditolak"));
      } else if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Aksi: Submit Kuis ke Server (BR-09, BR-10, BR-11)
  const handleSubmitQuiz = async () => {
    // Mode Pratinjau Pengajar/Admin: Berikan evaluasi simulasi langsung tanpa database pendaftaran
    if (isStaffPreview && !pendaftaran?.id) {
      let correctCount = 0;
      const localMod = ALL_COURSES.find((c) => c.slug === resolvedParams.slug)?.modul.find((m) => m.urutan === currentModulUrutan);
      const feedback = soalList.map((s) => {
        const localSoal = localMod?.soal?.find((ls) => ls.urutan === s.urutan || ls.id === s.id);
        const kunci = (s.kunci_jawaban || localSoal?.kunci_jawaban || "").trim().toUpperCase();
        const userChoice = (answers[s.id] || "").trim().toUpperCase();
        const isBenar = Boolean(userChoice && kunci && userChoice === kunci);
        if (isBenar) correctCount++;
        const topic = getStudyTopic(s.pertanyaan, s.urutan);
        const keyUser = userChoice ? userChoice.toLowerCase() : "";
        const teksUser = keyUser ? (s as any)[`pilihan_${keyUser}`] || userChoice : "Belum dijawab";
        return {
          id: s.id,
          urutan: s.urutan,
          pertanyaan: s.pertanyaan,
          pilihan_a: s.pilihan_a,
          pilihan_b: s.pilihan_b,
          pilihan_c: s.pilihan_c,
          pilihan_d: s.pilihan_d,
          jawaban_user: userChoice || "-",
          teks_user: teksUser,
          benar: isBenar,
          hint: isBenar
            ? `Jawaban Anda tepat! Pemahaman materi pada bab "${topic}" sudah sangat baik.`
            : `💡 Coba pelajari bab "${topic}" pada materi modul di atas untuk memahami konsep yang tepat.`,
        };
      });

      const score = Math.floor((correctCount / soalList.length) * 100);
      setQuizResult({
        nilai: score,
        lulus: score >= (kursus?.nilai_lulus || 60),
        jumlah_benar: correctCount,
        jumlah_soal: soalList.length,
        nomor_percobaan: 1,
        feedback: feedback,
      });
      return;
    }

    if (!pendaftaran?.id || !activeModul) return;

    // Pastikan semua soal telah dijawab (BR-09)
    for (const soal of soalList) {
      if (!answers[soal.id]) {
        alert(`Harap jawab semua soal terlebih dahulu! Soal nomor ${soal.urutan} belum dipilih.`);
        return;
      }
    }

    setIsSubmittingQuiz(true);
    try {
      const res = await fetch("/api/kuis/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftaranId: pendaftaran.id,
          modulId: activeModul.id,
          jawaban: answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Error kuis: " + (data.error || "Gagal memproses kuis"));
      } else {
        setQuizResult(data);
        if (data.attempts && data.attempts.length > 0) {
          setAttempts(data.attempts);
        }

        // Refresh riwayat kuis & progres (data kuis tersimpan di DB Supabase)
        await loadCourseData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#58816D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Mempersiapkan Ruang Belajar...</p>
        </div>
      </div>
    );
  }

  // Jika bukan peserta terdaftar aktif DAN bukan staf/pengajar pratinjau (BR-08)
  const isEnrolledAndActive = pendaftaran && (pendaftaran.status === "aktif" || pendaftaran.status === "selesai");

  if (!isEnrolledAndActive && !isStaffPreview) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-zinc-200 text-center shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900">
              Akses Ruang Belajar Terbatas
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Materi kursus ini hanya bisa dibuka oleh peserta dengan pendaftaran <strong>aktif</strong> atau <strong>selesai</strong>.
            </p>
            {pendaftaran?.status === "menunggu_bayar" ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-3">
                <p>Status Anda saat ini adalah <strong>Menunggu Pembayaran</strong>.</p>
                <Link
                  href="/dashboard"
                  className="inline-block w-full py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Lihat Tagihan di Kursus Saya
                </Link>
              </div>
            ) : (
              <Link
                href={`/kursus/${resolvedParams.slug}`}
                className="inline-block w-full py-3 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs shadow-xs"
              >
                Daftar Kursus Sekarang
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f9f7] via-[#eef5f1] to-[#e6efe9] flex flex-col font-sans selection:bg-[#58816D]/20 selection:text-[#58816D] relative overflow-x-hidden">
      {/* Ambient background glows for rich glassmorphism refraction */}
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-emerald-400/20 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/4 -right-40 w-[650px] h-[650px] bg-[#58816D]/20 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed -bottom-40 left-1/3 w-[600px] h-[600px] bg-blue-400/15 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      {/* Top Learning Bar */}
      <header className="sticky top-0 z-40 bg-[#58816D] text-white border-b border-[#456655] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-colors shrink-0"
            title="Kembali ke Kursus Saya"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200/90 block truncate">
              {kursus?.judul}
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate">
              Modul {activeModul?.urutan}: {activeModul?.judul}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              isFocusMode
                ? "bg-amber-300 text-amber-950 font-black shadow-xs border border-amber-400"
                : "bg-white/15 hover:bg-white/25 text-white"
            }`}
            title={isFocusMode ? "Keluar dari Mode Fokus (Tampilkan Sidebar)" : "Aktifkan Mode Fokus Belajar"}
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFocusMode ? "Keluar Fokus" : "Mode Fokus"}</span>
          </button>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-black/20 text-emerald-100 border border-white/10 hidden sm:inline-block">
            Passing Grade: {kursus?.nilai_lulus}/100
          </span>
          <Link
            href={isStaffPreview ? (isAdminRole ? "/admin/dashboard" : "/instruktur/kursus") : "/peserta/dashboard"}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white text-[#58816D] hover:bg-emerald-50 transition-all shadow-xs"
          >
            {isStaffPreview ? (isAdminRole ? "Panel Admin" : "Kelola Kursus") : "Kursus Saya"}
          </Link>
        </div>
      </header>

      {/* Banner Mode Pratinjau Instruktur & Admin */}
      {isStaffPreview && (
        <div className="bg-amber-500 text-amber-950 px-4 sm:px-6 py-2 text-xs font-bold flex items-center justify-between border-b border-amber-600/30 z-30">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-950" />
            <span>Mode Pratinjau Pengajar — Anda dapat memeriksa materi bacaan, video YouTube, lampiran dokumen PDF, dan kuis kursus ini secara utuh.</span>
          </div>
          <Link
            href={isAdminRole ? "/admin/dashboard" : "/instruktur/kursus"}
            className="px-3 py-1 rounded-full bg-amber-950 text-white text-[11px] hover:bg-black transition-colors"
          >
            {isAdminRole ? "Ke Panel Admin" : "Ke Kelola Kursus"}
          </Link>
        </div>
      )}

      {/* Main Workspace Layout (Compact Vertical Spacing) */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-3 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Sidebar: Modules Navigation List (Disembunyikan saat Mode Fokus) */}
        {!isFocusMode && (
          <aside className="lg:col-span-4 space-y-4 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-extrabold text-[#1F382B] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-700" />
                  <span>Daftar Modul Belajar</span>
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Selesaikan modul secara berurutan
                </p>
              </div>

              <div className="space-y-2">
                {modulList.map((m) => {
                  const locked = isModuleLocked(m.urutan);
                  const isPassed = progresMap[m.id]?.passed;
                  const isCurrent = activeModul?.id === m.id;

                  return (
                    <button
                      key={m.id}
                      disabled={locked}
                      onClick={() => {
                        if (!locked) {
                          router.push(`/belajar/${resolvedParams.slug}/${m.urutan}`);
                        }
                      }}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? "bg-[#58816D] text-white shadow-md border border-[#456655]"
                          : locked
                          ? "bg-zinc-50 text-zinc-400 border border-zinc-100 cursor-not-allowed"
                          : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200/60 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? "bg-white/20 text-white border border-white/20"
                              : isPassed
                              ? "bg-emerald-100 text-emerald-700"
                              : locked
                              ? "bg-zinc-200 text-zinc-400"
                              : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : m.urutan}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${isCurrent ? "text-white" : "text-zinc-900"}`}>{m.judul}</span>
                          <span className={`text-[10px] block ${isCurrent ? "text-emerald-100/80" : "text-zinc-500"}`}>
                            {m.durasi_menit} Menit · Kuis PG
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {locked && <Lock className={`w-3.5 h-3.5 ${isCurrent ? "text-amber-300" : "text-zinc-400"}`} />}
                        {!locked && !isPassed && !isCurrent && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                        {isPassed && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCurrent ? "bg-white/20 text-emerald-100" : "text-emerald-600"
                          }`}>
                            Lulus
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Help Box */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Sertifikat Kelulusan</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Saat semua {modulList.length} modul dinyatakan lulus, pendaftaran otomatis berubah selesai dan nomor sertifikat resmi langsung terbit!
              </p>
            </div>
          </aside>
        )}

        {/* Right Area: Module Material OR Interactive Quiz */}
        <main className={`${isFocusMode ? "lg:col-span-12 max-w-4xl mx-auto w-full" : "lg:col-span-8"} space-y-6 order-1 lg:order-2 transition-all`}>
          
          {/* Locked Notice (Jika mencoba membuka modul terkunci - BR-08, TC-16) */}
          {currentModulIsLocked ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-zinc-200 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">
                Modul Ini Masih Terkunci
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                Anda wajib menyelesaikan membaca materi dan lulus kuis pada modul sebelumnya terlebih dahulu sebelum modul {activeModul?.urutan} terbuka.
              </p>
              <button
                onClick={() => router.push(`/belajar/${resolvedParams.slug}/${Math.max(1, currentModulUrutan - 1)}`)}
                className="px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white font-bold text-xs shadow-xs"
              >
                Kembali ke Modul Sebelumnya
              </button>
            </div>
          ) : (
            <>
              {/* Tab Switcher: Materi vs Kuis Evaluasi */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2 bg-zinc-200/80 p-1 rounded-2xl">
                  <button
                    onClick={() => setActiveTab("materi")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "materi"
                        ? "bg-white text-[#1F382B] shadow-xs"
                        : "text-zinc-600 hover:text-[#1F382B]"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Materi Modul</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("kuis")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "kuis"
                        ? "bg-white text-[#1F382B] shadow-xs"
                        : "text-zinc-600 hover:text-[#1F382B]"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Kuis Evaluasi</span>
                    {isCurrentModulPassed ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500 ml-1" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("diskusi")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "diskusi"
                        ? "bg-white text-[#1F382B] shadow-xs"
                        : "text-zinc-600 hover:text-[#1F382B]"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#58816D]" />
                    <span>Tanya Jawab & Diskusi</span>
                  </button>
                </div>

                <div className="text-xs text-zinc-500 hidden sm:block">
                  Durasi Modul: <strong>{activeModul?.durasi_menit} Menit</strong>
                </div>
              </div>

              {/* TAB 1: MATERI MODUL */}
              {activeTab === "materi" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs space-y-6">
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Materi Modul {activeModul?.urutan}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F382B]">
                      {activeModul?.judul}
                    </h2>
                  </div>

                  {/* Video Embed Player jika ada video_url */}
                  {activeModul?.video_url && (
                    <div className="rounded-2xl overflow-hidden bg-[#58816D] aspect-video border border-zinc-800 shadow-inner flex items-center justify-center relative">
                      <iframe
                        src={activeModul.video_url.replace("watch?v=", "embed/")}
                        title={activeModul.judul}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="prose prose-zinc max-w-none text-sm sm:text-base text-zinc-700 leading-relaxed bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                    <p>{activeModul?.isi_materi}</p>
                  </div>

                  {/* PDF Attachment Notice */}
                  {activeModul?.lampiran_path && (
                    <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-rose-600 shrink-0" />
                        <div>
                          <span className="font-bold text-zinc-900 block">Lampiran Dokumen Panduan Praktis</span>
                          <span className="text-[11px] text-zinc-500 font-mono truncate max-w-xs block">{activeModul.lampiran_path}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white text-zinc-600 border border-zinc-200 hidden sm:inline-block">
                          PDF 10 MB Maks
                        </span>
                        <button
                          onClick={handleDownloadPdf}
                          disabled={isDownloadingPdf}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#58816D] hover:bg-[#456655] text-white font-bold text-[11px] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                          title="Tautan sementara berlaku 60 menit"
                        >
                          <Download className={`w-3.5 h-3.5 ${isDownloadingPdf ? "animate-bounce" : ""}`} />
                          <span>{isDownloadingPdf ? "Membuat URL..." : "Unduh PDF"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tombol "Tandai materi sudah dibaca" (BR-08) */}
                  <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-zinc-500">
                      {isCurrentModulRead ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Materi modul ini telah ditandai selesai dibaca.
                        </span>
                      ) : (
                        <span>Wajib menekan tombol ini sebelum kuis bisa dikerjakan.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!isCurrentModulRead && (
                        <button
                          onClick={handleMarkAsRead}
                          disabled={markingRead}
                          className="px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          {markingRead ? "Menandai..." : "Tandai Materi Sudah Dibaca"}
                        </button>
                      )}

                      <button
                        onClick={() => setActiveTab("kuis")}
                        className="px-5 py-2.5 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <span>Lanjut ke Kuis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Kotak Pintas Diskusi Materi Modul */}
                  <div className="mt-4 p-4 rounded-2xl bg-[#58816D]/10 border border-[#58816D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-white text-[#58816D] shadow-2xs">
                        <MessageSquare className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-bold text-[#1F382B] block">Punya pertanyaan seputar materi modul ini?</span>
                        <span className="text-[11px] text-zinc-500">Tanyakan langsung ke instruktur dan diskusikan bersama rekan belajar.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("diskusi")}
                      className="px-4 py-2 rounded-full bg-white hover:bg-zinc-50 text-[#1F382B] font-bold text-xs border border-zinc-200 transition-colors shadow-2xs shrink-0 cursor-pointer"
                    >
                      Buka Forum Tanya Jawab &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: KUIS EVALUASI MODUL (GLASSMORPHISM STYLE) */}
              {activeTab === "kuis" && (
                <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-white/70 border border-white/80 shadow-[0_20px_60px_-15px_rgba(88,129,109,0.18)] p-5 sm:p-7 space-y-5">
                  {/* Ornamen Glassmorphism Ambient Glow */}
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[#58816D]/20 to-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-500/15 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Quiz Header Bar (Glassmorphic) */}
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/60">
                    <div>
                      <span className="text-[11px] font-extrabold text-[#58816D] uppercase tracking-wider block mb-0.5">
                        Evaluasi Pemahaman Materi
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#1F382B] tracking-tight">
                        Kuis Pilihan Ganda Modul {activeModul?.urutan}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      <div className="backdrop-blur-md bg-white/80 border border-white/90 px-3.5 py-1.5 rounded-full font-bold text-zinc-700 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Sisa Percobaan: <strong>{remainingAttempts} dari 3</strong></span>
                      </div>
                      {remainingAttempts > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsRetakingQuiz(true);
                            setAnswers({});
                            setQuizResult(null);
                          }}
                          className="backdrop-blur-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer transition-all transform hover:-translate-y-0.5 text-xs"
                          title="Ulangi pengerjaan kuis"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Ulangi Kuis</span>
                        </button>
                      ) : isCurrentModulPassed ? (
                        <span className="backdrop-blur-md bg-emerald-500/15 border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-emerald-800 font-extrabold shadow-sm flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Sudah Lulus
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Kuis Terkunci Jika Materi Belum Dibaca (BR-08) */}
                  {!isCurrentModulRead && (
                    <div className="relative z-10 p-6 rounded-3xl backdrop-blur-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs sm:text-sm space-y-3 text-center shadow-lg">
                      <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                      <p className="font-extrabold text-base text-amber-900">
                        Kuis Belum Terbuka
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
                        Anda harus menekan tombol <strong>&quot;Tandai materi sudah dibaca&quot;</strong> pada tab Materi Modul terlebih dahulu.
                      </p>
                      <button
                        onClick={() => setActiveTab("materi")}
                        className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Buka Tab Materi
                      </button>
                    </div>
                  )}

                  {/* Percobaan Habis (BR-10) */}
                  {isCurrentModulRead && remainingAttempts === 0 && !isCurrentModulPassed && (
                    <div className="relative z-10 p-6 rounded-3xl backdrop-blur-xl bg-rose-50/70 border border-rose-200/80 text-rose-950 text-xs sm:text-sm space-y-3 text-center shadow-lg">
                      <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                      <p className="font-extrabold text-base text-rose-900">
                        Batas Percobaan Habis
                      </p>
                      <p className="text-xs text-rose-800 leading-relaxed max-w-md mx-auto">
                        Anda telah menggunakan seluruh 3 kesempatan pengerjaan kuis pada modul ini dan belum mencapai nilai passing grade ({kursus?.nilai_lulus || 60}).
                      </p>
                    </div>
                  )}

                  {/* UNIFIED GLASSMORPHIC QUIZ VIEW */}
                  {isCurrentModulRead && (() => {
                    const hasAttemptHistory = attempts.length > 0 || quizResult !== null;
                    const evaluatedList = getEvaluatedQuestions();
                    const latestScore = quizResult?.nilai ?? latestAttempt?.nilai ?? firstScore ?? 0;
                    const latestCorrect = quizResult?.jumlah_benar ?? latestAttempt?.jumlah_benar ?? firstAttempt?.jumlah_benar ?? 0;
                    const isPassed = isCurrentModulPassed || quizResult?.lulus || (latestScore >= (kursus?.nilai_lulus || 60));

                    // Formulir Interaktif 5 Soal Kuis
                    const renderInteractiveQuizForm = () => (
                      <div className="space-y-4 pt-1">
                        <div className="space-y-4">
                          {soalList.map((soal) => (
                            <div
                              key={soal.id}
                              className="backdrop-blur-xl p-5 sm:p-6 rounded-3xl bg-white/70 border border-white/80 shadow-sm space-y-3 hover:border-white transition-all"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#58816D] to-[#456655] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                    {soal.urutan}
                                  </span>
                                  <p className="text-sm font-bold text-zinc-900 leading-snug pt-0.5">
                                    {soal.pertanyaan}
                                  </p>
                                </div>
                                {isStaffPreview && soal.kunci_jawaban && (
                                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black tracking-wide flex items-center gap-1 shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Kunci: {soal.kunci_jawaban}</span>
                                  </span>
                                )}
                              </div>

                              {/* Pilihan A s/d D */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {[
                                  { key: "A", text: soal.pilihan_a },
                                  { key: "B", text: soal.pilihan_b },
                                  { key: "C", text: soal.pilihan_c },
                                  { key: "D", text: soal.pilihan_d },
                                ].map((opt) => {
                                  const isSelected = answers[soal.id] === opt.key;
                                  const isKey = isStaffPreview && soal.kunci_jawaban === opt.key;
                                  return (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      onClick={() => setAnswers({ ...answers, [soal.id]: opt.key })}
                                      className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer ${
                                        isSelected
                                          ? "backdrop-blur-md bg-gradient-to-r from-[#58816D] to-[#456655] text-white border-[#344d40] shadow-md transform -translate-y-0.5"
                                          : isKey
                                          ? "backdrop-blur-md bg-emerald-50/90 text-emerald-950 border-emerald-300 shadow-2xs"
                                          : "backdrop-blur-md bg-white/80 hover:bg-white text-zinc-800 border-white/90 shadow-2xs hover:shadow-xs"
                                      }`}
                                    >
                                      <span
                                        className={`w-6 h-6 rounded-lg font-black text-[11px] flex items-center justify-center shrink-0 transition-all ${
                                          isSelected
                                            ? "bg-white/20 text-white shadow-xs"
                                            : isKey
                                            ? "bg-emerald-600 text-white"
                                            : "bg-zinc-100 text-zinc-700"
                                        }`}
                                      >
                                        {opt.key}
                                      </span>
                                      <span className="truncate flex-1">{opt.text}</span>
                                      {isKey && (
                                        <span className="shrink-0 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                          Kunci Benar
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tombol Kirim Jawaban Kuis */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs text-zinc-500 font-medium">
                            Semua {soalList.length} soal wajib dijawab sebelum dikirim.
                          </span>
                          <button
                            type="button"
                            onClick={handleSubmitQuiz}
                            disabled={isSubmittingQuiz}
                            className="px-7 py-3 rounded-full bg-gradient-to-r from-[#58816D] to-[#456655] hover:from-[#456655] hover:to-[#344d40] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50"
                          >
                            {isSubmittingQuiz ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Menilai Kuis di Server...</span>
                              </>
                            ) : (
                              <>
                                <span>Kirim Jawaban Kuis</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );

                    // Kasus 1: Pengerjaan Kuis Pertama Kali
                    if (!hasAttemptHistory) {
                      return (
                        <div className="relative z-10 space-y-4 pt-1">
                          <div className="p-4 rounded-2xl backdrop-blur-md bg-white/70 border border-white/80 flex items-center justify-between text-xs text-zinc-700 shadow-sm">
                            <span className="font-extrabold text-[#1F382B] flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-[#58816D]" />
                              Pengerjaan Kuis (Percobaan 1 dari 3)
                            </span>
                            <span className="font-bold text-zinc-500">
                              Passing Grade: {kursus?.nilai_lulus || 60}/100
                            </span>
                          </div>
                          {renderInteractiveQuizForm()}
                        </div>
                      );
                    }

                    // Kasus 2: Sudah Ada Riwayat (Termasuk saat klik "Ulangi Kuis", Skor Pertama & Terkini Tetap Ditampilkan)
                    return (
                      <div className="relative z-10 space-y-6 pt-1">
                        {/* 1. KARTU STATUS, 3 KARTU SKOR GLASS, & RIWAYAT PERCOBAAN */}
                        <div className="backdrop-blur-2xl bg-white/75 border border-white/80 rounded-3xl p-5 sm:p-6 shadow-xl text-center space-y-5">
                          {/* Status Badge Glass */}
                          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-extrabold text-xs sm:text-sm shadow-xs backdrop-blur-md border ${isPassed ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-900" : "bg-amber-500/15 border-amber-400/50 text-amber-900"}`}>
                            {isPassed ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>SELAMAT! ANDA TELAH LULUS KUIS MODUL {currentModulUrutan}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>BELUM MENCAPAI PASSING GRADE (MINIMAL {kursus?.nilai_lulus || 60})</span>
                              </>
                            )}
                          </div>

                          {/* Reward Point Banner saat Lulus */}
                          {isPassed && (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-950 font-black text-xs shadow-xs animate-in zoom-in-95">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>+{getPointSettings().poinKuisLulus} Poin Reward Ditambahkan ke Saldo Akun Anda!</span>
                              {latestScore === 100 && (
                                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase">
                                  +{getPointSettings().poinKuisSempurna} Bonus Sempurna
                                </span>
                              )}
                            </div>
                          )}

                          {/* Grid 3 Kartu Skor Glassmorphism */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto text-left">
                            {/* 1. KARTU SKOR PERTAMA (Highlighted Frosted Glass) */}
                            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-white/70 border-2 border-blue-400/50 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-blue-400/80 transition-all">
                              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1 whitespace-nowrap">
                                  🎯 Skor Pertama
                                </span>
                                <span className="backdrop-blur-md bg-blue-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0">
                                  Percobaan 1
                                </span>
                              </div>
                              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                                {firstScore !== null ? firstScore : (attempts[0]?.nilai ?? latestScore)}{" "}
                                <span className="text-sm font-normal text-zinc-500">/ 100</span>
                              </div>
                              <span className="text-xs text-blue-950 font-bold block mt-1 whitespace-nowrap">
                                Benar {firstAttempt?.jumlah_benar ?? attempts[0]?.jumlah_benar ?? latestCorrect} dari {soalList.length || 5} Soal
                              </span>
                              <span className="text-[10px] text-zinc-500 block mt-0.5">
                                Skor awal pengerjaan pertama Anda
                              </span>
                            </div>

                            {/* 2. KARTU SKOR TERKINI */}
                            <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-white/70 border border-emerald-400/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1 whitespace-nowrap">
                                  🔄 Skor Terkini
                                </span>
                                <span className="backdrop-blur-md bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0">
                                  Percobaan {quizResult?.nomor_percobaan ?? latestAttempt?.nomor_percobaan ?? attempts.length}
                                </span>
                              </div>
                              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-900 to-teal-900 bg-clip-text text-transparent tracking-tight">
                                {latestScore}{" "}
                                <span className="text-sm font-normal text-zinc-500">/ 100</span>
                              </div>
                              <span className="text-xs text-emerald-950 font-bold block mt-1 whitespace-nowrap">
                                Benar {latestCorrect} dari {soalList.length || 5} Soal
                              </span>
                              <span className="text-[10px] text-zinc-500 block mt-0.5">
                                Hasil pengerjaan terakhir Anda
                              </span>
                            </div>

                            {/* 3. KARTU PASSING GRADE */}
                            <div className="backdrop-blur-xl bg-gradient-to-br from-[#58816D]/15 via-[#58816D]/5 to-white/70 border border-[#58816D]/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#1F382B] whitespace-nowrap">
                                  Passing Grade
                                </span>
                                <span className={`backdrop-blur-md font-extrabold text-[9px] px-2 py-0.5 rounded-full text-white whitespace-nowrap shrink-0 ${isPassed ? "bg-emerald-600" : "bg-amber-600"}`}>
                                  {isPassed ? "LULUS" : "BELUM"}
                                </span>
                              </div>
                              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#1F382B] to-[#58816D] bg-clip-text text-transparent tracking-tight">
                                {kursus?.nilai_lulus || 60}{" "}
                                <span className="text-sm font-normal text-zinc-500">/ 100</span>
                              </div>
                              <span className="text-xs text-[#1F382B] font-bold block mt-1">
                                Minimal 3 dari 5 soal benar
                              </span>
                              <span className="text-[10px] text-zinc-500 block mt-0.5">
                                Syarat kelulusan sertifikasi
                              </span>
                            </div>
                          </div>

                          {/* Riwayat Seluruh Percobaan (Glass List) */}
                          {attempts.length > 0 && (
                            <div className="backdrop-blur-md bg-white/60 border border-white/80 p-4 sm:p-5 rounded-2xl max-w-3xl mx-auto text-left space-y-2 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-zinc-900 text-xs flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-[#58816D]" />
                                  <span>Riwayat Percobaan Kuis Modul {currentModulUrutan}:</span>
                                </span>
                                <span className="text-[11px] text-zinc-500 font-medium">
                                  {attempts.length} dari 3 kesempatan terpakai
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {attempts.map((att) => (
                                  <div
                                    key={att.nomor_percobaan}
                                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-xs backdrop-blur-xs transition-all ${
                                      att.nomor_percobaan === 1
                                        ? "bg-blue-50/80 border-blue-200/90 text-blue-950 font-semibold shadow-2xs"
                                        : "bg-white/70 border-white/90 text-zinc-800"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span
                                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-xs ${
                                          att.nomor_percobaan === 1
                                            ? "bg-blue-600 text-white"
                                            : "bg-zinc-200 text-zinc-800"
                                        }`}
                                      >
                                        #{att.nomor_percobaan}
                                      </span>
                                      <span>
                                        {att.nomor_percobaan === 1 ? (
                                          <strong>Percobaan 1 (Skor Pertama)</strong>
                                        ) : (
                                          `Percobaan ${att.nomor_percobaan}`
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-extrabold text-zinc-900">
                                        {att.nilai}/100 ({att.jumlah_benar}/{att.jumlah_soal} benar)
                                      </span>
                                      <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
                                          att.lulus
                                            ? "bg-emerald-500 text-white"
                                            : "bg-rose-500 text-white"
                                        }`}
                                      >
                                        {att.lulus ? "Lulus" : "Belum Lulus"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Glass (Saat tidak sedang retake) */}
                          {!isRetakingQuiz && (
                            <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                              {remainingAttempts > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRetakingQuiz(true);
                                    setAnswers({});
                                    setQuizResult(null);
                                  }}
                                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  <span>Ulangi Kuis (Percobaan {attempts.length + 1} dari 3)</span>
                                </button>
                              )}

                              {isPassed && currentModulUrutan < modulList.length && (
                                <button
                                  type="button"
                                  onClick={() => router.push(`/belajar/${resolvedParams.slug}/${currentModulUrutan + 1}`)}
                                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#58816D] to-[#456655] hover:from-[#456655] hover:to-[#344d40] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                                >
                                  <span>Lanjut ke Modul {currentModulUrutan + 1}</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}

                          {quizResult?.certificate_issued && (
                            <div className="p-4 rounded-2xl bg-white border border-emerald-300 text-xs text-emerald-900 font-bold space-y-1 mt-4">
                              <p>🎉 SELURUH MODUL KURSUS TELAH SELESAI!</p>
                              <p>Sertifikat resmi Anda telah terbit dengan nomor: <strong>{quizResult.nomor_sertifikat}</strong></p>
                              <Link href="/dashboard" className="underline text-emerald-700 block mt-1">
                                Buka Dashboard untuk melihat sertifikat
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* 2. MODE PENGERJAAN ULANG KUIS (Aktif saat klik Ulangi Kuis) */}
                        {isRetakingQuiz && (
                          <div className="space-y-4 pt-1">
                            <div className="flex items-center justify-between p-3.5 rounded-2xl backdrop-blur-md bg-amber-500/15 border border-amber-300/60 text-amber-950">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-700" />
                                <span className="font-extrabold text-xs sm:text-sm">
                                  Sedang Mengerjakan Kuis Ulang (Percobaan {attempts.length + 1} dari 3 Kesempatan)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsRetakingQuiz(false)}
                                className="text-xs text-amber-900 underline font-extrabold hover:text-amber-950 cursor-pointer"
                              >
                                Batal / Lihat Evaluasi Jawaban
                              </button>
                            </div>

                            {renderInteractiveQuizForm()}
                          </div>
                        )}

                        {/* 3. EVALUASI JAWABAN (Tampil saat TIDAK sedang kuis ulang) */}
                        {!isRetakingQuiz && (
                          <div className="space-y-4 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/60 pb-3">
                              <div>
                                <h3 className="text-base font-black text-[#1F382B] flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-[#58816D]" />
                                  <span>Evaluasi Jawaban ({latestCorrect}/{soalList.length || 5} Benar)</span>
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  Cermati petunjuk bab materi pada setiap soal yang belum tepat untuk menyempurnakan pemahaman Anda.
                                </p>
                              </div>
                              <span className="text-xs font-bold text-zinc-600">
                                Status: <strong className={isPassed ? "text-emerald-700" : "text-amber-700"}>{isPassed ? "Lulus Evaluasi" : "Belum Lulus"}</strong>
                              </span>
                            </div>

                            <div className="space-y-4">
                              {evaluatedList.map((item: EvaluatedQuestion) => (
                                <div
                                  key={item.id}
                                  className={`backdrop-blur-2xl rounded-3xl border-2 p-5 sm:p-6 shadow-lg transition-all relative overflow-hidden ${
                                    item.benar
                                      ? "bg-emerald-500/10 border-emerald-400/50 shadow-emerald-500/5"
                                      : "bg-rose-500/10 border-rose-400/50 shadow-rose-500/5"
                                  }`}
                                >
                                  {/* Glass highlight shimmer */}
                                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

                                  {/* Header Soal */}
                                  <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                                    <div className="flex items-start gap-3">
                                      <span
                                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                                          item.benar
                                            ? "bg-emerald-600 text-white"
                                            : "bg-rose-600 text-white"
                                        }`}
                                      >
                                        {item.urutan}
                                      </span>
                                      <p className="text-sm font-bold text-zinc-900 leading-snug pt-0.5">
                                        {item.pertanyaan}
                                      </p>
                                    </div>

                                    <div className="shrink-0">
                                      {item.benar ? (
                                        <span className="backdrop-blur-md px-3.5 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400/60 text-emerald-950 text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Jawaban Benar
                                        </span>
                                      ) : (
                                        <span className="backdrop-blur-md px-3.5 py-1.5 rounded-full bg-rose-500/25 border border-rose-400/60 text-rose-950 text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs">
                                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Jawaban Salah
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Pilihan Jawaban Peserta */}
                                  <div className="pt-1 relative z-10">
                                    <div
                                      className={`p-4 rounded-2xl border text-xs backdrop-blur-md font-medium shadow-xs ${
                                        item.benar
                                          ? "bg-white/70 border-emerald-300/60 text-emerald-950"
                                          : "bg-white/70 border-rose-300/60 text-rose-950"
                                      }`}
                                    >
                                      <span className="text-[10px] font-extrabold uppercase tracking-wider block text-zinc-500 mb-1">
                                        Pilihan Jawaban Anda:
                                      </span>
                                      <span className="font-bold text-sm block">
                                        ({item.jawaban_user || "-"}) {item.teks_user}
                                      </span>
                                      {!item.benar && (
                                        <span className="block mt-1.5 text-xs font-bold text-rose-700">
                                          ❌ Jawaban ini belum tepat.
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Petunjuk Belajar Mandiri Berdasarkan Bab */}
                                  <div
                                    className={`mt-3 p-4 rounded-2xl border text-xs leading-relaxed backdrop-blur-md relative z-10 ${
                                      item.benar
                                        ? "bg-emerald-500/10 border-emerald-300/50 text-emerald-950"
                                        : "bg-amber-500/15 border-amber-300/50 text-amber-950"
                                    }`}
                                  >
                                    <strong className="font-extrabold block mb-1 flex items-center gap-1.5">
                                      {item.benar ? "✅ Catatan Evaluasi:" : "💡 Rekomendasi Belajar:"}
                                    </strong>
                                    <span>{item.hint}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: DISKUSI & TANYA JAWAB MODUL (Q&A FORUM) */}
              {activeTab === "diskusi" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <ModuleDiscussionForum
                    modulId={activeModul?.id || `mod-${resolvedParams.slug}-${activeModul?.urutan || 1}`}
                    courseSlug={resolvedParams.slug}
                    modulUrutan={activeModul?.urutan || 1}
                    modulJudul={activeModul?.judul || "Materi Modul"}
                  />
                </div>
              )}

            </>
          )}

        </main>
      </div>

      {/* AI Learning Assistant (Tutor AI Pijar Aksara) */}
      <ModuleAiTutor
        modulJudul={activeModul?.judul || "Materi Modul"}
        modulMateri={activeModul?.isi_materi || ""}
        courseTitle={kursus?.judul || "Kursus Pijar Aksara"}
        courseSlug={resolvedParams.slug}
        modulUrutan={activeModul?.urutan || 1}
      />

    </div>
  );
}
