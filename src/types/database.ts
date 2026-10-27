export type PeranPengguna = "peserta" | "instruktur" | "admin";
export type StatusKursus = "draf" | "ditinjau" | "terbit" | "ditutup";
export type StatusPendaftaran = "menunggu_bayar" | "aktif" | "selesai" | "kedaluwarsa" | "dibatalkan";
export type MetodeBayar = "gratis" | "transfer_manual" | "mayar";

export interface Profile {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp: string | null;
  peran: PeranPengguna;
  aktif: boolean;
  dibuat_pada: string;
}

export interface Kursus {
  id: string;
  instruktur_id: string;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string;
  deskripsi: string;
  harga: number;
  harga_awal?: number;
  diskon_persen?: number;
  kuota: number;
  nilai_lulus: number;
  status: StatusKursus;
  catatan_tinjauan: string | null;
  diajukan_pada: string | null;
  diterbitkan_pada: string | null;
  dibuat_pada: string;
  diubah_pada: string;
  // Relasi opsional
  instruktur?: Profile;
}

export interface Modul {
  id: string;
  kursus_id: string;
  urutan: number;
  judul: string;
  isi_materi: string;
  video_url: string | null;
  lampiran_path: string | null;
  durasi_menit: number;
  dibuat_pada: string;
}

export interface Soal {
  id: string;
  modul_id: string;
  urutan: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  // kunci_jawaban dirahasiakan dari client sesuai BR-09
  kunci_jawaban?: "A" | "B" | "C" | "D";
}

export interface Pendaftaran {
  id: string;
  kursus_id: string;
  peserta_id: string;
  status: StatusPendaftaran;
  nominal: number;
  metode_bayar: MetodeBayar;
  batas_bayar: string | null;
  mayar_invoice_id: string | null;
  dibayar_pada: string | null;
  dikonfirmasi_oleh: string | null;
  alasan_batal: string | null;
  didaftarkan_pada: string;
  selesai_pada: string | null;
  dibatalkan_pada: string | null;
  // Relasi opsional
  kursus?: Kursus;
  peserta?: Profile;
}

export interface ProgresModul {
  id: string;
  pendaftaran_id: string;
  modul_id: string;
  materi_dibaca_pada: string | null;
  lulus_pada: string | null;
}

export interface PercobaanKuis {
  id: string;
  pendaftaran_id: string;
  modul_id: string;
  nomor_percobaan: number; // 1 s/d 3
  jawaban: Record<string, "A" | "B" | "C" | "D">;
  jumlah_soal: number;
  jumlah_benar: number;
  nilai: number;
  lulus: boolean;
  dikerjakan_pada: string;
}

export interface Sertifikat {
  id: string;
  pendaftaran_id: string;
  tahun: number;
  nomor_urut: number;
  nomor_sertifikat: string; // format: PA-2026-XXXX
  nama_peserta: string;
  judul_kursus: string;
  diterbitkan_pada: string;
}

export interface AuditLog {
  id: number;
  pelaku_id: string | null;
  aksi: string;
  nama_tabel: string;
  id_data: string | null;
  data_sebelum: any;
  data_sesudah: any;
  dibuat_pada: string;
}
