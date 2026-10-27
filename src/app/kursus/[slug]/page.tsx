import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getCourseBySlug } from "@/lib/courses";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EnrollmentAction } from "./enrollment-action";
import { CourseReviewsSection } from "@/components/course-reviews-section";
import {
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Award,
  Sparkles,
  HelpCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Kursus Tidak Ditemukan - Pijar Aksara",
      description: "Halaman kursus yang Anda cari tidak tersedia atau belum diterbitkan.",
    };
  }

  return {
    title: `${course.judul} | Lembaga Kursus Pijar Aksara`,
    description: course.ringkasan,
    openGraph: {
      title: `${course.judul} - Pijar Aksara Depok`,
      description: course.ringkasan,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  // BR-01 & TC-02: Jika kursus tidak ada atau statusnya bukan 'terbit', lempar 404
  if (!course) {
    notFound();
  }

  const isFree = course.harga === 0;
  const totalDurasi = course.modul.reduce((sum, m) => sum + (m.durasi_menit || 0), 0);
  const isAlmostFull = course.sisa_kursi <= 2 && course.sisa_kursi > 0;
  const isFull = course.sisa_kursi === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DAE8FB]/30 via-white to-zinc-50/70 flex flex-col font-sans selection:bg-[#58816D]/20 selection:text-[#58816D]">
      <Navbar/>

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-[#0C0D45] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <span>/</span>
            <Link href="/#course" className="hover:text-[#0C0D45] transition-colors">
              Katalog Kursus
            </Link>
            <span>/</span>
            <span className="text-[#0C0D45] font-semibold truncate max-w-xs">{course.judul}</span>
          </nav>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Course Details & Syllabus */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Header Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#DAE8FB] text-[#0C0D45] text-xs font-semibold tracking-wide">
                    {course.kategori}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0C0D45] tracking-tight leading-tight mb-4">
                  {course.judul}
                </h1>

                <p className="text-base text-zinc-600 leading-relaxed mb-6">
                  {course.ringkasan}
                </p>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-6 border-t border-zinc-100 text-xs sm:text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-zinc-400" />
                    <span><strong>{course.modul.length}</strong> Modul Belajar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>Estimasi <strong>{totalDurasi}</strong> Menit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span>Kuota <strong>{course.kuota}</strong> Peserta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Passing Grade <strong>{course.nilai_lulus}</strong>/100</span>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs">
                <h2 className="text-lg sm:text-xl font-bold text-[#1F382B] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-700" />
                  <span>Tentang Kursus Ini</span>
                </h2>
                <div className="prose prose-zinc max-w-none text-sm sm:text-base text-zinc-600 leading-relaxed space-y-4">
                  <p>{course.deskripsi}</p>
                </div>

                {/* Key Benefits */}
                <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Materi Terstruktur Praktis</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-normal">
                      Disusun runtut per modul dengan durasi terukur dan studi kasus riil dunia kerja.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm mb-1">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Sertifikat Otomatis</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-normal">
                      Nomor unik resmi PA-2026-XXXX langsung terbit begitu semua modul berhasil lulus kuis.
                    </p>
                  </div>
                </div>
              </div>

              {/* Silabus Modul (Public only sees title and duration - PRD Section 7) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#1F382B] flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-zinc-700" />
                      <span>Silabus Kursus</span>
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {course.modul.length} modul berurutan · Kuis pilihan ganda di akhir setiap modul
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
                    Sistem Runtut
                  </span>
                </div>

                <div className="space-y-3">
                  {course.modul.map((m, index) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl border border-zinc-200/70 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-zinc-200/80 text-zinc-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {m.urutan}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-zinc-900 truncate">
                            {m.judul}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {m.durasi_menit} Menit
                            </span>
                            <span>•</span>
                            <span>Kuis Evaluasi</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Terkunci
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Aturan Belajar:</strong> Modul 1 langsung terbuka setelah Anda mendaftar. Modul berikutnya terbuka bertahap setelah kuis pada modul sebelumnya dinyatakan lulus.
                  </span>
                </div>
              </div>

              {/* Profil Instruktur */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0C0D45] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-[#0C0D45]/15">
                  {course.instruktur?.nama_lengkap?.substring(0, 2).toUpperCase() || "IP"}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Pengajar Kursus
                  </div>
                  <h3 className="text-base font-bold text-[#0C0D45]">
                    {course.instruktur?.nama_lengkap || "Instruktur Pijar Aksara"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Praktisi ahli di bidangnya · Lembaga Kursus Pijar Aksara Depok
                  </p>
                </div>
              </div>

              {/* Ulasan & Rating Bintang Peserta Terverifikasi */}
              <CourseReviewsSection
                courseId={course.id}
                courseJudul={course.judul}
              />

            </div>

            {/* Right Column: Sticky Pricing & Enrollment Card */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-sm">
                
                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Biaya Pendaftaran
                  </span>
                  <div className="flex items-baseline gap-2">
                    {isFree ? (
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#58816D] tracking-tight">
                        Gratis
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#0C0D45] tracking-tight">
                          Rp {course.harga.toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">/ peserta</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Seat Counter (BR-06) */}
                <div className="mb-6 p-4 rounded-2xl bg-[#DAE8FB]/20 border border-[#DAE8FB] space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-600">Sisa Kuota Kursi</span>
                    <span className={`font-bold ${
                      isFull ? "text-rose-600" : isAlmostFull ? "text-amber-600 font-extrabold" : "text-[#58816D]"
                    }`}>
                      {isFull ? "Penuh (0 Kursi)" : `Tersisa ${course.sisa_kursi} dari ${course.kuota}`}
                    </span>
                  </div>

                  {/* Visual Progress Bar of Seats */}
                  <div className="w-full h-2 rounded-full bg-zinc-200/80 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isFull
                          ? "bg-rose-500 w-full"
                          : isAlmostFull
                          ? "bg-amber-500"
                          : "bg-[#75CBD1]"
                      }`}
                      style={{
                        width: isFull ? "100%" : `${Math.min(100, Math.round(((course.kuota - course.sisa_kursi) / course.kuota) * 100))}%`
                      }}
                    />
                  </div>

                  {isAlmostFull && (
                    <p className="text-[11px] text-amber-700 font-semibold pt-1">
                      ⚠️ Kursi hampir habis! Segera amankan pendaftaran Anda.
                    </p>
                  )}
                </div>

                {/* Enrollment Action (Client Component) */}
                <EnrollmentAction
                  kursus={{
                    id: course.id,
                    judul: course.judul,
                    slug: course.slug,
                    harga: course.harga,
                    kuota: course.kuota,
                    kategori: course.kategori,
                    sisa_kursi: course.sisa_kursi,
                    instruktur_id: course.instruktur_id || course.instruktur?.id,
                  }}
                />

              </div>

              {/* Security & Support Guarantee */}
              <div className="p-4 rounded-2xl bg-zinc-100/70 border border-zinc-200/60 text-xs text-zinc-500 flex items-center justify-between">
                <span>Butuh bantuan atau tanya kelas?</span>
                <Link href="/kontak" className="text-zinc-900 font-bold hover:underline">
                  Hubungi Admin
                </Link>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
