# 🎓 PijarAksara LMS
> **Platform Pembelajaran Vokasi & Sertifikasi Digital Terbuka**  
> *Capstone Project - Fullstack Web Application*

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ecf8e?style=flat-square&logo=supabase)

---

## 📌 Tentang Proyek
**PijarAksara LMS** adalah platform pembelajaran daring berbasis kompetensi vokasi yang dirancang untuk menjembatani kesenjangan keterampilan kerja di Indonesia. Dilengkapi modul kurikulum terstruktur, forum diskusi per modul, evaluasi kuis kelulusan, asisten belajar cerdas **AI Tutor (Google Gemini)**, penerbitan sertifikat digital ber-QR Code dengan verifikasi publik, serta integrasi gateway pembayaran **Mayar**.

---

## ✨ Fitur Utama

- 📚 **Katalog Kursus Vokasi Terstruktur**: Filter dinamis berdasarkan kategori (Teknologi, Desain, Bisnis, Data), level kompetensi, dan status akreditasi.
- 💻 **Ruang Belajar Interaktif**: Tampilan materi hierarkis (video, teks, tautan materi unduhan), riwayat kemajuan per modul, dan checklist penyelesaian.
- 🤖 **AI Tutor Cerdas**: Asisten belajar interaktif bertenaga Google Gemini API untuk membantu peserta memahami materi dan memecahkan soal secara kontekstual.
- 💬 **Forum Diskusi Modul**: Tanya jawab kolaboratif langsung di setiap modul dengan dukungan role badge untuk instruktur dan mentor.
- 📝 **Evaluasi Kuis & Kelulusan**: Ujian kompetensi otomatis dengan batas nilai kelulusan (*passing grade*) dan kunci jawaban aman di sisi server.
- 📜 **Sertifikat Digital & QR Code**: Unduh sertifikat PDF beresolusi tinggi dengan nomor unik yang dapat diverifikasi oleh publik/perusahaan via `/verifikasi/[nomor]`.
- 💳 **Integrasi Pembayaran Mayar**: Dukungan checkout otomatis untuk kursus berbayar dengan konfirmasi status instan.
- 👤 **Multi-Role Authentication & Dashboard**:
  - **Peserta**: Akses kursus terdaftar, resume belajar, download sertifikat, dan riwayat poin.
  - **Instruktur**: Manajemen modul, input bank soal kuis, monitoring progres peserta, dan statistik kelas.
  - **Admin**: Audit log transaksi, kelola pengguna, validasi pengajuan kursus, dan analitik sistem.

---

## 🛠️ Tech Stack & Arsitektur

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI Library**: [React 19](https://react.dev/), [Lucide React](https://lucide.dev/), [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL dengan Row Level Security)
- **PDF & QR Engine**: `jspdf`, `html2canvas`, `qrcode`
- **Email Service**: [Resend](https://resend.com/)
- **Payment Gateway**: [Mayar](https://mayar.id/)
- **AI Engine**: [Google Gemini Flash](https://ai.google.dev/)

---

## 🚀 Panduan Menjalankan Lokal (Getting Started)

### 1. Prasyarat Sistem
- **Node.js**: versi 20.9.0 atau yang lebih baru
- **npm**: versi 10+ (atau `pnpm` / `yarn`)

### 2. Kloning Repository
```bash
git clone https://github.com/username/pijaraksara-lms.git
cd pijaraksara-lms
```

### 3. Pasang Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Salin file `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Lengkapi nilai variabel di dalam file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Integrasi Tambahan (Opsional untuk fitur tertentu)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=Pijar Aksara <onboarding@resend.dev>
MAYAR_API_KEY=your-mayar-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akun Demo Pengujian (Test Accounts)

Gunakan akun berikut untuk menguji masing-masing hak akses:

| Peran (Role) | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@pijaraksara.id` | `Admin123!` | Audit log, kelola pengguna & kursus, analitik |
| **Instruktur** | `instruktur@pijaraksara.id` | `Instruktur123!` | Buat modul, kelola soal kuis, rekap nilai peserta |
| **Peserta** | `budi.santoso@gmail.com` | `Peserta123!` | Ikuti kursus, kerjakan kuis, klaim sertifikat |

---

## 🌐 Panduan Deployment

### A. Deploy ke Netlify (Direkomendasikan untuk Serverless)
1. Hubungkan repository GitHub ke **Netlify**.
2. Netlify akan membaca konfigurasi otomatis dari `netlify.toml`.
3. Atur **Environment Variables** di dashboard Netlify (*Site configuration > Environment variables*):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (masukkan URL domain Netlify Anda)
4. Klik **Deploy Site**.

### B. Deploy ke Hostinger (VPS / Custom Domain)
- **Opsi 1 (Domain Saja - Sangat Direkomendasikan)**:  
  Deploy web ke Netlify, kemudian di dashboard Hostinger (DNS Management), arahkan domain Anda ke Netlify menggunakan CNAME / A-Record.
- **Opsi 2 (Hostinger VPS / Ubuntu)**:
  1. Clone repository di server VPS Hostinger.
  2. Pastikan terinstall Node.js 20+ dan PM2.
  3. Jalankan `npm run build`.
  4. Jalankan aplikasi via PM2: `pm2 start npm --name "pijaraksara" -- start`.
  5. Konfigurasikan Nginx reverse proxy ke `http://localhost:3000`.

---

## 📄 Lisensi & Kredit
Dikembangkan sebagai Capstone Project program pelatihan vokasi teknologi informasi.  
Hak Cipta © 2026 PijarAksara.
