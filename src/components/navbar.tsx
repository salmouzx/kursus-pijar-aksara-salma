"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowUpRight, LogIn, LogOut, BookOpen, LayoutDashboard, Shield, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import NotificationCenter from "@/components/notification-center";

interface NavbarProps {
  onOpenAuth?: (initialTab?: "login" | "register") => void;
  onScrollToCourse?: () => void;
  onScrollToMentors?: () => void;
  onScrollToServices?: () => void;
  onScrollToTestimonials?: () => void;
  onScrollToContact?: () => void;
  currentUser?: { nama: string; email: string; peran: string } | null;
  onLogout?: () => void;
}

export function Navbar({
  onOpenAuth,
  onScrollToCourse,
  onScrollToMentors,
  onScrollToServices,
  onScrollToTestimonials,
  onScrollToContact,
  currentUser: propUser,
  onLogout: propLogout,
}: NavbarProps) {
  const { currentUser: authUser, logout: authLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = propUser || (authUser ? {
    nama: authUser.nama,
    email: authUser.email,
    peran: authUser.peran,
  } : null);

  const handleLogout = async () => {
    if (propLogout) {
      await propLogout();
    } else {
      await authLogout();
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const navItems = [
    {
      label: "Home",
      href: "/#home",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      label: "Course",
      href: "/#course",
      action: onScrollToCourse,
    },
    {
      label: "Mentor",
      href: "/#mentor",
      action: onScrollToMentors,
    },
    {
      label: "Services",
      href: "/#layanan",
      action: onScrollToServices,
    },
    {
      label: "Testimonials",
      href: "/#testimoni",
      action: onScrollToTestimonials,
    },
    {
      label: "Contact",
      href: "/#kontak",
      action: onScrollToContact,
    },
  ];

  const handleNavClick = (
    e: React.MouseEvent,
    item: { label: string; href: string; action?: () => void }
  ) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      if (item.action) {
        e.preventDefault();
        item.action();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/60 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-[#58816D] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-[#EBF3EF]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base sm:text-lg tracking-tight text-[#1F382B] leading-none">
              Pijar Aksara
            </span>
          </div>
        </Link>

        {/* Center Navigation Links: Home, Course, Mentor, Services, Testimonials, Contact */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-zinc-700">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className="px-3.5 py-2 rounded-full hover:bg-white/60 hover:text-[#1F382B] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Active User Session OR Trial Account / Log In / Sign Up */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            /* Unified Active Sesi Pill */
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-white/80 p-1.5 pr-2.5 rounded-full shadow-2xs">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${currentUser.peran === "admin"
                  ? "bg-purple-600 text-white"
                  : currentUser.peran === "instruktur"
                    ? "bg-[#58816D] text-white"
                    : "bg-[#58816D] text-white"
                  }`}
              >
                {currentUser.nama.charAt(0)}
              </div>

              <div className="flex flex-col text-left leading-tight hidden sm:flex">
                <span className="text-xs font-bold text-zinc-900 truncate max-w-[120px]">
                  {currentUser.nama}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  {currentUser.peran}
                </span>
              </div>

              <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block"></div>

              {/* Role specific quick action pill */}
              {currentUser.peran === "peserta" && (
                <Link
                  href="/peserta/dashboard"
                  className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#58816D] hover:bg-[#456655] transition-all flex items-center gap-1 shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              )}

              {currentUser.peran === "instruktur" && (
                <Link
                  href="/instruktur/kursus"
                  className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#58816D] hover:bg-[#456655] transition-all flex items-center gap-1 shadow-xs border border-[#456655]"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#EBF3EF]" />
                  <span>Kelola Kursus</span>
                </Link>
              )}

              {currentUser.peran === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[#58816D] hover:bg-[#456655] transition-all flex items-center gap-1 shadow-xs border border-[#456655]"
                >
                  <Shield className="w-3.5 h-3.5 text-[#EBF3EF]" />
                  <span>Panel Admin</span>
                </Link>
              )}

              <NotificationCenter />

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50/80 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Unlogged State: Log In + Sign Up */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth?.("login")}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-800 hover:bg-white/60 border border-transparent hover:border-white/80 transition-all flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-zinc-500" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuth?.("register")}
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#58816D] hover:bg-[#456655] shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sign Up</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-700 hover:bg-white/60 transition-colors border border-zinc-200/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer (Home, Course, Mentor, Services, Testimonials, Contact, Trial Account) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/60 glass-panel px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex flex-col gap-1 text-sm font-semibold text-zinc-800">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  handleNavClick(e, item);
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-xl hover:bg-white/60 flex items-center justify-between"
              >
                <span>{item.label}</span>
                {item.label === "Course" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Populer
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
