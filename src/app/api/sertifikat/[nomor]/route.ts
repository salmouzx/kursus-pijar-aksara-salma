import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ nomor: string }> }
) {
  try {
    const resolvedParams = await params;
    const nomor = decodeURIComponent(resolvedParams.nomor);

    if (!nomor) {
      return NextResponse.json({ error: "Nomor sertifikat wajib diisi" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Query sertifikat dengan join pendaftaran, kursus, dan profil instruktur
    let query = admin
      .from("sertifikat")
      .select(`
        id,
        nomor_sertifikat,
        nama_peserta,
        judul_kursus,
        diterbitkan_pada,
        tahun,
        pendaftaran_id,
        pendaftaran:pendaftaran_id (
          id,
          peserta_id,
          kursus:kursus_id (
            id,
            judul,
            slug,
            kategori,
            instruktur:instruktur_id (
              id,
              nama_lengkap
            )
          )
        )
      `);

    if (nomor.startsWith("PA-")) {
      query = query.eq("nomor_sertifikat", nomor);
    } else {
      // Dukung pencarian via nomor_sertifikat, pendaftaran_id, atau id sertifikat
      query = query.or(`nomor_sertifikat.eq.${nomor},pendaftaran_id.eq.${nomor},id.eq.${nomor}`);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Database error fetching certificate:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      // Coba cari langsung berdasarkan ID pendaftaran
      const { data: pendaftaranData } = await admin
        .from("pendaftaran")
        .select(`
          id,
          status,
          peserta:peserta_id (nama_lengkap),
          kursus:kursus_id (
            judul,
            slug,
            kategori,
            instruktur:instruktur_id (nama_lengkap)
          ),
          sertifikat (
            id,
            nomor_sertifikat,
            nama_peserta,
            judul_kursus,
            diterbitkan_pada,
            tahun
          )
        `)
        .eq("id", nomor)
        .maybeSingle();

      if (pendaftaranData) {
        const cert = Array.isArray(pendaftaranData.sertifikat)
          ? pendaftaranData.sertifikat[0]
          : pendaftaranData.sertifikat;

        if (cert) {
          return NextResponse.json({
            success: true,
            data: {
              ...cert,
              pendaftaran: {
                id: pendaftaranData.id,
                kursus: pendaftaranData.kursus,
              },
            },
          });
        }

        // Jika pendaftaran valid tapi record sertifikat belum dibuat, buat fallback dinamis sesuai peserta & kursusnya
        return NextResponse.json({
          success: true,
          data: {
            id: pendaftaranData.id,
            nomor_sertifikat: `PA-2026-${pendaftaranData.id.slice(0, 4).toUpperCase()}`,
            nama_peserta: (pendaftaranData.peserta as any)?.nama_lengkap || "Peserta Pijar Aksara",
            judul_kursus: (pendaftaranData.kursus as any)?.judul || "Kursus",
            diterbitkan_pada: new Date().toISOString(),
            tahun: 2026,
            pendaftaran: {
              id: pendaftaranData.id,
              kursus: pendaftaranData.kursus,
            },
          },
        });
      }

      return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("API Error in /api/sertifikat/[nomor]:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
