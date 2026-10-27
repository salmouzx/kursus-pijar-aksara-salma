export interface ServerEmailPayload {
  toEmail: string;
  recipientName: string;
  type: "pendaftaran_aktif" | "batas_bayar_reminder" | "sertifikat_terbit";
  courseTitle: string;
  extraData?: {
    batasBayar?: string;
    nominal?: number;
    nomorSertifikat?: string;
    courseSlug?: string;
  };
}

export async function sendServerEmail(payload: ServerEmailPayload) {
  const { toEmail, recipientName, type, courseTitle, extraData = {} } = payload;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let subject = "";
  let htmlContent = "";

  if (type === "pendaftaran_aktif") {
    subject = `[Pijar Aksara] Pendaftaran Berhasil & Aktif - ${courseTitle}`;
    htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1F382B; margin: 0;">Lembaga Kursus Pijar Aksara</h2>
          <p style="color: #71717a; font-size: 13px;">Pemberitahuan Pendaftaran Kursus</p>
        </div>
        <p style="font-size: 15px; color: #18181b;">Halo <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
          Selamat! Status pendaftaran Anda untuk kursus <strong>${courseTitle}</strong> telah 
          <span style="color: #16a34a; font-weight: bold;">AKTIF</span>. Anda sekarang dapat mengakses seluruh materi modul dan kuis evaluasi.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/belajar/${extraData.courseSlug || ""}/1" style="background-color: #58816D; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Mulai Belajar Sekarang &rarr;
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa; text-align: center;">Lembaga Kursus Pijar Aksara · Depok, Jawa Barat</p>
      </div>
    `;
  } else if (type === "batas_bayar_reminder") {
    subject = `[Penting] Sisa Waktu 3 Jam Pembayaran Kursus - ${courseTitle}`;
    htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #fffbeb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #9a3412; margin: 0;">Lembaga Kursus Pijar Aksara</h2>
          <p style="color: #c2410c; font-size: 13px;">Pengingat Batas Waktu Pembayaran</p>
        </div>
        <p style="font-size: 15px; color: #18181b;">Halo <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
          Ini adalah pengingat bahwa batas waktu pembayaran untuk kursus <strong>${courseTitle}</strong> 
          tersisa kurang dari <strong>3 jam lagi</strong>.
        </p>
        <div style="background-color: white; padding: 16px; border-radius: 12px; border: 1px solid #fed7aa; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #71717a;">Nominal Tagihan:</p>
          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: #18181b;">
            Rp ${(extraData.nominal || 0).toLocaleString("id-ID")}
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/kursus-saya" style="background-color: #ea580c; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Buka Halaman Pembayaran &rarr;
          </a>
        </div>
      </div>
    `;
  } else if (type === "sertifikat_terbit") {
    subject = `[Selamat!] Sertifikat Kelulusan Anda Telah Terbit - ${courseTitle}`;
    htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1F382B; margin: 0;">Lembaga Kursus Pijar Aksara</h2>
          <p style="color: #71717a; font-size: 13px;">Sertifikat Kompetensi Resmi</p>
        </div>
        <p style="font-size: 15px; color: #18181b;">Halo <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
          Selamat atas keberhasilan Anda menyelesaikan seluruh rangkaian modul dan lulus kuis evaluasi pada kursus <strong>${courseTitle}</strong>!
        </p>
        <div style="background-color: #f4fdf8; padding: 16px; border-radius: 12px; border: 1px solid #bbf7d0; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #166534; font-weight: bold; text-transform: uppercase;">Nomor Sertifikat Resmi:</p>
          <p style="margin: 6px 0 0 0; font-size: 20px; font-weight: 900; color: #14532d; letter-spacing: 1px;">
            ${extraData.nomorSertifikat || "PA-2026-XXXX"}
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/sertifikat/${extraData.nomorSertifikat || ""}" style="background-color: #58816D; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Lihat & Unduh Sertifikat &rarr;
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="font-size: 12px; color: #a1a1aa; text-align: center;">Lembaga Kursus Pijar Aksara · Depok, Jawa Barat</p>
      </div>
    `;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  let resendResult: any = null;

  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Pijar Aksara <onboarding@resend.dev>";
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: subject,
          html: htmlContent,
        }),
      });
      resendResult = await resendRes.json();
      if (!resendRes.ok) {
        console.warn("[RESEND WARNING/ERROR]", resendResult);
      } else {
        console.log(`[RESEND SENT SUCCESS] ID: ${resendResult.id} to ${toEmail}`);
      }
    } catch (sendErr) {
      console.warn("Gagal dispatching resend email:", sendErr);
    }
  }

  console.log(`[EMAIL DISPATCHED] To: ${toEmail} | Subject: ${subject}`);
  return { success: true, subject, resendResult };
}
