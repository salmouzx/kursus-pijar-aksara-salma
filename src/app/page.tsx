"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesOrganicSection } from "@/components/features-organic-section";
import { CourseCatalogSection } from "@/components/course-catalog-section";
import { CourseDetailModal } from "@/components/course-detail-modal";
import { EnrollmentDialog } from "@/components/enrollment-dialog";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "@/components/footer";
import { Kursus, PUBLISHED_COURSES } from "@/data/courses";
import { UserCheck, ShieldCheck, LogOut, ExternalLink, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [selectedCourse, setSelectedCourse] = useState<Kursus | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [courseToEnroll, setCourseToEnroll] = useState<Kursus | null>(null);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register" | "demo">("login");

  // Current active user simulation
  const [currentUser, setCurrentUser] = useState<{
    nama: string;
    email: string;
    peran: string;
  } | null>(null);

  const handleOpenAuth = (tab: "login" | "register" | "demo" = "login") => {
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
      // If not logged in, prompt auth first or open demo account
      handleOpenAuth("login");
    } else {
      setIsEnrollOpen(true);
    }
  };

  const handleScrollToCatalog = () => {
    const el = document.getElementById("katalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToFeatures = () => {
    const el = document.getElementById("keunggulan");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#bef264] selection:text-zinc-950 font-sans">
      
      {/* Top Banner when a user/role is active */}
      {currentUser && (
        <div className="w-full bg-zinc-950 text-white text-xs py-2 px-4 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse"></span>
              <span>Sesi Aktif:</span>
              <strong className="text-white">{currentUser.nama}</strong>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                currentUser.peran === "admin"
                  ? "bg-purple-600 text-white"
                  : currentUser.peran === "instruktur"
                  ? "bg-sky-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}>
                {currentUser.peran}
              </span>
              <span className="text-zinc-400 text-[11px] hidden sm:inline">({currentUser.email})</span>
            </div>

            <div className="flex items-center gap-3">
              {currentUser.peran === "admin" && (
                <span className="text-[#bef264] text-[11px] font-semibold hidden md:inline">
                  Hak Akses: Panel Admin, Konfirmasi Bayar, Kelola Peran, Audit Log (BR-12)
                </span>
              )}
              {currentUser.peran === "instruktur" && (
                <span className="text-sky-300 text-[11px] font-semibold hidden md:inline">
                  Hak Akses: Kelola Kursus & Modul Sendiri, Nilai Peserta Kursus Sendiri (BR-04, BR-12)
                </span>
              )}
              {currentUser.peran === "peserta" && (
                <span className="text-emerald-300 text-[11px] font-semibold hidden md:inline">
                  Hak Akses: Ruang Belajar, Kuis Modul, Sertifikat Digital (BR-08, BR-11)
                </span>
              )}
              
              <button
                onClick={() => setCurrentUser(null)}
                className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] underline"
              >
                <LogOut className="w-3 h-3" />
                <span>Ganti Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onScrollToCatalog={handleScrollToCatalog}
        onScrollToFeatures={handleScrollToFeatures}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* HERO SECTION (Fusion of download.jpeg squircle frame + download (1).jpeg content) */}
        <HeroSection
          onSelectCourse={handleSelectCourse}
          onOpenAuth={handleOpenAuth}
          onScrollToCatalog={handleScrollToCatalog}
        />

        {/* 3 FEATURED ORGANIC CARDS (download (1).jpeg style) */}
        <FeaturesOrganicSection
          onSelectCourse={handleSelectCourse}
          onScrollToCatalog={handleScrollToCatalog}
        />

        {/* PUBLIC COURSE CATALOG (PRD & Wireframe compliant: US-01, BR-01, BR-06) */}
        <CourseCatalogSection
          onSelectCourse={handleSelectCourse}
          onEnrollCourse={handleEnrollCourse}
        />

      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
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
        onSuccess={() => {
          // Trigger success notification or navigation
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authTab}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={(acc) => {
          setCurrentUser(acc);
          if (courseToEnroll) {
            setIsEnrollOpen(true);
          }
        }}
      />

    </div>
  );
}
