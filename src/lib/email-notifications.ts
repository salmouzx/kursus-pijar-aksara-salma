/**
 * Layanan Notifikasi Email Transaksional Lembaga Kursus Pijar Aksara
 * Sesuai PRD Bab 11.2:
 * 1. Pendaftaran Aktif
 * 2. Pengingat Batas Bayar (3 Jam Tersisa)
 * 3. Penerbitan Sertifikat Kelulusan
 */

export type EmailNotificationType =
  | "pendaftaran_aktif"
  | "batas_bayar_reminder"
  | "sertifikat_terbit";

export interface SendEmailPayload {
  toEmail: string;
  recipientName: string;
  type: EmailNotificationType;
  courseTitle: string;
  extraData?: {
    batasBayar?: string;
    nominal?: number;
    nomorSertifikat?: string;
    courseSlug?: string;
  };
}

export async function sendEmailNotification(payload: SendEmailPayload) {
  try {
    const res = await fetch("/api/notifikasi/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.warn("Gagal mengirim notifikasi email:", err);
    return { success: false, error: err.message };
  }
}
