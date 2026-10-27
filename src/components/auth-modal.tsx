"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  BellRing,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { validatePasswordRules, generate6DigitOtp } from "@/lib/auth-security";

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: "login" | "register";
  onClose: () => void;
  onSuccessLogin?: (account: { nama: string; email: string; peran: string }) => void;
}

// Google SVG Logo Component
function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthModal({
  isOpen,
  initialTab = "login",
  onClose,
  onSuccessLogin,
}: AuthModalProps) {
  const {
    login,
    register,
    loginWithGoogle,
    loginWithSimulatedGoogle,
    loginWithOtpVerified,
    resetPassword,
    currentUser,
  } = useAuth();

  const [tab, setTab] = useState<"login" | "register" | "otp" | "forgot">(initialTab || "login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form Register
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Form Reset Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "password">("email");

  // State OTP & Floating Push Notification
  const [otpData, setOtpData] = useState<{
    code: string;
    email: string;
    type: "register" | "login" | "reset";
    expiresAt: number;
    payload?: any;
  } | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(60);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [showFloatingOtp, setShowFloatingOtp] = useState(false);

  // Google Simulated Chooser Modal
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password rules validation for Register & Reset
  const registerPwdValidation = validatePasswordRules(registerPassword);
  const resetPwdValidation = validatePasswordRules(newPassword);

  // Sync tab when initialTab changes
  useEffect(() => {
    setTab(initialTab);
    setNotification(null);
    setErrorMsg(null);
  }, [initialTab, isOpen]);

  // Timer countdown untuk kirim ulang OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tab === "otp" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tab, otpTimer]);

  if (!isOpen) return null;

  // Trigger Kirim OTP + Tampilkan Floating Notification Melayang
  const triggerSendOtp = (
    email: string,
    type: "register" | "login" | "reset",
    payload?: any
  ) => {
    const code = generate6DigitOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 menit
    setOtpData({ code, email, type, expiresAt, payload });
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpTimer(60);
    setShowFloatingOtp(true);
    setTab("otp");
    setErrorMsg(null);

    // Otomatis fokus ke kotak OTP pertama setelah transisi
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 200);
  };

  // Salin Kode OTP dan Otomatis Isi Input
  const handleCopyAndAutofillOtp = () => {
    if (!otpData) return;
    navigator.clipboard?.writeText(otpData.code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);

    // Auto-fill ke 6 kotak
    const chars = otpData.code.split("");
    setOtpDigits(chars);
    otpInputRefs.current[5]?.focus();
  };

  // Handle Input Digit OTP
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, ""); // Hanya angka
    if (!cleanVal) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    // Jika pengguna paste kode lengkap di kotak mana pun
    if (cleanVal.length >= 6) {
      const pasteDigits = cleanVal.slice(0, 6).split("");
      setOtpDigits(pasteDigits);
      otpInputRefs.current[5]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = cleanVal[cleanVal.length - 1]; // ambil karakter terakhir
    setOtpDigits(next);

    // Pindah ke kotak berikutnya jika ada
    if (index < 5 && cleanVal) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verifikasi Kode OTP yang dimasukkan
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join("");
    if (enteredCode.length !== 6) {
      setErrorMsg("Harap masukkan 6 digit kode verifikasi lengkap.");
      return;
    }

    if (!otpData || enteredCode !== otpData.code) {
      setErrorMsg("Kode OTP yang Anda masukkan salah. Periksa kembali notifikasi pop-up.");
      return;
    }

    if (Date.now() > otpData.expiresAt) {
      setErrorMsg("Kode OTP telah kedaluwarsa. Silakan klik 'Kirim Ulang Kode'.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (otpData.type === "register") {
        // Pendaftaran selesai terverifikasi
        const p = otpData.payload;
        await register(p.nama, p.email, p.phone, p.password);
        await loginWithOtpVerified({
          email: p.email,
          nama: p.nama,
          no_hp: p.phone,
          peran: "peserta",
        });

        setShowFloatingOtp(false);
        setNotification(`Akun ${p.nama} berhasil diverifikasi & aktif!`);
        if (onSuccessLogin) {
          onSuccessLogin({
            nama: p.nama,
            email: p.email,
            peran: "peserta",
          });
        }
        setTimeout(() => onClose(), 800);
      } else if (otpData.type === "login") {
        // Login via OTP instan
        await loginWithOtpVerified({
          email: otpData.email,
          peran: "peserta",
        });

        setShowFloatingOtp(false);
        setNotification("Verifikasi OTP berhasil! Mengalihkan ke dashboard...");
        if (onSuccessLogin) {
          onSuccessLogin({
            nama: otpData.email.split("@")[0],
            email: otpData.email,
            peran: "peserta",
          });
        }
        setTimeout(() => onClose(), 800);
      } else if (otpData.type === "reset") {
        // Berpindah ke tahap input password baru
        setResetStep("password");
        setTab("forgot");
        setShowFloatingOtp(false);
        setNotification("Kode OTP terverifikasi! Silakan tentukan kata sandi baru.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses verifikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Handler dengan Simulasi Fallback Cerdas
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        // Jika provider Supabase Google OAuth belum aktif, buka akun chooser simulasi
        setShowGoogleChooser(true);
      }
    } catch (err) {
      setShowGoogleChooser(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSimulatedGoogle = async (googleUser: { email: string; nama: string }) => {
    setIsLoading(true);
    setShowGoogleChooser(false);
    await loginWithSimulatedGoogle(googleUser);
    setIsLoading(false);
    setNotification(`Masuk berhasil via Google sebagai ${googleUser.nama}!`);
    if (onSuccessLogin) {
      onSuccessLogin({
        nama: googleUser.nama,
        email: googleUser.email,
        peran: "peserta",
      });
    }
    setTimeout(() => onClose(), 800);
  };

  // Submit Login Email & Password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg("Harap isi email dan kata sandi.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setNotification(null);

    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (result.success) {
      setNotification("Berhasil masuk! Mengalihkan ke dashboard...");
      const targetUser = result.user || currentUser;
      const userPeran = targetUser?.peran || "peserta";
      const userNama = targetUser?.nama || loginEmail.split("@")[0];

      if (onSuccessLogin) {
        onSuccessLogin({
          nama: userNama,
          email: loginEmail,
          peran: userPeran,
        });
      } else {
        setTimeout(() => {
          if (userPeran === "admin") {
            window.location.href = "/admin/dashboard";
          } else if (userPeran === "instruktur") {
            window.location.href = "/instruktur/kursus";
          } else {
            window.location.href = "/peserta/dashboard";
          }
        }, 400);
      }
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMsg(result.error || "Email atau kata sandi tidak cocok.");
    }
  };

  // Submit Form Register (Mengecek Strict Password Rules & Memicu OTP)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      setErrorMsg("Semua kolom pendaftaran wajib diisi secara lengkap.");
      return;
    }

    // Validasi aturan kata sandi ketat (8-12 karakter, kapital, angka, simbol)
    if (!registerPwdValidation.isValid) {
      setErrorMsg("Kata sandi belum memenuhi 4 kriteria keamanan (8–12 karakter, huruf kapital, angka, & simbol).");
      return;
    }

    // Picu pengiriman OTP ke notifikasi pop-up
    triggerSendOtp(registerEmail, "register", {
      nama: registerName,
      email: registerEmail,
      phone: registerPhone,
      password: registerPassword,
    });
  };

  // Submit Reset Sandi Baru
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdValidation.isValid) {
      setErrorMsg("Kata sandi baru wajib memenuhi 4 kriteria keamanan (8–12 karakter, huruf kapital, angka, & simbol).");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    await resetPassword(forgotEmail, newPassword);
    setIsLoading(false);

    setNotification("Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.");
    setTab("login");
    setLoginEmail(forgotEmail);
    setLoginPassword(newPassword);
    setResetStep("email");
  };

  return (
    <>
      {/* FLOATING PUSH NOTIFICATION (Melayang di layar atas dengan animasi dan badge) */}
      {showFloatingOtp && otpData && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[92vw] max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className="glass-card bg-[#1F382B]/95 text-white p-4 rounded-2xl sm:rounded-3xl border border-[#58816D]/50 shadow-2xl backdrop-blur-xl flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#58816D] flex items-center justify-center shrink-0 shadow-md animate-bounce">
              <BellRing className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Notifikasi Kode OTP Resmi
                </span>
                <button
                  type="button"
                  onClick={() => setShowFloatingOtp(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-white/80 mt-0.5">
                Verifikasi untuk <strong className="text-white font-semibold">{otpData.email}</strong>:
              </p>

              {/* Tampilan Digit OTP Besar & Jelas */}
              <div className="my-2 py-1.5 px-3 bg-white/10 rounded-xl border border-white/20 flex items-center justify-between">
                <span className="font-mono text-xl sm:text-2xl font-black tracking-[0.3em] text-amber-300">
                  {otpData.code}
                </span>

                <button
                  type="button"
                  onClick={handleCopyAndAutofillOtp}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {copiedOtp ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-white" />
                      <span>Salin Otomatis</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-white/60">
                Berlaku 5 menit. Jangan bagikan kepada siapa pun.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* POPUP SIMULASI GOOGLE ACCOUNT CHOOSER (Jika Google OAuth belum terpasang di cloud) */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GoogleIcon className="w-5 h-5" />
                <span className="text-sm font-bold text-zinc-800">Masuk dengan Google</span>
              </div>
              <button
                onClick={() => setShowGoogleChooser(false)}
                className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Badge */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/90 text-amber-900 text-[11px] leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Mode Masuk Cepat Google</span>
              </div>
              <span>
                Provider Google di Supabase Dashboard belum diaktifkan. Anda dapat langsung memilih salah satu akun profil di bawah ini untuk pengujian instan:
              </span>
            </div>

            <div className="space-y-2">
              {[
                { nama: "Lina Marlina", email: "lina.marlina@gmail.com", avatar: "LM" },
                { nama: "Rizky Ramadhan", email: "rizky.ramadhan@gmail.com", avatar: "RR" },
                { nama: "Bagus Santoso", email: "bagus.santoso@gmail.com", avatar: "BS" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSelectSimulatedGoogle(acc)}
                  className="w-full p-2.5 rounded-2xl border border-zinc-200 hover:border-[#58816D] hover:bg-zinc-50 flex items-center gap-3 transition-all text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#58816D] group-hover:bg-[#1F382B] text-white text-xs font-bold flex items-center justify-center shrink-0 transition-colors">
                    {acc.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-zinc-900 truncate">{acc.nama}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{acc.email}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#58816D] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  const inputName = prompt("Masukkan nama akun Google Anda:", "Peserta Mandiri");
                  if (inputName) {
                    const inputEmail = prompt("Masukkan email Google Anda:", "peserta@gmail.com");
                    if (inputEmail) {
                      handleSelectSimulatedGoogle({ nama: inputName, email: inputEmail });
                    }
                  }
                }}
                className="w-full py-2 text-xs text-[#58816D] font-bold hover:underline text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <span>+ Ketik Nama & Email Google Sendiri</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UTAMA */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#58816D]/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-lg bg-white rounded-[32px] border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Tabs */}
          <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200/80 overflow-x-auto">
              <button
                onClick={() => {
                  setTab("login");
                  setNotification(null);
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  tab === "login"
                    ? "bg-white text-[#1F382B] shadow-xs"
                    : "text-zinc-600 hover:text-[#1F382B]"
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setTab("register");
                  setNotification(null);
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  tab === "register"
                    ? "bg-white text-[#1F382B] shadow-xs"
                    : "text-zinc-600 hover:text-[#1F382B]"
                }`}
              >
                Daftar Peserta
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Banners */}
          {notification && (
            <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-900 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Body Konten */}
          <div className="p-6 sm:p-8 overflow-y-auto">

            {/* ======================================================== */}
            {/* TAB 1: LOGIN (EMAIL + PASSWORD / GOOGLE / MASUK VIA OTP) */}
            {/* ======================================================== */}
            {tab === "login" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1F382B]">Masuk ke LMS Pijar Aksara</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Silakan masuk menggunakan akun terdaftar atau akun Google Anda.
                  </p>
                </div>

                {/* Tombol Masuk dengan Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer group"
                >
                  <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Lanjutkan dengan Google</span>
                </button>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-zinc-200" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    atau dengan email
                  </span>
                  <div className="flex-1 h-px bg-zinc-200" />
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Email Terdaftar</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="contoh: lina.marlina@pijaraksara.test"
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-zinc-700">Kata Sandi</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginEmail);
                          setTab("forgot");
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-[#58816D] hover:underline font-bold"
                      >
                        Lupa Sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Kata sandi akun"
                        className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#58816D] hover:bg-[#456655] text-white shadow-md transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Masuk Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!loginEmail) {
                          setErrorMsg("Harap masukkan email terlebih dahulu untuk menerima kode OTP.");
                          return;
                        }
                        triggerSendOtp(loginEmail, "login");
                      }}
                      className="text-xs text-[#58816D] hover:underline font-bold flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Masuk dengan Kode OTP</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: REGISTER (RULES 8-12 + KAPITAL + ANGKA + SIMBOL)  */}
            {/* ======================================================== */}
            {tab === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1F382B]">Daftar Akun Peserta Baru</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Dapatkan akses ke semua materi praktis & sertifikat berlisensi.
                  </p>
                </div>

                {/* Google Sign-up Shortcut */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2 px-4 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer group"
                >
                  <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Daftar Instan dengan Google</span>
                </button>

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-zinc-200" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    atau isi formulir
                  </span>
                  <div className="flex-1 h-px bg-zinc-200" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Nama Lengkap Sesuai KTP</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Contoh: Lina Marlina, S.Kom"
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Email Aktif</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">WhatsApp / No. HP</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                      />
                    </div>
                  </div>
                </div>

                {/* Input Kata Sandi dengan Aturan Ketat */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-zinc-700">Kata Sandi Baru</label>
                    {registerPassword && (
                      <span className={`text-[10px] font-bold ${registerPwdValidation.strengthColor}`}>
                        Kekuatan: {registerPwdValidation.strengthLabel}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="8–12 karakter, ada huruf besar, angka, simbol"
                      className="w-full pl-10 pr-10 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Rules Checklist Panel */}
                  <div className="mt-2.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                    {/* Strength Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          registerPwdValidation.score === 4
                            ? "w-full bg-[#58816D]"
                            : registerPwdValidation.score === 3
                            ? "w-3/4 bg-emerald-500"
                            : registerPwdValidation.score === 2
                            ? "w-2/4 bg-amber-500"
                            : registerPwdValidation.score === 1
                            ? "w-1/4 bg-rose-500"
                            : "w-0"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${registerPwdValidation.hasLength ? "text-emerald-700 font-bold" : "text-zinc-500"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${registerPwdValidation.hasLength ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                          ✓
                        </div>
                        <span>8 – 12 Karakter</span>
                      </div>

                      <div className={`flex items-center gap-1.5 ${registerPwdValidation.hasUppercase ? "text-emerald-700 font-bold" : "text-zinc-500"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${registerPwdValidation.hasUppercase ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                          ✓
                        </div>
                        <span>Huruf Kapital (A-Z)</span>
                      </div>

                      <div className={`flex items-center gap-1.5 ${registerPwdValidation.hasNumber ? "text-emerald-700 font-bold" : "text-zinc-500"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${registerPwdValidation.hasNumber ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                          ✓
                        </div>
                        <span>Angka Numerik (0-9)</span>
                      </div>

                      <div className={`flex items-center gap-1.5 ${registerPwdValidation.hasSymbol ? "text-emerald-700 font-bold" : "text-zinc-500"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${registerPwdValidation.hasSymbol ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                          ✓
                        </div>
                        <span>Simbol (!@#$...)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !registerPwdValidation.isValid}
                  className="w-full py-3 rounded-full text-xs font-bold bg-[#1F382B] hover:bg-[#162920] text-white shadow-md transition-all mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <KeyRound className="w-4 h-4 text-emerald-300" />
                  <span>Daftar & Kirim Kode OTP</span>
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* TAB 3: VERIFIKASI OTP 6 DIGIT INPUT BOX                   */}
            {/* ======================================================== */}
            {tab === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="w-7 h-7 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1F382B]">Masukkan Kode OTP</h3>
                    <p className="text-xs text-zinc-500">
                      Kode 6-digit telah dikirimkan ke notifikasi pop-up untuk <strong>{otpData?.email}</strong>.
                    </p>
                  </div>
                </div>

                {/* 6 Digit Segmented Input Boxes */}
                <div className="py-4">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono bg-zinc-50 border-2 border-zinc-200 focus:border-[#58816D] focus:bg-white rounded-2xl text-zinc-900 focus:outline-none shadow-xs transition-all"
                      />
                    ))}
                  </div>

                  {/* Tombol Salin Cepat jika notifikasi tertutup */}
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => setShowFloatingOtp(true)}
                      className="text-xs text-[#58816D] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Buka Ulang Notifikasi OTP Pop-up</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpDigits.join("").length !== 6}
                  className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#58816D] hover:bg-[#456655] text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verifikasi & Masuk</span>
                    </>
                  )}
                </button>

                {/* Timer Kirim Ulang */}
                <div className="text-center pt-2 text-xs text-zinc-500">
                  {otpTimer > 0 ? (
                    <span>Kirim ulang kode dalam <strong className="font-mono text-zinc-800">{otpTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => otpData && triggerSendOtp(otpData.email, otpData.type, otpData.payload)}
                      className="font-bold text-[#58816D] hover:underline flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kirim Ulang Kode OTP Sekarang</span>
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* TAB 4: LUPA SANDI / RESET PASSWORD                       */}
            {/* ======================================================== */}
            {tab === "forgot" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTab("login");
                      setResetStep("email");
                    }}
                    className="w-7 h-7 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1F382B]">Reset Kata Sandi Akun</h3>
                    <p className="text-xs text-zinc-500">
                      {resetStep === "email"
                        ? "Masukkan email akun Anda untuk menerima kode OTP verifikasi."
                        : "Tentukan kata sandi baru yang memenuhi 4 kriteria keamanan."}
                    </p>
                  </div>
                </div>

                {resetStep === "email" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!forgotEmail) {
                        setErrorMsg("Harap masukkan email.");
                        return;
                      }
                      triggerSendOtp(forgotEmail, "reset");
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Email Akun</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="email@domain.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full text-xs font-bold bg-[#58816D] hover:bg-[#456655] text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Kirim OTP Reset Sandi</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSaveNewPassword} className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-zinc-700">Kata Sandi Baru</label>
                        {newPassword && (
                          <span className={`text-[10px] font-bold ${resetPwdValidation.strengthColor}`}>
                            {resetPwdValidation.strengthLabel}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="8–12 karakter, ada huruf besar, angka, simbol"
                          className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Checklist Rules */}
                      <div className="mt-2.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                        <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              resetPwdValidation.score === 4
                                ? "w-full bg-[#58816D]"
                                : resetPwdValidation.score === 3
                                ? "w-3/4 bg-emerald-500"
                                : resetPwdValidation.score === 2
                                ? "w-2/4 bg-amber-500"
                                : resetPwdValidation.score === 1
                                ? "w-1/4 bg-rose-500"
                                : "w-0"
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <div className={`flex items-center gap-1.5 ${resetPwdValidation.hasLength ? "text-emerald-700 font-bold" : "text-zinc-500"}`}>
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${resetPwdValidation.hasLength ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                              ✓
                            </div>
                            <span>8 – 12 Karakter</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${resetPwdValidation.hasUppercase ? "text-emerald-700 font-bold" : "text-zinc-500"}`}>
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${resetPwdValidation.hasUppercase ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                              ✓
                            </div>
                            <span>Huruf Kapital (A-Z)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${resetPwdValidation.hasNumber ? "text-emerald-700 font-bold" : "text-zinc-500"}`}>
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${resetPwdValidation.hasNumber ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                              ✓
                            </div>
                            <span>Angka Numerik (0-9)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${resetPwdValidation.hasSymbol ? "text-emerald-700 font-bold" : "text-zinc-500"}`}>
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${resetPwdValidation.hasSymbol ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-400"}`}>
                              ✓
                            </div>
                            <span>Simbol (!@#$...)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !resetPwdValidation.isValid}
                      className="w-full py-3 rounded-full text-xs font-bold bg-[#1F382B] hover:bg-[#162920] text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Simpan Kata Sandi Baru</span>
                    </button>
                  </form>
                )}
              </div>
            )}



          </div>
        </div>
      </div>
    </>
  );
}
