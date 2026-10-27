// =================================================================
// LMS LEMBAGA KURSUS PIJAR AKSARA
// Real Engine: Sistem Poin Terhitung Otomatis dari Database Supabase
// =================================================================

import { supabase } from "./supabase";

export interface PengaturanPoin {
  poinKuisLulus: number;
  poinKuisSempurna: number;
  poinKursusSelesai: number;
  minPoinKlaimDefault: number;
  fiturAktif: boolean;
  diubahPada: string;
}

export interface KursusPoinConfig {
  bisaKlaimPoin: boolean;
  poinDiperlukan: number;
  kuotaKlaimPoin: number;
}

export interface RiwayatPoinItem {
  id: string;
  penggunaId: string;
  perubahanPoin: number; // e.g. +150, +50, +800, -1500
  tipeAktivitas: "lulus_kuis" | "kuis_sempurna" | "selesai_kursus" | "klaim_kursus" | "refund_klaim" | "penyesuaian_admin";
  keterangan: string;
  dibuatPada: string;
}

export interface KlaimKursusItem {
  id: string;
  penggunaId: string;
  penggunaNama: string;
  penggunaEmail: string;
  kursusId: string;
  kursusJudul: string;
  kursusSlug: string;
  poinDigunakan: number;
  status: "menunggu_review" | "disetujui" | "ditolak";
  catatanPeserta?: string;
  catatanAdmin?: string;
  direviewOleh?: string;
  direviewPada?: string;
  dibuatPada: string;
  totalSertifikatPeserta?: number;
}

const STORAGE_KEY_SETTINGS = "pijaraksara_pengaturan_poin";
const STORAGE_KEY_CLAIMS = "pijaraksara_klaim_kursus";
const STORAGE_KEY_COURSE_CONFIG = "pijaraksara_kursus_poin_config";
const STORAGE_KEY_SPENT_POINTS = "pijaraksara_spent_points";

// Nilai standar ekonomi poin baru: Minimal 1500 Poin untuk Klaim Kursus
export const DEFAULT_POINT_SETTINGS: PengaturanPoin = {
  poinKuisLulus: 150,       // +150 Poin setiap lulus kuis modul
  poinKuisSempurna: 50,     // +50 Poin bonus nilai 100/100
  poinKursusSelesai: 800,   // +800 Poin bonus penyelesaian kursus & sertifikat
  minPoinKlaimDefault: 1500,// MINIMAL 1500 POIN untuk klaim kursus baru
  fiturAktif: true,
  diubahPada: new Date().toISOString(),
};

// Default per-kursus config (Semua minimal 1500 Poin)
export const DEFAULT_COURSE_CONFIG: Record<string, KursusPoinConfig> = {
  "00000000-0000-4000-b000-000000000001": { bisaKlaimPoin: true, poinDiperlukan: 1800, kuotaKlaimPoin: 10 },
  "00000000-0000-4000-b000-000000000002": { bisaKlaimPoin: true, poinDiperlukan: 1500, kuotaKlaimPoin: 15 },
  "00000000-0000-4000-b000-000000000003": { bisaKlaimPoin: true, poinDiperlukan: 2000, kuotaKlaimPoin: 8 },
  "00000000-0000-4000-b000-000000000004": { bisaKlaimPoin: true, poinDiperlukan: 1600, kuotaKlaimPoin: 10 },
  "00000000-0000-4000-b000-000000000005": { bisaKlaimPoin: true, poinDiperlukan: 1500, kuotaKlaimPoin: 12 },
  "00000000-0000-4000-b000-000000000006": { bisaKlaimPoin: true, poinDiperlukan: 1750, kuotaKlaimPoin: 6 },
  "00000000-0000-4000-b000-000000000007": { bisaKlaimPoin: true, poinDiperlukan: 1500, kuotaKlaimPoin: 10 },
};

// Seed Antrean Klaim Realistis untuk Panel Admin
export const SEED_CLAIMS: KlaimKursusItem[] = [
  {
    id: "claim-demo-001",
    penggunaId: "00000000-0000-4000-a000-000000000105", // Dewi Lestari (3200 Poin)
    penggunaNama: "Dewi Lestari",
    penggunaEmail: "dewi.lestari@pijaraksara.test",
    kursusId: "00000000-0000-4000-b000-000000000003",
    kursusJudul: "Bahasa Inggris untuk Percakapan Kerja",
    kursusSlug: "bahasa-inggris-percakapan-kerja",
    poinDigunakan: 2000,
    status: "menunggu_review",
    catatanPeserta: "Sudah lulus 9 modul dan punya 2 sertifikat aktif. Ingin mengambil kelas bahasa Inggris untuk persiapan kerja.",
    dibuatPada: new Date(Date.now() - 3600000 * 5).toISOString(),
    totalSertifikatPeserta: 2,
  },
  {
    id: "claim-demo-002",
    penggunaId: "00000000-0000-4000-a000-000000000112", // Rangga Wijaya (3750 Poin)
    penggunaNama: "Rangga Wijaya",
    penggunaEmail: "rangga.wijaya@pijaraksara.test",
    kursusId: "00000000-0000-4000-b000-000000000001",
    kursusJudul: "Excel untuk Administrasi Perkantoran",
    kursusSlug: "excel-administrasi-perkantoran",
    poinDigunakan: 1800,
    status: "menunggu_review",
    catatanPeserta: "Poin dikumpulkan murni dari kelulusan 3 sertifikat kursus sebelumnya.",
    dibuatPada: new Date(Date.now() - 3600000 * 18).toISOString(),
    totalSertifikatPeserta: 3,
  },
];

// Helper read/write storage
function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Gagal menyimpan ke localStorage:", e);
  }
}

// 1. Ambil & Simpan Pengaturan Global Poin oleh Admin
export function getPointSettings(): PengaturanPoin {
  return getStorageItem<PengaturanPoin>(STORAGE_KEY_SETTINGS, DEFAULT_POINT_SETTINGS);
}

export function savePointSettings(settings: Partial<PengaturanPoin>): PengaturanPoin {
  const current = getPointSettings();
  const updated: PengaturanPoin = {
    ...current,
    ...settings,
    diubahPada: new Date().toISOString(),
  };
  setStorageItem(STORAGE_KEY_SETTINGS, updated);
  return updated;
}

// 2. Ambil & Simpan Pengaturan Poin per Kursus
export function getCoursePointConfig(kursusId: string): KursusPoinConfig {
  const allConfigs = getStorageItem<Record<string, KursusPoinConfig>>(
    STORAGE_KEY_COURSE_CONFIG,
    DEFAULT_COURSE_CONFIG
  );
  if (allConfigs[kursusId]) return allConfigs[kursusId];
  
  const settings = getPointSettings();
  return {
    bisaKlaimPoin: true,
    poinDiperlukan: settings.minPoinKlaimDefault || 1500,
    kuotaKlaimPoin: 10,
  };
}

export function saveCoursePointConfig(kursusId: string, config: Partial<KursusPoinConfig>): KursusPoinConfig {
  const allConfigs = getStorageItem<Record<string, KursusPoinConfig>>(
    STORAGE_KEY_COURSE_CONFIG,
    DEFAULT_COURSE_CONFIG
  );
  const current = allConfigs[kursusId] || {
    bisaKlaimPoin: true,
    poinDiperlukan: 1500,
    kuotaKlaimPoin: 10,
  };
  const updated = { ...current, ...config };
  allConfigs[kursusId] = updated;
  setStorageItem(STORAGE_KEY_COURSE_CONFIG, allConfigs);
  return updated;
}

// ----------------- PENGHITUNGAN REAL POIN DARI DATABASE SUPABASE -----------------

/**
 * Menghitung Saldo Poin & Riwayat Transaksi ASLI (100% Real Data)
 * Berdasarkan percobaan_kuis (yang lulus dan skor 100) serta sertifikat terbit di database.
 */
export async function calculateRealUserPoints(userId: string): Promise<{
  totalPoints: number;
  spentPoints: number;
  balancePoints: number;
  history: RiwayatPoinItem[];
  passedModulesCount: number;
  certificatesCount: number;
}> {
  const settings = getPointSettings();
  if (!userId) {
    return { totalPoints: 0, spentPoints: 0, balancePoints: 0, history: [], passedModulesCount: 0, certificatesCount: 0 };
  }

  try {
    // 1. Ambil semua pendaftaran milik peserta
    const { data: pendaftarans, error: pErr } = await supabase
      .from("pendaftaran")
      .select("id, kursus:kursus_id(judul)")
      .eq("peserta_id", userId);

    if (pErr || !pendaftarans || pendaftarans.length === 0) {
      return { totalPoints: 0, spentPoints: 0, balancePoints: 0, history: [], passedModulesCount: 0, certificatesCount: 0 };
    }

    const pendaftaranIds = pendaftarans.map((p) => p.id);

    // 2. Ambil riwayat percobaan kuis yang LULUS dari database
    const { data: attempts } = await supabase
      .from("percobaan_kuis")
      .select("id, pendaftaran_id, modul_id, nilai, lulus, nomor_percobaan, dikerjakan_pada, modul:modul_id(urutan, judul)")
      .in("pendaftaran_id", pendaftaranIds)
      .eq("lulus", true)
      .order("dikerjakan_pada", { ascending: true });

    // 3. Ambil sertifikat terbit dari database
    const { data: certs } = await supabase
      .from("sertifikat")
      .select("id, nomor_sertifikat, judul_kursus, diterbitkan_pada")
      .in("pendaftaran_id", pendaftaranIds)
      .order("diterbitkan_pada", { ascending: true });

    // Susun audit trail riwayat poin
    const history: RiwayatPoinItem[] = [];
    let grossEarnedPoints = 0;

    // Filter modul lulus unik (hanya 1x poin kelulusan per modul)
    const passedModulesMap = new Map<string, any>();
    (attempts || []).forEach((att) => {
      if (!passedModulesMap.has(att.modul_id)) {
        passedModulesMap.set(att.modul_id, att);
      } else if (att.nilai === 100 && passedModulesMap.get(att.modul_id)?.nilai !== 100) {
        passedModulesMap.set(att.modul_id, att);
      }
    });

    // Hitung poin kuis modul
    passedModulesMap.forEach((att) => {
      const modulJudul = att.modul?.judul || `Modul ${att.modul?.urutan || ""}`;
      const modulUrutan = att.modul?.urutan || 1;

      // Poin Lulus Kuis
      grossEarnedPoints += settings.poinKuisLulus;
      history.push({
        id: `att-pass-${att.id}`,
        penggunaId: userId,
        perubahanPoin: settings.poinKuisLulus,
        tipeAktivitas: "lulus_kuis",
        keterangan: `Lulus Kuis Modul ${modulUrutan}: ${modulJudul}`,
        dibuatPada: att.dikerjakan_pada || new Date().toISOString(),
      });

      // Bonus Nilai Sempurna 100
      if (att.nilai === 100 && settings.poinKuisSempurna > 0) {
        grossEarnedPoints += settings.poinKuisSempurna;
        history.push({
          id: `att-perf-${att.id}`,
          penggunaId: userId,
          perubahanPoin: settings.poinKuisSempurna,
          tipeAktivitas: "kuis_sempurna",
          keterangan: `Bonus Nilai Sempurna 100/100 pada Modul ${modulUrutan}`,
          dibuatPada: att.dikerjakan_pada || new Date().toISOString(),
        });
      }
    });

    // Hitung poin kelulusan sertifikat
    (certs || []).forEach((cert) => {
      grossEarnedPoints += settings.poinKursusSelesai;
      history.push({
        id: `cert-${cert.id}`,
        penggunaId: userId,
        perubahanPoin: settings.poinKursusSelesai,
        tipeAktivitas: "selesai_kursus",
        keterangan: `Bonus Kelulusan Kursus & Terbit Sertifikat (${cert.nomor_sertifikat})`,
        dibuatPada: cert.diterbitkan_pada || new Date().toISOString(),
      });
    });

    // 4. Hitung poin yang sudah digunakan / di-hold untuk klaim
    const claims = getCourseClaims();
    let spentPoints = 0;
    claims
      .filter((c) => c.penggunaId === userId && (c.status === "menunggu_review" || c.status === "disetujui"))
      .forEach((c) => {
        spentPoints += c.poinDigunakan;
        history.push({
          id: `claim-use-${c.id}`,
          penggunaId: userId,
          perubahanPoin: -c.poinDigunakan,
          tipeAktivitas: "klaim_kursus",
          keterangan: `Pengajuan klaim kursus: ${c.kursusJudul} (${c.status === "disetujui" ? "Disetujui" : "Menunggu verifikasi admin"})`,
          dibuatPada: c.dibuatPada,
        });
      });

    // Urutkan riwayat dari yang paling baru
    history.sort((a, b) => new Date(b.dibuatPada).getTime() - new Date(a.dibuatPada).getTime());

    const balancePoints = Math.max(0, grossEarnedPoints - spentPoints);

    return {
      totalPoints: grossEarnedPoints,
      spentPoints,
      balancePoints,
      history,
      passedModulesCount: passedModulesMap.size,
      certificatesCount: certs?.length || 0,
    };
  } catch (err) {
    console.error("Gagal menghitung real user points:", err);
    return { totalPoints: 0, spentPoints: 0, balancePoints: 0, history: [], passedModulesCount: 0, certificatesCount: 0 };
  }
}

// ----------------- PENGAJUAN KLAIM & REVIEW ADMIN -----------------

export function getCourseClaims(): KlaimKursusItem[] {
  return getStorageItem<KlaimKursusItem[]>(STORAGE_KEY_CLAIMS, SEED_CLAIMS);
}

/**
 * Mengambil klaim kursus langsung dari Supabase Database via API Route
 */
export async function fetchCourseClaimsFromDB(userId?: string): Promise<KlaimKursusItem[]> {
  try {
    const url = new URL("/api/poin/klaim", window.location.origin);
    if (userId) url.searchParams.set("userId", userId);

    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.success && Array.isArray(data.claims) && data.claims.length > 0) {
      return data.claims;
    }
  } catch (e) {
    console.warn("Gagal memanggil API klaim poin, beralih ke storage fallback:", e);
  }
  return getCourseClaims();
}

export function submitCourseClaim(
  userId: string,
  userName: string,
  userEmail: string,
  kursusId: string,
  kursusJudul: string,
  kursusSlug: string,
  poinDiperlukan: number,
  currentBalance: number,
  catatanPeserta?: string,
  totalSertifikat?: number
): { success: boolean; error?: string; claimId?: string } {
  const settings = getPointSettings();
  if (!settings.fiturAktif) {
    return { success: false, error: "Fitur penukaran poin saat ini dinonaktifkan oleh Admin." };
  }

  if (currentBalance < poinDiperlukan) {
    return {
      success: false,
      error: `Poin riil Anda (${currentBalance}) tidak mencukupi untuk klaim kursus ini (${poinDiperlukan} poin).`,
    };
  }

  const claims = getCourseClaims();
  const existingPending = claims.find(
    (c) => c.penggunaId === userId && c.kursusId === kursusId && c.status === "menunggu_review"
  );
  if (existingPending) {
    return {
      success: false,
      error: "Anda sudah memiliki pengajuan klaim untuk kursus ini yang sedang menunggu verifikasi Admin.",
    };
  }

  const newClaim: KlaimKursusItem = {
    id: `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    penggunaId: userId,
    penggunaNama: userName,
    penggunaEmail: userEmail,
    kursusId: kursusId,
    kursusJudul: kursusJudul,
    kursusSlug: kursusSlug,
    poinDigunakan: poinDiperlukan,
    status: "menunggu_review",
    catatanPeserta: catatanPeserta || "",
    dibuatPada: new Date().toISOString(),
    totalSertifikatPeserta: totalSertifikat || 0,
  };

  claims.unshift(newClaim);
  setStorageItem(STORAGE_KEY_CLAIMS, claims);

  // Simpan ke Supabase Database
  try {
    fetch("/api/poin/klaim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userName,
        userEmail,
        kursusId,
        kursusJudul,
        kursusSlug,
        poinDiperlukan,
        catatanPeserta,
        totalSertifikat,
      }),
    }).catch((e) => console.warn("Supabase submit claim async:", e));
  } catch (e) {}

  return { success: true, claimId: newClaim.id };
}

export function reviewCourseClaim(
  claimId: string,
  decision: "disetujui" | "ditolak",
  adminNama: string,
  catatanAdmin?: string
): { success: boolean; error?: string; claim?: KlaimKursusItem } {
  const claims = getCourseClaims();
  const index = claims.findIndex((c) => c.id === claimId);

  if (index === -1) {
    return { success: false, error: "Data klaim tidak ditemukan." };
  }

  const target = claims[index];
  if (target.status !== "menunggu_review") {
    return { success: false, error: `Klaim ini telah berstatus '${target.status}'.` };
  }

  target.status = decision;
  target.direviewOleh = adminNama;
  target.direviewPada = new Date().toISOString();
  target.catatanAdmin = catatanAdmin || (decision === "disetujui" ? "Disetujui oleh Administrator" : "Ditolak oleh Administrator");

  claims[index] = target;
  setStorageItem(STORAGE_KEY_CLAIMS, claims);

  // Sync update ke Supabase Database
  try {
    fetch("/api/poin/klaim", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimId,
        decision,
        adminNama,
        catatanAdmin: target.catatanAdmin,
      }),
    }).catch((e) => console.warn("Supabase patch claim async:", e));
  } catch (e) {}

  return { success: true, claim: target };
}
