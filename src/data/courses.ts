export interface QuizQuestion {
  id: string;
  urutan: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  kunci_jawaban: "A" | "B" | "C" | "D";
}

export interface Modul {
  id: string;
  urutan: number;
  judul: string;
  durasiMenit: number;
  isiMateri: string;
  videoUrl?: string;
  lampiranPath?: string;
  soalCount: number;
  hasPdf: boolean;
  soal?: QuizQuestion[];
}

export interface Kursus {
  id: string;
  judul: string;
  slug: string;
  kategori: "Perkantoran" | "Desain" | "Bahasa" | "Keuangan" | "Pengembangan Diri";
  ringkasan: string;
  deskripsi: string;
  harga: number; // 0 = Gratis (Harga final setelah diskon)
  hargaAwal?: number; // Harga normal sebelum diskon (untuk harga coret)
  diskonPersen?: number; // Persentase diskon (contoh: 50 untuk 50%)
  kuota: number;
  terpakai: number;
  sisaKursi: number;
  nilaiLulus: number; // BR-03 & BR-09 (Kini 60 sesuai keputusan instruktur/admin)
  status: "terbit" | "ditinjau" | "ditutup" | "draf";
  instrukturId: string;
  instrukturNama: string;
  instrukturGelar: string;
  instrukturAvatar: string;
  totalDurasiMenit: number;
  image: string;
  highlightTag?: string;
  modul: Modul[];
}

export interface Mentor {
  id: string;
  nama: string;
  email: string;
  gelar: string;
  bidang: string;
  bio: string;
  avatar: string;
  totalSiswa: number;
  kursusDiajar: string[];
}

export const MENTORS: Mentor[] = [
  {
    id: "00000000-0000-4000-a000-000000000011",
    nama: "Yudha Pratama",
    email: "yudha@pijaraksara.test",
    gelar: "Senior Office & Finance Specialist",
    bidang: "Administrasi Perkantoran & Keuangan UMKM",
    bio: "Praktisi operasional kantor dan konsultan keuangan mikro lebih dari 8 tahun. Berpengalaman melatih ratusan staf administrasi dan pemilik UMKM di Jabodetabek.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    totalSiswa: 24,
    kursusDiajar: [
      "Excel untuk Administrasi Perkantoran",
      "Dasar Pembukuan untuk UMKM",
      "Microsoft Word untuk Surat Dinas (Draf)",
    ],
  },
  {
    id: "00000000-0000-4000-a000-000000000012",
    nama: "Laras Wulandari",
    email: "laras@pijaraksara.test",
    gelar: "Creative Director & Brand Strategist",
    bidang: "Desain Konten & Media Sosial",
    bio: "Berpengalaman memimpin tim kreatif agensi digital dan membina puluhan brand UMKM mengembangkan konten promosi visual yang menarik serta meningkatkan penjualan.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    totalSiswa: 18,
    kursusDiajar: [
      "Desain Konten Media Sosial dengan Canva",
      "Fotografi Produk dengan Ponsel (Ditutup)",
    ],
  },
  {
    id: "00000000-0000-4000-a000-000000000013",
    nama: "Michael Sitorus",
    email: "michael@pijaraksara.test",
    gelar: "Corporate English & Communication Trainer",
    bidang: "Bahasa Inggris Kerja & Public Speaking",
    bio: "Pelatih komunikasi bisnis bersertifikasi internasional. Membantu staf profesional menguasai percakapan rapat, email resmi, dan presentasi kerja yang percaya diri.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    totalSiswa: 7,
    kursusDiajar: [
      "Bahasa Inggris untuk Percakapan Kerja",
      "Public Speaking untuk Presentasi Kantor (Ditinjau)",
    ],
  },
];

export const ALL_COURSES: Kursus[] = [
  {
    "id": "00000000-0000-4000-b000-000000000001",
    "judul": "Excel untuk Administrasi Perkantoran",
    "slug": "excel-administrasi-perkantoran",
    "kategori": "Perkantoran",
    "ringkasan": "Kuasai Excel lengkap dari dasar formula, rekap data, VLOOKUP, Pivot Table, hingga Dashboard laporan bulanan kantor.",
    "deskripsi": "Course praktik Excel intensif 10 part untuk staf administrasi, sekretariat, dan staf operasional. Peserta belajar mengatur lembar kerja profesional, memanfaatkan rumus logika dan pencarian (SUM, IF, VLOOKUP, INDEX-MATCH, XLOOKUP), validasi data anti-salah, hingga menyusun dashboard visual interaktif satu halaman untuk laporan pimpinan.",
    "harga": 350000,
    "kuota": 25,
    "terpakai": 13,
    "sisaKursi": 12,
    "nilaiLulus": 60,
    "status": "terbit",
    "instrukturId": "00000000-0000-4000-a000-000000000011",
    "instrukturNama": "Yudha Pratama",
    "instrukturGelar": "Senior Office Specialist",
    "instrukturAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "image": "/images/card_perkantoran.jpg",
    "highlightTag": "Paling Populer",
    "modul": [
      {
        "id": "mod-excel-1",
        "urutan": 1,
        "judul": "Mengenal Antarmuka & Format Sel Standar Kantor",
        "durasiMenit": 45,
        "isiMateri": "Pada modul pertama ini, kita membedah antarmuka Microsoft Excel: Ribbon, Name Box, Formula Bar, dan Grid. Anda akan mempelajari jenis data (Teks, Angka, Tanggal, Logika), teknik navigasi cepat menggunakan shortcut keyboard (Ctrl+Panah, Ctrl+Home, Shift+Spasi), serta pengaturan format sel baku perkantoran seperti mata uang Rupiah (Accounting vs Currency), format persentase, dan perataan teks (Merge & Center vs Center Across Selection).",
        "videoUrl": "https://www.youtube.com/watch?v=rdKPQidw_qM",
        "lampiranPath": "panduan_excel_modul_1.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex1-1",
            "urutan": 1,
            "pertanyaan": "Apa fungsi kotak 'Name Box' yang terletak di sebelah kiri Formula Bar?",
            "pilihan_a": "Menampilkan nama file lembar kerja yang sedang aktif",
            "pilihan_b": "Menampilkan alamat sel atau rentang sel yang sedang dipilih",
            "pilihan_c": "Menuliskan komentar catatan pada lembar kerja",
            "pilihan_d": "Menyimpan nama rumus kustom pengguna",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex1-2",
            "urutan": 2,
            "pertanyaan": "Shortcut keyboard apakah yang digunakan untuk berpindah langsung ke sel paling ujung dari rentang data?",
            "pilihan_a": "Ctrl + Tombol Panah (Arrow)",
            "pilihan_b": "Alt + Tab",
            "pilihan_c": "Shift + Enter",
            "pilihan_d": "Ctrl + Alt + Del",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex1-3",
            "urutan": 3,
            "pertanyaan": "Perbedaan utama antara format Number 'Accounting' dan 'Currency' pada Excel adalah:",
            "pilihan_a": "Accounting tidak bisa menampilkan angka desimal",
            "pilihan_b": "Accounting meratakan simbol mata uang di sisi kiri sel dan menampilkan angka 0 sebagai strip (-)",
            "pilihan_c": "Currency secara otomatis mengubah angka negatif menjadi warna hijau",
            "pilihan_d": "Accounting hanya berlaku untuk mata uang US Dollar",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex1-4",
            "urutan": 4,
            "pertanyaan": "Mengapa opsi 'Center Across Selection' sering lebih direkomendasikan daripada 'Merge & Center' pada tabel administrasi?",
            "pilihan_a": "Karena 'Merge & Center' membuat ukuran file membesar dua kali lipat",
            "pilihan_b": "Karena 'Merge & Center' dapat menyulitkan proses sorting dan filtering data pada kolom bersangkutan",
            "pilihan_c": "Karena 'Center Across Selection' hanya tersedia di Excel versi gratis",
            "pilihan_d": "Karena 'Merge & Center' menghapus seluruh data di baris berikutnya",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex1-5",
            "urutan": 5,
            "pertanyaan": "Karakter pemisah ribuan standar untuk penulisan angka rupiah di pengaturan regional Indonesia adalah:",
            "pilihan_a": "Tanda Titik (.)",
            "pilihan_b": "Tanda Koma (,)",
            "pilihan_c": "Tanda Titik Koma (;)",
            "pilihan_d": "Tanda Garis Miring (/)",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-excel-2",
        "urutan": 2,
        "judul": "Rumus Operasi Dasar & Statistik Sederhana (SUM, AVERAGE, COUNT)",
        "durasiMenit": 45,
        "isiMateri": "Modul ini membahas implementasi kalkulasi esensial perkantoran. Anda akan mempraktikkan operasi matematika (+, -, *, /) serta fungsi statistik dasar: SUM (penjumlahan otomatis), AVERAGE (menghitung rata-rata nilai), COUNT (menghitung sel berisi angka), COUNTA (menghitung sel tidak kosong berisi teks maupun angka), MIN (nilai terendah), dan MAX (nilai tertinggi) untuk rekap absensi dan inventaris.",
        "videoUrl": "https://www.youtube.com/watch?v=Vl0H-qTclOg",
        "lampiranPath": "panduan_excel_modul_2.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex2-1",
            "urutan": 1,
            "pertanyaan": "Fungsi apakah yang digunakan untuk menghitung jumlah sel yang berisi data apa pun (tidak kosong/non-empty)?",
            "pilihan_a": "COUNT",
            "pilihan_b": "COUNTA",
            "pilihan_c": "COUNTBLANK",
            "pilihan_d": "SUM",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex2-2",
            "urutan": 2,
            "pertanyaan": "Jika sel A1 bernilai 10, A2 bernilai 20, dan A3 berisi teks 'Libur', berapakah hasil dari formula =AVERAGE(A1:A3)?",
            "pilihan_a": "10",
            "pilihan_b": "15",
            "pilihan_c": "30",
            "pilihan_d": "#VALUE!",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex2-3",
            "urutan": 3,
            "pertanyaan": "Shortcut tercepat untuk memasukkan fungsi AutoSum pada baris atau kolom yang dipilih adalah:",
            "pilihan_a": "Alt + =",
            "pilihan_b": "Ctrl + Shift + S",
            "pilihan_c": "Ctrl + =",
            "pilihan_d": "Alt + F4",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex2-4",
            "urutan": 4,
            "pertanyaan": "Tanda dolar ($) pada penulisan rumus seperti $A$1 memiliki fungsi sebagai:",
            "pilihan_a": "Mengubah mata uang sel menjadi Dollar Amerika",
            "pilihan_b": "Referensi absolut (mengunci posisi baris dan kolom saat rumus disalin)",
            "pilihan_c": "Menandakan bahwa sel tersebut berstatus terproteksi kata sandi",
            "pilihan_d": "Mengalikan nilai sel dengan kurs tukar valuta asing",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex2-5",
            "urutan": 5,
            "pertanyaan": "Fungsi manakah yang digunakan untuk mencari nilai terendah dari suatu rentang data rekapitulasi?",
            "pilihan_a": "LEAST()",
            "pilihan_b": "MIN()",
            "pilihan_c": "BOTTOM()",
            "pilihan_d": "SMALL()",
            "kunci_jawaban": "B"
          }
        ]
      },
      {
        "id": "mod-excel-3",
        "urutan": 3,
        "judul": "Logika Kondisional dengan Rumus IF Tunggal & Bersarang",
        "durasiMenit": 50,
        "isiMateri": "Kuasai pengambilan keputusan otomatis lembar kerja dengan formula logika. Pelajari sintaks =IF(logical_test, [value_if_true], [value_if_false]) untuk menentukan status 'LULUS'/'MENGULANG', 'LUNAS'/'BELUM LUNAS'. Dilanjutkan dengan operator logika ganda AND, OR, dan penyusunan IF bersarang (Nested IF) untuk grading performa karyawan atau penentuan potongan diskon belanja dinas.",
        "videoUrl": "https://www.youtube.com/watch?v=kYJv8PjXw1E",
        "lampiranPath": "panduan_excel_modul_3.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex3-1",
            "urutan": 1,
            "pertanyaan": "Rumus manakah yang benar untuk mengecek jika nilai di sel B2 minimal 60 maka 'Lulus', selain itu 'Remedial'?",
            "pilihan_a": "=IF(B2 >= 60, \"Lulus\", \"Remedial\")",
            "pilihan_b": "=IF(B2 = 60; 'Lulus'; 'Remedial')",
            "pilihan_c": "=CHECK(B2 >= 60, \"Lulus\", \"Remedial\")",
            "pilihan_d": "=IF(B2 > 60: Lulus : Remedial)",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex3-2",
            "urutan": 2,
            "pertanyaan": "Fungsi logika pembantu yang menghasilkan nilai TRUE hanya jika SELURUH kondisi yang diuji bernilai benar adalah:",
            "pilihan_a": "OR()",
            "pilihan_b": "AND()",
            "pilihan_c": "NOT()",
            "pilihan_d": "XOR()",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex3-3",
            "urutan": 3,
            "pertanyaan": "Jika kita memiliki formula =IF(A1>80, \"A\", IF(A1>70, \"B\", \"C\")), berapakah output yang dihasilkan jika sel A1 berisi angka 75?",
            "pilihan_a": "\"A\"",
            "pilihan_b": "\"B\"",
            "pilihan_c": "\"C\"",
            "pilihan_d": "\"#N/A\"",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex3-4",
            "urutan": 4,
            "pertanyaan": "Berapakah jumlah maksimal cabang logika kondisi yang dapat ditangani dalam struktur IF bersarang (Nested IF) pada Excel modern?",
            "pilihan_a": "Hingga 7 tingkat",
            "pilihan_b": "Hingga 64 tingkat",
            "pilihan_c": "Hanya 3 tingkat",
            "pilihan_d": "Tidak terbatas sama sekali",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex3-5",
            "urutan": 5,
            "pertanyaan": "Fungsi alternatif modern yang diperkenalkan Excel untuk menggantikan Nested IF yang panjang tanpa perlu tanda kurung berulang adalah:",
            "pilihan_a": "IFS()",
            "pilihan_b": "MULTI_IF()",
            "pilihan_c": "CASE()",
            "pilihan_d": "SWITCH_ALL()",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-excel-4",
        "urutan": 4,
        "judul": "Manipulasi Teks & Fungsi String Administrasi (TRIM, CONCAT, MID)",
        "durasiMenit": 40,
        "isiMateri": "Data masukan kantor dari formulir online sering kali berantakan dengan spasi ganda, huruf besar-kecil tidak seragam, atau format nomor induk yang tercampur. Modul ini mengajarkan teknik pembersihan data menggunakan TRIM (menghapus spasi liar), PROPER, UPPER, LOWER, serta ekstraksi kode barang dan NIP menggunakan LEFT, RIGHT, MID, dan fungsi penggabungan teks CONCAT / TEXTJOIN.",
        "videoUrl": "https://www.youtube.com/watch?v=G3w7-2p-Y5Y",
        "lampiranPath": "panduan_excel_modul_4.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex4-1",
            "urutan": 1,
            "pertanyaan": "Fungsi formula apakah yang bertugas menghapus kelebihan spasi di awal, di akhir, dan spasi ganda di tengah teks?",
            "pilihan_a": "CLEAN()",
            "pilihan_b": "TRIM()",
            "pilihan_c": "STRIP()",
            "pilihan_d": "DELSPACE()",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex4-2",
            "urutan": 2,
            "pertanyaan": "Jika sel A1 berisi teks 'laporan keuangan kuartal satu', fungsi manakah yang mengubahnya menjadi 'Laporan Keuangan Kuartal Satu'?",
            "pilihan_a": "=UPPER(A1)",
            "pilihan_b": "=PROPER(A1)",
            "pilihan_c": "=CAPITALIZE(A1)",
            "pilihan_d": "=TITLECASE(A1)",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex4-3",
            "urutan": 3,
            "pertanyaan": "Jika sel B1 berisi 'INV-2026-JKT', formula apakah yang menghasilkan 4 karakter angka tahun '2026'?",
            "pilihan_a": "=LEFT(B1, 4)",
            "pilihan_b": "=MID(B1, 5, 4)",
            "pilihan_c": "=RIGHT(B1, 4)",
            "pilihan_d": "=SUBSTRING(B1, 5, 4)",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex4-4",
            "urutan": 4,
            "pertanyaan": "Operator apakah dalam Excel yang dapat berfungsi sebagai pintasan untuk menggabungkan teks dari dua sel berbeda (selain fungsi CONCAT)?",
            "pilihan_a": "Tanda Simbol Dan (&)",
            "pilihan_b": "Tanda Tambah (+)",
            "pilihan_c": "Tanda Bintang (*)",
            "pilihan_d": "Tanda Persen (%)",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex4-5",
            "urutan": 5,
            "pertanyaan": "Kelebihan utama fungsi TEXTJOIN dibandingkan CONCATENATE klasik adalah:",
            "pilihan_a": "Bisa mengubah teks menjadi angka secara otomatis",
            "pilihan_b": "Dapat menentukan delimiter pemisah dan mengabaikan sel kosong secara serentak",
            "pilihan_c": "Dapat menerjemahkan teks ke bahasa asing",
            "pilihan_d": "Memperbaiki kesalahan ketik ejaan bahasa Indonesia",
            "kunci_jawaban": "B"
          }
        ]
      },
      {
        "id": "mod-excel-5",
        "urutan": 5,
        "judul": "Pencarian Referensi Data dengan VLOOKUP & HLOOKUP",
        "durasiMenit": 50,
        "isiMateri": "VLOOKUP adalah rumus paling wajib bagi staf administrasi. Pelajari anatomi pencarian data vertikal =VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup]). Anda akan membedah perbedaan pencarian presisi (FALSE / 0) untuk mencari harga barang atau nama staf berdasarkan ID, penanganan error #N/A dengan IFERROR, serta pengenalan HLOOKUP untuk tabel berbasis baris horizontal.",
        "videoUrl": "https://www.youtube.com/watch?v=uK48v7-9f14",
        "lampiranPath": "panduan_excel_modul_5.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex5-1",
            "urutan": 1,
            "pertanyaan": "Argumen keempat [range_lookup] pada VLOOKUP harus diisi dengan FALSE atau angka 0 ketika kita ingin:",
            "pilihan_a": "Mencari nilai yang mendekati (approximate match)",
            "pilihan_b": "Mencari nilai yang benar-benar persis sama (exact match)",
            "pilihan_c": "Mengurutkan data dari huruf A ke Z",
            "pilihan_d": "Mengabaikan huruf kapital dalam pencarian",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex5-2",
            "urutan": 2,
            "pertanyaan": "Di manakah posisi kolom kunci pencarian (lookup_value) wajib berada di dalam rentang table_array pada rumus VLOOKUP?",
            "pilihan_a": "Di kolom paling kanan tabel",
            "pilihan_b": "Di kolom paling pertama (paling kiri) dari rentang tabel",
            "pilihan_c": "Di baris terbawah tabel",
            "pilihan_d": "Boleh berada di sembarang kolom mana saja",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex5-3",
            "urutan": 3,
            "pertanyaan": "Pesan error apakah yang muncul jika VLOOKUP tidak berhasil menemukan nilai yang dicari pada tabel referensi?",
            "pilihan_a": "#REF!",
            "pilihan_b": "#N/A",
            "pilihan_c": "#DIV/0!",
            "pilihan_d": "#NAME?",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex5-4",
            "urutan": 4,
            "pertanyaan": "Bagaimanakah cara menyamarkan error #N/A pada VLOOKUP agar sel menampilkan teks 'Data Tidak Ada' yang rapi?",
            "pilihan_a": "Membungkus rumus dengan =IFERROR(VLOOKUP(...), \"Data Tidak Ada\")",
            "pilihan_b": "Menghapus tanda kutip pada nama barang",
            "pilihan_c": "Mengubah warna font sel menjadi putih",
            "pilihan_d": "Menggunakan fungsi =ERASE_ERROR()",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex5-5",
            "urutan": 5,
            "pertanyaan": "Apa perbedaan mendasar antara VLOOKUP dan HLOOKUP?",
            "pilihan_a": "VLOOKUP untuk teks, HLOOKUP untuk angka",
            "pilihan_b": "VLOOKUP mencari data secara vertikal (kolom), HLOOKUP secara horizontal (baris)",
            "pilihan_c": "HLOOKUP hanya ada di Google Sheets",
            "pilihan_d": "VLOOKUP membutuhkan lisensi berbayar",
            "kunci_jawaban": "B"
          }
        ]
      },
      {
        "id": "mod-excel-6",
        "urutan": 6,
        "judul": "Fungsi Pencarian Fleksibel INDEX-MATCH & XLOOKUP",
        "durasiMenit": 50,
        "isiMateri": "Keterbatasan utama VLOOKUP adalah tidak bisa mencari data ke arah kiri dan rentan rusak saat ada kolom baru disisipkan. Modul ini mengajarkan kombinasi dinamis INDEX dan MATCH yang jauh lebih tangguh. Selain itu, Anda akan mengeksplorasi rumus revolusioner XLOOKUP di Excel terbaru yang dapat mencari dua arah secara instan, mengembalikan banyak kolom sekaligus, dan memiliki penanganan error terintegrasi.",
        "videoUrl": "https://www.youtube.com/watch?v=Xz2z3Y-V94Q",
        "lampiranPath": "panduan_excel_modul_6.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex6-1",
            "urutan": 1,
            "pertanyaan": "Keunggulan utama kombinasi INDEX-MATCH dibandingkan VLOOKUP tradisional adalah:",
            "pilihan_a": "Rumus INDEX-MATCH lebih pendek dan mudah dihapal",
            "pilihan_b": "Dapat melakukan pencarian data ke arah kiri dan tidak terpengaruh penyisipan kolom baru",
            "pilihan_c": "Tidak memerlukan tanda kurung dalam penulisan rumus",
            "pilihan_d": "Otomatis membuat grafik di samping tabel",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex6-2",
            "urutan": 2,
            "pertanyaan": "Fungsi MATCH dalam kombinasi INDEX-MATCH menghasilkan output berupa:",
            "pilihan_a": "Nilai teks yang cocok",
            "pilihan_b": "Posisi nomor urut (indeks angka) suatu nilai di dalam rentang array",
            "pilihan_c": "Jumlah seluruh sel yang bernilai benar",
            "pilihan_d": "Alamat sel absolut lengkap dengan tanda dolar",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex6-3",
            "urutan": 3,
            "pertanyaan": "Rumus XLOOKUP pada Excel memiliki argumen bawaan ke-4 yang berfungsi untuk:",
            "pilihan_a": "Menghitung total pajak",
            "pilihan_b": "Menyediakan nilai alternatif jika data tidak ditemukan ([if_not_found]) tanpa perlu IFERROR",
            "pilihan_c": "Mengubah tabel menjadi format PDF otomatis",
            "pilihan_d": "Menghubungkan lembar kerja ke internet",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex6-4",
            "urutan": 4,
            "pertanyaan": "Secara default bawaan, jenis pencarian (match mode) pada rumus XLOOKUP adalah:",
            "pilihan_a": "Pencarian persis sama (Exact match)",
            "pilihan_b": "Pencarian perkiraan (Approximate match)",
            "pilihan_c": "Pencarian wildcard saja",
            "pilihan_d": "Pencarian biner terurut",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex6-5",
            "urutan": 5,
            "pertanyaan": "Apakah XLOOKUP mampu mengembalikan (return) beberapa kolom data sekaligus dalam satu kali rumus dimasukkan?",
            "pilihan_a": "Tidak bisa, hanya boleh satu sel saja",
            "pilihan_b": "Bisa, berkat kapabilitas Dynamic Array (Spill formula)",
            "pilihan_c": "Bisa, tetapi hanya untuk kolom yang bersebelahan ke kiri",
            "pilihan_d": "Hanya bisa jika file disimpan dalam format CSV",
            "kunci_jawaban": "B"
          }
        ]
      },
      {
        "id": "mod-excel-7",
        "urutan": 7,
        "judul": "Analisis Data Cepat Menggunakan Pivot Table & Slicer",
        "durasiMenit": 50,
        "isiMateri": "Menghabiskan waktu berjam-jam menghitung rekap manual adalah kesalahan fatal staf administrasi. Di modul ini, pelajari cara membuat Pivot Table dalam 30 detik untuk meringkas ribuan baris transaksi. Anda akan memahami 4 bidang Pivot (Filters, Columns, Rows, Values), melakukan grouping tanggal per bulan/kuartal, mengubah perhitungan dari SUM ke COUNT/AVERAGE, serta menyisipkan tombol interaktif Slicer dan Timeline.",
        "videoUrl": "https://www.youtube.com/watch?v=m0wI61ahfLc",
        "lampiranPath": "panduan_excel_modul_7.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex7-1",
            "urutan": 1,
            "pertanyaan": "Syarat mutlak agar suatu tabel data dapat diubah menjadi Pivot Table yang rapi dan tidak error adalah:",
            "pilihan_a": "Tabel harus memiliki judul kolom (header) yang jelas di setiap kolom dan tidak ada sel gabungan (merged cells)",
            "pilihan_b": "Seluruh baris data harus diwarnai selang-seling",
            "pilihan_c": "Data harus disimpan di format file Excel 97-2003",
            "pilihan_d": "Jumlah baris minimal harus 1.000 data",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex7-2",
            "urutan": 2,
            "pertanyaan": "Di manakah bidang (field) angka omzet penjualan harus diletakkan pada panel Pivot Table?",
            "pilihan_a": "Rows Area",
            "pilihan_b": "Values Area",
            "pilihan_c": "Columns Area",
            "pilihan_d": "Filters Area",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex7-3",
            "urutan": 3,
            "pertanyaan": "Fitur apakah pada Pivot Table yang menyediakan tombol filter visual modern yang interaktif dan mudah diklik pimpinan?",
            "pilihan_a": "Slicer",
            "pilihan_b": "Data Validator",
            "pilihan_c": "Quick Scraper",
            "pilihan_d": "Macro Button",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex7-4",
            "urutan": 4,
            "pertanyaan": "Jika data pada tabel sumber asli diubah atau ditambah, apakah angka di Pivot Table otomatis berubah seketika tanpa tindakan apa pun?",
            "pilihan_a": "Ya, selalu langsung otomatis berubah detik itu juga",
            "pilihan_b": "Tidak, pengguna perlu menekan tombol 'Refresh' (atau Alt+F5) untuk memperbarui data di Pivot Table",
            "pilihan_c": "Tidak, tabel sumber lama harus dihapus terlebih dahulu",
            "pilihan_d": "Hanya berubah jika komputer terhubung ke printer",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex7-5",
            "urutan": 5,
            "pertanyaan": "Bagaimanakah cara mengelompokkan data tanggal harian menjadi laporan per bulan pada baris Pivot Table?",
            "pilihan_a": "Mengetik rumus =MONTH() di setiap sel",
            "pilihan_b": "Klik kanan pada salah satu sel tanggal di Pivot Table, lalu pilih menu 'Group' dan pilih 'Months'",
            "pilihan_c": "Memindahkan field tanggal ke kolom Values",
            "pilihan_d": "Menghapus kolom tanggal dari tabel utama",
            "kunci_jawaban": "B"
          }
        ]
      },
      {
        "id": "mod-excel-8",
        "urutan": 8,
        "judul": "Visualisasi Data: Grafik Bisnis & Conditional Formatting",
        "durasiMenit": 45,
        "isiMateri": "Data yang disajikan dalam bentuk angka polos sering membingungkan pimpinan rapat. Pelajari kaidah visualisasi data profesional: memilih jenis grafik yang tepat (Column Chart untuk komparasi, Line Chart untuk tren bulanan, Donut/Bar Chart untuk proporsi biaya). Anda juga akan menguasai Conditional Formatting untuk memberi warna sel otomatis berdasarkan ambang batas target, Data Bars gradien, dan Icon Sets status hijau-kuning-merah.",
        "videoUrl": "https://www.youtube.com/watch?v=iI9E10v1V_g",
        "lampiranPath": "panduan_excel_modul_8.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex8-1",
            "urutan": 1,
            "pertanyaan": "Jenis grafik manakah yang paling ideal untuk menggambarkan tren kenaikan atau penurunan penjualan selama 12 bulan?",
            "pilihan_a": "Pie Chart 3D",
            "pilihan_b": "Line Chart (Grafik Garis)",
            "pilihan_c": "Radar Chart",
            "pilihan_d": "Treemap Chart",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex8-2",
            "urutan": 2,
            "pertanyaan": "Mengapa penggunaan Pie Chart (Diagram Lingkaran) 3D dengan lebih dari 7 kategori potongan sangat tidak disarankan dalam laporan bisnis resmi?",
            "pilihan_a": "Karena distorsi sudut 3D menyulitkan perbandingan proporsi visual secara akurat bagi pembaca",
            "pilihan_b": "Karena Excel membatasi warna maksimal hanya 3 warna",
            "pilihan_c": "Karena Pie Chart 3D tidak bisa diekspor ke PDF",
            "pilihan_d": "Karena formula matematisnya menghasilkan nilai negatif",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex8-3",
            "urutan": 3,
            "pertanyaan": "Fitur apakah yang dapat memberikan warna sel otomatis menjadi hijau jika penjualan melebihi target dan merah jika di bawah target?",
            "pilihan_a": "Conditional Formatting",
            "pilihan_b": "Auto Filter",
            "pilihan_c": "Format Painter",
            "pilihan_d": "Track Changes",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex8-4",
            "urutan": 4,
            "pertanyaan": "Opsi manakah di Conditional Formatting yang menampilkan indikator visual batang horizontal mini langsung di dalam sel angka?",
            "pilihan_a": "Color Scales",
            "pilihan_b": "Data Bars",
            "pilihan_c": "Top/Bottom Rules",
            "pilihan_d": "Text that Contains",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex8-5",
            "urutan": 5,
            "pertanyaan": "Alat bantu visual cepat 'Sparklines' pada Excel berfungsi untuk:",
            "pilihan_a": "Membuat diagram garis atau kolom mini yang pas di dalam 1 sel tunggal",
            "pilihan_b": "Mencari sel yang mengalami kesalahan pembagian dengan nol",
            "pilihan_c": "Membuat animasi slide presentasi di lembar kerja",
            "pilihan_d": "Menandai duplikasi data secara acak",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-excel-9",
        "urutan": 9,
        "judul": "Validasi Data, Penguncian Sel, & Proteksi Formula",
        "durasiMenit": 40,
        "isiMateri": "Saat lembar kerja dibagikan ke staf lain, risiko rumus terhapus atau salah ketik nama cabang sangat tinggi. Modul ini mengajarkan Data Validation: membuat dropdown list pilihan anti-salah, membatasi rentang tanggal dan panjang karakter nomor telepon, serta menyusun pesan peringatan (Error Alert Stop vs Warning). Anda juga akan mempelajari teknik proteksi cerdas: mengunci sel berisi rumus (Locked) dan membuka sel isian (Unlocked) dengan password lembar kerja.",
        "videoUrl": "https://www.youtube.com/watch?v=48-g8H-l9b0",
        "lampiranPath": "panduan_excel_modul_9.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex9-1",
            "urutan": 1,
            "pertanyaan": "Fitur Excel manakah yang digunakan untuk membuat menu daftar pilihan (dropdown list) pada suatu sel input?",
            "pilihan_a": "Consolidate",
            "pilihan_b": "Data Validation (opsi List)",
            "pilihan_c": "Goal Seek",
            "pilihan_d": "Auto Correct",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex9-2",
            "urutan": 2,
            "pertanyaan": "Secara default bawaan lembar kerja Excel, seluruh sel memiliki atribut status format:",
            "pilihan_a": "Unlocked (Terbuka)",
            "pilihan_b": "Locked (Terkunci, namun proteksi baru aktif setelah tombol 'Protect Sheet' ditekan)",
            "pilihan_c": "Hidden (Tersembunyi)",
            "pilihan_d": "Read-Only permanen",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex9-3",
            "urutan": 3,
            "pertanyaan": "Langkah pertama yang wajib dilakukan sebelum mengaktifkan 'Protect Sheet' jika Anda ingin memperbolehkan pengguna menginput data di kolom tertentu adalah:",
            "pilihan_a": "Menghapus password komputer",
            "pilihan_b": "Memilih sel input tersebut, buka Format Cells -> Protection -> hilangkan centang 'Locked'",
            "pilihan_c": "Menyimpan file sebagai read-only",
            "pilihan_d": "Menghilangkan formula bar dari menu View",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex9-4",
            "urutan": 4,
            "pertanyaan": "Jenis Error Alert pada Data Validation yang benar-benar menolak input data yang tidak valid dan tidak mengizinkan pengguna melanjutkan adalah tipe:",
            "pilihan_a": "Information",
            "pilihan_b": "Warning",
            "pilihan_c": "Stop",
            "pilihan_d": "Notice",
            "kunci_jawaban": "C"
          },
          {
            "id": "soal-ex9-5",
            "urutan": 5,
            "pertanyaan": "Apakah opsi 'Protect Workbook' dapat mencegah pengguna menghapus, menambah, atau memindahkan lembar sheet?",
            "pilihan_a": "Ya, Protect Workbook memproteksi struktur sheet lembar kerja",
            "pilihan_b": "Tidak, itu hanya fungsi dari Windows Defender",
            "pilihan_c": "Hanya berlaku jika komputer memiliki izin administrator",
            "pilihan_d": "Hanya bisa jika file disimpan dalam format ZIP",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-excel-10",
        "urutan": 10,
        "judul": "Merancang Dashboard Laporan Bulanan Eksekutif Siap Cetak",
        "durasiMenit": 55,
        "isiMateri": "Puncak dari keterampilan Excel perkantoran adalah menyusun Executive One-Page Dashboard. Di modul pamungkas ini, Anda akan menggabungkan seluruh teknik sebelumnya: KPI Summary Cards dengan font angka tebal, grafik tren dinamis, Pivot Table dengan Slicer terhubung, pengaturan tata letak tanpa garis grid (remove gridlines), pembuatan margin batas cetak rapi (Page Break Preview), serta ekspor laporan menjadi dokumen PDF eksekutif siap kirim ke direksi.",
        "videoUrl": "https://www.youtube.com/watch?v=K74_FNnlIF8",
        "lampiranPath": "panduan_excel_modul_10.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-ex10-1",
            "urutan": 1,
            "pertanyaan": "Prinsip utama desain dalam menyusun 'Executive Dashboard' satu halaman yang baik adalah:",
            "pilihan_a": "Memasukkan sebanyak mungkin jenis grafik dan warna pelangi agar meriah",
            "pilihan_b": "Menampilkan ringkasan metrik utama (KPI) yang bersih, fokus, dan dapat dipahami dalam waktu kurang dari 30 detik",
            "pilihan_c": "Menampilkan seluruh ribuan baris data mentah di halaman pertama",
            "pilihan_d": "Menggunakan font dekoratif bersambung",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex10-2",
            "urutan": 2,
            "pertanyaan": "Fitur view apakah yang paling efektif untuk mengatur agar lembar kerja dashboard tercetak pas dalam tepat 1 halaman kertas A4?",
            "pilihan_a": "Normal View",
            "pilihan_b": "Page Break Preview dan opsi 'Fit to 1 Page Wide by 1 Page Tall' pada Page Setup",
            "pilihan_c": "Custom Views",
            "pilihan_d": "Web Layout View",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex10-3",
            "urutan": 3,
            "pertanyaan": "Bagaimanakah cara menghubungkan satu tombol Slicer agar dapat memfilter 2 atau lebih Pivot Table secara serentak?",
            "pilihan_a": "Klik kanan pada Slicer, lalu pilih 'Report Connections' dan centang seluruh Pivot Table terkait",
            "pilihan_b": "Menggabungkan sel menggunakan Merge & Center",
            "pilihan_c": "Membuat salinan tombol Slicer sebanyak 5 kali",
            "pilihan_d": "Mengetik rumus =CONNECT_ALL()",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-ex10-4",
            "urutan": 4,
            "pertanyaan": "Mengapa menyembunyikan garis kotak kisi (uncheck 'Gridlines' pada tab View) membuat tampilan dashboard terlihat jauh lebih profesional?",
            "pilihan_a": "Mengurangi beban memori komputer hingga 80%",
            "pilihan_b": "Menciptakan latar belakang putih bersih seperti aplikasi web modern sehingga kartu metrik menonjol",
            "pilihan_c": "Mencegah virus makro menyerang file",
            "pilihan_d": "Menonaktifkan rumus-rumus yang tidak digunakan",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-ex10-5",
            "urutan": 5,
            "pertanyaan": "Format file ekspor manakah yang paling aman dan standar untuk mendistribusikan laporan eksekutif final ke pihak eksternal?",
            "pilihan_a": "PDF (Portable Document Format)",
            "pilihan_b": "TXT (Plain Text)",
            "pilihan_c": "RTF (Rich Text Format)",
            "pilihan_d": "HTML",
            "kunci_jawaban": "A"
          }
        ]
      }
    ],
    "totalDurasiMenit": 470
  },
  {
    "id": "00000000-0000-4000-b000-000000000002",
    "judul": "Desain Konten Media Sosial dengan Canva",
    "slug": "desain-konten-canva",
    "kategori": "Desain",
    "ringkasan": "Kelas komprehensif membuat konten promosi Instagram, carousel edukasi, reels, hingga kalender konten 1 minggu penuh.",
    "deskripsi": "Course intensif 10 modul bagi pengelola media sosial, pelaku UMKM, dan staf kreatif. Anda mempelajari prinsip visual modern, hirarki layout, psikologi warna brand, padu-padan tipografi komersial, optimalisasi template Canva, pembuatan carousel edukasi seamless, video animasi Reels, hingga penjadwalan kalender promosi.",
    "harga": 0,
    "kuota": 40,
    "terpakai": 18,
    "sisaKursi": 22,
    "nilaiLulus": 60,
    "status": "terbit",
    "instrukturId": "00000000-0000-4000-a000-000000000012",
    "instrukturNama": "Laras Wulandari",
    "instrukturGelar": "Creative Director",
    "instrukturAvatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "image": "/images/card_canva.jpg",
    "highlightTag": "Gratis 100%",
    "modul": [
      {
        "id": "mod-canva-1",
        "urutan": 1,
        "judul": "Fondasi Desain & Pengenalan Ruang Kerja Canva",
        "durasiMenit": 35,
        "isiMateri": "Modul pembuka ini memperkenalkan antarmuka Canva: Dashboard proyek, panel Elements, Uploads, Text, dan Draw. Anda akan memahami resolusi kanvas standar digital: Postingan Persegi Instagram (1080x1080 px), Portrait (1080x1350 px), dan Story/Reels (1080x1920 px), serta cara mengatur ruler, guides, dan margin batas aman konten.",
        "videoUrl": "https://www.youtube.com/watch?v=2f3J178g-h0",
        "lampiranPath": "panduan_canva_modul_1.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can1-1",
            "urutan": 1,
            "pertanyaan": "Berapakah ukuran piksel ideal yang direkomendasikan untuk postingan feed Instagram format Portrait (4:5)?",
            "pilihan_a": "1080 x 1080 piksel",
            "pilihan_b": "1080 x 1350 piksel",
            "pilihan_c": "1920 x 1080 piksel",
            "pilihan_d": "720 x 1280 piksel",
            "kunci_jawaban": "B"
          },
          {
            "id": "soal-can1-2",
            "urutan": 2,
            "pertanyaan": "Mengapa format Portrait (1080x1350 px) lebih disukai daripada format Square (1080x1080 px) untuk meningkatkan interaksi di feed Instagram?",
            "pilihan_a": "Karena portrait memakan ruang layar ponsel lebih tinggi sehingga menahan perhatian jempol audiens lebih lama",
            "pilihan_b": "Karena format square tidak bisa diisi teks",
            "pilihan_c": "Karena algoritma Instagram memblokir rasio 1:1",
            "pilihan_d": "Karena portrait tidak memerlukan gambar produk",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can1-3",
            "urutan": 3,
            "pertanyaan": "Fitur apakah di menu 'File' Canva yang menampilkan garis panduan biru saat menggeser objek agar elemen tidak menempel terlalu dekat ke pinggir kanvas?",
            "pilihan_a": "Show Margins & Show Rulers and Guides",
            "pilihan_b": "Auto Blur",
            "pilihan_c": "Compress Canvas",
            "pilihan_d": "Vectorize Image",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can1-4",
            "urutan": 4,
            "pertanyaan": "Shortcut keyboard apakah di Canva untuk menduplikasi elemen yang sedang dipilih secara instan?",
            "pilihan_a": "Ctrl + D (atau Alt + Drag)",
            "pilihan_b": "Ctrl + Shift + Z",
            "pilihan_c": "Ctrl + Backspace",
            "pilihan_d": "Shift + Enter",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can1-5",
            "urutan": 5,
            "pertanyaan": "Format file unduhan (export) manakah di Canva yang paling disarankan untuk postingan grafis media sosial yang jernih dan tajam?",
            "pilihan_a": "PNG (Portable Network Graphics)",
            "pilihan_b": "GIF kecepatan rendah",
            "pilihan_c": "PDF Print CMYK",
            "pilihan_d": "SVG tanpa warna",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-2",
        "urutan": 2,
        "judul": "Prinsip Hirarki Visual, Grid, & Ruang Negatif",
        "durasiMenit": 40,
        "isiMateri": "Desain yang buruk adalah desain yang membuat pembaca bingung mana yang harus dibaca duluan. Modul ini mengajarkan teknik Hirarki Visual: menentukan Headline utama (Focal Point), Sub-headline, dan Body Text. Anda juga akan mempelajari kaidah Whitespace (ruang kosong bernapas), penggunaan Grid penyelarasan, dan aturan sepertiga (Rule of Thirds) agar tata letak tidak sesak dan nyaman dipandang.",
        "videoUrl": "https://www.youtube.com/watch?v=a5KYlHNKQB8",
        "lampiranPath": "panduan_canva_modul_2.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can2-1",
            "urutan": 1,
            "pertanyaan": "Apa yang dimaksud dengan 'Hirarki Visual' dalam desain konten grafis?",
            "pilihan_a": "Mengurutkan elemen berdasarkan tingkat kepentingan agar mata audiens tertuntun membaca informasi dari yang paling utama ke pendukung",
            "pilihan_b": "Menyusun seluruh teks dengan ukuran huruf yang persis sama besar",
            "pilihan_c": "Menggunakan gradasi warna dari gelap ke terang di seluruh latar belakang",
            "pilihan_d": "Menyembunyikan teks penting di bagian bawah gambar",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can2-2",
            "urutan": 2,
            "pertanyaan": "Fungsi dari 'Whitespace' (atau ruang negatif) pada desain feed Instagram adalah:",
            "pilihan_a": "Memberi ruang jeda visual agar mata audiens tidak lelah dan fokus pada pesan inti",
            "pilihan_b": "Menandakan bahwa kuota desain belum selesai",
            "pilihan_c": "Mengurangi pemakaian kuota internet saat mengunduh gambar",
            "pilihan_d": "Menghapus elemen logo yang tidak berbayar",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can2-3",
            "urutan": 3,
            "pertanyaan": "Prinsip 'Focal Point' pada banner promosi merujuk pada:",
            "pilihan_a": "Titik elemen visual yang pertama kali menarik pandangan mata pembaca saat melihat desain",
            "pilihan_b": "Alamat URL toko online di pojok kiri bawah",
            "pilihan_c": "Nomor WhatsApp customer service",
            "pilihan_d": "Bingkai garis putus-putus di pinggir gambar",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can2-4",
            "urutan": 4,
            "pertanyaan": "Alat bantu di Canva yang memudahkan kita memasukkan foto ke dalam bentuk tertentu (lingkaran, mockup HP) adalah:",
            "pilihan_a": "Frames (Bingkai)",
            "pilihan_b": "Stickers bergerak",
            "pilihan_c": "Background Remover",
            "pilihan_d": "Font Combinator",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can2-5",
            "urutan": 5,
            "pertanyaan": "Kaidah visual 'Rule of Thirds' membagi bidang kanvas menjadi berapa bagian kisi-kisi imajiner?",
            "pilihan_a": "9 bagian (melalui 2 garis horizontal dan 2 garis vertikal)",
            "pilihan_b": "3 bagian vertikal saja",
            "pilihan_c": "6 bagian diagonal",
            "pilihan_d": "12 bagian kotak",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-3",
        "urutan": 3,
        "judul": "Tipografi Konten: Padu Padan Font Komersial",
        "durasiMenit": 40,
        "isiMateri": "Pemilihan jenis font sangat menentukan citra profesionalitas brand. Di modul ini, pelajari klasifikasi font: Serif (elegan/formal), Sans Serif (modern/bersih), Script (artistik), dan Display (tebal/menarik perhatian). Praktikkan aturan emas padu-padan (Font Pairing) maksimal 2 jenis font dalam 1 desain, pengaturan kerning (jarak antar huruf), dan line-spacing (ketinggian baris) agar mudah dibaca di layar HP kecil.",
        "videoUrl": "https://www.youtube.com/watch?v=wZc7v3A2J8U",
        "lampiranPath": "panduan_canva_modul_3.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can3-1",
            "urutan": 1,
            "pertanyaan": "Berapa jumlah maksimal jenis keluarga font (font families) yang disarankan dalam satu postingan grafis agar tidak terlihat amatir?",
            "pilihan_a": "Maksimal 2 hingga 3 kombinasi font yang serasi",
            "pilihan_b": "Minimal 6 jenis font berbeda",
            "pilihan_c": "Wajib 1 font saja untuk seluruh kalimat",
            "pilihan_d": "Bebas berapapun asalkan berwarna-warni",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can3-2",
            "urutan": 2,
            "pertanyaan": "Jenis font apakah yang memiliki 'kaki' atau kait kecil di ujung goresan huruf (seperti Times New Roman atau Playfair Display)?",
            "pilihan_a": "Serif",
            "pilihan_b": "Sans Serif",
            "pilihan_c": "Monospace",
            "pilihan_d": "Handwriting",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can3-3",
            "urutan": 3,
            "pertanyaan": "Untuk isi teks paragraf panjang (body text) di feed Instagram, jenis font manakah yang paling mudah dan nyaman dibaca di layar smartphone?",
            "pilihan_a": "Sans Serif (seperti Montserrat, Inter, atau Open Sans)",
            "pilihan_b": "Gothic Cursive",
            "pilihan_c": "Font Script bersambung tipis",
            "pilihan_d": "Comic Sans miring",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can3-4",
            "urutan": 4,
            "pertanyaan": "Pengaturan 'Line Spacing' (ketinggian baris teks) yang terlalu rapat akan berakibat:",
            "pilihan_a": "Teks tampak saling bertumpuk dan sangat sulit dibaca oleh audiens",
            "pilihan_b": "Ukuran file bertambah besar",
            "pilihan_c": "Warna huruf memudar otomatis",
            "pilihan_d": "Font berubah menjadi huruf kapital semua",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can3-5",
            "urutan": 5,
            "pertanyaan": "Efek teks di Canva yang menambahkan bayangan lembut di belakang huruf agar terbaca jelas di atas gambar latar belakang yang ramai adalah:",
            "pilihan_a": "Shadow (Drop Shadow)",
            "pilihan_b": "Glitch",
            "pilihan_c": "Hollow",
            "pilihan_d": "Echo",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-4",
        "urutan": 4,
        "judul": "Psikologi & Harmoni Warna untuk Brand UMKM",
        "durasiMenit": 35,
        "isiMateri": "Warna bukan sekadar hiasan, melainkan pemicu emosi bawah sadar pelanggan. Pelajari arti psikologis warna: Merah & Kuning (memicu nafsu makan kuliner & urgensi diskon), Biru (kepercayaan perbankan & teknologi), Hijau (kesehatan, alam & keuangan). Anda juga akan mempelajari roda warna, aturan proporsi 60-30-10, kontras warna yang ramah aksesibilitas, dan cara membuat palet warna dari foto produk.",
        "videoUrl": "https://www.youtube.com/watch?v=L1CK9bE3v_8",
        "lampiranPath": "panduan_canva_modul_4.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can4-1",
            "urutan": 1,
            "pertanyaan": "Warna apakah yang secara psikologi sering dikaitkan dengan rasa percaya, stabilitas, dan profesionalisme (banyak dipakai institusi korporat/keuangan)?",
            "pilihan_a": "Biru",
            "pilihan_b": "Merah Terang",
            "pilihan_c": "Kuning Neon",
            "pilihan_d": "Ungu Gelap",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can4-2",
            "urutan": 2,
            "pertanyaan": "Prinsip pembagian warna '60-30-10' mengalokasikan 10% untuk bagian apa?",
            "pilihan_a": "Warna aksen (Accent Color) untuk tombol CTA, badge diskon, atau poin sorotan utama",
            "pilihan_b": "Warna latar belakang kanvas utama",
            "pilihan_c": "Warna elemen pendukung sekunder",
            "pilihan_d": "Warna teks pasal dan ketentuan",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can4-3",
            "urutan": 3,
            "pertanyaan": "Kombinasi warna 'Komplementer' (Complementary) diperoleh dari:",
            "pilihan_a": "Dua warna yang saling berhadapan langsung pada roda lingkaran warna (seperti Biru dan Oranye)",
            "pilihan_b": "Warna yang bersebelahan berdampingan",
            "pilihan_c": "Tiga warna hitam, abu-abu, dan putih saja",
            "pilihan_d": "Gradasi satu warna tunggal",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can4-4",
            "urutan": 4,
            "pertanyaan": "Alat 'Color Picker' (Eyedropper) pada Canva berguna untuk:",
            "pilihan_a": "Menyalin kode warna persis langsung dari foto produk yang diunggah ke kanvas",
            "pilihan_b": "Menebak nama font secara otomatis",
            "pilihan_c": "Memotong ukuran gambar",
            "pilihan_d": "Menambah saturasi cahaya",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can4-5",
            "urutan": 5,
            "pertanyaan": "Mengapa teks berwarna kuning di atas latar belakang putih sangat dilarang dalam desain media sosial?",
            "pilihan_a": "Karena tingkat kontras warnanya sangat rendah sehingga teks menjadi tidak terbaca",
            "pilihan_b": "Karena warna kuning hanya untuk cetak offset",
            "pilihan_c": "Karena melanggar hak cipta warna",
            "pilihan_d": "Karena warna kuning otomatis diubah hitam oleh Canva",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-5",
        "urutan": 5,
        "judul": "Membangun Brand Kit & Identitas Visual Konsisten",
        "durasiMenit": 40,
        "isiMateri": "Kunci akun Instagram UMKM yang terlihat bonafit adalah konsistensi identitas brand. Modul ini membimbing Anda mengatur Brand Kit: menyiapkan logo transparan format PNG, menetapkan 3-4 kode Hex warna resmi, menyimpan kombinasi font judul dan isi, serta mengorganisir folder aset grafik di Canva agar seluruh staf membuat konten yang seragam dan mudah dikenali pelanggan.",
        "videoUrl": "https://www.youtube.com/watch?v=y3u_A0q4PzU",
        "lampiranPath": "panduan_canva_modul_5.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can5-1",
            "urutan": 1,
            "pertanyaan": "Format file logo apakah yang wajib digunakan agar latar belakang logo transparan dan menyatu sempurna saat ditaruh di atas kanvas?",
            "pilihan_a": "PNG (Portable Network Graphics)",
            "pilihan_b": "JPG",
            "pilihan_c": "BMP",
            "pilihan_d": "TIFF",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can5-2",
            "urutan": 2,
            "pertanyaan": "Kode heksadesimal (Hex Code) warna di Canva diawali dengan simbol:",
            "pilihan_a": "Tanda Pagar (#)",
            "pilihan_b": "Tanda Dolar ($)",
            "pilihan_c": "Tanda Bintang (*)",
            "pilihan_d": "Tanda Seru (!)",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can5-3",
            "urutan": 3,
            "pertanyaan": "Manfaat utama menyiapkan 'Brand Kit' di Canva bagi pelaku usaha adalah:",
            "pilihan_a": "Menjaga konsistensi warna, font, dan logo di setiap postingan sehingga brand mudah diingat audiens",
            "pilihan_b": "Menjamin akun Instagram langsung mendapatkan centang biru",
            "pilihan_c": "Mendapatkan gratis ongkir pengiriman otomatis",
            "pilihan_d": "Menghilangkan keharusan membuat copywriting",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can5-4",
            "urutan": 4,
            "pertanyaan": "Fitur 'Magic Switch' / 'Resize' pada Canva memungkinkan pengguna untuk:",
            "pilihan_a": "Mengubah ukuran satu desain feed menjadi format Story, Facebook, atau Twitter dalam hitungan detik",
            "pilihan_b": "Menghapus akun kompetitor secara permanen",
            "pilihan_c": "Mengganti model foto manusia secara otomatis",
            "pilihan_d": "Menerjemahkan teks ke suara audio podcast",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can5-5",
            "urutan": 5,
            "pertanyaan": "Berapakah jumlah warna utama brand (primary brand colors) yang ideal disiapkan di Brand Kit UMKM?",
            "pilihan_a": "2 hingga 4 warna pilihan terkoordinasi",
            "pilihan_b": "Minimal 15 warna",
            "pilihan_c": "Hanya 1 warna hitam saja",
            "pilihan_d": "Harus mengikuti seluruh warna pelangi",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-6",
        "urutan": 6,
        "judul": "Membuat Feed Edukasi Carousel Slides (Menyambung/Seamless)",
        "durasiMenit": 45,
        "isiMateri": "Konten carousel (multi-slide) memiliki tingkat simpan (save) dan bagikan (share) paling tinggi di Instagram. Pelajari anatomi carousel yang viral: Cover Hook yang memancing rasa penasaran, Slide 2-7 isi daging bernilai edukatif, dan Slide Penutup yang memuat Call-to-Action (CTA) ajakan komentar atau klik tautan bio. Anda juga akan mempraktikkan trik desain seamless di mana gambar dan garis panah menyambung mulus antar slide.",
        "videoUrl": "https://www.youtube.com/watch?v=T1bW7Q3dGfk",
        "lampiranPath": "panduan_canva_modul_6.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can6-1",
            "urutan": 1,
            "pertanyaan": "Peran terpenting dari slide pertama (Cover) pada konten carousel Instagram adalah:",
            "pilihan_a": "Memuat hook visual dan judul yang memicu rasa penasaran (thumb-stopping) agar audiens mau menggeser (swipe)",
            "pilihan_b": "Menampilkan seluruh daftar pustaka referensi",
            "pilihan_c": "Memuat nomor rekening pembayaran donasi",
            "pilihan_d": "Menuliskan syarat dan ketentuan lengkap 500 kata",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can6-2",
            "urutan": 2,
            "pertanyaan": "Teknik desain 'Seamless Carousel' adalah:",
            "pilihan_a": "Desain di mana elemen gambar atau garis terpotong persis di tepi slide dan menyambung mulus saat digeser ke slide berikutnya",
            "pilihan_b": "Slide yang tidak memiliki tulisan sama sekali",
            "pilihan_c": "Carousel yang berputar otomatis tanpa disentuh",
            "pilihan_d": "Postingan yang berbayar kepada pihak Instagram",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can6-3",
            "urutan": 3,
            "pertanyaan": "Singkatan dari CTA dalam desain slide penutup promosi adalah:",
            "pilihan_a": "Call to Action (ajakan bertindak seperti 'Save postingan ini' atau 'Klik link bio')",
            "pilihan_b": "Cost to Advertise",
            "pilihan_c": "Central Typography Area",
            "pilihan_d": "Customer Target Audience",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can6-4",
            "urutan": 4,
            "pertanyaan": "Berapakah jumlah slide maksimal yang diizinkan oleh Instagram untuk 1 postingan carousel saat ini?",
            "pilihan_a": "Hingga 20 slide",
            "pilihan_b": "Hanya 3 slide",
            "pilihan_c": "Maksimal 5 slide",
            "pilihan_d": "Tidak terbatas",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can6-5",
            "urutan": 5,
            "pertanyaan": "Elemen visual apakah yang efektif ditaruh di pojok kanan bawah slide carousel untuk memandu audiens terus menggeser?",
            "pilihan_a": "Tanda panah geser (swipe indicator / 'Swipe >>>')",
            "pilihan_b": "Logo garansi uang kembali",
            "pilihan_c": "Foto tanda tangan basah",
            "pilihan_d": "Icon gembok terkunci",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-7",
        "urutan": 7,
        "judul": "Desain Story Interaktif & Sampul Sorotan (Highlight Cover)",
        "durasiMenit": 35,
        "isiMateri": "Instagram Story adalah kanal tercepat untuk membangun interaksi harian dan konversi penjualan langsung. Modul ini mengulas tata letak vertikal rasio 9:16 (1080x1920 px), penempatan area aman (Safe Zone) agar stiker polling dan nama akun tidak tertutup sistem IG, serta pembuatan set icon Highlight Cover yang estetik untuk profil toko online (FAQ, Testimoni, Katalog, Cara Order).",
        "videoUrl": "https://www.youtube.com/watch?v=mD19zG99Hqw",
        "lampiranPath": "panduan_canva_modul_7.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can7-1",
            "urutan": 1,
            "pertanyaan": "Berapa rasio aspek dan ukuran standar kanvas untuk Instagram Story dan Reels?",
            "pilihan_a": "Rasio 9:16 dengan resolusi 1080 x 1920 piksel",
            "pilihan_b": "Rasio 1:1 dengan resolusi 1080 x 1080 piksel",
            "pilihan_c": "Rasio 16:9 dengan resolusi 1920 x 1080 piksel",
            "pilihan_d": "Rasio 4:3 dengan resolusi 800 x 600 piksel",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can7-2",
            "urutan": 2,
            "pertanyaan": "Apa yang dimaksud dengan 'Safe Zone' pada desain Instagram Story?",
            "pilihan_a": "Area bebas sekitar 250px di bagian atas dan bawah agar teks/tombol tidak tertutup oleh nama akun dan kolom ketik pesan",
            "pilihan_b": "Folder privat yang dikunci kata sandi",
            "pilihan_c": "Zona waktu khusus saat mengunggah postingan",
            "pilihan_d": "Area bebas sensor kata-kata kasar",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can7-3",
            "urutan": 3,
            "pertanyaan": "Fungsi dari 'Highlight Cover' (Sampul Sorotan) pada beranda profil Instagram bisnis adalah:",
            "pilihan_a": "Merapikan arsip informasi penting (Testimoni, Harga, Cara Pesan) dengan ikon serasi agar profil terlihat profesional",
            "pilihan_b": "Menghapus pesan DM otomatis dari kompetitor",
            "pilihan_c": "Mengirimkan email penawaran ke seluruh followers",
            "pilihan_d": "Menaikkan jumlah like foto lama",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can7-4",
            "urutan": 4,
            "pertanyaan": "Stiker interaktif apakah di Instagram Story yang paling efektif untuk memicu respon klik cepat dari penonton?",
            "pilihan_a": "Stiker Polling (Jajak Pendapat) dan Quiz interaktif",
            "pilihan_b": "Stiker jam dinding statis",
            "pilihan_c": "Stiker cuaca hujan",
            "pilihan_d": "Stiker tanda seru merah",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can7-5",
            "urutan": 5,
            "pertanyaan": "Masa tayang standar satu postingan Instagram Story sebelum otomatis tersimpan ke arsip adalah:",
            "pilihan_a": "24 Jam",
            "pilihan_b": "12 Jam",
            "pilihan_c": "48 Jam",
            "pilihan_d": "7 Hari",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-8",
        "urutan": 8,
        "judul": "Desain Spanduk Promo Flash Sale & Marketplace",
        "durasiMenit": 45,
        "isiMateri": "Saat periode promo seperti tanggal kembar (11.11, 12.12) atau gajian (Payday Sale), desain promo harus mampu mengkonversi pengunjung menjadi pembeli. Anda akan mempraktikkan pembuatan banner promo marketplace (Shopee/Tokopedia): teknik pop-out produk dengan Magic Background Remover, penambahan badge diskon tajam 'Diskon 50%', bayangan realistis produk, dan copywriting penawaran terbatas.",
        "videoUrl": "https://www.youtube.com/watch?v=qXg7n-Gq3c4",
        "lampiranPath": "panduan_canva_modul_8.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can8-1",
            "urutan": 1,
            "pertanyaan": "Fitur di Canva yang dapat menghapus latar belakang foto produk secara instan dalam 1 klik adalah:",
            "pilihan_a": "Background Remover (Magic Eraser)",
            "pilihan_b": "Layer Masking manual",
            "pilihan_c": "Clone Stamp Tool",
            "pilihan_d": "Crop Shape Tool",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can8-2",
            "urutan": 2,
            "pertanyaan": "Elemen apakah yang wajib ditambahkan di bawah foto produk agar produk tidak terlihat melayang palsu pada banner promo?",
            "pilihan_a": "Efek bayangan realistis (Contact Shadow)",
            "pilihan_b": "Garis border neon tebal",
            "pilihan_c": "Emotikon api menyala",
            "pilihan_d": "Peta lokasi Google Maps",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can8-3",
            "urutan": 3,
            "pertanyaan": "Taktik psikologi harga manakah yang sering digunakan pada spanduk diskon kilat (Flash Sale)?",
            "pilihan_a": "Mencantumkan harga lama yang dicoret di samping harga promo diskon besar",
            "pilihan_b": "Menyembunyikan harga sampai konsumen bertanya di WhatsApp",
            "pilihan_c": "Menuliskan harga dalam mata uang asing",
            "pilihan_d": "Menggunakan font ukuran 8 yang sangat kecil",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can8-4",
            "urutan": 4,
            "pertanyaan": "Warna lencana (badge) promo apakah yang paling umum digunakan untuk memicu rasa urgensi 'Beli Sekarang'?",
            "pilihan_a": "Merah terang atau Kuning menyala",
            "pilihan_b": "Abu-abu muda",
            "pilihan_c": "Cokelat pastel",
            "pilihan_d": "Biru pucat",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can8-5",
            "urutan": 5,
            "pertanyaan": "Ukuran rasio standar untuk banner header toko di Shopee/Tokopedia umumnya berbentuk:",
            "pilihan_a": "Persegi panjang memanjang (Landscape rasio 2:1)",
            "pilihan_b": "Persegi vertikal (Portrait 9:16)",
            "pilihan_c": "Lingkaran penuh",
            "pilihan_d": "Segitiga sama sisi",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-9",
        "urutan": 9,
        "judul": "Animasi Elemen & Pembuatan Video Pendek Reels",
        "durasiMenit": 40,
        "isiMateri": "Konten video pendek vertikal (Instagram Reels & TikTok) adalah mesin pendorong jangkauan organik terkuat saat ini. Modul ini mengajarkan pembuatan Reels dinamis di Canva: memotong durasi klip video (trimming), menambahkan transisi halaman yang mulus (Match & Move), memberi animasi teks menarik (Typewriter, Pop, Rise), serta menyisipkan musik latar bebas royalti.",
        "videoUrl": "https://www.youtube.com/watch?v=J_7z9YtLz3o",
        "lampiranPath": "panduan_canva_modul_9.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can9-1",
            "urutan": 1,
            "pertanyaan": "Format file video standar yang harus dipilih saat mengunduh video Reels dari Canva adalah:",
            "pilihan_a": "MP4 Video (resolusi 1080p)",
            "pilihan_b": "GIF animasi tanpa suara",
            "pilihan_c": "AVI resolusi rendah",
            "pilihan_d": "FLV flash",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can9-2",
            "urutan": 2,
            "pertanyaan": "Fitur transisi cerdas di Canva yang dapat menganimasikan pergeseran posisi elemen antar halaman secara otomatis adalah:",
            "pilihan_a": "Match & Move",
            "pilihan_b": "Color Dissolve",
            "pilihan_c": "Spin 360",
            "pilihan_d": "Pixelate",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can9-3",
            "urutan": 3,
            "pertanyaan": "Berapa detik 'Golden Rule' durasi hook di awal video Reels sebelum penonton memutuskan untuk terus menonton atau scroll?",
            "pilihan_a": "1 hingga 3 detik pertama",
            "pilihan_b": "30 detik pertama",
            "pilihan_c": "1 menit pertama",
            "pilihan_d": "Bebas kapan saja",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can9-4",
            "urutan": 4,
            "pertanyaan": "Efek animasi teks apakah di Canva yang memunculkan huruf satu demi satu menyerupai ketikan mesin tik?",
            "pilihan_a": "Typewriter",
            "pilihan_b": "Stomp",
            "pilihan_c": "Neon",
            "pilihan_d": "Breathe",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can9-5",
            "urutan": 5,
            "pertanyaan": "Mengapa penggunaan musik yang memiliki hak cipta ilegal harus dihindari saat mengekspor video untuk iklan berbayar?",
            "pilihan_a": "Karena video iklan dapat dinonaktifkan suaranya (mute) atau diblokir oleh platform periklanan",
            "pilihan_b": "Karena video otomatis berubah menjadi hitam putih",
            "pilihan_c": "Karena durasi video dipotong menjadi 5 detik",
            "pilihan_d": "Karena kuota iklan dipotong dua kali lipat",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-canva-10",
        "urutan": 10,
        "judul": "Perancangan Kalender Konten Mingguan Terjadwal",
        "durasiMenit": 45,
        "isiMateri": "Modul penutup ini menggabungkan semua keterampilan menjadi alur kerja profesional. Anda akan mempelajari teknik Content Pillars (Edukasi, Hiburan, Testimoni, Promosi Penjualan), strategi Batch Production (mendesain 7 postingan sekaligus dalam 1 hari), serta pemanfaatan fitur Content Planner di Canva untuk menjadwalkan publikasi otomatis ke akun media sosial bisnis Anda.",
        "videoUrl": "https://www.youtube.com/watch?v=xV3U7N_kIpw",
        "lampiranPath": "panduan_canva_modul_10.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-can10-1",
            "urutan": 1,
            "pertanyaan": "Apa yang dimaksud dengan 'Content Pillars' dalam strategi media sosial?",
            "pilihan_a": "Tema-tema pokok yang menjadi panduan variasi topik konten (seperti Edukasi, Inspirasi, Hiburan, dan Promosi) agar akun tidak membosankan",
            "pilihan_b": "Tiang penyangga fisik untuk tripod kamera smartphone",
            "pilihan_c": "Daftar kata kunci terlarang di media sosial",
            "pilihan_d": "Aturan jam tidur staf pengelola media sosial",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can10-2",
            "urutan": 2,
            "pertanyaan": "Metode kerja 'Batch Designing' adalah:",
            "pilihan_a": "Membuat seluruh stok materi desain untuk 1 minggu atau 1 bulan sekaligus dalam satu sesi kerja khusus agar lebih efisien",
            "pilihan_b": "Mendesain secara terburu-buru 5 menit sebelum jam tayang",
            "pilihan_c": "Menyalin postingan milik kompetitor secara mentah-mentah",
            "pilihan_d": "Membeli akun media sosial yang sudah jadi",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can10-3",
            "urutan": 3,
            "pertanyaan": "Fitur di Canva yang memungkinkan Anda mengatur tanggal dan jam tayang otomatis postingan langsung ke media sosial adalah:",
            "pilihan_a": "Content Planner (Schedule Post)",
            "pilihan_b": "Brand Voice AI",
            "pilihan_c": "Color Palette Generator",
            "pilihan_d": "Mockup Creator",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can10-4",
            "urutan": 4,
            "pertanyaan": "Berapakah proporsi seimbang yang disarankan antara konten edukasi/nilai tambah vs konten jualan hard-selling langsung pada feed bisnis?",
            "pilihan_a": "Sekitar 80% edukasi/hiburan/interaksi dan 20% promosi penjualan (Prinsip Pareto)",
            "pilihan_b": "100% wajib seluruhnya promosi jualan produk tanpa jeda",
            "pilihan_c": "0% edukasi dan hanya foto testimoni",
            "pilihan_d": "50% konten meme luar negeri dan 50% link judi",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-can10-5",
            "urutan": 5,
            "pertanyaan": "Tindakan evaluasi berkala apakah yang wajib dilakukan setelah 1 bulan kalender konten dijalankan?",
            "pilihan_a": "Memeriksa menu Insight/Analitik untuk melihat format postingan mana yang paling banyak disave, dishare, dan mendatangkan followers",
            "pilihan_b": "Menghapus seluruh postingan lama yang ada di profil",
            "pilihan_c": "Mengubah nama toko dan logo setiap 2 minggu sekali",
            "pilihan_d": "Menonaktifkan kolom komentar postingan secara permanen",
            "kunci_jawaban": "A"
          }
        ]
      }
    ],
    "totalDurasiMenit": 400
  },
  {
    "id": "00000000-0000-4000-b000-000000000003",
    "judul": "Bahasa Inggris untuk Percakapan Kerja",
    "slug": "bahasa-inggris-percakapan-kerja",
    "kategori": "Bahasa",
    "ringkasan": "Kuasai komunikasi bahasa Inggris percaya diri: perkenalan profesional, percakapan kantor, email bisnis, meeting, negosiasi, hingga wawancara kerja.",
    "deskripsi": "Pelatihan intensif 10 bagian yang dirancang khusus untuk staf profesional, admin, dan profesional muda. Anda belajar mengatasi gugup saat berbahasa Inggris, menguasai frasa rapat resmi, etiket menerima panggilan telepon dari klien internasional, menyusun email bisnis yang ringkas, berargumen sopan saat meeting, hingga teknik wawancara kerja STAR.",
    "harga": 450000,
    "kuota": 20,
    "terpakai": 7,
    "sisaKursi": 13,
    "nilaiLulus": 60,
    "status": "terbit",
    "instrukturId": "00000000-0000-4000-a000-000000000013",
    "instrukturNama": "Michael Sitorus",
    "instrukturGelar": "Corporate English Trainer",
    "instrukturAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "image": "/images/hero_learning_desk.jpg",
    "highlightTag": "Karier Global",
    "modul": [
      {
        "id": "mod-eng-1",
        "urutan": 1,
        "judul": "Professional Self-Introduction & Networking",
        "durasiMenit": 40,
        "isiMateri": "Modul pertama berfokus pada fondasi perkenalan diri formal di lingkungan kerja. Anda mempelajari frasa pembuka, menyusun 'Elevator Pitch' 60 detik yang merangkum nama, jabatan, divisi kerja, dan kontribusi Anda. Selain itu, Anda akan berlatih topik 'Small Talk' ringan (cuaca, perjalanan kantor) untuk mencairkan suasana sebelum rapat dimulai tanpa canggung.",
        "videoUrl": "https://www.youtube.com/watch?v=w-CSmUXe0bU",
        "lampiranPath": "panduan_english_modul_1.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng1-1",
            "urutan": 1,
            "pertanyaan": "Which phrase is the most professional way to introduce your current job position during a corporate networking event?",
            "pilihan_a": "\"I am working as a Senior Administrative Specialist at Pijar Aksara.\"",
            "pilihan_b": "\"Me do office things in Pijar Aksara.\"",
            "pilihan_c": "\"I am boss of paperworks here.\"",
            "pilihan_d": "\"My job is very hard at Pijar Aksara.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng1-2",
            "urutan": 2,
            "pertanyaan": "What is the primary objective of an 'Elevator Pitch' in professional introductions?",
            "pilihan_a": "To clearly summarize who you are, what you do, and the value you bring within 30 to 60 seconds",
            "pilihan_b": "To explain the complete history of your life since childhood",
            "pilihan_c": "To ask for an immediate salary raise from the client",
            "pilihan_d": "To critique the architecture of the building elevator",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng1-3",
            "urutan": 3,
            "pertanyaan": "Which of the following topics is generally SAFE and APPROPRIATE for professional small talk before a business meeting?",
            "pilihan_a": "The weather or travel trip to the venue",
            "pilihan_b": "Personal political voting preferences",
            "pilihan_c": "Detailed religious beliefs",
            "pilihan_d": "Asking about colleagues' personal romantic relationships",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng1-4",
            "urutan": 4,
            "pertanyaan": "When greeting an international client for the first time in an official morning meeting, you should say:",
            "pilihan_a": "\"Good morning, Mr. David. It's a pleasure to meet you.\"",
            "pilihan_b": "\"Hey dude, what's up?\"",
            "pilihan_c": "\"Yo, how is life going?\"",
            "pilihan_d": "\"Morning man, why are you here?\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng1-5",
            "urutan": 5,
            "pertanyaan": "What is the proper professional response when someone says: \"Thank you for having me here today\"?",
            "pilihan_a": "\"You are most welcome. We are delighted to have you.\"",
            "pilihan_b": "\"No problem, I don't care.\"",
            "pilihan_c": "\"Yes, you should say thanks.\"",
            "pilihan_d": "\"Never mind, whatever.\"",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-2",
        "urutan": 2,
        "judul": "Office Etiquette & Daily Workplace Conversations",
        "durasiMenit": 40,
        "isiMateri": "Komunikasi antar rekan kerja sehari-hari memerlukan kesantunan diplomatis (politeness strategies). Di modul ini, Anda mempelajari penggunaan kata bantu modal verbs (Could you please..., Would you mind..., I was wondering if...) saat meminta bantuan atau file dokumen, menanyakan progres tenggat waktu (deadline), serta mengonfirmasi ketersediaan rekan tanpa terdengar menuntut.",
        "videoUrl": "https://www.youtube.com/watch?v=zYyB-B8X0_c",
        "lampiranPath": "panduan_english_modul_2.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng2-1",
            "urutan": 1,
            "pertanyaan": "Which sentence is the most polite and professional way to ask a colleague for a financial report file?",
            "pilihan_a": "\"Could you please send me the financial report when you have a moment?\"",
            "pilihan_b": "\"Give me the financial report now!\"",
            "pilihan_c": "\"Where is report? Send it fast!\"",
            "pilihan_d": "\"You must email me the report right this second.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng2-2",
            "urutan": 2,
            "pertanyaan": "What grammatical form follows the polite request phrase: \"Would you mind...?\"",
            "pilihan_a": "Verb-ing (Gerund), e.g., \"Would you mind checking this spreadsheet?\"",
            "pilihan_b": "Past tense verb (Verb 2), e.g., \"Would you mind checked...?\"",
            "pilihan_c": "Base verb with 'to', e.g., \"Would you mind to check...?\"",
            "pilihan_d": "Future tense, e.g., \"Would you mind will check...?\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng2-3",
            "urutan": 3,
            "pertanyaan": "How do you politely decline an invitation to join a lunch meeting due to an urgent task?",
            "pilihan_a": "\"I'd love to join, but unfortunately I have an urgent deadline to complete by 2 PM.\"",
            "pilihan_b": "\"No, your lunch is boring.\"",
            "pilihan_c": "\"I hate restaurants.\"",
            "pilihan_d": "\"Don't invite me again.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng2-4",
            "urutan": 4,
            "pertanyaan": "What is the professional expression to ask a coworker when a particular project task will be completed?",
            "pilihan_a": "\"Could you provide an estimated timeline for this deliverable?\"",
            "pilihan_b": "\"Why are you so slow on this?\"",
            "pilihan_c": "\"Finish it yesterday!\"",
            "pilihan_d": "\"Are you sleeping on the job?\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng2-5",
            "urutan": 5,
            "pertanyaan": "The idiom \"to be on the same page\" in daily office conversation means:",
            "pilihan_a": "To have the same mutual understanding and agreement regarding a plan",
            "pilihan_b": "To read the exact same printed page in a physical book",
            "pilihan_c": "To sit side by side on one office chair",
            "pilihan_d": "To share the same computer monitor screen",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-3",
        "urutan": 3,
        "judul": "Effective Business Email Writing & Inquiries",
        "durasiMenit": 45,
        "isiMateri": "Email adalah rekam jejak tertulis resmi instansi kerja. Modul ini membongkar struktur email bisnis standar internasional: Subject Line yang informatif, salam pembuka yang tepat (Dear Mr./Ms. vs Dear Team), paragraf inti yang ringkas menggunakan poin-poin (bullet points), cara menyebutkan lampiran (Please find attached), Call-to-Action yang jelas, dan salam penutup formal (Best regards, Sincerely).",
        "videoUrl": "https://www.youtube.com/watch?v=8l-Q9V-zJpM",
        "lampiranPath": "panduan_english_modul_3.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng3-1",
            "urutan": 1,
            "pertanyaan": "Which of the following email subject lines is the most effective and professional?",
            "pilihan_a": "\"Meeting Reschedule: Q3 Financial Review - Pijar Aksara\"",
            "pilihan_b": "\"URGENT PLEASE READ NOW!!!\"",
            "pilihan_c": "\"Hello\"",
            "pilihan_d": "\"meeting tomorrow maybe?\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng3-2",
            "urutan": 2,
            "pertanyaan": "How should you correctly inform the recipient that a PDF document is attached to the email?",
            "pilihan_a": "\"Please find attached the signed contract for your review.\"",
            "pilihan_b": "\"Look at my file inside computer.\"",
            "pilihan_c": "\"I throw PDF to you.\"",
            "pilihan_d": "\"Attachment is flying in email.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng3-3",
            "urutan": 3,
            "pertanyaan": "Which sign-off is considered universally appropriate for formal corporate business correspondence?",
            "pilihan_a": "\"Best regards,\"",
            "pilihan_b": "\"XOXO,\"",
            "pilihan_c": "\"See ya later,\"",
            "pilihan_d": "\"Cheers bro,\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng3-4",
            "urutan": 4,
            "pertanyaan": "What does the abbreviation \"FYI\" in a workplace email communication stand for?",
            "pilihan_a": "\"For Your Information\"",
            "pilihan_b": "\"Follow Your Instinct\"",
            "pilihan_c": "\"Find Your Invoice\"",
            "pilihan_d": "\"Fix Your Items\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng3-5",
            "urutan": 5,
            "pertanyaan": "If you need an answer from the client by Friday afternoon, which polite closing sentence should you write?",
            "pilihan_a": "\"I would appreciate it if you could share your feedback by Friday, 5 PM.\"",
            "pilihan_b": "\"Answer me before Friday or else!\"",
            "pilihan_c": "\"Friday is the end of the world for you.\"",
            "pilihan_d": "\"Reply fast because I am waiting.\"",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-4",
        "urutan": 4,
        "judul": "Handling Telephone Calls & Scheduling Appointments",
        "durasiMenit": 40,
        "isiMateri": "Berbicara via telepon tanpa melihat ekspresi wajah lawan bicara sering membuat cemas. Modul ini melatih etiket telepon kantor: salam pembuka dan identifikasi diri/perusahaan, meminta penelpon menunggu (hold the line), mencatat pesan (taking a message), mengeja nama atau alamat email menggunakan alfabet fonetik internasional (NATO Phonetic Alphabet), serta konfirmasi ulang janji temu.",
        "videoUrl": "https://www.youtube.com/watch?v=5rT7Dk97LwQ",
        "lampiranPath": "panduan_english_modul_4.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng4-1",
            "urutan": 1,
            "pertanyaan": "What is the standard professional telephone greeting when answering an office phone call?",
            "pilihan_a": "\"Good morning, Pijar Aksara Institute, Michael speaking. How may I assist you today?\"",
            "pilihan_b": "\"Hello, who are you?\"",
            "pilihan_c": "\"Yes? What do you want?\"",
            "pilihan_d": "\"Speak up, I am busy.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng4-2",
            "urutan": 2,
            "pertanyaan": "If the person the caller is looking for is currently in another meeting, what should you politely say?",
            "pilihan_a": "\"I'm afraid Mr. Yudha is currently in a meeting. May I take a message, or would you prefer to call back later?\"",
            "pilihan_b": "\"He is hiding from you right now.\"",
            "pilihan_c": "\"He cannot talk because he does not like calls.\"",
            "pilihan_d": "\"Call back tomorrow, bye.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng4-3",
            "urutan": 3,
            "pertanyaan": "Which phrase is correct when asking a caller to hold while you transfer the call?",
            "pilihan_a": "\"Could you please hold the line for a moment while I transfer your call?\"",
            "pilihan_b": "\"Wait there and don't make noise.\"",
            "pilihan_c": "\"Hold your breath now.\"",
            "pilihan_d": "\"Stay dead on the phone.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng4-4",
            "urutan": 4,
            "pertanyaan": "In the NATO Phonetic Alphabet, how do you clearly spell the letters \"P - A\" over a poor phone connection?",
            "pilihan_a": "\"Papa - Alpha\"",
            "pilihan_b": "\"Peter - Apple\"",
            "pilihan_c": "\"Paris - America\"",
            "pilihan_d": "\"Puppy - Animal\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng4-5",
            "urutan": 5,
            "pertanyaan": "How do you confirm a scheduled meeting time over the phone before hanging up?",
            "pilihan_a": "\"To confirm, we have an appointment scheduled for next Tuesday, October 28th at 10:00 AM.\"",
            "pilihan_b": "\"See you whenever you show up.\"",
            "pilihan_c": "\"Meeting is locked, do not forget.\"",
            "pilihan_d": "\"Tuesday morning, that's it.\"",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-5",
        "urutan": 5,
        "judul": "Leading & Participating in Business Meetings",
        "durasiMenit": 45,
        "isiMateri": "Meeting dalam bahasa Inggris memerlukan kontrol alur dan penguasaan agenda. Pelajari cara membuka rapat resmi ('Let's get down to business'), membagikan agenda pembahasan, mengundang rekan lain untuk berpendapat ('I'd like to hear Sarah's thoughts on this'), menjaga waktu (keeping to time), serta merangkum keputusan dan action points sebelum rapat ditutup.",
        "videoUrl": "https://www.youtube.com/watch?v=yYkH0c0xV8o",
        "lampiranPath": "panduan_english_modul_5.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng5-1",
            "urutan": 1,
            "pertanyaan": "Which business idiom is commonly used by a meeting chairperson to signal that everyone should stop chatting and begin the formal discussion?",
            "pilihan_a": "\"Let's get down to business.\"",
            "pilihan_b": "\"Let's break the leg.\"",
            "pilihan_c": "\"Let's hit the ceiling.\"",
            "pilihan_d": "\"Let's bite the bullet.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng5-2",
            "urutan": 2,
            "pertanyaan": "How do you politely invite a quiet team member named Maya to share her perspective during the meeting?",
            "pilihan_a": "\"Maya, we would love to hear your thoughts on this proposal. What do you think?\"",
            "pilihan_b": "\"Maya, why are you not talking at all?\"",
            "pilihan_c": "\"Speak now Maya, it is an order!\"",
            "pilihan_d": "\"Maya, say something quickly.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng5-3",
            "urutan": 3,
            "pertanyaan": "If discussion goes off-topic, which diplomatic phrase brings the team back to the primary agenda item?",
            "pilihan_a": "\"That's an interesting point, but let's stick to the main agenda item for today.\"",
            "pilihan_b": "\"Stop talking nonsense, that is garbage.\"",
            "pilihan_c": "\"Shut up and follow the paper!\"",
            "pilihan_d": "\"Your opinion is totally useless right now.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng5-4",
            "urutan": 4,
            "pertanyaan": "What phrase is suitable when asking for clarification if you did not understand a technical point in the meeting?",
            "pilihan_a": "\"Could you please elaborate on what you mean by operational overhead?\"",
            "pilihan_b": "\"Your English is very strange, repeat!\"",
            "pilihan_c": "\"What was that gibberish?\"",
            "pilihan_d": "\"I have no idea what you are saying.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng5-5",
            "urutan": 5,
            "pertanyaan": "How does the meeting leader officially conclude the session and thank attendees?",
            "pilihan_a": "\"Thank you everyone for your active participation today. We will circulate the minutes by tomorrow morning.\"",
            "pilihan_b": "\"Finally it is over, get out of the room.\"",
            "pilihan_c": "\"Meeting finished, bye.\"",
            "pilihan_d": "\"We waste one hour here, good luck.\"",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-6",
        "urutan": 6,
        "judul": "Expressing Opinions & Polite Disagreement",
        "durasiMenit": 45,
        "isiMateri": "Menyanggah pendapat di ruang rapat tanpa menyinggung perasaan rekan kerja adalah seni komunikasi tingkat tinggi. Modul ini mengajarkan variasi derajat opini (Strong: I firmly believe... vs Moderate: In my view...), teknik menyetujui sebagian ('I agree up to a point, however...'), serta menyanggah secara diplomatis ('I see where you're coming from, but we should also consider the financial risk').",
        "videoUrl": "https://www.youtube.com/watch?v=QxZ3F9T9QW8",
        "lampiranPath": "panduan_english_modul_6.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng6-1",
            "urutan": 1,
            "pertanyaan": "Which phrase expresses polite, constructive disagreement in an executive board meeting?",
            "pilihan_a": "\"I see your point, however, I'm afraid we might exceed our allocated budget if we proceed that way.\"",
            "pilihan_b": "\"You are completely wrong and that idea is bad.\"",
            "pilihan_c": "\"I disagree 100% because you do not know anything.\"",
            "pilihan_d": "\"No way! Never in a million years.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng6-2",
            "urutan": 2,
            "pertanyaan": "How do you express strong, firm agreement with a marketing proposal?",
            "pilihan_a": "\"I completely agree with this strategy; it aligns perfectly with our quarterly targets.\"",
            "pilihan_b": "\"Maybe yes, maybe no.\"",
            "pilihan_c": "\"I don't care whatever you do.\"",
            "pilihan_d": "\"If you say so, fine.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng6-3",
            "urutan": 3,
            "pertanyaan": "The phrase: \"I see what you mean, but...\" is an example of:",
            "pilihan_a": "The 'Diplomatic Cushion' technique (acknowledging the speaker's viewpoint before introducing a counter-argument)",
            "pilihan_b": "A direct personal insult",
            "pilihan_c": "An immediate surrender of your opinion",
            "pilihan_d": "A formal resignation from the company",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng6-4",
            "urutan": 4,
            "pertanyaan": "Which of the following phrases is the most professional way to state your personal perspective?",
            "pilihan_a": "\"From my perspective, focusing on existing customer retention offers higher ROI.\"",
            "pilihan_b": "\"According to me only, everyone else is wrong.\"",
            "pilihan_c": "\"Trust me because I am genius.\"",
            "pilihan_d": "\"I think so because I like it.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng6-5",
            "urutan": 5,
            "pertanyaan": "When two parties agree to meet in the middle and accept mutually beneficial terms, they reach a:",
            "pilihan_a": "Compromise (Win-Win Solution)",
            "pilihan_b": "Deadlock",
            "pilihan_c": "Hostile takeover",
            "pilihan_d": "Termination notice",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-7",
        "urutan": 7,
        "judul": "Delivering Impactful Business Presentations",
        "durasiMenit": 50,
        "isiMateri": "Presentasi bisnis di depan audiens internasional menuntut penguasaan 'Signposting Language' (frasa penunjuk jalan bagi pendengar). Pelajari frasa pembuka memikat, mengumumkan tujuan presentasi, menghubungkan slide satu ke slide berikutnya ('Moving on to the next chart...'), mendeskripsikan tren data grafik (increase, soar, fluctuate, level off), serta memandu sesi tanya jawab (Q&A) dengan percaya diri.",
        "videoUrl": "https://www.youtube.com/watch?v=u1j9T8A4t6k",
        "lampiranPath": "panduan_english_modul_7.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng7-1",
            "urutan": 1,
            "pertanyaan": "Which signposting phrase is most suitable for transitioning smoothly from Slide 3 to Slide 4 in a presentation?",
            "pilihan_a": "\"Now that we've covered the revenue figures, let's turn our attention to client acquisition costs.\"",
            "pilihan_b": "\"Next slide please, I am done here.\"",
            "pilihan_c": "\"Click the button computer guy.\"",
            "pilihan_d": "\"Forget that slide, look here now.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng7-2",
            "urutan": 2,
            "pertanyaan": "If a sales graph shows a dramatic, rapid upward surge in monthly revenue, which verb best describes this trend?",
            "pilihan_a": "Skyrocketed / Soared",
            "pilihan_b": "Plummeted",
            "pilihan_c": "Stagnated",
            "pilihan_d": "Deteriorated",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng7-3",
            "urutan": 3,
            "pertanyaan": "How should a presenter politely handle a difficult question during the Q&A session when they do not have the exact number on hand?",
            "pilihan_a": "\"That's an excellent question. I don't have the exact breakdown with me right now, but I will verify the figures and follow up with you via email this afternoon.\"",
            "pilihan_b": "\"Don't ask hard questions like that!\"",
            "pilihan_c": "\"I don't know and nobody cares.\"",
            "pilihan_d": "\"Ask someone else in the room.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng7-4",
            "urutan": 4,
            "pertanyaan": "The expression: \"To recap the key points of our proposal...\" is used to:",
            "pilihan_a": "Summarize the essential highlights near the conclusion of the presentation",
            "pilihan_b": "Cancel the entire presentation immediately",
            "pilihan_c": "Criticize competitor's products",
            "pilihan_d": "Introduce the speaker's family members",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng7-5",
            "urutan": 5,
            "pertanyaan": "What should you avoid doing during a professional slide presentation in English?",
            "pilihan_a": "Reading whole paragraphs word-for-word with your back turned to the audience",
            "pilihan_b": "Making natural eye contact with different sections of the room",
            "pilihan_c": "Using high-quality visual charts to illustrate data",
            "pilihan_d": "Speaking with clear pronunciation and moderate pacing",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-8",
        "urutan": 8,
        "judul": "Negotiation Tactics & Client Relationship Handling",
        "durasiMenit": 45,
        "isiMateri": "Negosiasi kontrak dan penanganan keluhan klien menuntut bahasa yang taktis dan empati tinggi. Di modul ini, pelajari 'Conditional Sentences' untuk tawar-menawar harga ('If you could increase the order volume to 500 units, we would be able to offer a 10% discount'), etiket menghadapi klien yang komplain tanpa panik, meminta maaf secara profesional (de-escalation), dan menawarkan solusi konkrit.",
        "videoUrl": "https://www.youtube.com/watch?v=4J8Q_dGv7F0",
        "lampiranPath": "panduan_english_modul_8.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng8-1",
            "urutan": 1,
            "pertanyaan": "Which sentence structure is the standard diplomatic formula for business price negotiations?",
            "pilihan_a": "\"If you commit to a 12-month contract, we would be open to discussing a tiered discount.\"",
            "pilihan_b": "\"Pay full price or go away!\"",
            "pilihan_c": "\"Give us money and we will give you product maybe.\"",
            "pilihan_d": "\"Our price is cheap, why are you asking discount?\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng8-2",
            "urutan": 2,
            "pertanyaan": "When an angry client calls regarding a delayed shipment, what is the best initial response to defuse tension?",
            "pilihan_a": "\"I sincerely apologize for the inconvenience this delay has caused. I understand your urgency, and I am personally looking into the tracking status right now.\"",
            "pilihan_b": "\"It is not my fault, blame the courier company!\"",
            "pilihan_c": "\"Why are you shouting? Calm down or I hang up.\"",
            "pilihan_d": "\"Delays happen everywhere, deal with it.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng8-3",
            "urutan": 3,
            "pertanyaan": "What does the negotiation term \"BATNA\" stand for?",
            "pilihan_a": "Best Alternative to a Negotiated Agreement",
            "pilihan_b": "Business Action Tariff Network Association",
            "pilihan_c": "Banking Transfer Notice Agreement",
            "pilihan_d": "Basic Administrative Technique for Non-Auditors",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng8-4",
            "urutan": 4,
            "pertanyaan": "Which phrase politely indicates that a proposed offer is below what your company can accommodate?",
            "pilihan_a": "\"Unfortunately, that rate is slightly below our break-even threshold, but here is what we can propose instead.\"",
            "pilihan_b": "\"Are you crazy with that low number?\"",
            "pilihan_c": "\"We are not a charity, no way.\"",
            "pilihan_d": "\"That price is an insult to our dignity.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng8-5",
            "urutan": 5,
            "pertanyaan": "How do you close a successful negotiation call with enthusiasm and professionalism?",
            "pilihan_a": "\"We look forward to a fruitful collaboration. I will prepare the formal agreement draft by tomorrow.\"",
            "pilihan_b": "\"Good, you finally agreed, goodbye.\"",
            "pilihan_c": "\"Don't change your mind or I sue you.\"",
            "pilihan_d": "\"Deal done, send cash.\"",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-9",
        "urutan": 9,
        "judul": "Writing Meeting Minutes & Action Items Summary",
        "durasiMenit": 40,
        "isiMateri": "Notulensi rapat (Minutes of Meeting / MoM) adalah dokumen legal yang mendokumentasikan keputusan bersama. Modul ini mengajarkan cara menyusun MoM berbahasa Inggris yang padat dan jelas: struktur Header (Date, Time, Attendees, Absentees), pencatatan poin keputusan (Decisions Made), dan penulisan Action Items yang memuat PIC (Person In Charge) serta batas waktu penyelesaian (Deadline).",
        "videoUrl": "https://www.youtube.com/watch?v=hZ7y8wG8n4E",
        "lampiranPath": "panduan_english_modul_9.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng9-1",
            "urutan": 1,
            "pertanyaan": "What is the primary purpose of writing official 'Meeting Minutes' (MoM)?",
            "pilihan_a": "To provide an objective, accurate written record of discussions, decisions, and assigned responsibilities for all stakeholders",
            "pilihan_b": "To write a word-for-word transcript of jokes told during the meeting",
            "pilihan_c": "To assign penalties and blame to absent participants",
            "pilihan_d": "To test the secretary's typing speed",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng9-2",
            "urutan": 2,
            "pertanyaan": "What does the abbreviation \"PIC\" in an Action Items table stand for?",
            "pilihan_a": "Person In Charge",
            "pilihan_b": "Photo In Camera",
            "pilihan_c": "Project Initial Cost",
            "pilihan_d": "Public Information Center",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng9-3",
            "urutan": 3,
            "pertanyaan": "Which sentence format is standard for documenting an Action Item in meeting minutes?",
            "pilihan_a": "\"Action Item: Michael to finalize vendor contract by Friday, Nov 3rd.\"",
            "pilihan_b": "\"Someone needs to do contracts sometime soon maybe.\"",
            "pilihan_c": "\"Vendor contract will do itself.\"",
            "pilihan_d": "\"Michael must work hard on contracts.\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng9-4",
            "urutan": 4,
            "pertanyaan": "In the meeting minutes header, the list of invited members who could not attend the meeting is labeled as:",
            "pilihan_a": "Regrets / Apologies / Absentees",
            "pilihan_b": "Fired employees",
            "pilihan_c": "Lost people",
            "pilihan_d": "Ignored list",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng9-5",
            "urutan": 5,
            "pertanyaan": "When distributing the completed minutes via email, what polite opening sentence should you write?",
            "pilihan_a": "\"Please find attached the minutes of our strategy meeting held on October 20th for your review and approval.\"",
            "pilihan_b": "\"Here is the paper from meeting, read it now.\"",
            "pilihan_c": "\"I typed this for you, so you must say thank you.\"",
            "pilihan_d": "\"Minutes attached, don't ask questions.\"",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-eng-10",
        "urutan": 10,
        "judul": "Job Interview Mastery: The STAR Method & Career Q&A",
        "durasiMenit": 50,
        "isiMateri": "Puncak dari kemahiran berbahasa Inggris kerja adalah kemampuan menghadapi wawancara kerja (Job Interview) di perusahaan multinasional. Kuasai kerangka STAR (Situation, Task, Action, Result) untuk menjawab pertanyaan berbasis perilaku (Behavioral Questions) seperti 'Tell me about a time you handled a difficult challenge'. Anda juga akan mempelajari cara bernegosiasi benefit kerja dan mengajukan pertanyaan balik cerdas kepada interviewer.",
        "videoUrl": "https://www.youtube.com/watch?v=7_tQnF9-qLs",
        "lampiranPath": "panduan_english_modul_10.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-eng10-1",
            "urutan": 1,
            "pertanyaan": "What does each letter in the renowned 'STAR Method' for behavioral job interviews represent?",
            "pilihan_a": "Situation, Task, Action, Result",
            "pilihan_b": "Skill, Talent, Attitude, Resilience",
            "pilihan_c": "Speed, Timing, Accuracy, Reliability",
            "pilihan_d": "Strategy, Team, Analysis, Report",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng10-2",
            "urutan": 2,
            "pertanyaan": "When answering the common interview question \"Tell me about yourself\", what should you focus on?",
            "pilihan_a": "A tailored summary of your professional background, key achievements, and why your skills align with this specific role",
            "pilihan_b": "Your childhood hobbies and primary school stories",
            "pilihan_c": "Complaining about how toxic your previous boss was",
            "pilihan_d": "Demanding a high salary before any other discussion",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng10-3",
            "urutan": 3,
            "pertanyaan": "In the 'Result' phase of the STAR response, what makes your answer most persuasive to the hiring manager?",
            "pilihan_a": "Providing quantifiable metrics and measurable outcomes (e.g., \"increased office efficiency by 25%\")",
            "pilihan_b": "Saying that everyone in the office clapped for you",
            "pilihan_c": "Explaining that you felt very tired after working",
            "pilihan_d": "Stating that you forgot the exact results",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng10-4",
            "urutan": 4,
            "pertanyaan": "When the interviewer asks: \"Do you have any questions for us?\" at the end, what is the best response?",
            "pilihan_a": "\"Yes, could you share what the primary challenges facing this team are over the next six months?\"",
            "pilihan_b": "\"No, I have no questions at all, can I go home?\"",
            "pilihan_c": "\"How many vacation days can I take immediately next week?\"",
            "pilihan_d": "\"When will you give me free food here?\"",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-eng10-5",
            "urutan": 5,
            "pertanyaan": "How should you follow up after completing an international job interview?",
            "pilihan_a": "Send a concise, professional 'Thank You' email within 24 hours expressing gratitude and reiterating enthusiasm for the role",
            "pilihan_b": "Call the interviewer's personal mobile phone 10 times at night",
            "pilihan_c": "Send direct messages to the interviewer's private personal social media account",
            "pilihan_d": "Wait quietly for two months without doing anything",
            "kunci_jawaban": "A"
          }
        ]
      }
    ],
    "totalDurasiMenit": 440
  },
  {
    "id": "00000000-0000-4000-b000-000000000004",
    "judul": "Dasar Pembukuan untuk UMKM",
    "slug": "dasar-pembukuan-umkm",
    "kategori": "Keuangan",
    "ringkasan": "Panduan praktis pembukuan usaha kecil: pisah rekening, buku kas masuk-keluar, hitung HPP realistis, laba rugi, hingga kelola cash flow anti-macet.",
    "deskripsi": "Course intensif 10 bagian khusus pemilik usaha mikro, warung, toko kelontong, kuliner, dan online shop. Pelajari cara menghentikan kebocoran uang dagang, memisahkan dompet pribadi dan bisnis, menghitung HPP per porsi, menentukan harga jual ber-margin untung, mengelola piutang jatuh tempo, hingga menyusun laporan laba rugi sederhana yang siap diajukan ke perbankan (KUR).",
    "harga": 300000,
    "kuota": 12,
    "terpakai": 11,
    "sisaKursi": 1,
    "nilaiLulus": 60,
    "status": "terbit",
    "instrukturId": "00000000-0000-4000-a000-000000000011",
    "instrukturNama": "Yudha Pratama",
    "instrukturGelar": "Konsultan Keuangan UMKM",
    "instrukturAvatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "image": "/images/card_pembukuan.jpg",
    "highlightTag": "Tersisa 1 Kursi!",
    "modul": [
      {
        "id": "mod-fin-1",
        "urutan": 1,
        "judul": "Fondasi Keuangan & Pemisahan Dompet Usaha",
        "durasiMenit": 35,
        "isiMateri": "Penyebab nomor satu UMKM bangkrut tanpa disadari adalah bercampurnya uang kas toko dengan uang dapur pribadi. Di modul pembuka ini, Anda akan membedah bahaya 'dompet silang', cara membuka rekening bank operasional khusus usaha, menentukan gaji tetap bulanan bagi pemilik usaha, serta menetapkan batas kas kecil (petty cash) kasir toko.",
        "videoUrl": "https://www.youtube.com/watch?v=c7uA5O_1d2M",
        "lampiranPath": "panduan_pembukuan_modul_1.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin1-1",
            "urutan": 1,
            "pertanyaan": "Apa risiko terbesar yang dialami pemilik usaha jika uang kas bisnis dan uang belanja pribadi disatukan dalam satu rekening?",
            "pilihan_a": "Modal usaha perlahan tergerus untuk konsumsi pribadi tanpa disadari hingga toko kekurangan modal kulakan",
            "pilihan_b": "Rekening bank otomatis diblokir oleh Bank Indonesia",
            "pilihan_c": "Harga jual barang otomatis naik sendiri",
            "pilihan_d": "Barang dagangan menjadi cepat kadaluarsa",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin1-2",
            "urutan": 2,
            "pertanyaan": "Bagaimanakah cara yang paling benar bagi pemilik usaha untuk mengambil keuntungan bagi kebutuhan hidup pribadinya?",
            "pilihan_a": "Menetapkan alokasi 'Gaji Pemilik' dalam jumlah tetap per bulan yang dicatat sebagai beban operasional usaha",
            "pilihan_b": "Mengambil uang kas kasir semaunya setiap kali butuh uang jajan",
            "pilihan_c": "Mengambil seluruh saldo kas toko di akhir hari",
            "pilihan_d": "Membebankan cicilan motor pribadi ke nota belanja bahan baku toko",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin1-3",
            "urutan": 3,
            "pertanyaan": "Apa fungsi dari penyediaan dana 'Petty Cash' (Kas Kecil) di tempat usaha harian?",
            "pilihan_a": "Membiayai pengeluaran operasional kecil dan mendesak (seperti beli lakban, bensin kurir, uang kembalian) dengan batas tertentu",
            "pilihan_b": "Membeli mesin pabrik skala besar",
            "pilihan_c": "Menyimpan seluruh keuntungan bersih tahunan",
            "pilihan_d": "Membayar pajak penghasilan tahunan badan",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin1-4",
            "urutan": 4,
            "pertanyaan": "Istilah akuntansi untuk penarikan dana usaha oleh pemilik untuk kepentingan non-bisnis pribadi disebut:",
            "pilihan_a": "Prive (Drawings)",
            "pilihan_b": "Amortisasi",
            "pilihan_c": "Depresiasi",
            "pilihan_d": "Dividen Saham Publik",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin1-5",
            "urutan": 5,
            "pertanyaan": "Kapan waktu paling lambat pencatatan transaksi uang masuk dan keluar toko sebaiknya dilakukan?",
            "pilihan_a": "Setiap hari sebelum toko tutup (tutup buku harian)",
            "pilihan_b": "Tiga bulan sekali saat ingat",
            "pilihan_c": "Setahun sekali saat musim liburan",
            "pilihan_d": "Hanya saat ada pemeriksaan petugas pajak",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-2",
        "urutan": 2,
        "judul": "Menentukan Modal Awal & Inventaris Usaha",
        "durasiMenit": 40,
        "isiMateri": "Sebelum mulai mencatat transaksi harian, Anda harus tahu dari mana bisnis Anda berpijak. Modul ini mengajarkan cara menginventarisir Modal Awal: membedakan Modal Lancar (Uang kas tunai di bank dan stok barang dagang) dengan Modal Tetap/Aset (etalase, freezer, timbangan digital, perlengkapan masak). Anda juga akan mempelajari cara menghitung penyusutan alat secara sederhana.",
        "videoUrl": "https://www.youtube.com/watch?v=N4X5a3g6ZBo",
        "lampiranPath": "panduan_pembukuan_modul_2.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin2-1",
            "urutan": 1,
            "pertanyaan": "Manakah di bawah ini yang termasuk dalam kategori 'Aset Tetap' (Fixed Assets) pada usaha kuliner kopi keliling?",
            "pilihan_a": "Mesin espresso dan sepeda gerobak",
            "pilihan_b": "Biji kopi dan susu segar",
            "pilihan_c": "Gelas plastik sekali pakai",
            "pilihan_d": "Sedotan kertas",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin2-2",
            "urutan": 2,
            "pertanyaan": "Apa yang dimaksud dengan 'Penyusutan' (Depresiasi) aset peralatan usaha?",
            "pilihan_a": "Alokasi penurunan nilai ekonomis alat seiring pemakaian dan berjalannya waktu (misal mesin freezer dipakai 5 tahun)",
            "pilihan_b": "Kondisi peralatan yang dicuri oleh orang lain",
            "pilihan_c": "Kenaikan harga jual barang di toko",
            "pilihan_d": "Pencairan pinjaman dari koperasi",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin2-3",
            "urutan": 3,
            "pertanyaan": "Rumus persamaan dasar akuntansi yang menjadi pondasi seluruh pembukuan keuangan adalah:",
            "pilihan_a": "Aset (Harta) = Kewajiban (Utang) + Ekuitas (Modal)",
            "pilihan_b": "Aset = Pendapatan - Beban",
            "pilihan_c": "Modal = Utang + Laba Bersih",
            "pilihan_d": "Kas = Piutang x 100%",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin2-4",
            "urutan": 4,
            "pertanyaan": "Jika seorang pemilik usaha menyuntikkan uang tabungan pribadinya sebesar Rp10.000.000 ke kas toko, transaksi ini dicatat sebagai:",
            "pilihan_a": "Penambahan Kas (Debit) dan Penambahan Modal Pemilik (Kredit)",
            "pilihan_b": "Penambahan Utang Bank",
            "pilihan_c": "Pendapatan Penjualan Produk",
            "pilihan_d": "Biaya Operasional Toko",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin2-5",
            "urutan": 5,
            "pertanyaan": "Barang habis pakai (seperti kantong plastik, struk kertas thermal) dalam pembukuan dikelompokkan ke dalam:",
            "pilihan_a": "Perlengkapan (Supplies) / Beban Operasional Habis Pakai",
            "pilihan_b": "Aset Tetap Permanen",
            "pilihan_c": "Investasi Jangka Panjang",
            "pilihan_d": "Piutang Usaha",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-3",
        "urutan": 3,
        "judul": "Pencatatan Buku Kas Masuk & Kas Keluar Harian",
        "durasiMenit": 40,
        "isiMateri": "Buku kas harian adalah jantung pelaporan keuangan toko Anda. Modul ini membimbing format standar 5 kolom: Tanggal, Deskripsi/Uraian Transaksi, Nomor Bukti Nota, Uang Masuk (Debit), Uang Keluar (Kredit), dan Saldo Berjalan. Anda akan mempraktikkan pengarsipan nota fisik, pembuatan kuitansi pembayaran yang sah, serta pengecekan fisik uang di laci kasir (Cash Opname) setiap malam.",
        "videoUrl": "https://www.youtube.com/watch?v=8zJ0q9U8aTw",
        "lampiranPath": "panduan_pembukuan_modul_3.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin3-1",
            "urutan": 1,
            "pertanyaan": "Dalam pembukuan buku kas satu kolom, pembayaran sewa kios toko sebesar Rp1.000.000 dicatat pada kolom:",
            "pilihan_a": "Kas Keluar (Kredit) sehingga mengurangi nilai saldo akhir",
            "pilihan_b": "Kas Masuk (Debit)",
            "pilihan_c": "Kolom Piutang Toko",
            "pilihan_d": "Kolom Margin Keuntungan",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin3-2",
            "urutan": 2,
            "pertanyaan": "Mengapa menyimpan nota fisik belanja atau struk pembayaran bahan baku merupakan kewajiban staf kasir?",
            "pilihan_a": "Sebagai bukti sah (supporting document) bahwa pengeluaran tersebut benar-benar terjadi untuk keperluan audit dan pembukuan",
            "pilihan_b": "Untuk dijual kembali ke pengepul kertas bekas",
            "pilihan_c": "Sebagai syarat mendapatkan hadiah undian bank",
            "pilihan_d": "Agar laci kasir terlihat penuh",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin3-3",
            "urutan": 3,
            "pertanyaan": "Apa tindakan pertama yang wajib dilakukan jika saat 'Cash Opname' uang fisik di laci kasir ternyata kurang Rp50.000 dari saldo buku catatan?",
            "pilihan_a": "Memeriksa ulang seluruh nota transaksi hari itu dan mutasi QRIS untuk menemukan transaksi yang lupa dicatat",
            "pilihan_b": "Langsung menuduh kasir mencuri tanpa bukti",
            "pilihan_c": "Mengubah angka di buku catatan tanpa penjelasan",
            "pilihan_d": "Membiarkannya karena nominalnya kecil",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin3-4",
            "urutan": 4,
            "pertanyaan": "Bagaimanakah pencatatan yang benar saat ada pelanggan membayar produk menggunakan QRIS atau transfer bank?",
            "pilihan_a": "Dicatat sebagai Kas Masuk Bank (Non-Tunai) dengan mencantumkan nomor referensi transaksi digital",
            "pilihan_b": "Tidak perlu dicatat karena uangnya belum ditarik tunai",
            "pilihan_c": "Dicatat sebagai utang pelanggan",
            "pilihan_d": "Dicatat di buku kas pribadi",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin3-5",
            "urutan": 5,
            "pertanyaan": "Berapa lama bukti nota dan dokumen pembukuan UMKM sebaiknya diarsipkan secara rapi?",
            "pilihan_a": "Minimal 5 hingga 10 tahun sesuai ketentuan perpajakan dan hukum dagang Indonesia",
            "pilihan_b": "Cukup 1 hari saja lalu dibuang",
            "pilihan_c": "Hanya sampai akhir bulan berjalan",
            "pilihan_d": "Tidak perlu disimpan sama sekali jika sudah difoto",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-4",
        "urutan": 4,
        "judul": "Menghitung Harga Pokok Penjualan (HPP) Realistis",
        "durasiMenit": 45,
        "isiMateri": "Banyak pengusaha merasa dagangannya laris manis setiap hari, tapi uangnya selalu habis. Masalahnya ada pada salah menghitung HPP! Di modul ini, Anda akan membedah rumus HPP riil: Biaya Bahan Baku Langsung + Biaya Tenaga Kerja Pembuat + Biaya Overhead (gas elpiji, minyak goreng, kemasan boks, stiker logo, listrik). Anda akan menghitung HPP per unit/porsi secara akurat.",
        "videoUrl": "https://www.youtube.com/watch?v=d_k6e0F8xQw",
        "lampiranPath": "panduan_pembukuan_modul_4.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin4-1",
            "urutan": 1,
            "pertanyaan": "Komponen biaya manakah yang termasuk dalam perhitungan HPP produk makanan kotak nasi ayam goreng?",
            "pilihan_a": "Biaya ayam, beras, bumbu, minyak, gas, kotak kemasan, dan sendok plastik",
            "pilihan_b": "Biaya sewa rumah pribadi pemilik",
            "pilihan_c": "Biaya kuota internet anak pemilik",
            "pilihan_d": "Pajak kendaraan bermotor pribadi",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin4-2",
            "urutan": 2,
            "pertanyaan": "Jika total biaya produksi 100 porsi kue adalah Rp500.000, berapakah HPP per satu porsi kue tersebut?",
            "pilihan_a": "Rp5.000",
            "pilihan_b": "Rp50.000",
            "pilihan_c": "Rp500",
            "pilihan_d": "Rp10.000",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin4-3",
            "urutan": 3,
            "pertanyaan": "Biaya overhead seperti gas elpiji dan minyak goreng sering terlupakan dalam HPP padahal efeknya:",
            "pilihan_a": "Mengakibatkan harga jual yang ditetapkan terlalu murah sehingga bisnis merugi secara tidak kasat mata",
            "pilihan_b": "Membuat rasa makanan berubah hambar",
            "pilihan_c": "Membuat toko kekurangan stok beras",
            "pilihan_d": "Membuat nota kasir robek",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin4-4",
            "urutan": 4,
            "pertanyaan": "Dalam rumus akuntansi barang dagangan ritel/toko kelontong, HPP dihitung dengan rumus:",
            "pilihan_a": "Persediaan Awal + Pembelian Bersih - Persediaan Akhir",
            "pilihan_b": "Penjualan Kotor + Kas Masuk",
            "pilihan_c": "Persediaan Akhir / Total Diskon",
            "pilihan_d": "Modal Awal x Suku Bunga",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin4-5",
            "urutan": 5,
            "pertanyaan": "Apakah biaya kantong plastik dan stiker kemasan wajib dimasukkan ke dalam HPP per unit produk?",
            "pilihan_a": "Ya, karena biaya kemasan menempel langsung pada setiap unit produk yang terjual ke konsumen",
            "pilihan_b": "Tidak perlu, itu beban sosial pemilik",
            "pilihan_c": "Hanya jika kemasannya terbuat dari emas",
            "pilihan_d": "Tergantung cuaca hari itu",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-5",
        "urutan": 5,
        "judul": "Menentukan Margin Keuntungan & Strategi Pricing",
        "durasiMenit": 40,
        "isiMateri": "Setelah mengetahui HPP riil produk Anda, langkah krusial berikutnya adalah menentukan harga jual (Pricing Strategy). Pelajari perbedaan matematis antara Mark-up (persentase penambahan di atas HPP) dan Margin Kotor (persentase keuntungan dari harga jual final). Anda juga akan mempelajari komparasi harga pasar kompetitor, penetapan batas diskon promosi yang aman, dan perhitungan titik impas (Break Even Point / BEP).",
        "videoUrl": "https://www.youtube.com/watch?v=7uV8W8_eKyo",
        "lampiranPath": "panduan_pembukuan_modul_5.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin5-1",
            "urutan": 1,
            "pertanyaan": "Jika HPP sebuah produk adalah Rp10.000 dan Anda ingin menerapkan Mark-up sebesar 50%, berapakah harga jual yang harus dipasang?",
            "pilihan_a": "Rp15.000",
            "pilihan_b": "Rp20.000",
            "pilihan_c": "Rp12.500",
            "pilihan_d": "Rp5.000",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin5-2",
            "urutan": 2,
            "pertanyaan": "Jika sebuah barang dijual seharga Rp20.000 dengan HPP Rp15.000, berapakah Margin Keuntungan Kotor (Gross Margin) barang tersebut?",
            "pilihan_a": "25% (diperoleh dari untung Rp5.000 dibagi harga jual Rp20.000)",
            "pilihan_b": "50%",
            "pilihan_c": "75%",
            "pilihan_d": "15%",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin5-3",
            "urutan": 3,
            "pertanyaan": "Titik Impas atau Break Even Point (BEP) adalah kondisi di mana:",
            "pilihan_a": "Total pendapatan usaha sama persis dengan total seluruh biaya yang dikeluarkan (tidak untung dan tidak rugi)",
            "pilihan_b": "Usaha mengalami kebangkrutan total",
            "pilihan_c": "Keuntungan usaha mencapai 100%",
            "pilihan_d": "Seluruh stok barang habis dibeli pemborong",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin5-4",
            "urutan": 4,
            "pertanyaan": "Kesalahan paling fatal saat toko membuat program diskon promosi 'Beli 1 Gratis 1' adalah:",
            "pilihan_a": "Tidak menghitung apakah margin kotor produk mencukupi untuk menanggung HPP unit kedua yang digratiskan",
            "pilihan_b": "Membagikan pamflet promosi ke warga sekitar",
            "pilihan_c": "Memasang spanduk terlalu besar",
            "pilihan_d": "Melayani pembeli dengan senyuman ramah",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin5-5",
            "urutan": 5,
            "pertanyaan": "Strategi harga psikologis 'Charm Pricing' sering menggunakan akhiran angka:",
            "pilihan_a": "Angka 9 atau 900 (misalnya Rp19.900 daripada Rp20.000)",
            "pilihan_b": "Angka 000 genap",
            "pilihan_c": "Angka romawi",
            "pilihan_d": "Angka pecahan desimal 4 digit",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-6",
        "urutan": 6,
        "judul": "Pencatatan Piutang Pelanggan & Utang Supplier",
        "durasiMenit": 40,
        "isiMateri": "Banyak usaha ramai pembeli tapi kasnya kosong melompong karena uangnya tersangkut di 'bon' pelanggan! Di modul ini, pelajari teknik pencatatan Buku Piutang: mencatat nama debitur, nomor HP, tanggal transaksi, tanggal jatuh tempo, dan riwayat cicilan. Anda juga akan mempelajari pengelolaan Buku Utang Dagang kepada pemasok (supplier) agar reputasi toko tetap dipercaya dan terhindar dari denda keterlambatan.",
        "videoUrl": "https://www.youtube.com/watch?v=3g8L1w-A2Po",
        "lampiranPath": "panduan_pembukuan_modul_6.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin6-1",
            "urutan": 1,
            "pertanyaan": "Apa yang dimaksud dengan 'Piutang Usaha' (Accounts Receivable) bagi sebuah warung atau toko UMKM?",
            "pilihan_a": "Uang hak toko yang masih tertahan di tangan pembeli karena transaksi pembelian secara kredit/tempo (bon)",
            "pilihan_b": "Uang yang dipinjam toko dari bank",
            "pilihan_c": "Gaji karyawan yang belum dibayar",
            "pilihan_d": "Sisa uang kembalian di kasir",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin6-2",
            "urutan": 2,
            "pertanyaan": "Kolom informasi apakah yang paling wajib ada pada Buku Piutang agar penagihan tidak terlambat?",
            "pilihan_a": "Tanggal Jatuh Tempo (Due Date)",
            "pilihan_b": "Warna pakaian pelanggan saat berbelanja",
            "pilihan_c": "Nomor seri KTP lurah setempat",
            "pilihan_d": "Zodiak pelanggan",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin6-3",
            "urutan": 3,
            "pertanyaan": "Jika toko membeli 10 dus minyak goreng secara tempo dari grosir, transaksi tersebut menambah:",
            "pilihan_a": "Stok Barang Dagang dan Utang Usaha (Accounts Payable)",
            "pilihan_b": "Kas Tunai di laci kasir",
            "pilihan_c": "Piutang Pelanggan",
            "pilihan_d": "Biaya Promosi Iklan",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin6-4",
            "urutan": 4,
            "pertanyaan": "Taktik bijak apakah yang harus diterapkan UMKM untuk membatasi resiko piutang macet?",
            "pilihan_a": "Menetapkan batas maksimal nominal plafon bon (misal maks Rp500.000) dan batas waktu tempo maksimal 14 hari",
            "pilihan_b": "Membebaskan semua orang berutang tanpa batas",
            "pilihan_c": "Tidak perlu mencatat nama pembeli yang berutang",
            "pilihan_d": "Menghapus seluruh piutang setiap minggu",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin6-5",
            "urutan": 5,
            "pertanyaan": "Piutang yang sudah lewat lebih dari 1 tahun dan debitur sudah tidak bisa dihubungi dalam akuntansi disebut:",
            "pilihan_a": "Piutang Tak Tertagih / Beban Kerugian Piutang (Bad Debt)",
            "pilihan_b": "Aset Produktif Lancar",
            "pilihan_c": "Dividen Tunai Pemilik",
            "pilihan_d": "Pendapatan Lain-lain",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-7",
        "urutan": 7,
        "judul": "Stok Opname Barang & Rekonsiliasi Kas Toko",
        "durasiMenit": 40,
        "isiMateri": "Kebocoran barang hilang, rusak, atau dimakan tikus di gudang sering tidak terdeteksi tanpa Stok Opname rutin. Modul ini mengajarkan metode penghitungan fisik persediaan (Stock Taking) mingguan/bulanan, mencocokkan stok fisik dengan kartu stok gudang, mendata selisih barang susut, serta melakukan Rekonsiliasi Bank bulanan untuk mencocokkan saldo catatan buku kas dengan rekening koran mutasi bank.",
        "videoUrl": "https://www.youtube.com/watch?v=kY3P9o8L7Xo",
        "lampiranPath": "panduan_pembukuan_modul_7.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin7-1",
            "urutan": 1,
            "pertanyaan": "Apa tujuan utama diadakannya kegiatan 'Stok Opname' berkala di gudang atau toko?",
            "pilihan_a": "Menghitung secara fisik jumlah nyata barang yang ada dan mencocokkannya dengan kartu stok pembukuan",
            "pilihan_b": "Membongkar seluruh rak toko agar tampak baru",
            "pilihan_c": "Mengganti seluruh harga barang menjadi diskon 90%",
            "pilihan_d": "Membuang barang dagangan yang laku",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin7-2",
            "urutan": 2,
            "pertanyaan": "Jika catatan kartu stok menunjukkan 50 botol kecap, tetapi saat dihitung fisik hanya ada 47 botol, maka 3 botol yang hilang dicatat sebagai:",
            "pilihan_a": "Selisih Kurang Stok / Beban Kerugian Kerusakan Persediaan",
            "pilihan_b": "Pendapatan Bonus Toko",
            "pilihan_c": "Tambahan modal dari distributor",
            "pilihan_d": "Pembayaran dividen kasir",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin7-3",
            "urutan": 3,
            "pertanyaan": "Apa yang dimaksud dengan 'Rekonsiliasi Bank' pada pembukuan akhir bulan?",
            "pilihan_a": "Proses mencocokkan saldo kas bank di catatan internal usaha dengan saldo rekening koran resmi yang diterbitkan bank",
            "pilihan_b": "Meminta pinjaman dana darurat ke bank",
            "pilihan_c": "Menutup rekening tabungan selamanya",
            "pilihan_d": "Membuka cabang toko baru di dalam kantor bank",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin7-4",
            "urutan": 4,
            "pertanyaan": "Biaya administrasi bulanan bank dan bunga tabungan yang muncul di rekening koran wajib dicatat di buku kas toko sebagai:",
            "pilihan_a": "Beban Administrasi Bank (kas keluar) dan Pendapatan Bunga (kas masuk)",
            "pilihan_b": "Tidak perlu dicatat karena otomatis dari bank",
            "pilihan_c": "Beban pajak penghasilan karyawan",
            "pilihan_d": "Utang jangka panjang",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin7-5",
            "urutan": 5,
            "pertanyaan": "Metode manajemen persediaan FIFO adalah singkatan dari:",
            "pilihan_a": "First In First Out (Barang yang masuk pertama harus dikeluarkan/dijual pertama kali agar tidak basi/rusak)",
            "pilihan_b": "Fast Income Fast Output",
            "pilihan_c": "Final Invoice For Order",
            "pilihan_d": "Free Items For Owner",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-8",
        "urutan": 8,
        "judul": "Menyusun Laporan Laba Rugi Sederhana Bulanan",
        "durasiMenit": 45,
        "isiMateri": "Laporan Laba Rugi (Profit & Loss Statement) adalah cermin kejujuran bisnis Anda. Di modul ini, Anda akan mempraktikkan penyusunan Laporan Laba Rugi format baku UMKM: Pendapatan Penjualan Kotor - Potongan Diskon = Pendapatan Bersih. Kemudian Pendapatan Bersih - HPP = Laba Kotor (Gross Profit). Lalu Laba Kotor - Beban Operasional (Sewa, Gaji, Listrik, Internet, Bensin) = Laba Bersih Usaha (Net Profit).",
        "videoUrl": "https://www.youtube.com/watch?v=9_K0u8yV2Wk",
        "lampiranPath": "panduan_pembukuan_modul_8.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin8-1",
            "urutan": 1,
            "pertanyaan": "Urutan perhitungan matematis yang benar dalam laporan laba rugi adalah:",
            "pilihan_a": "Pendapatan Bersih - HPP = Laba Kotor; Laba Kotor - Beban Operasional = Laba Bersih",
            "pilihan_b": "Pendapatan Bersih - Beban Operasional = HPP",
            "pilihan_c": "Laba Bersih + HPP = Penjualan Kotor",
            "pilihan_d": "Modal Awal - Utang = Laba Kotor",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin8-2",
            "urutan": 2,
            "pertanyaan": "Jika sebuah warung memiliki omzet penjualan Rp30.000.000, HPP Rp18.000.000, dan Biaya Operasional Rp7.000.000, berapakah Laba Bersih warung tersebut?",
            "pilihan_a": "Rp5.000.000 (diperoleh dari 30jt - 18jt - 7jt)",
            "pilihan_b": "Rp12.000.000",
            "pilihan_c": "Rp23.000.000",
            "pilihan_d": "Rp25.000.000",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin8-3",
            "urutan": 3,
            "pertanyaan": "Pengeluaran manakah di bawah ini yang TIDAK boleh dimasukkan ke dalam pos Beban Operasional Usaha pada laporan laba rugi toko?",
            "pilihan_a": "Biaya liburan keluarga pemilik toko ke pantai",
            "pilihan_b": "Biaya tagihan listrik PLN dan air toko",
            "pilihan_c": "Gaji staf penjaga toko",
            "pilihan_d": "Biaya paket kuota internet kasir toko",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin8-4",
            "urutan": 4,
            "pertanyaan": "Apa arti dari hasil laporan laba rugi yang menunjukkan angka minus (negatif) di baris terbawah?",
            "pilihan_a": "Usaha pada periode tersebut mengalami kerugian (rugi bersih) karena pengeluaran lebih besar dari pendapatan",
            "pilihan_b": "Usaha mendapatkan bonus dari pemerintah",
            "pilihan_c": "Usaha harus segera mengganti seluruh karyawan",
            "pilihan_d": "Pencatatan kasir sudah sempurna tanpa cela",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin8-5",
            "urutan": 5,
            "pertanyaan": "Mengapa pihak bank atau lembaga penyalur KUR (Kredit Usaha Rakyat) mewajibkan lampiran Laporan Laba Rugi 6 bulan terakhir?",
            "pilihan_a": "Untuk menganalisis kemampuan dan kapasitas usaha dalam membayar cicilan pokok pinjaman dan bunga secara tepat waktu",
            "pilihan_b": "Sebagai formalitas kertas yang akan dibuang",
            "pilihan_c": "Untuk meminta jatah bagian saham toko",
            "pilihan_d": "Agar pimpinan bank dapat berbelanja gratis di toko",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-9",
        "urutan": 9,
        "judul": "Mengelola Arus Kas (Cash Flow) agar Tidak Boncos",
        "durasiMenit": 45,
        "isiMateri": "Sebuah pepatah bisnis terkenal mengatakan: 'Revenue is vanity, Profit is sanity, but Cash is King!' Modul ini mengajarkan manajemen Arus Kas (Cash Flow): memahami perbedaan mengapa toko bisa untung di atas kertas tapi rekeningnya kosong, teknik menjaga cadangan Dana Darurat Usaha minimal 3 bulan operasional, dan proyeksi arus kas masuk-keluar untuk 4 minggu ke depan.",
        "videoUrl": "https://www.youtube.com/watch?v=x7wP8_L9pYo",
        "lampiranPath": "panduan_pembukuan_modul_9.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin9-1",
            "urutan": 1,
            "pertanyaan": "Mengapa sebuah toko yang di laporan laba ruginya tercatat 'UNTUNG Rp10 Juta' bisa mengalami krisis kehabisan uang kas tunai?",
            "pilihan_a": "Karena sebagian besar keuntungan tersebut masih berupa piutang yang belum dibayar pembeli atau tertimbun dalam bentuk stok mati di gudang",
            "pilihan_b": "Karena uang kas tunai hilang menguap oleh udara",
            "pilihan_c": "Karena bank menyembunyikan uang tersebut",
            "pilihan_d": "Karena kalkulator salah menghitung penjumlahan",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin9-2",
            "urutan": 2,
            "pertanyaan": "Berapa jumlah ideal cadangan 'Dana Darurat Usaha' (Emergency Cash Reserve) yang wajib disisihkan UMKM?",
            "pilihan_a": "Minimal setara dengan 3 hingga 6 bulan biaya operasional tetap (fixed cost)",
            "pilihan_b": "Cukup untuk 1 hari kerja saja",
            "pilihan_c": "Tidak perlu menyiapkan cadangan kas",
            "pilihan_d": "Harus 100 kali lipat omzet bulanan",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin9-3",
            "urutan": 3,
            "pertanyaan": "Arus kas dari aktivitas operasional (Operating Cash Flow) bersumber dari:",
            "pilihan_a": "Aktivitas penerimaan kas harian dari penjualan produk/jasa dikurangi pengeluaran operasional belanja bahan dan gaji",
            "pilihan_b": "Uang pencairan pinjaman bank",
            "pilihan_c": "Hasil penjualan aset tanah milik keluarga",
            "pilihan_d": "Hadiah undian berhadiah supermarket",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin9-4",
            "urutan": 4,
            "pertanyaan": "Langkah mitigasi tercepat yang harus diambil pemilik usaha saat arus kas diproyeksikan akan minus minggu depan adalah:",
            "pilihan_a": "Menagih piutang jatuh tempo ke pelanggan, mengadakan promo cuci gudang barang lambat laku (slow-moving), dan menunda belanja modal yang belum mendesak",
            "pilihan_b": "Menutup toko dan melarikan diri",
            "pilihan_c": "Membeli barang mewah tambahan",
            "pilihan_d": "Menaikkan gaji karyawan 2 kali lipat",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin9-5",
            "urutan": 5,
            "pertanyaan": "Kondisi 'Arus Kas Negatif' (Negative Cash Flow) yang berkepanjangan pada UMKM akan berujung pada:",
            "pilihan_a": "Kebangkrutan (Insolvency) karena usaha tidak sanggup lagi membayar utang jatuh tempo dan gaji karyawan",
            "pilihan_b": "Kenaikan peringkat saham",
            "pilihan_c": "Penurunan pajak secara menguntungkan",
            "pilihan_d": "Mendapatkan penghargaan UMKM terbaik",
            "kunci_jawaban": "A"
          }
        ]
      },
      {
        "id": "mod-fin-10",
        "urutan": 10,
        "judul": "Membaca Kesehatan Keuangan & Rencana Ekspansi Usaha",
        "durasiMenit": 45,
        "isiMateri": "Modul penutup ini membekali Anda cara membaca indikator kesehatan finansial UMKM: Rasio Likuiditas (kemampuan melunasi utang lancar), Rasio Profitabilitas (apakah modal yang ditanam menghasilkan margin yang layak), serta panduan menyusun proposal pengajuan modal ekspansi (KUR atau kemitraan bagi hasil) dengan laporan pembukuan yang rapi dan kredibel.",
        "videoUrl": "https://www.youtube.com/watch?v=4pL0_Q8w2Ro",
        "lampiranPath": "panduan_pembukuan_modul_10.pdf",
        "soalCount": 5,
        "hasPdf": true,
        "soal": [
          {
            "id": "soal-fin10-1",
            "urutan": 1,
            "pertanyaan": "Indikator utama yang menandakan bahwa sebuah usaha UMKM sehat secara finansial dan siap untuk berekspansi adalah:",
            "pilihan_a": "Memiliki arus kas operasional yang positif secara konsisten, margin laba bersih stabil, dan memiliki dana cadangan kas yang cukup",
            "pilihan_b": "Hanya karena tokonya ramai dipadati antrean orang meski menjual di bawah HPP",
            "pilihan_c": "Pemilik usaha sering mengganti mobil baru dengan uang kasir",
            "pilihan_d": "Memiliki utang yang menumpuk di 5 bank berbeda",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin10-2",
            "urutan": 2,
            "pertanyaan": "Apa arti dari rasio 'Current Ratio' (Rasio Lancar) sebesar 2:1 pada neraca keuangan usaha?",
            "pilihan_a": "Usaha memiliki aset lancar 2 kali lipat lebih besar daripada jumlah utang jangka pendek yang harus segera dibayar",
            "pilihan_b": "Usaha memiliki 2 pemilik dan 1 karyawan",
            "pilihan_c": "Toko buka 2 hari dan libur 1 hari",
            "pilihan_d": "Penjualan turun 50%",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin10-3",
            "urutan": 3,
            "pertanyaan": "Sebelum memutuskan membuka cabang toko kedua, analisis pembukuan apakah yang paling wajib diperiksa?",
            "pilihan_a": "Apakah cabang pertama sudah terbukti menghasilkan laba bersih stabil yang sanggup membiayai modal awal cabang baru tanpa mengganggu operasional harian",
            "pilihan_b": "Hanya melihat apakah ruko di sebelah sedang kosong disewakan",
            "pilihan_c": "Melihat ramalan zodiak tahun depan",
            "pilihan_d": "Mengikuti tren teman arisan",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin10-4",
            "urutan": 4,
            "pertanyaan": "Berapakah porsi ideal keuntungan bersih bulanan yang sebaiknya ditahan (Retained Earnings) untuk reinvestasi modal pengembangan usaha?",
            "pilihan_a": "Sekitar 30% hingga 50% dari laba bersih ditahan untuk memperkuat modal usaha",
            "pilihan_b": "100% langsung dihabiskan untuk konsumsi pribadi",
            "pilihan_c": "0% karena modal tidak boleh bertambah",
            "pilihan_d": "Semua dibagikan sebagai bonus tahun baru",
            "kunci_jawaban": "A"
          },
          {
            "id": "soal-fin10-5",
            "urutan": 5,
            "pertanyaan": "Kelebihan utama UMKM yang memiliki pembukuan keuangan rapi saat mengajukan pinjaman modal usaha (seperti KUR Bank) adalah:",
            "pilihan_a": "Proses verifikasi bank menjadi sangat cepat, tingkat persetujuan kredit tinggi, dan plafon pinjaman dapat maksimal",
            "pilihan_b": "Bebas dari bunga pinjaman secara permanen",
            "pilihan_c": "Tidak perlu membayar kembali pinjaman",
            "pilihan_d": "Mendapatkan mobil operasional gratis dari bank",
            "kunci_jawaban": "A"
          }
        ]
      }
    ],
    "totalDurasiMenit": 415
  },
  {
    "id": "00000000-0000-4000-b000-000000000005",
    "judul": "Fotografi Produk dengan Ponsel",
    "slug": "fotografi-produk-ponsel",
    "kategori": "Desain",
    "ringkasan": "Teknik foto produk jualan online hanya bermodalkan smartphone dan cahaya alami.",
    "deskripsi": "Pelatihan fotografi komersial sederhana bagi pelaku kuliner dan produk fisik. Mempelajari pemanfaatan cahaya alami jendela, alas foto terjangkau, serta teknik editing cepat di HP.",
    "harga": 250000,
    "kuota": 15,
    "terpakai": 15,
    "sisaKursi": 0,
    "nilaiLulus": 60,
    "status": "ditutup",
    "instrukturId": "00000000-0000-4000-a000-000000000012",
    "instrukturNama": "Laras Wulandari",
    "instrukturGelar": "Creative Director",
    "instrukturAvatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "totalDurasiMenit": 75,
    "image": "/images/card_canva.jpg",
    "modul": [
      {
        "id": "mod-foto-1",
        "urutan": 1,
        "judul": "Cahaya dan Latar Belakang",
        "durasiMenit": 35,
        "isiMateri": "Pengaturan cahaya matahari samping jendela, reflektor styrofoam terjangkau, dan pemilihan background foto produk yang bersih.",
        "soalCount": 4,
        "hasPdf": true,
        "soal": [
          {
            "id": "00000000-0000-4000-d000-000500010001",
            "urutan": 1,
            "pertanyaan": "Sumber cahaya paling murah untuk foto produk adalah...",
            "pilihan_a": "Cahaya jendela",
            "pilihan_b": "Senter merah",
            "pilihan_c": "Layar televisi",
            "pilihan_d": "Lampu disko",
            "kunci_jawaban": "A"
          },
          {
            "id": "00000000-0000-4000-d000-000500010002",
            "urutan": 2,
            "pertanyaan": "Latar belakang polos dipakai agar...",
            "pilihan_a": "Foto terlihat gelap",
            "pilihan_b": "Warna produk berubah",
            "pilihan_c": "File lebih besar",
            "pilihan_d": "Produk menjadi fokus",
            "kunci_jawaban": "D"
          },
          {
            "id": "00000000-0000-4000-d000-000500010003",
            "urutan": 3,
            "pertanyaan": "Bayangan yang terlalu keras bisa dilunakkan dengan...",
            "pilihan_a": "Mematikan ponsel",
            "pilihan_b": "Memperbesar zoom",
            "pilihan_c": "Memakai flash langsung",
            "pilihan_d": "Kain tipis atau kertas putih",
            "kunci_jawaban": "D"
          },
          {
            "id": "00000000-0000-4000-d000-000500010004",
            "urutan": 4,
            "pertanyaan": "Waktu terbaik memakai cahaya matahari tidak langsung adalah...",
            "pilihan_a": "Saat hujan deras di luar ruangan",
            "pilihan_b": "Tengah malam",
            "pilihan_c": "Kapan saja tanpa beda",
            "pilihan_d": "Pagi atau sore",
            "kunci_jawaban": "D"
          }
        ]
      },
      {
        "id": "mod-foto-2",
        "urutan": 2,
        "judul": "Komposisi dan Penyuntingan Cepat",
        "durasiMenit": 40,
        "isiMateri": "Rule of thirds, sudut flat-lay vs eye-level, serta teknik peningkatan ketajaman dan koreksi warna di aplikasi ponsel.",
        "soalCount": 4,
        "hasPdf": true,
        "soal": [
          {
            "id": "00000000-0000-4000-d000-000500020001",
            "urutan": 1,
            "pertanyaan": "Garis bantu tiga kali tiga di kamera disebut...",
            "pilihan_a": "HDR",
            "pilihan_b": "Rule of thirds",
            "pilihan_c": "Histogram",
            "pilihan_d": "Burst",
            "kunci_jawaban": "B"
          },
          {
            "id": "00000000-0000-4000-d000-000500020002",
            "urutan": 2,
            "pertanyaan": "Sudut foto yang cocok untuk makanan di piring datar adalah...",
            "pilihan_a": "Dari bawah meja",
            "pilihan_b": "Dari samping jauh",
            "pilihan_c": "Dari atas (flat lay)",
            "pilihan_d": "Dari belakang",
            "kunci_jawaban": "C"
          },
          {
            "id": "00000000-0000-4000-d000-000500020003",
            "urutan": 3,
            "pertanyaan": "Penyuntingan yang wajar untuk foto produk adalah...",
            "pilihan_a": "Mengatur terang dan kontras",
            "pilihan_b": "Mengganti warna asli produk",
            "pilihan_c": "Mengubah bentuk produk",
            "pilihan_d": "Menambah stiker penuh",
            "kunci_jawaban": "A"
          },
          {
            "id": "00000000-0000-4000-d000-000500020004",
            "urutan": 4,
            "pertanyaan": "Zoom digital sebaiknya dihindari karena...",
            "pilihan_a": "Menghemat baterai",
            "pilihan_b": "Membuat foto lebih tajam",
            "pilihan_c": "Menambah warna",
            "pilihan_d": "Menurunkan ketajaman foto",
            "kunci_jawaban": "D"
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-b000-000000000006",
    "judul": "Public Speaking untuk Presentasi Kantor",
    "slug": "public-speaking-presentasi-kantor",
    "kategori": "Pengembangan Diri",
    "ringkasan": "Kuasai teknik presentasi efektif di depan pimpinan dan klien tanpa gugup.",
    "deskripsi": "Kelas intensif menyusun struktur presentasi ringkas, teknik membuka presentasi yang memikat, kontrol intonasi suara, serta tips mengatasi rasa cemas saat berbicara di depan audiens.",
    "harga": 400000,
    "kuota": 20,
    "terpakai": 0,
    "sisaKursi": 20,
    "nilaiLulus": 60,
    "status": "ditinjau",
    "instrukturId": "00000000-0000-4000-a000-000000000013",
    "instrukturNama": "Michael Sitorus",
    "instrukturGelar": "Corporate English Trainer",
    "instrukturAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "totalDurasiMenit": 75,
    "image": "/images/hero_learning_desk.jpg",
    "modul": [
      {
        "id": "mod-ps-1",
        "urutan": 1,
        "judul": "Menyusun Alur Presentasi",
        "durasiMenit": 40,
        "isiMateri": "Struktur pembuka, inti pesan, visual slide yang tidak membosankan, dan kesimpulan meyakinkan.",
        "soalCount": 3,
        "hasPdf": true,
        "soal": [
          {
            "id": "00000000-0000-4000-d000-000600010001",
            "urutan": 1,
            "pertanyaan": "Bagian pembuka presentasi sebaiknya berisi...",
            "pilihan_a": "Ucapan penutup",
            "pilihan_b": "Tujuan dan gambaran isi",
            "pilihan_c": "Lampiran data mentah",
            "pilihan_d": "Daftar pustaka",
            "kunci_jawaban": "B"
          },
          {
            "id": "00000000-0000-4000-d000-000600010002",
            "urutan": 2,
            "pertanyaan": "Jumlah poin utama yang mudah diingat audiens adalah...",
            "pilihan_a": "Sekitar 3 poin",
            "pilihan_b": "Tidak ada poin",
            "pilihan_c": "Satu kata saja",
            "pilihan_d": "Lebih dari 15 poin",
            "kunci_jawaban": "A"
          },
          {
            "id": "00000000-0000-4000-d000-000600010003",
            "urutan": 3,
            "pertanyaan": "Penutup presentasi yang kuat berisi...",
            "pilihan_a": "Permintaan maaf panjang",
            "pilihan_b": "Slide kosong",
            "pilihan_c": "Materi baru",
            "pilihan_d": "Ringkasan dan ajakan bertindak",
            "kunci_jawaban": "D"
          }
        ]
      },
      {
        "id": "mod-ps-2",
        "urutan": 2,
        "judul": "Mengelola Rasa Gugup & Bahasa Tubuh",
        "durasiMenit": 35,
        "isiMateri": "Teknik pernapasan diafragma, kontak mata, bahasa tubuh terbuka, dan menghadapi sesi tanya jawab alot.",
        "soalCount": 3,
        "hasPdf": true,
        "soal": [
          {
            "id": "00000000-0000-4000-d000-000600020001",
            "urutan": 1,
            "pertanyaan": "Cara sederhana mengurangi gugup sebelum tampil adalah...",
            "pilihan_a": "Latihan dan napas perlahan",
            "pilihan_b": "Minum kopi lima gelas",
            "pilihan_c": "Tidak menyiapkan materi",
            "pilihan_d": "Begadang",
            "kunci_jawaban": "A"
          },
          {
            "id": "00000000-0000-4000-d000-000600020002",
            "urutan": 2,
            "pertanyaan": "Kontak mata dengan audiens berguna untuk...",
            "pilihan_a": "Menghindari pertanyaan",
            "pilihan_b": "Membangun kepercayaan",
            "pilihan_c": "Mempercepat waktu",
            "pilihan_d": "Membuat audiens takut",
            "kunci_jawaban": "B"
          },
          {
            "id": "00000000-0000-4000-d000-000600020003",
            "urutan": 3,
            "pertanyaan": "Bila lupa materi saat presentasi, sebaiknya...",
            "pilihan_a": "Diam sampai waktu habis",
            "pilihan_b": "Jeda sejenak lalu lihat catatan",
            "pilihan_c": "Mengulang dari awal",
            "pilihan_d": "Langsung meninggalkan ruangan",
            "kunci_jawaban": "B"
          }
        ]
      }
    ]
  },
  {
    "id": "00000000-0000-4000-b000-000000000007",
    "judul": "Microsoft Word untuk Surat Dinas",
    "slug": "word-surat-dinas",
    "kategori": "Perkantoran",
    "ringkasan": "Format surat resmi standar instansi, penomoran otomatis, dan mail merge massal.",
    "deskripsi": "Panduan praktis staf sekretariat membuat surat undangan, surat tugas, dan nota dinas rapi sesuai tata naskah dinas, lengkap dengan otomatisasi nama penerima menggunakan Mail Merge.",
    "harga": 200000,
    "kuota": 20,
    "terpakai": 0,
    "sisaKursi": 20,
    "nilaiLulus": 60,
    "status": "draf",
    "instrukturId": "00000000-0000-4000-a000-000000000011",
    "instrukturNama": "Yudha Pratama",
    "instrukturGelar": "Senior Office Specialist",
    "instrukturAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "totalDurasiMenit": 65,
    "image": "/images/card_perkantoran.jpg",
    "modul": [
      {
        "id": "mod-word-1",
        "urutan": 1,
        "judul": "Format Surat Dinas & Tata Naskah",
        "durasiMenit": 30,
        "isiMateri": "Pengaturan margin, kop surat resmi, penomoran surat, dan kerapian tabulasi spasi.",
        "soalCount": 3,
        "hasPdf": true,
        "soal": [
          {
            "id": "00000000-0000-4000-d000-000700010001",
            "urutan": 1,
            "pertanyaan": "Bagian surat yang memuat nama dan alamat instansi adalah...",
            "pilihan_a": "Tembusan",
            "pilihan_b": "Lampiran",
            "pilihan_c": "Paraf",
            "pilihan_d": "Kop surat",
            "kunci_jawaban": "D"
          },
          {
            "id": "00000000-0000-4000-d000-000700010002",
            "urutan": 2,
            "pertanyaan": "Nomor surat ditulis di bagian...",
            "pilihan_a": "Di amplop saja",
            "pilihan_b": "Tidak perlu ditulis",
            "pilihan_c": "Atas, setelah kop surat",
            "pilihan_d": "Paling bawah",
            "kunci_jawaban": "C"
          },
          {
            "id": "00000000-0000-4000-d000-000700010003",
            "urutan": 3,
            "pertanyaan": "Ukuran kertas surat dinas yang umum adalah...",
            "pilihan_a": "A6",
            "pilihan_b": "Kertas folio bergaris",
            "pilihan_c": "Kertas HVS warna",
            "pilihan_d": "A4",
            "kunci_jawaban": "D"
          }
        ]
      },
      {
        "id": "mod-word-2",
        "urutan": 2,
        "judul": "Mail Merge untuk Surat Massal",
        "durasiMenit": 35,
        "isiMateri": "Menghubungkan Word dengan data Excel penerima untuk cetak ratusan surat sekali klik.",
        "soalCount": 2,
        "hasPdf": true,
        "soal": [
          {
            "id": "00000000-0000-4000-d000-000700020001",
            "urutan": 1,
            "pertanyaan": "Mail merge dipakai untuk...",
            "pilihan_a": "Mengirim email spam",
            "pilihan_b": "Menghapus format",
            "pilihan_c": "Menggabungkan dua printer",
            "pilihan_d": "Membuat banyak surat dengan data penerima berbeda",
            "kunci_jawaban": "D"
          },
          {
            "id": "00000000-0000-4000-d000-000700020002",
            "urutan": 2,
            "pertanyaan": "Sumber data mail merge bisa berupa...",
            "pilihan_a": "File video",
            "pilihan_b": "File gambar",
            "pilihan_c": "File Excel daftar penerima",
            "pilihan_d": "File musik",
            "kunci_jawaban": "C"
          }
        ]
      }
    ]
  }
];

// Katalog publik hanya menampilkan yang berstatus "terbit" (BR-01)
export const PUBLISHED_COURSES = ALL_COURSES.filter((c) => c.status === "terbit");
