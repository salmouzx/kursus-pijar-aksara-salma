# Rencana Kerja & Test Plan
## Capstone Project 03 · LMS Lembaga Kursus Pijar Aksara

Dokumen ini disusun berdasarkan **PRD Aplikasi LMS Lembaga Kursus Pijar Aksara**, **Petunjuk Capstone Project**, dan **ERD LMS**. Dokumen ini menjadi acuan pengembangan sistematis dan pengujian kepatuhan aturan bisnis (Business Rules / BR) serta pemenuhan User Story (US).

---

## 1. Rencana Kerja Per Halaman

Aplikasi LMS Lembaga Kursus Pijar Aksara terdiri dari halaman publik dan halaman internal dengan kontrol akses berbasis peran (RBAC):

| Halaman | Rute URL | Akses Peran | SEO & Indexing | Fitur Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page & Katalog Kursus** | `/` atau `/katalog` | Publik (Pengunjung, Peserta, Instruktur, Admin) | `index, follow`, Masuk Sitemap | Hero estetik (gaya cards rounded Vespa & Prospera), pencarian teks bebas, filter kategori, kartu kursus terbit (BR-01), harga / label gratis, sisa kursi dinamis (BR-06), nama instruktur. |
| **Detail Kursus** | `/kursus/[slug]` | Publik | `index, follow`, Masuk Sitemap | Info detail kursus terbit, deskripsi lengkap, silabus modul & durasi (BR-03), profil instruktur, kuota & sisa kursi, tombol pendaftaran langsung (US-01, US-02). |
| **Autentikasi (Masuk & Daftar)** | `/login`, `/register` | Publik | `noindex, nofollow` | Pendaftaran akun baru peran Peserta (nama, email, nomor HP, password). Login dengan Supabase Auth untuk 3 peran (Admin, Instruktur, Peserta). |
| **Kursus Saya** | `/kursus-saya` | Peserta | `noindex, nofollow` | Daftar pendaftaran kursus peserta, badge status (menunggu_bayar, aktif, selesai, dibatalkan, kedaluwarsa), countdown batas bayar 24 jam (BR-07), tombol batalkan pendaftaran yang belum dibayar, progress bar belajar, tombol "Lanjut Belajar", tombol "Lihat Sertifikat" (BR-11). |
| **Ruang Belajar** | `/belajar/[slug]/[modul]` | Peserta Terdaftar (aktif/selesai) | `noindex, nofollow` | Sidebar navigasi modul terurut (BR-03), lock/unlock indikator modul (BR-08), viewer materi teks/video/PDF dari Supabase Storage privat dengan signed URL maks 60 menit, tombol "Tandai materi sudah dibaca", antarmuka kuis pilihan ganda A-D (BR-09), pembatasan 3 percobaan kuis per modul (BR-10), skor kuis otomatis tanpa membocorkan kunci jawaban, penerbitan sertifikat otomatis saat modul terakhir lulus (BR-11). |
| **Kelola Kursus** | `/instruktur/kursus` | Instruktur Pemilik | `noindex, nofollow` | Manajemen kursus milik instruktur sendiri (BR-12), CRUD modul & soal saat status `draf` (BR-04), validasi prasyarat pengajuan (2-10 modul berurutan, 3-20 soal per modul, harga Rp0/Rp50rb-Rp5jt, kuota 1-100, pass grade 50-100) (BR-03), alur pengajuan ke status `ditinjau`, penampil catatan pengembalian dari admin. |
| **Peserta & Nilai** | `/instruktur/peserta`, `/admin/peserta` | Instruktur Pemilik, Admin | `noindex, nofollow` | Rekap peserta per kursus, progres modul, nilai terbaik dan riwayat percobaan kuis per modul. Instruktur hanya dapat melihat peserta kursus miliknya sendiri (BR-12). |
| **Panel Admin** | `/admin/panel` | Admin | `noindex, nofollow` | Tab Tinjauan Kursus: terbitkan, kembalikan ke draf (wajib catatan min 10 karakter), tutup kursus, buka kembali (BR-02); Tab Pendaftaran & Pembayaran: konfirmasi manual pembayaran, batalkan pendaftaran aktif (alasan min 10 karakter) (BR-07); Tab Pengguna: kelola peran akun, nonaktifkan akun (dilarang self-demote/deactivate) (BR-12); Tab Audit Log (BR-12). |
| **Dashboard Admin** | `/admin/dashboard` | Admin | `noindex, nofollow` | Filter tanggal (default 8 minggu terakhir), kartu ringkasan (pendaftaran, pendapatan, peserta aktif, sertifikat terbit), grafik batang pendaftaran mingguan (gratis vs berbayar), grafik garis pendapatan mingguan, grafik tingkat penyelesaian kursus, tabel modul tingkat lulus percobaan pertama terendah, tabel kursus hampir penuh (sisa kursi <= 2). |

---

## 2. Matriks Akses Peran (Access Control Matrix)

| Rute / Aksi | Pengunjung | Peserta | Instruktur | Admin | Aturan Terkait |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Lihat Katalog & Detail Kursus Terbit | ✅ | ✅ | ✅ | ✅ | BR-01 |
| Buka URL Kursus Draf / Ditinjau / Ditutup | ❌ (404) | ❌ (404) | Hanya Pemilik | ✅ | BR-01, BR-02 |
| Mendaftar Kursus (Gratis / Berbayar) | ❌ (Redirect Login) | ✅ | ❌ | ❌ | BR-05, BR-06 |
| Buka Materi & Kerjakan Kuis di Ruang Belajar | ❌ | Hanya Peserta Terdaftar (Aktif/Selesai) | ❌ | ❌ | BR-08, BR-12 |
| Unduh Sertifikat Sendiri | ❌ | Hanya Pemilik Sertifikat | ❌ | ✅ | BR-11, BR-12 |
| Buat & Edit Draf Kursus/Modul/Soal | ❌ | ❌ | Hanya Pemilik | ❌ | BR-04, BR-12 |
| Ajukan Kursus (draf ke ditinjau) | ❌ | ❌ | Hanya Pemilik | ❌ | BR-02, BR-03 |
| Terbitkan / Kembalikan / Tutup Kursus | ❌ | ❌ | ❌ | ✅ | BR-02 |
| Konfirmasi Pembayaran & Batal Pendaftaran | ❌ | ❌ | ❌ | ✅ | BR-07 |
| Batalkan Pendaftaran Milik Sendiri (Belum Bayar) | ❌ | ✅ | ❌ | ❌ | BR-07 |
| Lihat Nilai Kuis & Data Peserta Lain | ❌ | ❌ | Hanya Peserta Kursus Miliknya | ✅ Semua Kursus | BR-12 |
| Buka Panel Admin & Kelola Pengguna | ❌ | ❌ | ❌ | ✅ | BR-12 |
| Buka Dashboard Laporan Bisnis | ❌ | ❌ | ❌ | ✅ | BR-12, PRD Bab 9 |

---

## 3. Test Plan Berdasarkan Aturan Bisnis (BR) & User Story (US)

Setiap pengujian memuat kode uji, rujukan aturan, akun penguji dari sheet **Akun Uji**, langkah pengujian, hasil yang diharapkan, hasil aktual, dan status pengujian.

| Kode | Rujukan | Akun Uji | Jenis Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | BR-01, US-01 | Pengunjung (Anonim) | Positif | Buka halaman `/katalog` tanpa login. Periksa kursus yang ditampilkan. | Hanya 4 kursus berstatus `terbit` yang muncul (Excel, Canva, Bahasa Inggris, Dasar Pembukuan). Kursus draf, ditinjau, dan ditutup tidak tampil. | *Menunggu eksekusi* | Draft |
| **TC-02** | BR-01, US-01 | Pengunjung (Anonim) | Negatif | Buka rute langsung `/kursus/fotografi-produk-dengan-ponsel` (kursus berstatus `ditutup`). | Menghasilkan respon 404 (Halaman Tidak Ditemukan). Akses ditolak. | *Menunggu eksekusi* | Draft |
| **TC-03** | BR-02, US-08 | Instruktur Yudha Pratama | Negatif | Mengirim request ubah status kursus dari `draf` langsung ke `terbit` lewat API/fungsi. | Permintaan ditolak database/API dengan pesan: "Perpindahan status tidak diizinkan. Hanya Admin yang dapat menerbitkan kursus dari status ditinjau." | *Menunggu eksekusi* | Draft |
| **TC-04** | BR-02, US-08 | Admin Ratna Kusumawati | Negatif (Validasi) | Mengembalikan kursus dari status `ditinjau` ke `draf` dengan catatan kurang dari 10 karakter (misal: "Revisi"). | Tombol submit menolak dan validasi server memunculkan error: "Catatan pengembalian wajib minimal 10 karakter". | *Menunggu eksekusi* | Draft |
| **TC-05** | BR-02, US-08 | Admin Ratna Kusumawati | Negatif | Mencoba mengembalikan kursus yang sudah `terbit` ke status `draf`. | Ditolak oleh constraint database: "Kursus terbit tidak bisa kembali ke draf." | *Menunggu eksekusi* | Draft |
| **TC-06** | BR-03, US-06 | Instruktur Yudha Pratama | Negatif (Kasus Batas) | Mengajukan kursus draf `Microsoft Word untuk Surat Dinas` (modul 2 hanya memiliki 2 soal). | Pengajuan ditolak dengan pesan: "Kursus belum memenuhi syarat. Setiap modul wajib memiliki 3 sampai 20 soal." | *Menunggu eksekusi* | Draft |
| **TC-07** | BR-04, US-06 | Instruktur Michael Sitorus | Negatif (Hak Akses) | Menambahkan modul baru pada kursus `Public Speaking untuk Presentasi Kantor` yang sedang berstatus `ditinjau`. | Ditolak dengan pesan: "Isi kursus terkunci dan hanya bisa diubah saat status draf." | *Menunggu eksekusi* | Draft |
| **TC-08** | BR-05, US-02 | Peserta Putri Ayuningtyas | Negatif | Mendaftar ke kursus `Desain Konten Media Sosial dengan Canva` padahal sudah memiliki pendaftaran berstatus `aktif`. | Pendaftaran ditolak dengan pesan: "Anda sudah memiliki pendaftaran yang masih berlaku untuk kursus ini." | *Menunggu eksekusi* | Draft |
| **TC-09** | BR-05, US-02 | Peserta Putri Ayuningtyas | Positif (Daftar Ulang) | Mendaftar kursus `Dasar Pembukuan untuk UMKM` setelah pendaftaran sebelumnya `kedaluwarsa`. | Pendaftaran baru berhasil dibuat karena pendaftaran lama sudah tidak berlaku (kedaluwarsa). | *Menunggu eksekusi* | Draft |
| **TC-10** | BR-06, US-02 | Peserta Bagus Santoso | Positif (Kursi Terakhir) | Mendaftar kursus `Dasar Pembukuan untuk UMKM` yang kuotanya 12 dan sisa kursi 1. | Pendaftaran berhasil dibuat, sisa kursi berkurang menjadi 0. | *Menunggu eksekusi* | Draft |
| **TC-11** | BR-06, US-02 | Peserta Siti Aminah | Negatif (Kuota Penuh) | Mendaftar kursus `Dasar Pembukuan untuk UMKM` setelah sisa kursi 0 (kuota penuh). | Pendaftaran ditolak dengan pesan: "Kuota peserta telah penuh." | *Menunggu eksekusi* | Draft |
| **TC-12** | BR-06, US-02 | 2 Peserta Bersamaan | Kasus Batas (Race Condition) | 2 akun mencoba mendaftar secara bersamaan pada 1 sisa kursi terakhir melalui function dengan `FOR UPDATE`. | Tepat 1 akun berhasil mendaftar, akun kedua mendapat respon penolakan kuota penuh. Kuota tidak boleh minus/over-subscribed. | *Menunggu eksekusi* | Draft |
| **TC-13** | BR-07, US-02 | Peserta Nur Fadilah | Positif | Mendaftar kursus gratis `Desain Konten Media Sosial dengan Canva`. | Pendaftaran langsung berstatus `aktif` tanpa menunggu konfirmasi pembayaran. | *Menunggu eksekusi* | Draft |
| **TC-14** | BR-07, US-02 | Peserta Yoga Firmansyah | Positif | Menekan tombol "Batalkan Pendaftaran" pada pendaftaran kursus berbayar yang berstatus `menunggu_bayar`. | Status pendaftaran berhasil berubah menjadi `dibatalkan` dan sisa kursi kursus bertambah kembali 1. | *Menunggu eksekusi* | Draft |
| **TC-15** | BR-07, US-09 | Admin Dimas Prasetyo | Negatif (Validasi) | Membatalkan pendaftaran peserta aktif tanpa mengisi alasan pembatalan (atau kurang dari 10 karakter). | Ditolak oleh sistem dengan pesan: "Alasan pembatalan pendaftaran aktif wajib diisi minimal 10 karakter." | *Menunggu eksekusi* | Draft |
| **TC-16** | BR-08, US-03 | Peserta Lina Marlina | Negatif | Mengakses langsung materi Modul 3 kursus `Excel untuk Administrasi Perkantoran` saat Modul 2 belum lulus. | Akses ditolak / terkunci dengan indikator: "Selesaikan dan lulus kuis modul sebelumnya terlebih dahulu." | *Menunggu eksekusi* | Draft |
| **TC-17** | BR-08, US-04 | Peserta Zaki Maulana | Negatif | Membuka kuis Modul 1 `Excel` sebelum menekan tombol "Tandai materi sudah dibaca". | Tombol buka kuis nonaktif dengan pesan: "Harap selesaikan membaca materi terlebih dahulu." | *Menunggu eksekusi* | Draft |
| **TC-18** | BR-09, US-04 | Peserta Lina Marlina | Keamanan (Security) | Menginspeksi response network tab browser saat kuis dimuat dan dikirim. | Kunci jawaban (`kunci_jawaban`) sama sekali tidak ada di payload JSON. Penilaian diproses di server. | *Menunggu eksekusi* | Draft |
| **TC-19** | BR-09, US-04 | Peserta Lina Marlina | Kasus Batas (Perhitungan) | Submit kuis modul 4 soal dengan 3 benar: (3/4)*100 = 75. Submit kuis modul 5 soal dengan 3 benar: (3/5)*100 = 60. | Nilai dibulatkan ke bawah. Pada passing grade 70, nilai 75 berstatus `Lulus`, nilai 60 berstatus `Belum Lulus`. | *Menunggu eksekusi* | Draft |
| **TC-20** | BR-10, US-04 | Peserta Rizky Ramadhan | Negatif (Batas Percobaan) | Mencoba submit kuis Modul 1 `Bahasa Inggris` untuk percobaan ke-4 setelah 3 kali gagal. | Ditolak oleh server: "Batas maksimal 3 percobaan kuis telah tercapai." | *Menunggu eksekusi* | Draft |
| **TC-21** | BR-11, US-05 | Peserta Rangga Wijaya | Positif | Menyelesaikan modul terakhir kursus yang belum selesai. | Status pendaftaran otomatis berubah menjadi `selesai`, dan sertifikat otomatis terbit dengan format `PA-2026-XXXX`. | *Menunggu eksekusi* | Draft |
| **TC-22** | BR-12, US-07 | Instruktur Yudha Pratama | Hak Akses (Isolasi Data) | Mengakses data peserta kursus `Bahasa Inggris` milik Michael Sitorus lewat rute atau API. | Ditolak oleh Row Level Security (RLS) Supabase: data kosong atau 403 Forbidden. Yudha hanya bisa melihat peserta kursusnya sendiri. | *Menunggu eksekusi* | Draft |
| **TC-23** | BR-12, US-09 | Admin Ratna Kusumawati | Negatif (Integritas Admin) | Mencoba mengubah perannya sendiri menjadi Peserta, atau menonaktifkan akunnya sendiri di menu Kelola Pengguna. | Ditolak dengan pesan: "Admin tidak dapat menurunkan peran atau menonaktifkan akun sendiri." | *Menunggu eksekusi* | Draft |
| **TC-24** | BR-12, US-09 | Admin Ratna Kusumawati | Auditability | Mengubah kuota kursus terbit atau mengonfirmasi pembayaran. | Perubahan otomatis tercatat di tabel `audit_log` dengan rincian pelaku, aksi, waktu, data sebelum, dan data sesudah. | *Menunggu eksekusi* | Draft |

---

## 4. Standar Desain UI & Eksekusi

Sesuai arahan desain yang disepakati:
- **Style Visual (download.jpeg)**: Rounded card squircle container (radius 24–32px), clean light slate/off-white background, pill navbar terstruktur, typography editorial bold + avatar pill group, quick course thumbnail carousel (`<- -> 01/04`), floating micro-badges (sisa kursi, rating, durasi modul).
- **Struktur Konten (download (1).jpeg)**: Capsule-outlined headlines (`[Pekerja Kantor]` & `[Pelaku UMKM]`), bullet value props dengan panah mikro, conversational/social proof floating bubbles ("Sertifikat resmi langsung terbit", "Materi praktis siap pakai"), 3 featured organic cards dengan fluid shapes & modern gradient accents.
- **Teknologi Komponen**: Menggunakan arsitektur **shadcn/ui** berbasis Radix UI Primitives + Tailwind CSS (Bukan template kaku / AI slop, tetapi komponen fungsional yang accessible, responsive, dan high-polish).
