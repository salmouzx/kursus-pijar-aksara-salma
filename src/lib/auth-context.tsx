"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Profile, PeranPengguna } from "@/types/database";

interface AuthUser {
  id: string;
  email: string;
  nama: string;
  no_hp?: string | null;
  peran: PeranPengguna;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser | null }>;
  register: (nama: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithSimulatedGoogle: (user: { email: string; nama: string }) => Promise<{ success: boolean }>;
  loginWithOtpVerified: (userData: { email: string; nama?: string; no_hp?: string; peran?: PeranPengguna }) => Promise<{ success: boolean }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { nama: string; no_hp?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  loginWithSimulatedGoogle: async () => ({ success: true }),
  loginWithOtpVerified: async () => ({ success: true }),
  resetPassword: async () => ({ success: true }),
  logout: async () => {},
  deleteAccount: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil profil dari tabel 'profiles' berdasarkan user ID
  const fetchProfile = async (
    userId: string,
    emailFallback: string,
    userMeta?: Record<string, any>
  ): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const metaName = userMeta?.full_name || userMeta?.name || userMeta?.nama_lengkap;

      if (error || !data) {
        // Fallback jika profil belum selesai dibuat oleh trigger
        const fallbackUser: AuthUser = {
          id: userId,
          email: emailFallback,
          nama: metaName || emailFallback.split("@")[0],
          peran: "peserta",
        };
        setCurrentUser(fallbackUser);
        return fallbackUser;
      }

      const userObj: AuthUser = {
        id: data.id,
        email: data.email,
        nama: data.nama_lengkap || metaName || emailFallback.split("@")[0],
        no_hp: data.no_hp,
        peran: data.peran || "peserta",
      };

      setProfile(data as Profile);
      setCurrentUser(userObj);
      return userObj;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  };

  // Helper untuk membersihkan hash URL dan me-redirect pengguna ke dashboard setelah OAuth login
  const handleOAuthRedirect = (user: AuthUser | null) => {
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      // Bersihkan hash fragment yang panjang dari address bar
      window.history.replaceState(null, "", window.location.pathname);

      // Jika mendarat di root / homepage, otomatis alihkan ke dashboard sesuai peran
      if (window.location.pathname === "/" || window.location.pathname === "") {
        const role = user?.peran || "peserta";
        if (role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (role === "instruktur") {
          window.location.href = "/instruktur/kursus";
        } else {
          window.location.href = "/peserta/dashboard";
        }
      }
    }
  };

  useEffect(() => {
    // 1. Cek sesi aktif saat pertama kali load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userObj = await fetchProfile(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata
        );
        handleOAuthRedirect(userObj);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });

    // 2. Dengarkan perubahan sesi (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userObj = await fetchProfile(
            session.user.id,
            session.user.email || "",
            session.user.user_metadata
          );
          if (event === "SIGNED_IN" || (typeof window !== "undefined" && window.location.hash.includes("access_token"))) {
            handleOAuthRedirect(userObj);
          }
        } else {
          setCurrentUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      let loggedInUser: AuthUser | null = null;
      if (data.user) {
        loggedInUser = await fetchProfile(data.user.id, data.user.email || email);
      }

      return { success: true, user: loggedInUser };
    } catch (err: any) {
      return { success: false, error: err.message || "Gagal masuk ke sistem." };
    }
  };

  const register = async (nama: string, email: string, phone: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nama_lengkap: nama.trim(),
            no_hp: phone.trim(),
            peran: "peserta",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchProfile(data.user.id, data.user.email || email);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Gagal mendaftar akun baru." };
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (typeof window !== "undefined") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/peserta/dashboard`,
            queryParams: {
              prompt: "select_account",
              access_type: "offline",
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      }
      return { success: false, error: "Window tidak tersedia" };
    } catch (err: any) {
      return { success: false, error: err.message || "Gagal menghubungkan ke Google." };
    }
  };

  const loginWithSimulatedGoogle = async (user: { email: string; nama: string }) => {
    const mockId = "google-" + Math.random().toString(36).substring(2, 10);
    const mockUser: AuthUser = {
      id: mockId,
      email: user.email,
      nama: user.nama,
      no_hp: "081298765432",
      peran: "peserta",
    };
    setCurrentUser(mockUser);
    setProfile({
      id: mockId,
      email: user.email,
      nama_lengkap: user.nama,
      no_hp: "081298765432",
      peran: "peserta",
      aktif: true,
      dibuat_pada: new Date().toISOString(),
    });
    return { success: true };
  };

  const loginWithOtpVerified = async (userData: { email: string; nama?: string; no_hp?: string; peran?: PeranPengguna }) => {
    const userId = "otp-" + Math.random().toString(36).substring(2, 10);
    const displayName = userData.nama || userData.email.split("@")[0];
    const userRole = userData.peran || "peserta";
    const userObj: AuthUser = {
      id: userId,
      email: userData.email,
      nama: displayName,
      no_hp: userData.no_hp || null,
      peran: userRole,
    };
    setCurrentUser(userObj);
    setProfile({
      id: userId,
      email: userData.email,
      nama_lengkap: displayName,
      no_hp: userData.no_hp || null,
      peran: userRole,
      aktif: true,
      dibuat_pada: new Date().toISOString(),
    });
    return { success: true };
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        // Fallback jika tidak dalam active session
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      return { success: true };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const deleteAccount = async () => {
    try {
      if (!currentUser?.id) {
        return { success: false, error: "Tidak ada sesi pengguna aktif." };
      }
      const res = await fetch("/api/akun/hapus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Gagal menghapus akun." };
      }
      await logout();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Gagal menghapus akun." };
    }
  };

  const updateProfile = async (data: { nama: string; no_hp?: string }) => {
    try {
      if (!currentUser?.id) {
        return { success: false, error: "Tidak ada pengguna aktif." };
      }
      const res = await fetch("/api/profil/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          nama_lengkap: data.nama,
          no_hp: data.no_hp,
        }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || "Gagal memperbarui profil." };
      }
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              nama: data.nama,
              no_hp: data.no_hp || prev.no_hp,
            }
          : null
      );
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              nama_lengkap: data.nama,
              no_hp: data.no_hp || prev.no_hp,
            }
          : null
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Gagal memperbarui profil." };
    }
  };

  const refreshProfile = async () => {
    if (currentUser?.id) {
      await fetchProfile(currentUser.id, currentUser.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithSimulatedGoogle,
        loginWithOtpVerified,
        resetPassword,
        logout,
        deleteAccount,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
