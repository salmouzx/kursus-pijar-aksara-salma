import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("pendaftaran")
      .select(`
        id,
        status,
        nominal,
        metode_bayar,
        batas_bayar,
        didaftarkan_pada,
        dibayar_pada,
        selesai_pada,
        mayar_invoice_id,
        peserta:peserta_id (
          id,
          nama_lengkap,
          email,
          no_hp
        ),
        kursus:kursus_id (
          id,
          judul,
          slug,
          kategori,
          harga,
          kuota,
          nilai_lulus,
          modul (
            id,
            urutan,
            judul,
            durasi_menit
          )
        ),
        progres_modul (
          modul_id,
          lulus_pada
        ),
        sertifikat (
          nomor_sertifikat,
          diterbitkan_pada
        )
      `)
      .order("didaftarkan_pada", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((item: any) => ({
      ...item,
      sertifikat: Array.isArray(item.sertifikat) ? item.sertifikat[0] || null : item.sertifikat,
    }));

    return NextResponse.json({
      success: true,
      enrollments: formatted,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
