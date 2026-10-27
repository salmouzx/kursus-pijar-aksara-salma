"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ContactSection } from "@/components/contact-section";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "@/components/footer";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function KontakPage() {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const handleOpenAuth = (tab: "login" | "register" = "login") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#58816D]/20 selection:text-[#58816D]">
      <Navbar onOpenAuth={handleOpenAuth} />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#1F382B] mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200/80 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Layanan Pelanggan & Konsultasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F382B] tracking-tight">
            Hubungi Pijar Aksara
          </h1>
          <p className="text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
            Kunjungi kampus kami di Margonda Raya Depok atau hubungi layanan konsultasi online melalui WhatsApp dan formulir pesan di bawah ini.
          </p>
        </div>

        <ContactSection />
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authTab}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={(acc) => {
          if (acc?.peran === "admin") {
            router.push("/admin/dashboard");
          } else if (acc?.peran === "instruktur") {
            router.push("/instruktur/kursus");
          } else {
            router.push("/peserta/dashboard");
          }
        }}
      />
    </div>
  );
}
