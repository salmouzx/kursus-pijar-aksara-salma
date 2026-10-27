import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const admin = getSupabaseAdmin();

    let query = admin
      .from("klaim_kursus_poin")
      .select("*")
      .order("dibuat_pada", { ascending: false });

    if (userId) {
      query = query.eq("pengguna_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, fallback: true, error: error.message }, { status: 200 });
    }

    const formatted = (data || []).map((c: any) => ({
      id: c.id,
      penggunaId: c.pengguna_id,
      penggunaNama: c.pengguna_nama,
      penggunaEmail: c.pengguna_email,
      kursusId: c.kursus_id,
      kursusJudul: c.kursus_judul,
      kursusSlug: c.kursus_slug,
      poinDigunakan: c.poin_digunakan,
      status: c.status,
      catatanPeserta: c.catatan_peserta,
      catatanAdmin: c.catatan_admin,
      direviewOleh: c.direview_oleh,
      direviewPada: c.direview_pada,
      totalSertifikatPeserta: c.total_sertifikat_peserta,
      dibuatPada: c.dibuat_pada,
    }));

    return NextResponse.json({ success: true, claims: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      userName,
      userEmail,
      kursusId,
      kursusJudul,
      kursusSlug,
      poinDiperlukan = 1500,
      catatanPeserta,
      totalSertifikat = 0,
    } = body;

    if (!userId || !kursusId || !kursusJudul || !userName) {
      return NextResponse.json(
        { error: "Field userId, kursusId, kursusJudul, dan userName wajib diisi." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Cek apakah ada klaim menunggu review untuk kursus yang sama
    const { data: existing } = await admin
      .from("klaim_kursus_poin")
      .select("id, status")
      .eq("pengguna_id", userId)
      .eq("kursus_id", kursusId)
      .eq("status", "menunggu_review")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Anda sudah memiliki pengajuan klaim untuk kursus ini yang sedang menunggu review Admin." },
        { status: 400 }
      );
    }

    // 2. Simpan klaim baru ke Supabase
    const { data, error } = await admin
      .from("klaim_kursus_poin")
      .insert({
        pengguna_id: userId,
        pengguna_nama: userName.trim(),
        pengguna_email: userEmail || "",
        kursus_id: kursusId,
        kursus_judul: kursusJudul.trim(),
        kursus_slug: kursusSlug || "",
        poin_digunakan: Number(poinDiperlukan) || 1500,
        status: "menunggu_review",
        catatan_peserta: catatanPeserta || "",
        total_sertifikat_peserta: Number(totalSertifikat) || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, claimId: data.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { claimId, decision, adminNama = "Administrator", catatanAdmin } = body;

    if (!claimId || !decision) {
      return NextResponse.json({ error: "claimId dan decision wajib diisi." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // 1. Ambil data klaim saat ini
    const { data: claim, error: fetchErr } = await admin
      .from("klaim_kursus_poin")
      .select("*")
      .eq("id", claimId)
      .single();

    if (fetchErr || !claim) {
      return NextResponse.json({ error: "Data klaim tidak ditemukan." }, { status: 404 });
    }

    if (claim.status !== "menunggu_review") {
      return NextResponse.json(
        { error: `Klaim ini sudah diproses dengan status '${claim.status}'.` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const resolvedCatatan =
      catatanAdmin ||
      (decision === "disetujui"
        ? "Klaim poin reward disetujui oleh Administrator. Pendaftaran otomatis aktif."
        : "Klaim poin reward ditolak oleh Administrator.");

    // 2. Update status klaim di tabel
    const { error: updateErr } = await admin
      .from("klaim_kursus_poin")
      .update({
        status: decision,
        direview_oleh: adminNama,
        direview_pada: now,
        catatan_admin: resolvedCatatan,
      })
      .eq("id", claimId);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // 3. JIKA DISETUJUI: Daftarkan peserta ke kursus secara otomatis berstatus 'aktif' (GRATIS)
    if (decision === "disetujui") {
      // Cek apakah sudah terdaftar
      const { data: existingReg } = await admin
        .from("pendaftaran")
        .select("id, status")
        .eq("kursus_id", claim.kursus_id)
        .eq("peserta_id", claim.pengguna_id)
        .in("status", ["aktif", "selesai", "menunggu_bayar"])
        .maybeSingle();

      if (!existingReg) {
        await admin.from("pendaftaran").insert({
          kursus_id: claim.kursus_id,
          peserta_id: claim.pengguna_id,
          status: "aktif",
          nominal: 0,
          metode_bayar: "gratis",
          didaftarkan_pada: now,
          dibayar_pada: now,
          dikonfirmasi_oleh: adminNama,
        });

        // Audit Log
        await admin.from("audit_log").insert({
          pengguna_id: claim.pengguna_id,
          tabel: "pendaftaran",
          aksi: "klaim_poin_disetujui_aktif",
          data_sesudah: {
            kursus_id: claim.kursus_id,
            peserta_id: claim.pengguna_id,
            status: "aktif",
            poin_digunakan: claim.poin_digunakan,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Klaim poin berhasil diubah menjadi '${decision}'.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
