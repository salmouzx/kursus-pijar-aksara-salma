"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CourseCatalogSection } from "@/components/course-catalog-section";
import { CourseDetailModal } from "@/components/course-detail-modal";
import { EnrollmentDialog } from "@/components/enrollment-dialog";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "@/components/footer";
import { Kursus } from "@/data/courses";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

export default function CoursePage() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Kursus | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [courseToEnroll, setCourseToEnroll] = useState<Kursus | null>(null);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const handleOpenAuth = (tab: "login" | "register" = "login") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const handleSelectCourse = (kursus: Kursus) => {
    setSelectedCourse(kursus);
    setIsDetailOpen(true);
  };

  const handleEnrollCourse = (kursus: Kursus) => {
    setCourseToEnroll(kursus);
    if (!currentUser) {
      handleOpenAuth("login");
    } else {
      setIsEnrollOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#58816D]/20 selection:text-[#58816D]">
      <Navbar
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
        onLogout={logout}
      />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#1F382B] mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1F382B] tracking-tight">
            Daftar Course Siap Kerja & Bisnis
          </h1>
          <p className="text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
            Kurikulum praktis berbasis studi kasus nyata. Pilih course yang sesuai kebutuhan Anda dan dapatkan sertifikat verifikasi digital unik.
          </p>
        </div>

        <CourseCatalogSection
          onSelectCourse={handleSelectCourse}
          onEnrollCourse={handleEnrollCourse}
        />
      </main>

      <Footer />

      <CourseDetailModal
        kursus={selectedCourse}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEnroll={handleEnrollCourse}
      />

      <EnrollmentDialog
        kursus={courseToEnroll}
        isOpen={isEnrollOpen}
        currentUser={currentUser}
        onClose={() => setIsEnrollOpen(false)}
        onSuccess={() => {}}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authTab}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={(acc) => {
          if (courseToEnroll) {
            setIsEnrollOpen(true);
          } else {
            if (acc?.peran === "admin") {
              router.push("/admin/dashboard");
            } else if (acc?.peran === "instruktur") {
              router.push("/instruktur/kursus");
            } else {
              router.push("/peserta/dashboard");
            }
          }
        }}
      />
    </div>
  );
}
