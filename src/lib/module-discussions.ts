/**
 * Modul Diskusi & Tanya Jawab Materi Modul (Q&A Forum)
 * Terhubung langsung ke API Database Supabase (/api/diskusi) dengan fallback offline/localStorage.
 */

export interface DiscussionAnswer {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  userRole: "peserta" | "instruktur" | "admin";
  userAvatar?: string;
  isOfficialAnswer: boolean;
  isi: string;
  createdAt: string;
}

export interface DiscussionItem {
  id: string;
  modulId: string;
  courseSlug: string;
  modulUrutan: number;
  userId: string;
  userName: string;
  userRole: "peserta" | "instruktur" | "admin";
  userAvatar?: string;
  judul: string;
  isi: string;
  createdAt: string;
  upvotes: number;
  jawaban: DiscussionAnswer[];
}

const STORAGE_KEY = "pijar_module_discussions_v1";

// Seed Diskusi Awal yang Bermanfaat & Otentik
export const INITIAL_DISCUSSIONS: DiscussionItem[] = [
  {
    id: "disc-ex1-01",
    modulId: "mod-excel-1",
    courseSlug: "excel-administrasi-perkantoran",
    modulUrutan: 1,
    userId: "user-lina-marlina",
    userName: "Lina Marlina",
    userRole: "peserta",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    judul: "Kapan sebaiknya pakai format sel Accounting daripada Currency?",
    isi: "Halo Pak Yudha, di modul 1 disebutkan format mata uang ada Accounting dan Currency. Untuk pembuatan laporan kas bulanan kantor lebih standar yang mana ya?",
    createdAt: "2026-10-21T09:15:00Z",
    upvotes: 6,
    jawaban: [
      {
        id: "ans-ex1-01",
        discussionId: "disc-ex1-01",
        userId: "00000000-0000-4000-a000-000000000011",
        userName: "Yudha Pratama",
        userRole: "instruktur",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        isOfficialAnswer: true,
        isi: "Halo Mbak Lina! Pertanyaan bagus sekali. Format Accounting selalu meratakan simbol Rupiah (Rp) di sisi paling kiri sel dan angka di sisi kanan, serta angka 0 ditampilkan sebagai tanda strip (-). Ini adalah standar baku audit keuangan agar angka ribuan dan desimal sejajar lurus ke bawah. Sedangkan format Currency menempelkan simbol Rp tepat di depan angka. Untuk laporan kantor resmi, disarankan selalu gunakan Accounting.",
        createdAt: "2026-10-21T10:00:00Z",
      },
    ],
  },
  {
    id: "disc-ex1-02",
    modulId: "mod-excel-1",
    courseSlug: "excel-administrasi-perkantoran",
    modulUrutan: 1,
    userId: "user-ahmad-fauzi",
    userName: "Ahmad Fauzi",
    userRole: "peserta",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    judul: "Shortcut cepat untuk memilih seluruh baris tanpa klik mouse",
    isi: "Apakah ada kombinasi tombol di keyboard untuk langsung memblok 1 baris penuh saat menyusun rekap data?",
    createdAt: "2026-10-22T14:30:00Z",
    upvotes: 4,
    jawaban: [
      {
        id: "ans-ex1-02",
        discussionId: "disc-ex1-02",
        userId: "00000000-0000-4000-a000-000000000011",
        userName: "Yudha Pratama",
        userRole: "instruktur",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        isOfficialAnswer: true,
        isi: "Gunakan kombinasi 'Shift + Spasi' untuk memblok 1 baris penuh, dan 'Ctrl + Spasi' untuk memblok 1 kolom penuh. Coba praktikkan, ini sangat menghemat waktu kerja harian!",
        createdAt: "2026-10-22T15:10:00Z",
      },
    ],
  },
  {
    id: "disc-canva1-01",
    modulId: "mod-canva-1",
    courseSlug: "desain-konten-media-sosial-dengan-canva",
    modulUrutan: 1,
    userId: "user-siti-aminah",
    userName: "Siti Aminah",
    userRole: "peserta",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    judul: "Ukuran ideal feed Instagram Carousel di Canva",
    isi: "Halo Bu Laras, untuk postingan produk di Instagram baiknya pakai rasio 1:1 (1080x1080) atau 4:5 (1080x1350)?",
    createdAt: "2026-10-23T11:20:00Z",
    upvotes: 8,
    jawaban: [
      {
        id: "ans-canva1-01",
        discussionId: "disc-canva1-01",
        userId: "00000000-0000-4000-a000-000000000012",
        userName: "Laras Wulandari",
        userRole: "instruktur",
        userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
        isOfficialAnswer: true,
        isi: "Sangat disarankan rasio 4:5 (1080 x 1350 px) Mbak Siti! Karena rasio potret 4:5 memakan layar HP pengguna lebih luas saat di-scroll di feed Instagram, sehingga impresi dan keterbacaan materi promosi meningkat drastis.",
        createdAt: "2026-10-23T12:00:00Z",
      },
    ],
  },
];

export function getAllDiscussions(): DiscussionItem[] {
  if (typeof window === "undefined") return INITIAL_DISCUSSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const existingIds = new Set(parsed.map((d: DiscussionItem) => d.id));
      const unmerged = INITIAL_DISCUSSIONS.filter((d) => !existingIds.has(d.id));
      return [...parsed, ...unmerged];
    }
  } catch (e) {
    console.warn("Gagal membaca discussions:", e);
  }
  return INITIAL_DISCUSSIONS;
}

export function getDiscussionsByModule(
  modulId: string,
  courseSlug?: string,
  modulUrutan?: number
): DiscussionItem[] {
  const all = getAllDiscussions();
  return all.filter((d) => {
    if (modulId && d.modulId === modulId) return true;
    if (courseSlug && d.courseSlug === courseSlug && modulUrutan && d.modulUrutan === modulUrutan) return true;
    return false;
  });
}

/**
 * Mengambil diskusi langsung dari Supabase Database via API Route
 */
export async function fetchDiscussionsFromDB(
  modulId: string,
  courseSlug?: string,
  modulUrutan?: number
): Promise<DiscussionItem[]> {
  try {
    const url = new URL("/api/diskusi", window.location.origin);
    if (modulId) url.searchParams.set("modulId", modulId);
    if (courseSlug) url.searchParams.set("courseSlug", courseSlug);
    if (modulUrutan) url.searchParams.set("modulUrutan", modulUrutan.toString());

    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.success && Array.isArray(data.discussions) && data.discussions.length > 0) {
      return data.discussions;
    }
  } catch (e) {
    console.warn("Gagal memanggil API diskusi, beralih ke fallback:", e);
  }
  return getDiscussionsByModule(modulId, courseSlug, modulUrutan);
}

/**
 * Menambahkan pertanyaan baru ke Supabase Database
 */
export async function createDiscussionQuestion(input: {
  modulId: string;
  courseSlug: string;
  modulUrutan: number;
  userId: string;
  userName: string;
  userRole?: "peserta" | "instruktur" | "admin";
  userAvatar?: string;
  judul: string;
  isi: string;
}): Promise<DiscussionItem> {
  const newItem: DiscussionItem = {
    id: "disc-" + Math.random().toString(36).substring(2, 9),
    modulId: input.modulId,
    courseSlug: input.courseSlug,
    modulUrutan: input.modulUrutan,
    userId: input.userId,
    userName: input.userName.trim(),
    userRole: input.userRole || "peserta",
    userAvatar: input.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(input.userName)}`,
    judul: input.judul.trim(),
    isi: input.isi.trim(),
    createdAt: new Date().toISOString(),
    upvotes: 0,
    jawaban: [],
  };

  // Simpan ke database Supabase
  try {
    fetch("/api/diskusi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_question",
        ...input,
      }),
    }).catch((e) => console.warn("Supabase insert async:", e));
  } catch (err) {}

  // Update juga LocalStorage untuk sinkronisasi offline seketika
  if (typeof window !== "undefined") {
    try {
      const all = getAllDiscussions();
      const updated = [newItem, ...all];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("discussion_updated", { detail: newItem }));
    } catch (e) {}
  }

  return newItem;
}

/**
 * Menambahkan balasan jawaban ke Supabase Database
 */
export async function createDiscussionAnswer(input: {
  discussionId: string;
  userId: string;
  userName: string;
  userRole?: "peserta" | "instruktur" | "admin";
  userAvatar?: string;
  isOfficialAnswer?: boolean;
  isi: string;
}): Promise<DiscussionAnswer> {
  const newAns: DiscussionAnswer = {
    id: "ans-" + Math.random().toString(36).substring(2, 9),
    discussionId: input.discussionId,
    userId: input.userId,
    userName: input.userName.trim(),
    userRole: input.userRole || "peserta",
    userAvatar: input.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(input.userName)}`,
    isOfficialAnswer: input.isOfficialAnswer ?? (input.userRole === "instruktur" || input.userRole === "admin"),
    isi: input.isi.trim(),
    createdAt: new Date().toISOString(),
  };

  // Simpan ke database Supabase
  try {
    fetch("/api/diskusi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_answer",
        ...input,
      }),
    }).catch((e) => console.warn("Supabase insert answer async:", e));
  } catch (err) {}

  // Update LocalStorage
  if (typeof window !== "undefined") {
    try {
      const all = getAllDiscussions();
      const target = all.find((d) => d.id === input.discussionId);
      if (target) {
        target.jawaban = [...target.jawaban, newAns];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        window.dispatchEvent(new CustomEvent("discussion_updated", { detail: target }));
      }
    } catch (e) {}
  }

  return newAns;
}

/**
 * Menambah jumlah upvote di Supabase Database
 */
export function toggleUpvoteDiscussion(discussionId: string): number {
  try {
    fetch("/api/diskusi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upvote", discussionId }),
    }).catch(() => {});
  } catch (e) {}

  if (typeof window !== "undefined") {
    try {
      const all = getAllDiscussions();
      const target = all.find((d) => d.id === discussionId);
      if (target) {
        target.upvotes += 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        window.dispatchEvent(new CustomEvent("discussion_updated", { detail: target }));
        return target.upvotes;
      }
    } catch (e) {}
  }
  return 0;
}
