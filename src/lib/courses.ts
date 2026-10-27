import { supabase, getSupabaseAdmin } from "./supabase";
import { Kursus, Modul, Profile } from "@/types/database";
import { PUBLISHED_COURSES } from "@/data/courses";

export interface CourseDetailWithSyllabus extends Kursus {
  instruktur: Profile;
  modul: Pick<Modul, "id" | "urutan" | "judul" | "durasi_menit">[];
  sisa_kursi: number;
}

export interface CourseCatalogItem extends Kursus {
  instruktur: Profile;
  total_modul: number;
  total_durasi: number;
  sisa_kursi: number;
}

function applyStoredPriceOverride<T extends { id?: string; harga: number }>(course: T): T {
  if (typeof window !== "undefined" && course.id) {
    try {
      const overrides = JSON.parse(localStorage.getItem("admin_course_price_overrides") || "{}");
      if (overrides[course.id] !== undefined) {
        return { ...course, harga: Number(overrides[course.id]) };
      }
    } catch (e) {}
  }
  return course;
}

/**
 * Mengambil semua kursus berstatus 'terbit' untuk Katalog Publik (BR-01).
 * Kursus draf, ditinjau, dan ditutup otomatis diabaikan.
 */
export async function getPublishedCourses(): Promise<CourseCatalogItem[]> {
  try {
    const { data, error } = await supabase
      .from("kursus")
      .select(`
        *,
        instruktur:profiles!kursus_instruktur_id_fkey(id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada),
        modul(id, urutan, durasi_menit)
      `)
      .eq("status", "terbit")
      .order("dibuat_pada", { ascending: true });

    if (error || !data || data.length === 0) {
      return PUBLISHED_COURSES.map((c) =>
        applyStoredPriceOverride({
          ...c,
          instruktur: {
            id: c.instrukturId,
            nama_lengkap: c.instrukturNama,
            email: "instruktur@pijaraksara.test",
            no_hp: "08123456789",
            peran: "instruktur",
            aktif: true,
            dibuat_pada: new Date().toISOString(),
          },
          total_modul: c.modul.length,
          total_durasi: c.totalDurasiMenit,
          sisa_kursi: c.sisaKursi,
        })
      ) as unknown as CourseCatalogItem[];
    }

    // Hitung sisa kursi dan total durasi untuk tiap kursus
    const coursesWithMeta = await Promise.all(
      data.map(async (c: any) => {
        const { data: sisaKursi } = await supabase.rpc("hitung_sisa_kursi", {
          p_kursus_id: c.id,
        });

        const modulList = c.modul || [];
        const totalDurasi = modulList.reduce((acc: number, m: any) => acc + (m.durasi_menit || 0), 0);

        return {
          ...c,
          instruktur: c.instruktur,
          total_modul: modulList.length,
          total_durasi: totalDurasi,
          sisa_kursi: sisaKursi ?? Math.max(0, c.kuota),
        } as CourseCatalogItem;
      })
    );

    return coursesWithMeta.map((c) => applyStoredPriceOverride(c));
  } catch (err) {
    console.error("Unexpected error in getPublishedCourses:", err);
    return PUBLISHED_COURSES.map((c) =>
      applyStoredPriceOverride({
        ...c,
        instruktur: {
          id: c.instrukturId,
          nama_lengkap: c.instrukturNama,
          email: "instruktur@pijaraksara.test",
          no_hp: "08123456789",
          peran: "instruktur",
          aktif: true,
          dibuat_pada: new Date().toISOString(),
        },
        total_modul: c.modul.length,
        total_durasi: c.totalDurasiMenit,
        sisa_kursi: c.sisaKursi,
      })
    ) as unknown as CourseCatalogItem[];
  }
}

/**
 * Mengambil detail kursus berdasarkan slug untuk Halaman Publik /kursus/[slug] (BR-01, BR-06).
 * Jika kursus bukan 'terbit' atau tidak ditemukan, fungsi mengembalikan null (memicu 404).
 */
export async function getCourseBySlug(slug: string): Promise<CourseDetailWithSyllabus | null> {
  try {
    const { data: course, error } = await supabase
      .from("kursus")
      .select(`
        *,
        instruktur:profiles!kursus_instruktur_id_fkey(id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada),
        modul(id, urutan, judul, durasi_menit)
      `)
      .eq("slug", slug)
      .eq("status", "terbit")
      .single();

    if (error || !course) {
      const fallback = PUBLISHED_COURSES.find((c) => c.slug === slug);
      if (fallback) {
        return applyStoredPriceOverride({
          ...fallback,
          instruktur: {
            id: fallback.instrukturId,
            nama_lengkap: fallback.instrukturNama,
            email: "instruktur@pijaraksara.test",
            no_hp: "08123456789",
            peran: "instruktur",
            aktif: true,
            dibuat_pada: new Date().toISOString(),
          },
          modul: fallback.modul.map((m) => ({
            id: m.id,
            urutan: m.urutan,
            judul: m.judul,
            durasi_menit: m.durasiMenit,
          })),
          sisa_kursi: fallback.sisaKursi,
        } as unknown as CourseDetailWithSyllabus);
      }
      return null;
    }

    // Urutkan modul berdasarkan urutan asc
    const sortedModul = (course.modul || []).sort(
      (a: any, b: any) => a.urutan - b.urutan
    );

    // Dapatkan sisa kursi dinamis
    const { data: sisaKursi } = await supabase.rpc("hitung_sisa_kursi", {
      p_kursus_id: course.id,
    });

    return applyStoredPriceOverride({
      ...course,
      modul: sortedModul,
      sisa_kursi: sisaKursi ?? Math.max(0, course.kuota),
    } as CourseDetailWithSyllabus);
  } catch (err) {
    console.error("Error in getCourseBySlug:", err);
    const fallback = PUBLISHED_COURSES.find((c) => c.slug === slug);
    if (fallback) {
      return applyStoredPriceOverride({
        ...fallback,
        instruktur: {
          id: fallback.instrukturId,
          nama_lengkap: fallback.instrukturNama,
          email: "instruktur@pijaraksara.test",
          no_hp: "08123456789",
          peran: "instruktur",
          aktif: true,
          dibuat_pada: new Date().toISOString(),
        },
        modul: fallback.modul.map((m) => ({
          id: m.id,
          urutan: m.urutan,
          judul: m.judul,
          durasi_menit: m.durasiMenit,
        })),
        sisa_kursi: fallback.sisaKursi,
      } as unknown as CourseDetailWithSyllabus);
    }
    return null;
  }
}

