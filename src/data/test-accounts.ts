export interface TestAccount {
  nama: string;
  email: string;
  peran: "admin" | "instruktur" | "peserta";
  kataSandi: string;
  keterangan: string;
  badge: string;
}

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    nama: "Ratna Kusumawati",
    email: "ratna@pijaraksara.test",
    peran: "admin",
    kataSandi: "Latihan#2026",
    keterangan: "Admin Utama (Kelola course, pembayaran, peran, dashboard)",
    badge: "Admin",
  },
  {
    nama: "Yudha Pratama",
    email: "yudha@pijaraksara.test",
    peran: "instruktur",
    kataSandi: "Latihan#2026",
    keterangan: "Instruktur Pemilik Excel, Dasar Pembukuan & Word",
    badge: "Instruktur",
  },
  {
    nama: "Lina Marlina",
    email: "lina.marlina@pijaraksara.test",
    peran: "peserta",
    kataSandi: "Latihan#2026",
    keterangan: "Peserta Aktif Excel (Sisa 1 percobaan kuis di modul 2)",
    badge: "Peserta (Kasus Batas)",
  },
  {
    nama: "Bagus Santoso",
    email: "bagus.santoso@pijaraksara.test",
    peran: "peserta",
    kataSandi: "Latihan#2026",
    keterangan: "Peserta Baru (Untuk uji mendaftar kursi terakhir Pembukuan)",
    badge: "Peserta Baru",
  },
  {
    nama: "Rizky Ramadhan",
    email: "rizky.ramadhan@pijaraksara.test",
    peran: "peserta",
    kataSandi: "Latihan#2026",
    keterangan: "Peserta Bahasa Inggris (Percobaan kuis habis 3x)",
    badge: "Peserta (Limit Kuis)",
  },
];
