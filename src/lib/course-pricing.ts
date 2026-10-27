/**
 * Modul Pengelolaan Harga & Diskon Kursus Pijar Aksara
 * Mendukung harga awal (coret), persentase diskon, live preview,
 * serta sinkronisasi instan ke Landing Page, Katalog, dan Checkout.
 */

export interface CourseDiscountInfo {
  courseId: string;
  hargaAwal: number;
  diskonPersen: number;
  hargaFinal: number;
  diubahPada: string;
}

const STORAGE_KEY = "admin_course_discounts_v2";

// Default diskon bawaan (untuk demo awal jika admin belum mengubah)
const DEFAULT_INITIAL_DISCOUNTS: Record<string, { hargaAwal: number; diskonPersen: number }> = {
  // Excel Administrasi: Harga normal 500k -> diskon 30% -> 350k
  "00000000-0000-4000-b000-000000000001": { hargaAwal: 500000, diskonPersen: 30 },
  // Canva: 100% Gratis (Normal 200k)
  "00000000-0000-4000-b000-000000000002": { hargaAwal: 200000, diskonPersen: 100 },
  // Bahasa Inggris: Normal 600k -> diskon 25% -> 450k
  "00000000-0000-4000-b000-000000000003": { hargaAwal: 600000, diskonPersen: 25 },
  // Pembukuan UMKM: Normal 400k -> diskon 25% -> 300k
  "00000000-0000-4000-b000-000000000004": { hargaAwal: 400000, diskonPersen: 25 },
  // Fotografi Produk: Normal 350k -> diskon 28% -> 250k
  "00000000-0000-4000-b000-000000000005": { hargaAwal: 350000, diskonPersen: 28 },
  // Public Speaking: Normal 500k -> diskon 20% -> 400k
  "00000000-0000-4000-b000-000000000006": { hargaAwal: 500000, diskonPersen: 20 },
  // Word Surat Dinas: Normal 250k -> diskon 20% -> 200k
  "00000000-0000-4000-b000-000000000007": { hargaAwal: 250000, diskonPersen: 20 },
};

/**
 * Mengambil semua data diskon kursus
 */
export function getAllDiscounts(): Record<string, CourseDiscountInfo> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Gagal membaca storage diskon:", e);
  }
  return {};
}

/**
 * Mengambil info harga & diskon untuk satu kursus tertentu
 * @param allowLocalStorage Hanya aktifkan setelah komponen ter-mount di client (menghindari hydration error)
 */
export function getCoursePriceInfo(
  courseId: string,
  baseHarga?: number,
  allowLocalStorage: boolean = false
): {
  hargaFinal: number;
  hargaAwal: number;
  diskonPersen: number;
  isDiscounted: boolean;
  isFree: boolean;
  hematNominal: number;
} {
  const currentFinal = baseHarga ?? 0;

  // 1. Cek diskon yang diubah oleh admin di localStorage HANYA jika allowLocalStorage = true
  // Mencegah Server/Client Hydration Mismatch di Next.js App Router
  if (allowLocalStorage && typeof window !== "undefined" && courseId) {
    try {
      const discounts = getAllDiscounts();
      if (discounts[courseId]) {
        const item = discounts[courseId];
        return {
          hargaFinal: item.hargaFinal,
          hargaAwal: item.hargaAwal,
          diskonPersen: item.diskonPersen,
          isDiscounted: item.diskonPersen > 0 && item.hargaAwal > item.hargaFinal,
          isFree: item.hargaFinal === 0,
          hematNominal: Math.max(0, item.hargaAwal - item.hargaFinal),
        };
      }
    } catch (e) {}
  }

  // 2. Default baseline discounts (konsisten SAMA persis antara SSR Server dan Client Hydration awal)
  if (courseId && DEFAULT_INITIAL_DISCOUNTS[courseId]) {
    const def = DEFAULT_INITIAL_DISCOUNTS[courseId];
    const hargaAwal = def.hargaAwal;
    const diskonPersen = def.diskonPersen;
    const calculatedFinal = Math.round(hargaAwal * (1 - diskonPersen / 100));
    return {
      hargaFinal: calculatedFinal,
      hargaAwal,
      diskonPersen,
      isDiscounted: diskonPersen > 0 && hargaAwal > calculatedFinal,
      isFree: calculatedFinal === 0,
      hematNominal: Math.max(0, hargaAwal - calculatedFinal),
    };
  }

  return {
    hargaFinal: currentFinal,
    hargaAwal: currentFinal,
    diskonPersen: 0,
    isDiscounted: false,
    isFree: currentFinal === 0,
    hematNominal: 0,
  };
}

/**
 * Menyimpan konfigurasi harga awal & diskon baru dari Admin
 */
export function saveCourseDiscount(
  courseId: string,
  hargaAwal: number,
  diskonPersen: number,
  hargaFinal?: number
): CourseDiscountInfo {
  const validHargaAwal = Math.max(0, Number(hargaAwal) || 0);
  const validDiskon = Math.min(100, Math.max(0, Number(diskonPersen) || 0));

  // Jika hargaFinal tidak ditentukan, hitung otomatis berdasarkan persen
  const calculatedFinal =
    hargaFinal !== undefined
      ? Math.max(0, Number(hargaFinal))
      : Math.round(validHargaAwal * (1 - validDiskon / 100));

  const info: CourseDiscountInfo = {
    courseId,
    hargaAwal: validHargaAwal,
    diskonPersen: validDiskon,
    hargaFinal: calculatedFinal,
    diubahPada: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const all = getAllDiscounts();
      all[courseId] = info;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

      // Juga sinkronkan override harga standar
      const priceOverrides = JSON.parse(
        localStorage.getItem("admin_course_price_overrides") || "{}"
      );
      priceOverrides[courseId] = calculatedFinal;
      localStorage.setItem(
        "admin_course_price_overrides",
        JSON.stringify(priceOverrides)
      );

      // Trigger custom storage event agar komponen lain update instan
      window.dispatchEvent(new Event("admin_price_updated"));
    } catch (e) {
      console.warn("Gagal menyimpan diskon:", e);
    }
  }

  return info;
}
