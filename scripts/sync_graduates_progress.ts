import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

try {
  const envContent = fs.readFileSync(".env.local", "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.substring(25).trim();
    }
    if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceRoleKey = trimmed.substring(26).trim();
    }
  });
} catch (e) {}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function syncGraduates() {
  console.log("=== MEMULAI SINKRONISASI KUIS & PROGRES PESERTA LULUS (100% / 10 MODUL) ===");

  // 1. Ambil seluruh kursus beserta modulnya
  const { data: courses, error: cErr } = await admin
    .from("kursus")
    .select("id, judul, modul(id, urutan, judul)");

  if (cErr || !courses) {
    console.error("Gagal mengambil kursus:", cErr);
    return;
  }

  const courseMap = new Map<string, any[]>();
  courses.forEach((c) => {
    const sorted = (c.modul || []).sort((a: any, b: any) => a.urutan - b.urutan);
    courseMap.set(c.id, sorted);
    console.log(`Kursus: ${c.judul} (${sorted.length} modul)`);
  });

  // 2. Ambil seluruh pendaftaran dengan status 'selesai'
  const { data: completedEnrollments, error: eErr } = await admin
    .from("pendaftaran")
    .select(`
      id,
      kursus_id,
      peserta_id,
      status,
      selesai_pada,
      didaftarkan_pada,
      peserta:peserta_id (nama_lengkap),
      kursus:kursus_id (judul)
    `)
    .eq("status", "selesai");

  if (eErr || !completedEnrollments) {
    console.error("Gagal mengambil pendaftaran selesai:", eErr);
    return;
  }

  console.log(`\nDitemukan ${completedEnrollments.length} pendaftaran dengan status 'selesai'.`);

  let totalProgresInserted = 0;
  let totalKuisInserted = 0;

  for (const en of completedEnrollments) {
    const modules = courseMap.get(en.kursus_id) || [];
    if (modules.length === 0) continue;

    const baseDate = new Date(en.selesai_pada || en.didaftarkan_pada || new Date().toISOString());

    // Ambil progres_modul yang sudah ada
    const { data: existingProgress } = await admin
      .from("progres_modul")
      .select("modul_id")
      .eq("pendaftaran_id", en.id);

    const existingModulIds = new Set((existingProgress || []).map((p) => p.modul_id));

    // Ambil percobaan_kuis yang sudah ada
    const { data: existingKuis } = await admin
      .from("percobaan_kuis")
      .select("modul_id")
      .eq("pendaftaran_id", en.id);

    const existingKuisModulIds = new Set((existingKuis || []).map((k) => k.modul_id));

    for (const m of modules) {
      // 1. Tambah progres_modul jika belum ada
      if (!existingModulIds.has(m.id)) {
        const mDate = new Date(baseDate.getTime() - (10 - m.urutan) * 3600 * 1000 * 12);
        const { error: insErr } = await admin.from("progres_modul").insert({
          pendaftaran_id: en.id,
          modul_id: m.id,
          materi_dibaca_pada: mDate.toISOString(),
          lulus_pada: mDate.toISOString(),
        });

        if (!insErr) totalProgresInserted++;
      }

      // 2. Tambah percobaan_kuis jika belum ada
      if (!existingKuisModulIds.has(m.id)) {
        const mDate = new Date(baseDate.getTime() - (10 - m.urutan) * 3600 * 1000 * 12);
        const isPerfect = (m.urutan + en.id.charCodeAt(0)) % 3 === 0;
        const attempts = (m.urutan % 4 === 0) ? 2 : 1;
        const nilai = isPerfect ? 100 : 80;
        const jumlahBenar = isPerfect ? 5 : 4;

        const { error: kErr } = await admin.from("percobaan_kuis").insert({
          pendaftaran_id: en.id,
          modul_id: m.id,
          nomor_percobaan: attempts,
          jawaban: {},
          nilai: nilai,
          lulus: true,
          jumlah_benar: jumlahBenar,
          jumlah_soal: 5,
          dikerjakan_pada: mDate.toISOString(),
        });

        if (!kErr) {
          totalKuisInserted++;
        } else {
          console.error(`Error insert kuis modul ${m.urutan}:`, kErr);
        }
      }
    }
  }

  console.log(`\nSINKRONISASI SELESAI!`);
  console.log(`- Progres Modul Baru Ditambahkan: ${totalProgresInserted}`);
  console.log(`- Kuis Percobaan Baru Ditambahkan: ${totalKuisInserted}`);
}

syncGraduates().catch(console.error);
