import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const admin = getSupabaseAdmin();

    // 1. Cek apakah ini Webhook Mayar resmi atau simulasi pendaftaranId
    let pendaftaranId = body.pendaftaranId;
    const invoiceCandidate =
      body.invoiceId ||
      body.mayar_invoice_id ||
      body.data?.invoiceCode ||
      body.data?.id ||
      body.data?.transactionId ||
      body.id;

    if (!pendaftaranId && invoiceCandidate) {
      // Cari pendaftaran berdasarkan mayar_invoice_id
      const { data: found } = await admin
        .from("pendaftaran")
        .select("id, status")
        .or(`mayar_invoice_id.eq.${invoiceCandidate},mayar_invoice_id.eq.${body.data?.id || ''},mayar_invoice_id.eq.${body.data?.invoiceCode || ''}`)
        .maybeSingle();

      if (found) {
        pendaftaranId = found.id;
      }
    }

    if (!pendaftaranId) {
      return NextResponse.json(
        { error: "Pendaftaran ID atau Mayar Invoice ID tidak ditemukan." },
        { status: 400 }
      );
    }

    // 2. Ambil data pendaftaran saat ini
    const { data: pendaftaran, error: pErr } = await admin
      .from("pendaftaran")
      .select(`
        id, status, nominal, peserta_id, kursus_id,
        kursus:kursus_id (judul, slug)
      `)
      .eq("id", pendaftaranId)
      .single();

    if (pErr || !pendaftaran) {
      return NextResponse.json({ error: "Data pendaftaran tidak ditemukan." }, { status: 404 });
    }

    if (pendaftaran.status === "aktif" || pendaftaran.status === "selesai") {
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        message: "Pendaftaran ini sudah berstatus aktif.",
        redirectUrl: `/belajar/${(pendaftaran.kursus as any)?.slug}/1`,
      });
    }

    if (pendaftaran.status === "dibatalkan" || pendaftaran.status === "kedaluwarsa") {
      return NextResponse.json(
        { error: "Pendaftaran ini sudah dibatalkan atau kedaluwarsa. Silakan daftar ulang." },
        { status: 400 }
      );
    }

    // 3. Update status pendaftaran menjadi aktif (Pembayaran Mayar Diterima)
    const now = new Date().toISOString();
    const { error: updateErr } = await admin
      .from("pendaftaran")
      .update({
        status: "aktif",
        metode_bayar: "mayar",
        dibayar_pada: now,
      })
      .eq("id", pendaftaranId);

    if (updateErr) {
      console.error("Error updating pendaftaran to aktif:", updateErr);
      return NextResponse.json(
        { error: "Gagal memperbarui status pendaftaran: " + updateErr.message },
        { status: 500 }
      );
    }

    // 4. Catat Audit Log (BR-12)
    await admin.from("audit_log").insert({
      pengguna_id: pendaftaran.peserta_id,
      tabel: "pendaftaran",
      aksi: "konfirmasi_pembayaran_mayar",
      data_sebelum: { status: pendaftaran.status },
      data_sesudah: { status: "aktif", metode_bayar: "mayar", dibayar_pada: now },
    });

    return NextResponse.json({
      success: true,
      message: "Konfirmasi pembayaran Mayar berhasil! Kursus telah aktif.",
      redirectUrl: `/belajar/${(pendaftaran.kursus as any)?.slug}/1`,
    });
  } catch (err: any) {
    console.error("Unexpected error in Mayar payment confirmation:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server saat memproses konfirmasi Mayar." },
      { status: 500 }
    );
  }
}
