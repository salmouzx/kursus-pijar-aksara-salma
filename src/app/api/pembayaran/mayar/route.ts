import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Helper untuk query status invoice langsung ke API Mayar (sandbox maupun production)
 */
async function checkMayarInvoiceLive(candidate: string) {
  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) return null;

  // Ekstrak slug atau kode bersih jika candidate berbentuk URL
  // Contoh: https://kelas-belajar.myr.lat/invoices/2l0mux1nu -> 2l0mux1nu
  const cleanCandidate = candidate
    .replace(/^https?:\/\/[^\/]+\/(?:invoices|inv|pl)\//, "")
    .replace(/\?.*/, "")
    .trim();

  for (const host of ["api.mayar.io", "api.mayar.id"]) {
    try {
      // 1. Jika candidate berbentuk UUID (36 karakter dengan strip)
      if (candidate.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const res = await fetch(`https://${host}/hl/v2/invoices/${candidate}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data) return json.data;
        }
      }

      // 2. Fetch list invoice terbaru untuk mencocokkan link / paymentUrl / ID
      const listRes = await fetch(`https://${host}/hl/v2/invoices?limit=30`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });

      if (listRes.ok) {
        const listData = await listRes.json();
        const invoices = listData?.data || [];

        const match = invoices.find((inv: any) => {
          if (!inv) return false;
          const invId = inv.id;
          const invLink = inv.link;
          const invPaymentUrl = inv.paymentUrl;

          return (
            invId === candidate ||
            invId === cleanCandidate ||
            invLink === cleanCandidate ||
            (invLink && candidate.includes(invLink)) ||
            (invPaymentUrl && (candidate.includes(invPaymentUrl) || invPaymentUrl.includes(cleanCandidate)))
          );
        });

        if (match) return match;
      }
    } catch (e) {
      console.warn(`Gagal query invoice Mayar di ${host}:`, e);
    }
  }

  return null;
}

/**
 * GET: Cek & sinkronkan status pembayaran Mayar secara langsung (Live Sync)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pendaftaranId = searchParams.get("pendaftaranId");
    const admin = getSupabaseAdmin();

    if (!pendaftaranId) {
      return NextResponse.json(
        { error: "Parameter pendaftaranId wajib disertakan." },
        { status: 400 }
      );
    }

    // 1. Ambil pendaftaran
    const { data: pendaftaran, error: pErr } = await admin
      .from("pendaftaran")
      .select(`
        id, status, nominal, peserta_id, kursus_id, mayar_invoice_id,
        kursus:kursus_id (judul, slug)
      `)
      .eq("id", pendaftaranId)
      .single();

    if (pErr || !pendaftaran) {
      return NextResponse.json({ error: "Data pendaftaran tidak ditemukan." }, { status: 404 });
    }

    // 2. Jika sudah aktif / selesai, kembalikan status aktif
    if (pendaftaran.status === "aktif" || pendaftaran.status === "selesai") {
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        status: pendaftaran.status,
        message: "Pendaftaran ini sudah berstatus aktif.",
        redirectUrl: `/belajar/${(pendaftaran.kursus as any)?.slug}/1`,
      });
    }

    // 3. Jika status masih menunggu_bayar, cek status ke API Mayar
    if (pendaftaran.status === "menunggu_bayar" && pendaftaran.mayar_invoice_id) {
      const liveInvoice = await checkMayarInvoiceLive(pendaftaran.mayar_invoice_id);

      if (liveInvoice && (liveInvoice.status === "paid" || liveInvoice.status === true)) {
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
          console.error("Gagal mengaktifkan pendaftaran via live sync:", updateErr);
          return NextResponse.json(
            { error: "Gagal memperbarui database: " + updateErr.message },
            { status: 500 }
          );
        }

        // Catat audit log
        await admin.from("audit_log").insert({
          pengguna_id: pendaftaran.peserta_id,
          tabel: "pendaftaran",
          aksi: "sinkronisasi_pembayaran_mayar_sukses",
          data_sebelum: { status: pendaftaran.status },
          data_sesudah: { status: "aktif", metode_bayar: "mayar", dibayar_pada: now },
        });

        return NextResponse.json({
          success: true,
          status: "aktif",
          updated: true,
          message: "Pembayaran Mayar berhasil diverifikasi! Kursus Anda telah aktif.",
          redirectUrl: `/belajar/${(pendaftaran.kursus as any)?.slug}/1`,
        });
      }

      return NextResponse.json({
        success: false,
        status: "menunggu_bayar",
        mayarStatus: liveInvoice?.status || "unpaid",
        message: "Pembayaran belum terdeteksi lunas di Mayar.",
      });
    }

    return NextResponse.json({
      success: false,
      status: pendaftaran.status,
      message: `Status pendaftaran saat ini: ${pendaftaran.status}`,
    });
  } catch (err: any) {
    console.error("Error saat verifikasi status Mayar:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server saat memeriksa status." },
      { status: 500 }
    );
  }
}

/**
 * POST: Webhook Mayar resmi & konfirmasi manual
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const admin = getSupabaseAdmin();

    // 1. Kumpulkan seluruh kandidat ID / Link transaksi
    let pendaftaranId = body.pendaftaranId;
    const candidates: string[] = [];

    if (body.data?.id) candidates.push(body.data.id);
    if (body.data?.link) candidates.push(body.data.link);
    if (body.data?.invoiceCode) candidates.push(body.data.invoiceCode);
    if (body.data?.paymentLinkId) candidates.push(body.data.paymentLinkId);
    if (body.data?.paymentUrl) candidates.push(body.data.paymentUrl);
    if (body.id) candidates.push(body.id);
    if (body.invoiceId) candidates.push(body.invoiceId);
    if (body.mayar_invoice_id) candidates.push(body.mayar_invoice_id);

    // 2. Jika tidak ada pendaftaranId langsung, cari di database berdasarkan kandidat
    if (!pendaftaranId && candidates.length > 0) {
      // Buat filter query OR untuk pencarian tepat (.eq) maupun sebagian (.ilike)
      const orFilters = candidates
        .filter(Boolean)
        .flatMap((cand) => [`mayar_invoice_id.eq.${cand}`, `mayar_invoice_id.ilike.%${cand}%`])
        .join(",");

      const { data: found } = await admin
        .from("pendaftaran")
        .select("id, status")
        .or(orFilters)
        .order("didaftarkan_pada", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (found) {
        pendaftaranId = found.id;
      } else {
        // Coba cari invoice di Mayar secara live untuk mendapatkan link-nya
        for (const cand of candidates) {
          const liveInv = await checkMayarInvoiceLive(cand);
          if (liveInv?.link) {
            const { data: foundByLink } = await admin
              .from("pendaftaran")
              .select("id, status")
              .ilike("mayar_invoice_id", `%${liveInv.link}%`)
              .order("didaftarkan_pada", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (foundByLink) {
              pendaftaranId = foundByLink.id;
              break;
            }
          }
        }
      }
    }

    if (!pendaftaranId) {
      return NextResponse.json(
        { error: "Pendaftaran ID atau Mayar Invoice ID tidak ditemukan." },
        { status: 400 }
      );
    }

    // 3. Ambil data pendaftaran saat ini
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

    // 4. Update status pendaftaran menjadi aktif (Pembayaran Mayar Diterima)
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

    // 5. Catat Audit Log (BR-12)
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
