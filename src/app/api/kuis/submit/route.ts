import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStudyTopicUniversal } from "../review/route";
import { sendServerEmail } from "@/lib/server-email";

export async function POST(request: Request) {
  try {
    const { pendaftaranId, modulId, jawaban } = await request.json();

    if (!pendaftaranId || !modulId || !jawaban) {
      return NextResponse.json(
        { error: "Parameter pendaftaranId, modulId, dan jawaban wajib diisi." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Ambil pendaftaran dan info kursus
    const { data: pendaftaran, error: pError } = await admin
      .from("pendaftaran")
      .select(`
        id,
        status,
        peserta_id,
        kursus:kursus_id (
          id,
          judul,
          nilai_lulus,
          modul (id, urutan)
        ),
        peserta:peserta_id (
          nama_lengkap
        )
      `)
      .eq("id", pendaftaranId)
      .single();

    if (pError || !pendaftaran) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan." }, { status: 404 });
    }

    // Hanya pendaftaran aktif atau selesai yang boleh mengerjakan
    if (pendaftaran.status !== "aktif" && pendaftaran.status !== "selesai") {
      return NextResponse.json(
        { error: "Pendaftaran belum aktif atau sudah kedaluwarsa/dibatalkan." },
        { status: 403 }
      );
    }

    // 2. Cek riwayat percobaan kuis sebelumnya (Maksimal 3 percobaan pengerjaan)
    const { data: previousAttempts, error: attemptError } = await admin
      .from("percobaan_kuis")
      .select("nomor_percobaan, lulus")
      .eq("pendaftaran_id", pendaftaranId)
      .eq("modul_id", modulId)
      .order("nomor_percobaan", { ascending: false });

    if (attemptError) {
      return NextResponse.json({ error: "Gagal membaca riwayat kuis." }, { status: 500 });
    }

    const alreadyPassed = (previousAttempts || []).some((a) => a.lulus === true);
    const currentAttemptCount = previousAttempts ? previousAttempts.length : 0;
    if (currentAttemptCount >= 3) {
      return NextResponse.json(
        { error: "Batas maksimal 3 percobaan kuis telah tercapai. Anda tidak dapat mencoba lagi." },
        { status: 400 }
      );
    }

    const nextAttemptNumber = currentAttemptCount + 1;

    // 3. Ambil soal asli dari database (termasuk kunci_jawaban rahasia - BR-09)
    const { data: soalList, error: soalError } = await admin
      .from("soal")
      .select("id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban")
      .eq("modul_id", modulId)
      .order("urutan", { ascending: true });

    let activeSoalList: any[] = (soalList || []);

    if (activeSoalList.length === 0) {
      // Fallback ke dataset ALL_COURSES
      const { ALL_COURSES } = await import("@/data/courses");
      for (const c of ALL_COURSES) {
        const m = c.modul.find((mod) => mod.id === modulId || String(mod.urutan) === String(modulId));
        if (m?.soal && m.soal.length > 0) {
          activeSoalList = m.soal;
          break;
        }
      }
    }

    if (activeSoalList.length === 0) {
      return NextResponse.json({ error: "Soal kuis tidak ditemukan." }, { status: 404 });
    }

    // 4. Hitung skor di server & susun feedback edukatif
    let benarCount = 0;
    const totalSoal = activeSoalList.length;

    const feedback = activeSoalList.map((soal: any) => {
      const userChoice = (jawaban[soal.id] || "").trim().toUpperCase();
      const isCorrect = userChoice === soal.kunci_jawaban;
      if (isCorrect) benarCount++;

      const keyUser = userChoice.toLowerCase();
      const teksUser = userChoice ? soal[`pilihan_${keyUser}`] || userChoice : "Belum dijawab";
      const currentModulJudul = (pendaftaran.kursus as any)?.modul?.find((m: any) => m.id === modulId)?.judul;
      const topic = getStudyTopicUniversal(soal.pertanyaan, soal.urutan, currentModulJudul);

      return {
        id: soal.id,
        urutan: soal.urutan,
        pertanyaan: soal.pertanyaan,
        pilihan_a: soal.pilihan_a,
        pilihan_b: soal.pilihan_b,
        pilihan_c: soal.pilihan_c,
        pilihan_d: soal.pilihan_d,
        jawaban_user: userChoice,
        teks_user: teksUser,
        benar: isCorrect,
        hint: isCorrect
          ? `Jawaban Anda tepat! Pemahaman materi pada bab "${topic}" sudah sangat baik.`
          : `💡 Coba pelajari bab "${topic}" pada materi modul di atas untuk memahami konsep yang tepat.`,
      };
    });

    const nilaiLulus = (pendaftaran.kursus as any)?.nilai_lulus ?? 60;
    const nilai = Math.floor((benarCount / totalSoal) * 100);
    const isLulus = nilai >= nilaiLulus || alreadyPassed;

    // 5. Simpan catatan percobaan kuis
    const { error: insertAttemptError } = await admin
      .from("percobaan_kuis")
      .insert({
        pendaftaran_id: pendaftaranId,
        modul_id: modulId,
        nomor_percobaan: nextAttemptNumber,
        jawaban: jawaban,
        jumlah_soal: totalSoal,
        jumlah_benar: benarCount,
        nilai: nilai,
        lulus: isLulus,
        dikerjakan_pada: new Date().toISOString(),
      });

    if (insertAttemptError) {
      console.error("Error inserting attempt:", insertAttemptError);
      return NextResponse.json({ error: "Gagal menyimpan hasil kuis." }, { status: 500 });
    }

    let certificateIssued = false;
    let certNumber = null;

    // 6. Jika Lulus, update progres_modul dan cek apakah seluruh modul kursus sudah tuntas
    if (isLulus) {
      await admin
        .from("progres_modul")
        .upsert(
          {
            pendaftaran_id: pendaftaranId,
            modul_id: modulId,
            lulus_pada: new Date().toISOString(),
          },
          { onConflict: "pendaftaran_id, modul_id" }
        );

      // Cek apakah seluruh modul pada kursus ini sudah lulus
      const allModules = (pendaftaran.kursus as any)?.modul || [];
      const { data: allPassedProgress } = await admin
        .from("progres_modul")
        .select("modul_id, lulus_pada")
        .eq("pendaftaran_id", pendaftaranId)
        .not("lulus_pada", "is", null);

      const passedModuleIds = new Set((allPassedProgress || []).map((p) => p.modul_id));
      const isAllCoursePassed = allModules.length > 0 && allModules.every((m: any) => passedModuleIds.has(m.id));

      // 7. Jika seluruh modul lulus: update pendaftaran jadi 'selesai' & buat sertifikat otomatis (BR-11)
      if (isAllCoursePassed) {
        await admin
          .from("pendaftaran")
          .update({
            status: "selesai",
            selesai_pada: new Date().toISOString(),
          })
          .eq("id", pendaftaranId);

        // Cek apakah sertifikat sudah ada
        const { data: existingCert } = await admin
          .from("sertifikat")
          .select("nomor_sertifikat")
          .eq("pendaftaran_id", pendaftaranId)
          .maybeSingle();

        if (existingCert) {
          certNumber = existingCert.nomor_sertifikat;
        } else {
          // Buat nomor sertifikat berurutan PA-TAHUN-NOMOR (BR-11)
          const currentYear = new Date().getFullYear();
          const { data: maxCert } = await admin
            .from("sertifikat")
            .select("nomor_urut")
            .eq("tahun", currentYear)
            .order("nomor_urut", { ascending: false })
            .limit(1)
            .maybeSingle();

          const nextUrut = (maxCert?.nomor_urut || 0) + 1;
          const formattedNumber = `PA-${currentYear}-${String(nextUrut).padStart(4, "0")}`;

          const { error: certError } = await admin.from("sertifikat").insert({
            pendaftaran_id: pendaftaranId,
            tahun: currentYear,
            nomor_urut: nextUrut,
            nomor_sertifikat: formattedNumber,
            nama_peserta: (pendaftaran.peserta as any)?.nama_lengkap || "Peserta Pijar Aksara",
            judul_kursus: (pendaftaran.kursus as any)?.judul || "Kursus",
            diterbitkan_pada: new Date().toISOString(),
          });

          if (!certError) {
            certificateIssued = true;
            certNumber = formattedNumber;

            // Trigger notifikasi email sertifikat terbit (PRD Bab 11.2)
            try {
              const { data: pProfile } = await admin
                .from("profiles")
                .select("email")
                .eq("id", pendaftaran.peserta_id)
                .maybeSingle();

              if (pProfile?.email) {
                await sendServerEmail({
                  toEmail: pProfile.email,
                  recipientName: (pendaftaran.peserta as any)?.nama_lengkap || "Peserta Pijar Aksara",
                  type: "sertifikat_terbit",
                  courseTitle: (pendaftaran.kursus as any)?.judul || "Kursus",
                  extraData: { nomorSertifikat: formattedNumber },
                });
              }
            } catch (e) {
              console.warn("Gagal mengirim notifikasi sertifikat:", e);
            }
          }
        }
      }
    }

    // Ambil riwayat seluruh percobaan modul ini untuk pendaftaran ini
    const { data: allUpdatedAttempts } = await admin
      .from("percobaan_kuis")
      .select("nomor_percobaan, nilai, jumlah_benar, jumlah_soal, lulus, dikerjakan_pada")
      .eq("pendaftaran_id", pendaftaranId)
      .eq("modul_id", modulId)
      .order("nomor_percobaan", { ascending: true });

    const firstAttempt = (allUpdatedAttempts || []).find((a) => a.nomor_percobaan === 1);
    const skorPertama = firstAttempt ? firstAttempt.nilai : nilai;

    return NextResponse.json({
      success: true,
      nomor_percobaan: nextAttemptNumber,
      sisa_percobaan: Math.max(0, 3 - nextAttemptNumber),
      nilai: nilai,
      nilai_lulus: nilaiLulus,
      jumlah_benar: benarCount,
      jumlah_soal: totalSoal,
      lulus: isLulus,
      feedback: feedback,
      skor_pertama: skorPertama,
      attempts: allUpdatedAttempts || [],
      certificate_issued: certificateIssued,
      nomor_sertifikat: certNumber,
    });
  } catch (err: any) {
    console.error("Unexpected error in quiz submit:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
