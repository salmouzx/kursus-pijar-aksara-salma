"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, CheckCircle, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";
import { TEST_ACCOUNTS, TestAccount } from "@/data/test-accounts";

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: "login" | "register" | "demo";
  onClose: () => void;
  onSuccessLogin: (account: { nama: string; email: string; peran: string }) => void;
}

export function AuthModal({ isOpen, initialTab = "login", onClose, onSuccessLogin }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register" | "demo">(initialTab);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Sync tab when initialTab changes
  React.useEffect(() => {
    setTab(initialTab);
    setNotification(null);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleTestAccountSelect = (acc: TestAccount) => {
    setLoginEmail(acc.email);
    setLoginPassword(acc.kataSandi);
    setNotification(`Akun ${acc.badge} dipilih: ${acc.nama} (${acc.email})`);
    setTimeout(() => {
      onSuccessLogin({
        nama: acc.nama,
        email: acc.email,
        peran: acc.peran,
      });
      onClose();
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert("Harap isi email dan kata sandi.");
      return;
    }

    // Check if matched with test accounts
    const match = TEST_ACCOUNTS.find((a) => a.email.toLowerCase() === loginEmail.toLowerCase());
    const peran = match ? match.peran : "peserta";
    const nama = match ? match.nama : loginEmail.split("@")[0];

    setNotification(`Berhasil masuk sebagai ${nama} (${peran})`);
    setTimeout(() => {
      onSuccessLogin({ nama, email: loginEmail, peran });
      onClose();
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      alert("Semua kolom pendaftaran wajib diisi sesuai PRD Bab 7.");
      return;
    }

    setNotification(`Akun Peserta untuk ${registerName} berhasil didaftarkan!`);
    setTimeout(() => {
      onSuccessLogin({
        nama: registerName,
        email: registerEmail,
        peran: "peserta", // PRD: Akun baru selalu berperan Peserta
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-[32px] border border-zinc-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs (inspired by Vespa pill tabs) */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200/80">
            <button
              onClick={() => { setTab("login"); setNotification(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tab === "login" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setTab("register"); setNotification(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                tab === "register" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Daftar Peserta
            </button>
            <button
              onClick={() => { setTab("demo"); setNotification(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                tab === "demo" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:bg-emerald-100/50"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Akun Uji (3 Peran)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          
          {/* TAB 1: LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-zinc-950">Masuk ke LMS Pijar Aksara</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Masukkan email dan kata sandi akun Peserta, Instruktur, atau Admin Anda.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="contoh: lina.marlina@pijaraksara.test"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Kata sandi akun"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-zinc-950 hover:bg-zinc-800 text-white shadow-md transition-all mt-4 flex items-center justify-center gap-1.5"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTab("demo")}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold underline underline-offset-2"
                >
                  Gunakan Akun Uji Cepat (Admin / Instruktur / Peserta)
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER (PRD Bab 7: nama, email, nomor HP, kata sandi) */}
          {tab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-xl font-extrabold text-zinc-950">Daftar Akun Peserta Baru</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Akun baru otomatis terdaftar dengan peran <strong>Peserta</strong> (PRD Bab 3).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Nama lengkap sesuai KTP (untuk sertifikat)"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nomor WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="tel"
                    required
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full text-xs font-bold bg-[#bef264] hover:bg-[#a3e635] text-zinc-950 shadow-md transition-all mt-3 flex items-center justify-center gap-1.5"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: DEMO ACCOUNTS QUICK LOGIN */}
          {tab === "demo" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-extrabold text-zinc-950">Akun Uji Resmi (Capstone)</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Klik salah satu akun untuk langsung menguji sistem dengan peran dan batasan yang telah dikonfigurasi.
                </p>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {TEST_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleTestAccountSelect(acc)}
                    className="w-full text-left p-3.5 rounded-2xl border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-950">{acc.nama}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          acc.peran === "admin" 
                            ? "bg-purple-100 text-purple-900" 
                            : acc.peran === "instruktur"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-emerald-100 text-emerald-900"
                        }`}>
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{acc.email}</div>
                      <p className="text-[10px] text-zinc-400 mt-1">{acc.keterangan}</p>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-600">
                <strong>Password Semua Akun:</strong> <code className="font-mono text-zinc-900 font-bold">Latihan#2026</code>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
