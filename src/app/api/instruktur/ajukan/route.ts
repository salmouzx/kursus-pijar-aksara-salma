import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { kursusId, instrukturId } = await request.json();

    if (!kursusId || !instrukturId) {
      return NextResponse.json(
        { error: "kursusId dan instrukturId wajib disertakan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: kursus, error: fetchErr } = await admin
      .from("kursus")
      .select(`
        id,
        judul,
        status,
        harga,
        kuota,
        nilai_lulus,
        instruktur_id,
        modul (
          id,
          urutan,
          judul,
          soal (
            id,
            urutan
          )
        )
      `)
      .eq("id", kursusId)
      .single();

    if (fetchErr || !kursus) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    if (kursus.instruktur_id !== instrukturId) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya instruktur pemilik yang boleh mengajukan kursus untuk ditinjau." },
        { status: 403 }
      );
    }

    if (kursus.status !== "draf") {
      return NextResponse.json(
        { error: `Hanya kursus berstatus 'draf' yang bisa diajukan. Status saat ini: '${kursus.status}'.` },
        { status: 400 }
      );
    }

    const modulList = (kursus.modul || []).sort((a: any, b: any) => a.urutan - b.urutan);

    // ========================================================
    // VALIDASI ATURAN BISNIS BR-03
    // ========================================================

    // 1. Jumlah Modul 2 sampai 10
    if (modulList.length < 2 || modulList.length > 10) {
      return NextResponse.json(
        {
          error: `Kursus belum memenuhi syarat (BR-03): Kursus hanya bisa diajukan bila memiliki 2 sampai 10 modul. Saat ini terdapat ${modulList.length} modul.`,
        },
        { status: 400 }
      );
    }

    // 2. Nomor Urut Modul 1, 2, 3... tanpa lompatan
    for (let i = 0; i < modulList.length; i++) {
      const expectedUrutan = i + 1;
      if (modulList[i].urutan !== expectedUrutan) {
        return NextResponse.json(
          {
            error: `Nomor urut modul harus berurutan 1, 2, 3 tanpa lompatan (BR-03). Ditemukan modul "${modulList[i].judul}" bernomor ${modulList[i].urutan}, seharusnya ${expectedUrutan}.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Setiap Modul memiliki 3 sampai 20 soal (TC-06)
    for (const m of modulList) {
      const soalCount = Array.isArray(m.soal) ? m.soal.length : 0;
      if (soalCount < 3 || soalCount > 20) {
        return NextResponse.json(
          {
            error: `Kursus belum memenuhi syarat. Setiap modul wajib memiliki 3 sampai 20 soal (TC-06 / BR-03). Modul ${m.urutan} ("${m.judul}") saat ini hanya memiliki ${soalCount} soal.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Harga Rp0 (gratis) atau Rp50.000 sampai Rp5.000.000
    if (kursus.harga !== 0 && (kursus.harga < 50000 || kursus.harga > 5000000)) {
      return NextResponse.json(
        { error: "Harga kursus harus Rp0 (gratis) atau Rp50.000 sampai Rp5.000.000 (BR-03)." },
        { status: 400 }
      );
    }

    // 5. Kuota 1 sampai 100
    if (kursus.kuota < 1 || kursus.kuota > 100) {
      return NextResponse.json(
        { error: "Kuota kursus harus antara 1 sampai 100 peserta (BR-03)." },
        { status: 400 }
      );
    }

    // 6. Nilai Lulus 50 sampai 100
    if (kursus.nilai_lulus < 50 || kursus.nilai_lulus > 100) {
      return NextResponse.json(
        { error: "Nilai lulus kuis harus antara 50 sampai 100 (BR-03)." },
        { status: 400 }
      );
    }

    // ========================================================
    // UPDATE STATUS KURSUS: draf -> ditinjau (BR-02)
    // ========================================================
    const now = new Date().toISOString();
    const { error: updateErr } = await admin
      .from("kursus")
      .update({
        status: "ditinjau",
        diajukan_pada: now,
        diubah_pada: now,
      })
      .eq("id", kursusId);

    if (updateErr) {
      console.error("Error submitting course to review:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await admin.from("audit_log").insert({
      pelaku_id: instrukturId,
      aksi: "AJUKAN_KURSUS_TINJAUAN",
      nama_tabel: "kursus",
      id_data: kursusId,
      data_sebelum: { status: "draf" },
      data_sesudah: { status: "ditinjau", diajukan_pada: now },
    });

    return NextResponse.json({
      success: true,
      message: `Kursus "${kursus.judul}" berhasil diajukan untuk ditinjau oleh Admin (BR-02). Isi kursus kini terkunci (BR-04).`,
    });
  } catch (err: any) {
    console.error("Unexpected error in ajukan kursus:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server saat mengajukan kursus." },
      { status: 500 }
    );
  }
}
