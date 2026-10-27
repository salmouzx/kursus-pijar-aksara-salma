import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET: Ambil daftar kursus milik instruktur
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instrukturId = searchParams.get("instrukturId");

    if (!instrukturId) {
      return NextResponse.json(
        { error: "Parameter instrukturId wajib disertakan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: courses, error } = await admin
      .from("kursus")
      .select(`
        id,
        instruktur_id,
        judul,
        slug,
        kategori,
        ringkasan,
        deskripsi,
        harga,
        kuota,
        nilai_lulus,
        status,
        catatan_tinjauan,
        diajukan_pada,
        diterbitkan_pada,
        dibuat_pada,
        diubah_pada,
        modul (
          id,
          urutan,
          judul,
          durasi_menit,
          isi_materi,
          video_url,
          lampiran_path,
          soal (
            id,
            urutan,
            pertanyaan,
            pilihan_a,
            pilihan_b,
            pilihan_c,
            pilihan_d,
            kunci_jawaban
          )
        )
      `)
      .eq("instruktur_id", instrukturId)
      .order("dibuat_pada", { ascending: false });

    if (error) {
      console.error("Error fetching instructor courses:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, courses: courses || [] });
  } catch (err: any) {
    console.error("Unexpected error in GET instructor courses:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// POST: Buat kursus baru oleh instruktur (status selalu 'draf' - BR-02)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      instrukturId,
      judul,
      kategori,
      ringkasan,
      deskripsi,
      harga = 0,
      kuota = 20,
      nilaiLulus = 70,
    } = body;

    if (!instrukturId || !judul || !kategori || !ringkasan || !deskripsi) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi (instrukturId, judul, kategori, ringkasan, deskripsi)." },
        { status: 400 }
      );
    }

    // Validasi BR-03
    const numericHarga = Number(harga);
    if (numericHarga !== 0 && (numericHarga < 50000 || numericHarga > 5000000)) {
      return NextResponse.json(
        { error: "Harga kursus harus Rp0 (gratis) atau antara Rp50.000 sampai Rp5.000.000 (BR-03)." },
        { status: 400 }
      );
    }

    const numericKuota = Number(kuota);
    if (numericKuota < 1 || numericKuota > 100) {
      return NextResponse.json(
        { error: "Kuota kursus harus antara 1 sampai 100 peserta (BR-03)." },
        { status: 400 }
      );
    }

    const numericNilaiLulus = Number(nilaiLulus);
    if (numericNilaiLulus < 50 || numericNilaiLulus > 100) {
      return NextResponse.json(
        { error: "Nilai lulus kuis harus antara 50 sampai 100 (BR-03)." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Buat slug unik
    const baseSlug = generateSlug(judul);
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await admin
        .from("kursus")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (!existing) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();

    const { data: newCourse, error: insertError } = await admin
      .from("kursus")
      .insert({
        instruktur_id: instrukturId,
        judul: judul.trim(),
        slug: finalSlug,
        kategori: kategori.trim(),
        ringkasan: ringkasan.trim(),
        deskripsi: deskripsi.trim(),
        harga: numericHarga,
        kuota: numericKuota,
        nilai_lulus: numericNilaiLulus,
        status: "draf", // BR-02: Kursus baru selalu draf
        dibuat_pada: now,
        diubah_pada: now,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating course:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Catat Audit Log (BR-12)
    await admin.from("audit_log").insert({
      pelaku_id: instrukturId,
      aksi: "BUAT_KURSUS_DRAF",
      nama_tabel: "kursus",
      id_data: newCourse.id,
      data_sebelum: null,
      data_sesudah: { judul: newCourse.judul, slug: newCourse.slug, status: "draf" },
    });

    return NextResponse.json({
      success: true,
      message: "Draf kursus baru berhasil dibuat.",
      course: newCourse,
    });
  } catch (err: any) {
    console.error("Unexpected error in POST course:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// PUT: Perbarui kursus (BR-04: Hanya boleh diubah saat status 'draf')
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      kursusId,
      instrukturId,
      judul,
      kategori,
      ringkasan,
      deskripsi,
      harga,
      kuota,
      nilaiLulus,
    } = body;

    if (!kursusId || !instrukturId) {
      return NextResponse.json(
        { error: "kursusId dan instrukturId wajib disertakan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: existingCourse, error: fetchErr } = await admin
      .from("kursus")
      .select("*")
      .eq("id", kursusId)
      .single();

    if (fetchErr || !existingCourse) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    if (existingCourse.instruktur_id !== instrukturId) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda hanya dapat mengubah kursus milik Anda sendiri." },
        { status: 403 }
      );
    }

    // BR-04: Terkunci jika bukan draf
    if (existingCourse.status !== "draf") {
      return NextResponse.json(
        { error: "Isi kursus terkunci dan hanya bisa diubah saat berstatus draf (BR-04)." },
        { status: 400 }
      );
    }

    const updates: any = { diubah_pada: new Date().toISOString() };
    if (judul) updates.judul = judul.trim();
    if (kategori) updates.kategori = kategori.trim();
    if (ringkasan) updates.ringkasan = ringkasan.trim();
    if (deskripsi) updates.deskripsi = deskripsi.trim();

    if (harga !== undefined) {
      const numericHarga = Number(harga);
      if (numericHarga !== 0 && (numericHarga < 50000 || numericHarga > 5000000)) {
        return NextResponse.json(
          { error: "Harga kursus harus Rp0 atau antara Rp50.000 sampai Rp5.000.000 (BR-03)." },
          { status: 400 }
        );
      }
      updates.harga = numericHarga;
    }

    if (kuota !== undefined) {
      const numericKuota = Number(kuota);
      if (numericKuota < 1 || numericKuota > 100) {
        return NextResponse.json(
          { error: "Kuota harus antara 1 sampai 100 peserta (BR-03)." },
          { status: 400 }
        );
      }
      updates.kuota = numericKuota;
    }

    if (nilaiLulus !== undefined) {
      const numericNilaiLulus = Number(nilaiLulus);
      if (numericNilaiLulus < 50 || numericNilaiLulus > 100) {
        return NextResponse.json(
          { error: "Nilai lulus harus antara 50 sampai 100 (BR-03)." },
          { status: 400 }
        );
      }
      updates.nilai_lulus = numericNilaiLulus;
    }

    const { data: updatedCourse, error: updateError } = await admin
      .from("kursus")
      .update(updates)
      .eq("id", kursusId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating course:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await admin.from("audit_log").insert({
      pelaku_id: instrukturId,
      aksi: "UPDATE_KURSUS_DRAF",
      nama_tabel: "kursus",
      id_data: kursusId,
      data_sebelum: existingCourse,
      data_sesudah: updatedCourse,
    });

    return NextResponse.json({
      success: true,
      message: "Data kursus berhasil diperbarui.",
      course: updatedCourse,
    });
  } catch (err: any) {
    console.error("Unexpected error in PUT course:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// DELETE: Hapus kursus draf
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kursusId = searchParams.get("kursusId");
    const instrukturId = searchParams.get("instrukturId");

    if (!kursusId || !instrukturId) {
      return NextResponse.json(
        { error: "Parameter kursusId dan instrukturId wajib disertakan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: existingCourse, error: fetchErr } = await admin
      .from("kursus")
      .select("id, status, instruktur_id, judul")
      .eq("id", kursusId)
      .single();

    if (fetchErr || !existingCourse) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    if (existingCourse.instruktur_id !== instrukturId) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda bukan pemilik kursus ini." },
        { status: 403 }
      );
    }

    if (existingCourse.status !== "draf") {
      return NextResponse.json(
        { error: "Hanya kursus berstatus draf yang dapat dihapus." },
        { status: 400 }
      );
    }

    const { error: deleteErr } = await admin.from("kursus").delete().eq("id", kursusId);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    await admin.from("audit_log").insert({
      pelaku_id: instrukturId,
      aksi: "HAPUS_KURSUS_DRAF",
      nama_tabel: "kursus",
      id_data: kursusId,
      data_sebelum: existingCourse,
      data_sesudah: null,
    });

    return NextResponse.json({
      success: true,
      message: `Kursus "${existingCourse.judul}" berhasil dihapus.`,
    });
  } catch (err: any) {
    console.error("Unexpected error in DELETE course:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
