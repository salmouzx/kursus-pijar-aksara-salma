import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * PATCH /api/admin/kursus
 * Endpoint khusus Admin untuk memperbarui harga kursus, kuota, atau status publikasi.
 * Menggunakan server-side admin client dan otomatis mencatat ke audit_log.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { courseId, harga, kuota, status, catatan_tinjauan, adminNama } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Parameter courseId wajib diisi." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Ambil data kursus saat ini untuk audit log
    const { data: currentCourse, error: fetchErr } = await admin
      .from("kursus")
      .select("id, judul, slug, harga, kuota, status")
      .eq("id", courseId)
      .single();

    if (fetchErr || !currentCourse) {
      return NextResponse.json(
        { error: "Kursus tidak ditemukan dalam sistem database." },
        { status: 404 }
      );
    }

    // 2. Siapkan data pembaruan
    const updatePayload: Record<string, any> = {
      diubah_pada: new Date().toISOString(),
    };

    const auditChanges: Record<string, any> = {};

    if (harga !== undefined) {
      const parsedHarga = Number(harga);
      if (isNaN(parsedHarga) || parsedHarga < 0) {
        return NextResponse.json(
          { error: "Harga harus berupa angka valid dan tidak boleh bernilai negatif." },
          { status: 400 }
        );
      }
      updatePayload.harga = parsedHarga;
      auditChanges.harga_lama = currentCourse.harga;
      auditChanges.harga_baru = parsedHarga;
    }

    if (kuota !== undefined) {
      const parsedKuota = Number(kuota);
      if (isNaN(parsedKuota) || parsedKuota < 1) {
        return NextResponse.json(
          { error: "Kuota minimal adalah 1 peserta." },
          { status: 400 }
        );
      }
      updatePayload.kuota = parsedKuota;
      auditChanges.kuota_lama = currentCourse.kuota;
      auditChanges.kuota_baru = parsedKuota;
    }

    if (status !== undefined) {
      updatePayload.status = status;
      if (status === "terbit") {
        updatePayload.diterbitkan_pada = new Date().toISOString();
        updatePayload.catatan_tinjauan = null;
      }
      if (status === "draf" && catatan_tinjauan) {
        updatePayload.catatan_tinjauan = catatan_tinjauan;
      }
      auditChanges.status_lama = currentCourse.status;
      auditChanges.status_baru = status;
    }

    // 3. Update data kursus
    const { data: updatedCourse, error: updateErr } = await admin
      .from("kursus")
      .update(updatePayload)
      .eq("id", courseId)
      .select()
      .single();

    if (updateErr) {
      console.error("Gagal memperbarui kursus:", updateErr);
      return NextResponse.json(
        { error: "Gagal memperbarui data kursus: " + updateErr.message },
        { status: 500 }
      );
    }

    // 4. Catat aktivitas di audit_log
    const aksiNama = harga !== undefined && kuota === undefined && status === undefined
      ? "ADMIN_UBAH_HARGA_KURSUS"
      : "ADMIN_UPDATE_KURSUS";

    try {
      await admin.from("audit_log").insert({
        aksi: aksiNama,
        nama_tabel: "kursus",
        id_data: courseId,
        data_sebelum: currentCourse,
        data_sesudah: updatePayload,
      });
    } catch (auditErr) {
      console.warn("Gagal mencatat audit log:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Data kursus berhasil diperbarui oleh Administrator.",
      kursus: updatedCourse,
      perubahan: auditChanges,
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/kursus:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server: " + error.message },
      { status: 500 }
    );
  }
}
