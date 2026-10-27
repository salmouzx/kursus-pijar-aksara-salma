"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesOrganicSection } from "@/components/features-organic-section";
import { CourseCatalogSection } from "@/components/course-catalog-section";
import { MentorsSection } from "@/components/mentors-section";
import { ServicesSection } from "@/components/services-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { ContactSection } from "@/components/contact-section";
import { CtaConversionSection } from "@/components/cta-conversion-section";
import { CourseDetailModal } from "@/components/course-detail-modal";
import { EnrollmentDialog } from "@/components/enrollment-dialog";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "@/components/footer";
import { Kursus } from "@/data/courses";

import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
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

  const handleScrollToCourse = () => {
    const el = document.getElementById("course");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToMentors = () => {
    const el = document.getElementById("mentor");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToServices = () => {
    const el = document.getElementById("layanan");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToTestimonials = () => {
    const el = document.getElementById("testimoni");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToContact = () => {
    const el = document.getElementById("kontak");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen glass-glow-bg flex flex-col selection:bg-[#58816D]/20 selection:text-[#1F382B] font-sans">

      {/* 1. HEADER (Home, Course, Mentor, Layanan, Testimoni, Kontak) */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onScrollToCourse={handleScrollToCourse}
        onScrollToMentors={handleScrollToMentors}
        onScrollToServices={handleScrollToServices}
        onScrollToTestimonials={handleScrollToTestimonials}
        onScrollToContact={handleScrollToContact}
        currentUser={currentUser}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1">

        {/* 2. HERO SECTION (id="home") */}
        <div id="home">
          <HeroSection
            onSelectCourse={handleSelectCourse}
            onOpenAuth={handleOpenAuth}
            onScrollToCatalog={handleScrollToCourse}
          />
        </div>

        {/* 3. 3 FEATURED TRACKS (Perkantoran, Desain, Keuangan UMKM) */}
        <FeaturesOrganicSection
          onSelectCourse={handleSelectCourse}
          onScrollToCatalog={handleScrollToCourse}
        />

        {/* 4. KATALOG COURSE PUBLIK (id="course") */}
        <CourseCatalogSection
          onSelectCourse={handleSelectCourse}
          onEnrollCourse={handleEnrollCourse}
        />

        {/* 5. MENTOR & INSTRUKTUR PRAKTISI (id="mentor") */}
        <MentorsSection />

        {/* 6. LAYANAN PELATIHAN & KONSULTASI (id="layanan") */}
        <ServicesSection />

        {/* 7. TESTIMONI ALUMNI TERVERIFIKASI (id="testimoni") */}
        <TestimonialsSection />

        {/* 8. CTA KONVERSI (Berada di atas Hubungi Tim) */}
        <CtaConversionSection
          onScrollToCatalog={handleScrollToCourse}
          onOpenAuth={handleOpenAuth}
        />

        {/* 9. KONTAK & KONSULTASI RESMI (id="kontak") */}
        <ContactSection />

      </main>

      {/* 10. FOOTER RESMI */}
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
          // Success callback
        }}
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
