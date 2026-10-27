import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// POST: Tambah modul baru ke kursus draf (BR-04)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      kursusId,
      instrukturId,
      urutan,
      judul,
      isiMateri,
      videoUrl = null,
      lampiranPath = null,
      durasiMenit = 15,
    } = body;

    if (!kursusId || !instrukturId || !judul || !isiMateri || !urutan) {
      return NextResponse.json(
        { error: "Field kursusId, instrukturId, urutan, judul, dan isiMateri wajib diisi." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: kursus, error: kError } = await admin
      .from("kursus")
      .select("id, status, instruktur_id, judul")
      .eq("id", kursusId)
      .single();

    if (kError || !kursus) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    if (kursus.instruktur_id !== instrukturId) {
      return NextResponse.json({ error: "Akses ditolak: Anda bukan pemilik kursus ini." }, { status: 403 });
    }

    // BR-04: Terkunci jika bukan draf
    if (kursus.status !== "draf") {
      return NextResponse.json(
        { error: "Isi kursus terkunci dan hanya bisa diubah saat berstatus draf (BR-04)." },
        { status: 400 }
      );
    }

    const { data: newModul, error: insertError } = await admin
      .from("modul")
      .insert({
        kursus_id: kursusId,
        urutan: Number(urutan),
        judul: judul.trim(),
        isi_materi: isiMateri.trim(),
        video_url: videoUrl ? videoUrl.trim() : null,
        lampiran_path: lampiranPath ? lampiranPath.trim() : null,
        durasi_menit: Number(durasiMenit) || 15,
        dibuat_pada: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await admin
      .from("kursus")
      .update({ diubah_pada: new Date().toISOString() })
      .eq("id", kursusId);

    await admin.from("audit_log").insert({
      pelaku_id: instrukturId,
      aksi: "TAMBAH_MODUL_DRAF",
      nama_tabel: "modul",
      id_data: newModul.id,
      data_sebelum: null,
      data_sesudah: { kursus: kursus.judul, modul: newModul.judul, urutan: newModul.urutan },
    });

    return NextResponse.json({
      success: true,
      message: `Modul ${newModul.urutan}: "${newModul.judul}" berhasil ditambahkan.`,
      modul: newModul,
    });
  } catch (err: any) {
    console.error("Unexpected error in POST modul:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PUT: Perbarui modul dalam kursus draf (BR-04)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      modulId,
      kursusId,
      instrukturId,
      urutan,
      judul,
      isiMateri,
      videoUrl,
      lampiranPath,
      durasiMenit,
    } = body;

    if (!modulId || !kursusId || !instrukturId) {
      return NextResponse.json(
        { error: "modulId, kursusId, dan instrukturId wajib disertakan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: kursus, error: kError } = await admin
      .from("kursus")
      .select("id, status, instruktur_id, judul")
      .eq("id", kursusId)
      .single();

    if (kError || !kursus) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    if (kursus.instruktur_id !== instrukturId) {
      return NextResponse.json({ error: "Akses ditolak: Anda bukan pemilik kursus ini." }, { status: 403 });
    }

    if (kursus.status !== "draf") {
      return NextResponse.json(
        { error: "Isi kursus terkunci dan hanya bisa diubah saat berstatus draf (BR-04)." },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (urutan !== undefined) updates.urutan = Number(urutan);
    if (judul) updates.judul = judul.trim();
    if (isiMateri) updates.isi_materi = isiMateri.trim();
    if (videoUrl !== undefined) updates.video_url = videoUrl ? videoUrl.trim() : null;
    if (lampiranPath !== undefined) updates.lampiran_path = lampiranPath ? lampiranPath.trim() : null;
    if (durasiMenit !== undefined) updates.durasi_menit = Number(durasiMenit);

    const { data: updatedModul, error: updateError } = await admin
      .from("modul")
      .update(updates)
      .eq("id", modulId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await admin
      .from("kursus")
      .update({ diubah_pada: new Date().toISOString() })
      .eq("id", kursusId);

    return NextResponse.json({
      success: true,
      message: "Modul berhasil diperbarui.",
      modul: updatedModul,
    });
  } catch (err: any) {
    console.error("Unexpected error in PUT modul:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}

// DELETE: Hapus modul dari kursus draf
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modulId = searchParams.get("modulId");
    const kursusId = searchParams.get("kursusId");
    const instrukturId = searchParams.get("instrukturId");

    if (!modulId || !kursusId || !instrukturId) {
      return NextResponse.json(
        { error: "Parameter modulId, kursusId, dan instrukturId wajib disertakan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: kursus } = await admin
      .from("kursus")
      .select("id, status, instruktur_id")
      .eq("id", kursusId)
      .single();

    if (!kursus || kursus.instruktur_id !== instrukturId) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    if (kursus.status !== "draf") {
      return NextResponse.json(
        { error: "Isi kursus terkunci dan hanya bisa diubah saat berstatus draf (BR-04)." },
        { status: 400 }
      );
    }

    const { error: delError } = await admin.from("modul").delete().eq("id", modulId);

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Modul dan soal di dalamnya berhasil dihapus.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
