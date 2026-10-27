import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instrukturId = searchParams.get("instrukturId");
    const kursusId = searchParams.get("kursusId");

    if (!instrukturId) {
      return NextResponse.json(
        { error: "Parameter instrukturId wajib disertakan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Ambil daftar kursus milik instruktur ini (BR-12: Isolasi Data Instruktur)
    const { data: myCourses, error: courseErr } = await admin
      .from("kursus")
      .select(`
        id,
        judul,
        slug,
        kuota,
        modul (
          id,
          urutan,
          judul
        )
      `)
      .eq("instruktur_id", instrukturId);

    if (courseErr) {
      return NextResponse.json({ error: courseErr.message }, { status: 500 });
    }

    if (!myCourses || myCourses.length === 0) {
      return NextResponse.json({
        success: true,
        courses: [],
        enrollments: [],
      });
    }

    const myCourseIds = myCourses.map((c) => c.id);

    let targetCourseIds = myCourseIds;
    if (kursusId && kursusId !== "all") {
      if (!myCourseIds.includes(kursusId)) {
        return NextResponse.json(
          { error: "Akses ditolak: Anda tidak memiliki akses ke kursus ini (BR-12)." },
          { status: 403 }
        );
      }
      targetCourseIds = [kursusId];
    }

    // 2. Ambil pendaftaran peserta untuk kursus yang diampu
    const { data: enrollments, error: enrollErr } = await admin
      .from("pendaftaran")
      .select(`
        id,
        status,
        nominal,
        metode_bayar,
        didaftarkan_pada,
        dibayar_pada,
        selesai_pada,
        kursus_id,
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
          kuota
        ),
        progres_modul (
          modul_id,
          materi_dibaca_pada,
          lulus_pada
        ),
        percobaan_kuis (
          id,
          modul_id,
          nomor_percobaan,
          nilai,
          lulus,
          jumlah_benar,
          jumlah_soal,
          dikerjakan_pada
        ),
        sertifikat (
          nomor_sertifikat,
          diterbitkan_pada
        )
      `)
      .in("kursus_id", targetCourseIds)
      .order("didaftarkan_pada", { ascending: false });

    if (enrollErr) {
      return NextResponse.json({ error: enrollErr.message }, { status: 500 });
    }

    // 3. Format data peserta dengan statistik progres per modul
    const formattedEnrollments = (enrollments || []).map((item: any) => {
      const courseInfo = myCourses.find((c) => c.id === item.kursus_id);
      const totalModules = courseInfo?.modul?.length || 1;
      
      // Jika status pendaftaran 'selesai', peserta telah 100% menyelesaikan dan lulus seluruh modul
      let passedModules = (item.progres_modul || []).filter((p: any) => p.lulus_pada !== null).length;
      if (item.status === "selesai") {
        passedModules = Math.max(passedModules, totalModules);
      }
      const progressPercent = Math.min(100, Math.round((passedModules / totalModules) * 100));

      const modulUrutanMap = new Map<string, number>();
      (courseInfo?.modul || []).forEach((m: any) => {
        modulUrutanMap.set(m.id, m.urutan);
      });

      const modulScores: Record<string, { bestScore: number; attempts: number; passed: boolean; urutan: number }> = {};
      (item.percobaan_kuis || []).forEach((att: any) => {
        const urutan = modulUrutanMap.get(att.modul_id) || 1;
        if (!modulScores[att.modul_id]) {
          modulScores[att.modul_id] = { bestScore: att.nilai, attempts: 1, passed: att.lulus, urutan };
        } else {
          modulScores[att.modul_id].attempts += 1;
          if (att.nilai > modulScores[att.modul_id].bestScore) {
            modulScores[att.modul_id].bestScore = att.nilai;
          }
          if (att.lulus) {
            modulScores[att.modul_id].passed = true;
          }
        }
      });

      // Urutkan modul berdasarkan nomor modul (Modul 1 s/d Modul 10)
      const sortedModulScores: Record<string, { bestScore: number; attempts: number; passed: boolean; urutan: number }> = {};
      Object.entries(modulScores)
        .sort(([, a], [, b]) => a.urutan - b.urutan)
        .forEach(([k, v]) => {
          sortedModulScores[k] = v;
        });

      return {
        id: item.id,
        status: item.status,
        didaftarkan_pada: item.didaftarkan_pada,
        peserta: item.peserta,
        kursus: item.kursus,
        totalModules,
        passedModules,
        progressPercent,
        modulScores: sortedModulScores,
        sertifikat: Array.isArray(item.sertifikat) ? item.sertifikat[0] || null : item.sertifikat,
      };
    });

    return NextResponse.json({
      success: true,
      courses: myCourses,
      enrollments: formattedEnrollments,
    });
  } catch (err: any) {
    console.error("Unexpected error in GET instructor peserta:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
