"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Compass, ShieldCheck, UserCheck, Menu, X, ArrowUpRight } from "lucide-react";

interface NavbarProps {
  onOpenAuth: (initialTab?: "login" | "register" | "demo") => void;
  onScrollToCatalog: () => void;
  onScrollToFeatures: () => void;
}

export function Navbar({ onOpenAuth, onScrollToCatalog, onScrollToFeatures }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white/90 backdrop-blur-md border border-zinc-200/80 shadow-xs rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-[#bef264]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-zinc-950 flex items-center gap-1">
              Pijar Aksara
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block animate-pulse"></span>
            </span>
            <span className="text-[10px] text-zinc-500 font-medium leading-none">Lembaga Kursus · Depok</span>
          </div>
        </Link>

        {/* Center Pill Nav Links (inspired by Vespa & Prospera) */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1 rounded-full border border-zinc-200/60">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-900 bg-white shadow-xs hover:text-black transition-all"
          >
            Beranda
          </button>
          <button
            onClick={onScrollToCatalog}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-white/60 transition-all flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            Katalog Kursus
          </button>
          <button
            onClick={onScrollToFeatures}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-white/60 transition-all"
          >
            Keunggulan
          </button>
          <button
            onClick={() => onOpenAuth("demo")}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 transition-all flex items-center gap-1 border border-emerald-200/60"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            Akun Uji (3 Peran)
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => onOpenAuth("login")}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-800 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all"
          >
            Masuk
          </button>
          <button
            onClick={() => onOpenAuth("register")}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-950 bg-[#bef264] hover:bg-[#a3e635] shadow-xs hover:shadow-sm transition-all flex items-center gap-1"
          >
            Daftar Sekarang
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full text-zinc-700 hover:bg-zinc-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 bg-white/95 backdrop-blur-lg rounded-3xl border border-zinc-200 shadow-xl space-y-3">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-semibold text-zinc-900 rounded-xl hover:bg-zinc-100"
            >
              Beranda
            </button>
            <button
              onClick={() => {
                onScrollToCatalog();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-medium text-zinc-700 rounded-xl hover:bg-zinc-100"
            >
              Katalog Kursus
            </button>
            <button
              onClick={() => {
                onScrollToFeatures();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-medium text-zinc-700 rounded-xl hover:bg-zinc-100"
            >
              Keunggulan
            </button>
            <button
              onClick={() => {
                onOpenAuth("demo");
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50 rounded-xl flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Coba Akun Uji Mentor (3 Peran)
            </button>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex gap-2">
            <button
              onClick={() => {
                onOpenAuth("login");
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs font-semibold rounded-full border border-zinc-300 text-zinc-800"
            >
              Masuk
            </button>
            <button
              onClick={() => {
                onOpenAuth("register");
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-xs font-semibold rounded-full bg-[#bef264] text-zinc-950"
            >
              Daftar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
