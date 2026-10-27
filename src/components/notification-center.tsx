"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  Award,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  X,
  CreditCard,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "success" | "warning" | "info" | "award" | "security";
  link?: string;
  isRead: boolean;
}

const DEFAULT_ENROLLMENTS: any[] = [];

interface NotificationCenterProps {
  enrollments?: any[];
}

export default function NotificationCenter({ enrollments = DEFAULT_ENROLLMENTS }: NotificationCenterProps) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userKey = currentUser ? `${currentUser.id}:${currentUser.nama}` : "";
  const enrollmentsKey = (enrollments || [])
    .map((e) => `${e.id || ""}-${e.status || ""}`)
    .join(",");

  useEffect(() => {
    if (!currentUser) {
      setNotifications((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const list: AppNotification[] = [];

    // 1. Notifikasi Login Berhasil
    list.push({
      id: "login-success",
      title: "Masuk Akun Berhasil",
      message: `Selamat datang kembali, ${currentUser.nama || "Peserta"}! Anda berhasil terhubung melalui sesi terverifikasi.`,
      time: "Baru saja",
      type: "security",
      isRead: false,
    });

    // 2. Notifikasi dari Pendaftaran Kursus yang Aktif
    (enrollments || []).forEach((e) => {
      if (e.status === "aktif") {
        list.push({
          id: `enroll-${e.id}`,
          title: "Akses Kursus Aktif",
          message: `Kursus "${e.kursus?.judul || "Pelatihan"}" siap dipelajari. Seluruh materi modul & kuis evaluasi telah terbuka.`,
          time: "Aktif",
          type: "success",
          link: `/belajar/${e.kursus?.slug || ""}/1`,
          isRead: false,
        });
      } else if (e.status === "menunggu_bayar") {
        list.push({
          id: `tagihan-${e.id}`,
          title: "Menunggu Pembayaran",
          message: `Tagihan kursus "${e.kursus?.judul}" sebesar Rp ${(e.nominal || 0).toLocaleString("id-ID")} menunggu pelunasan Mayar.`,
          time: "24 Jam",
          type: "warning",
          link: "/dashboard",
          isRead: false,
        });
      } else if (e.status === "selesai") {
        list.push({
          id: `sertifikat-${e.id}`,
          title: "Sertifikat Kelulusan Terbit",
          message: `Selamat! Anda telah lulus kursus "${e.kursus?.judul}". Sertifikat kompetensi resmi Anda sudah dapat diunduh.`,
          time: "Resmi",
          type: "award",
          link: `/sertifikat/${e.sertifikat?.nomor_sertifikat || e.id}`,
          isRead: false,
        });
      }
    });

    // 3. Notifikasi Pengingat Sistem
    list.push({
      id: "tips-kelulusan",
      title: "Standar Kelulusan",
      message: "Raih nilai kuis minimal 80% pada evaluasi akhir untuk menerbitkan sertifikat kompetensi ber-barcode resmi.",
      time: "Info",
      type: "info",
      isRead: true,
    });

    // Cek status read dari localStorage
    try {
      const readIds = JSON.parse(localStorage.getItem(`read_notifs_${currentUser.id}`) || "[]");
      const updated = list.map((n) => ({
        ...n,
        isRead: readIds.includes(n.id) || n.isRead,
      }));
      setNotifications(updated);
    } catch {
      setNotifications(list);
    }
  }, [userKey, enrollmentsKey]);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    const allIds = notifications.map((n) => n.id);
    try {
      localStorage.setItem(`read_notifs_${currentUser.id}`, JSON.stringify(allIds));
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "warning":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "award":
        return <Award className="w-4 h-4 text-indigo-600" />;
      case "security":
        return <ShieldCheck className="w-4 h-4 text-[#58816D]" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-600" />;
    }
  };

  const getBg = (type: AppNotification["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200/80";
      case "warning":
        return "bg-amber-50 border-amber-200/80";
      case "award":
        return "bg-indigo-50 border-indigo-200/80";
      case "security":
        return "bg-[#58816D]/10 border-[#58816D]/20";
      default:
        return "bg-sky-50 border-sky-200/80";
    }
  };

  return (
    <div className="relative" ref={dropdownRef} suppressHydrationWarning>
      {/* Trigger Button Bell */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-2xl border border-zinc-200 hover:border-[#58816D] bg-white/80 hover:bg-white text-zinc-700 transition-all cursor-pointer flex items-center justify-center shadow-2xs group"
        title="Pusat Notifikasi & Aktivitas Akun"
        aria-label="Notifikasi"
        suppressHydrationWarning
      >
        <Bell className="w-4 h-4 text-zinc-600 group-hover:text-[#58816D] transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-zinc-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/90">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#58816D]/15 text-[#58816D] flex items-center justify-center font-bold">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-extrabold text-xs text-[#1F382B]">Notifikasi Akun</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-[#58816D] hover:underline cursor-pointer"
              >
                Tandai Dibaca
              </button>
            )}
          </div>

          {/* List Item */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                Belum ada notifikasi aktivitas.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 hover:bg-zinc-50/80 transition-colors flex items-start gap-3 text-left ${
                    !n.isRead ? "bg-emerald-50/20" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getBg(
                      n.type
                    )}`}
                  >
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-zinc-900 truncate">{n.title}</span>
                      <span className="text-[10px] text-zinc-400 font-medium shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-snug">{n.message}</p>
                    {n.link && (
                      <div className="pt-1">
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#58816D] hover:underline"
                        >
                          <span>Buka Sekarang</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#58816D] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-zinc-50/70 border-t border-zinc-100 text-center">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-zinc-600 hover:text-[#1F382B]"
            >
              Lihat Seluruh Aktivitas di Dashboard &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
