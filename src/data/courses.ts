export interface Modul {
  id: string;
  urutan: number;
  judul: string;
  durasiMenit: number;
  isiMateri: string;
  soalCount: number;
  hasPdf: boolean;
}

export interface Kursus {
  id: string;
  judul: string;
  slug: string;
  kategori: "Perkantoran" | "Desain" | "Bahasa" | "Keuangan" | "Pengembangan Diri";
  ringkasan: string;
  deskripsi: string;
  harga: number; // 0 = Gratis
  kuota: number;
  terpakai: number;
  sisaKursi: number;
  nilaiLulus: number;
  status: "terbit" | "ditinjau" | "ditutup" | "draf";
  instrukturNama: string;
  instrukturGelar: string;
  instrukturAvatar: string;
  totalDurasiMenit: number;
  image: string;
  highlightTag?: string;
  modul: Modul[];
}

export const PUBLISHED_COURSES: Kursus[] = [
  {
    id: "00000000-0000-4000-b000-000000000001",
    judul: "Excel untuk Administrasi Perkantoran",
    slug: "excel-administrasi-perkantoran",
    kategori: "Perkantoran",
    ringkasan: "Kuasai Excel untuk rekap data, rumus dasar, dan laporan bulanan kantor.",
    deskripsi: "Kursus praktik Excel intensif untuk staf administrasi dan sekretariat. Peserta belajar mengatur lembar kerja profesional, memanfaatkan rumus dasar dan logika (SUM, AVERAGE, IF), serta menyusun laporan visual interaktif dengan tabel pivot dan grafik perkantoran.",
    harga: 350000,
    kuota: 25,
    terpakai: 13,
    sisaKursi: 12,
    nilaiLulus: 70,
    status: "terbit",
    instrukturNama: "Yudha Pratama",
    instrukturGelar: "Senior Office Specialist",
    instrukturAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    totalDurasiMenit: 155,
    image: "/images/card_perkantoran.jpg",
    highlightTag: "Paling Populer",
    modul: [
      {
        id: "mod-1",
        urutan: 1,
        judul: "Mengenal Lembar Kerja dan Format Sel",
        durasiMenit: 45,
        isiMateri: "Pengaturan lembar kerja, format angka mata uang, tanggal, dan conditional formatting dasar.",
        soalCount: 4,
        hasPdf: true,
      },
      {
        id: "mod-2",
        urutan: 2,
        judul: "Rumus Dasar SUM, AVERAGE, dan IF",
        durasiMenit: 60,
        isiMateri: "Penerapan formula logika IF bersarang, lookup dasar, dan kalkulasi rekap bulanan otomatis.",
        soalCount: 4,
        hasPdf: true,
      },
      {
        id: "mod-3",
        urutan: 3,
        judul: "Tabel dan Grafik untuk Laporan Eksekutif",
        durasiMenit: 50,
        isiMateri: "Penyusunan dashboard satu halaman, grafik batang dan tren, persiapan cetak PDF rapi.",
        soalCount: 4,
        hasPdf: true,
      },
    ],
  },
  {
    id: "00000000-0000-4000-b000-000000000002",
    judul: "Desain Konten Media Sosial dengan Canva",
    slug: "desain-konten-canva",
    kategori: "Desain",
    ringkasan: "Kelas gratis membuat konten Instagram yang rapi dan menarik dengan Canva.",
    deskripsi: "Kursus gratis untuk pelaku usaha pemula, UMKM, dan staf pemasaran digital. Peserta belajar kaidah visual, tipografi, psikologi warna, optimalisasi template Canva, dan perancangan kalender konten terjadwal untuk satu minggu penuh.",
    harga: 0,
    kuota: 40,
    terpakai: 18,
    sisaKursi: 22,
    nilaiLulus: 70,
    status: "terbit",
    instrukturNama: "Laras Wulandari",
    instrukturGelar: "Creative Director",
    instrukturAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    totalDurasiMenit: 120,
    image: "/images/card_canva.jpg",
    highlightTag: "Gratis 100%",
    modul: [
      {
        id: "mod-canva-1",
        urutan: 1,
        judul: "Prinsip Dasar Desain Visual",
        durasiMenit: 40,
        isiMateri: "Hirarki visual, kontras warna, pemilihan font komersial, dan layout grid.",
        soalCount: 4,
        hasPdf: true,
      },
      {
        id: "mod-canva-2",
        urutan: 2,
        judul: "Memakai Template dan Brand Kit",
        durasiMenit: 45,
        isiMateri: "Membangun identitas brand kit, palet warna, dan elemen grafis konsisten.",
        soalCount: 4,
        hasPdf: true,
      },
      {
        id: "mod-canva-3",
        urutan: 3,
        judul: "Merencanakan Konten Satu Minggu",
        durasiMenit: 35,
        isiMateri: "Penyusunan konten carousel edukasi, poster promo feed, dan reel cover.",
        soalCount: 4,
        hasPdf: true,
      },
    ],
  },
  {
    id: "00000000-0000-4000-b000-000000000003",
    judul: "Bahasa Inggris untuk Percakapan Kerja",
    slug: "bahasa-inggris-percakapan-kerja",
    kategori: "Bahasa",
    ringkasan: "Latihan percakapan bahasa Inggris untuk rapat, telepon, dan email kantor.",
    deskripsi: "Tingkatkan rasa percaya diri berkomunikasi dalam lingkungan kerja global. Materi berfokus pada ungkapan praktis saat meeting, etiket menerima panggilan klien internasional, serta template penulisan email bisnis yang ringkas dan profesional.",
    harga: 450000,
    kuota: 20,
    terpakai: 7,
    sisaKursi: 13,
    nilaiLulus: 70,
    status: "terbit",
    instrukturNama: "Michael Sitorus",
    instrukturGelar: "Corporate English Trainer",
    instrukturAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    totalDurasiMenit: 135,
    image: "/images/hero_learning_desk.jpg",
    highlightTag: "Karier Global",
    modul: [
      {
        id: "mod-eng-1",
        urutan: 1,
        judul: "Memperkenalkan Diri dan Rekan Kerja",
        durasiMenit: 40,
        isiMateri: "Greeting formal, self-introduction, describing job responsibilities and roles.",
        soalCount: 4,
        hasPdf: true,
      },
      {
        id: "mod-eng-2",
        urutan: 2,
        judul: "Bahasa Inggris dalam Rapat",
        durasiMenit: 50,
        isiMateri: "Stating opinions, disagreeing politely, asking for clarification, summarising actions.",
        soalCount: 4,
        hasPdf: true,
      },
      {
        id: "mod-eng-3",
        urutan: 3,
        judul: "Telepon dan Email Singkat",
        durasiMenit: 45,
        isiMateri: "Handling inquiries, scheduling meetings, professional sign-offs.",
        soalCount: 4,
        hasPdf: true,
      },
    ],
  },
  {
    id: "00000000-0000-4000-b000-000000000004",
    judul: "Dasar Pembukuan untuk UMKM",
    slug: "dasar-pembukuan-umkm",
    kategori: "Keuangan",
    ringkasan: "Catat kas masuk, kas keluar, dan laba rugi sederhana untuk usaha kecil.",
    deskripsi: "Kursus kelas kecil khusus pelaku UMKM di Depok dan sekitarnya. Peserta dibimbing langsung cara memisahkan keuangan pribadi dan usaha, mencatat arus kas harian tanpa ribet, serta membaca kesehatan usaha lewat laporan laba rugi sederhana.",
    harga: 300000,
    kuota: 12,
    terpakai: 11,
    sisaKursi: 1, // KASUS BATAS BR-06 SISA 1 KURSI!
    nilaiLulus: 70,
    status: "terbit",
    instrukturNama: "Yudha Pratama",
    instrukturGelar: "Konsultan Keuangan UMKM",
    instrukturAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    totalDurasiMenit: 110,
    image: "/images/card_pembukuan.jpg",
    highlightTag: "Tersisa 1 Kursi!",
    modul: [
      {
        id: "mod-fin-1",
        urutan: 1,
        judul: "Memisahkan Uang Usaha dan Pribadi",
        durasiMenit: 30,
        isiMateri: "Prinsip dasar rekening terpisah, penggajian pemilik usaha, dan disiplin pencatatan.",
        soalCount: 4,
        hasPdf: true,
      },
      {
        id: "mod-fin-2",
        urutan: 2,
        judul: "Mencatat Kas Masuk dan Kas Keluar",
        durasiMenit: 40,
        isiMateri: "Pencatatan buku kas harian, kategorisasi pengeluaran modal vs operasional.",
        soalCount: 4,
        hasPdf: true,
      },
      {
        id: "mod-fin-3",
        urutan: 3,
        judul: "Laporan Laba Rugi Sederhana",
        durasiMenit: 40,
        isiMateri: "Menghitung HPP, laba kotor, laba bersih, serta kalkulasi margin keuntungan.",
        soalCount: 4,
        hasPdf: true,
      },
    ],
  },
];
