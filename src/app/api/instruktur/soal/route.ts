import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET: Ambil soal suatu modul untuk editor instruktur
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modulId = searchParams.get("modulId");

    if (!modulId) {
      return NextResponse.json({ error: "modulId wajib disertakan." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: soalList, error } = await admin
      .from("soal")
      .select("id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban")
      .eq("modul_id", modulId)
      .order("urutan", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, soal: soalList || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}

// POST: Tambah butir soal kuis (BR-04: hanya saat kursus draf)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      modulId,
      kursusId,
      instrukturId,
      urutan,
      pertanyaan,
      pilihanA,
      pilihanB,
      pilihanC,
      pilihanD,
      kunciJawaban,
    } = body;

    if (!modulId || !kursusId || !instrukturId || !pertanyaan || !pilihanA || !pilihanB || !pilihanC || !pilihanD || !kunciJawaban) {
      return NextResponse.json(
        { error: "Semua kolom soal wajib diisi termasuk pilihan A-D dan kunci jawaban." },
        { status: 400 }
      );
    }

    const validKeys = ["A", "B", "C", "D"];
    const upperKey = kunciJawaban.trim().toUpperCase();
    if (!validKeys.includes(upperKey)) {
      return NextResponse.json(
        { error: "Kunci jawaban harus berupa salah satu dari A, B, C, atau D." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: kursus, error: kError } = await admin
      .from("kursus")
      .select("id, status, instruktur_id")
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

    let finalUrutan = Number(urutan);
    if (!finalUrutan) {
      const { data: lastSoal } = await admin
        .from("soal")
        .select("urutan")
        .eq("modul_id", modulId)
        .order("urutan", { ascending: false })
        .limit(1)
        .maybeSingle();

      finalUrutan = (lastSoal?.urutan || 0) + 1;
    }

    const { data: newSoal, error: insertError } = await admin
      .from("soal")
      .insert({
        modul_id: modulId,
        urutan: finalUrutan,
        pertanyaan: pertanyaan.trim(),
        pilihan_a: pilihanA.trim(),
        pilihan_b: pilihanB.trim(),
        pilihan_c: pilihanC.trim(),
        pilihan_d: pilihanD.trim(),
        kunci_jawaban: upperKey,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Soal nomor ${newSoal.urutan} berhasil ditambahkan.`,
      soal: newSoal,
    });
  } catch (err: any) {
    console.error("Unexpected error in POST soal:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PUT: Perbarui butir soal kuis (BR-04)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      soalId,
      kursusId,
      instrukturId,
      urutan,
      pertanyaan,
      pilihanA,
      pilihanB,
      pilihanC,
      pilihanD,
      kunciJawaban,
    } = body;

    if (!soalId || !kursusId || !instrukturId) {
      return NextResponse.json(
        { error: "soalId, kursusId, dan instrukturId wajib disertakan." },
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

    const updates: any = {};
    if (urutan !== undefined) updates.urutan = Number(urutan);
    if (pertanyaan) updates.pertanyaan = pertanyaan.trim();
    if (pilihanA) updates.pilihan_a = pilihanA.trim();
    if (pilihanB) updates.pilihan_b = pilihanB.trim();
    if (pilihanC) updates.pilihan_c = pilihanC.trim();
    if (pilihanD) updates.pilihan_d = pilihanD.trim();
    if (kunciJawaban) {
      const upper = kunciJawaban.trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(upper)) {
        return NextResponse.json({ error: "Kunci jawaban harus A, B, C, atau D." }, { status: 400 });
      }
      updates.kunci_jawaban = upper;
    }

    const { data: updatedSoal, error: updateError } = await admin
      .from("soal")
      .update(updates)
      .eq("id", soalId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Soal berhasil diperbarui.",
      soal: updatedSoal,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}

// DELETE: Hapus butir soal
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const soalId = searchParams.get("soalId");
    const kursusId = searchParams.get("kursusId");
    const instrukturId = searchParams.get("instrukturId");

    if (!soalId || !kursusId || !instrukturId) {
      return NextResponse.json({ error: "Parameter tidak lengkap." }, { status: 400 });
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

    const { error: delError } = await admin.from("soal").delete().eq("id", soalId);
    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Soal berhasil dihapus." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
