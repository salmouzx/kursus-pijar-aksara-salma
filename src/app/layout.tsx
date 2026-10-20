import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lembaga Kursus Pijar Aksara · Kursus Praktis Perkantoran & UMKM Depok",
  description:
    "Aplikasi LMS Lembaga Kursus Pijar Aksara Depok. Pelatihan singkat Excel, Desain Media Sosial Canva, Bahasa Inggris Kerja, dan Dasar Pembukuan UMKM dengan modul terstruktur, kuis otomatis, dan sertifikat resmi.",
  keywords: [
    "Kursus Depok",
    "LMS Pijar Aksara",
    "Excel Administrasi Perkantoran",
    "Desain Canva UMKM",
    "Dasar Pembukuan Usaha Kecil",
    "Bahasa Inggris Percakapan Kerja",
  ],
  authors: [{ name: "Lembaga Kursus Pijar Aksara" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
