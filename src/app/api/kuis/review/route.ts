import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Helper penentu bab materi untuk petunjuk belajar mandiri lintas semua kursus
export const getStudyTopicUniversal = (pertanyaan: string, urutan: number, modulJudul?: string): string => {
  const p = (pertanyaan || "").toLowerCase();

  // Excel
  if (p.includes("name box") || p.includes("formula bar")) return "Antarmuka Excel & Fungsi Name Box";
  if (p.includes("shortcut") || p.includes("panah") || p.includes("berpindah")) return "Shortcut Navigasi & Perpindahan Sel Cepat";
  if (p.includes("accounting") || p.includes("currency")) return "Pengaturan Format Angka (Accounting vs Currency)";
  if (p.includes("center across selection") || p.includes("merge")) return "Perataan Sel & Alternatif Center Across Selection";
  if (p.includes("pemisah ribuan") || p.includes("rupiah") || p.includes("regional")) return "Format Regional & Karakter Pemisah Angka";
  if (p.includes("sum") || p.includes("penjumlahan") || p.includes("autosum")) return "Rumus Operasi Matematika & Fungsi SUM";
  if (p.includes("average") || p.includes("rata-rata")) return "Kalkulasi Rata-rata Nilai dengan AVERAGE";
  if (p.includes("count") || p.includes("menghitung sel")) return "Perbedaan Fungsi COUNT dan COUNTA";
  if (p.includes("dolar") || p.includes("absolut") || p.includes("referensi")) return "Referensi Rumus Absolut ($) & Relatif";
  if (p.includes("min") || p.includes("max") || p.includes("terendah") || p.includes("tertinggi")) return "Fungsi Ekstrem Nilai (MIN & MAX)";
  if (p.includes("vlookup") || p.includes("vertikal")) return "Pencarian Vertikal Tabel dengan VLOOKUP";
  if (p.includes("xlookup")) return "Pencarian Fleksibel Dua Arah dengan XLOOKUP";
  if (p.includes("index") || p.includes("match")) return "Kombinasi Formula Dinamis INDEX & MATCH";
  if (p.includes("if") || p.includes("kondisi") || p.includes("logika")) return "Logika Percabangan Rumus IF";
  if (p.includes("pivot")) return "Penyusunan Pivot Table & Ringkasan Data";
  if (p.includes("validasi") || p.includes("dropdown")) return "Validasi Input Data & Pembatasan Sel";
  if (p.includes("grafik") || p.includes("chart") || p.includes("dashboard")) return "Visualisasi Data & Dashboard Ringkas";
  if (p.includes("concatenate") || p.includes("string") || p.includes("left") || p.includes("right") || p.includes("mid")) return "Manipulasi Teks & Fungsi String";

  // Desain Canva & Media Sosial
  if (p.includes("piksel") || p.includes("ukuran") || p.includes("kanvas") || p.includes("rasio")) return "Ukuran Kanvas & Rasio Aspek Desain";
  if (p.includes("hirarki visual") || p.includes("ruang negatif") || p.includes("grid")) return "Hirarki Visual & Tata Letak Elemen";
  if (p.includes("font") || p.includes("tipografi") || p.includes("keluarga font")) return "Pemilihan & Padu Padan Tipografi Font";
  if (p.includes("warna") || p.includes("psikologi warna") || p.includes("kontras")) return "Psikologi Warna & Harmoni Visual Brand";
  if (p.includes("logo") || p.includes("transparan") || p.includes("brand kit") || p.includes("png")) return "Identitas Visual & Penggunaan Brand Kit";
  if (p.includes("carousel") || p.includes("seamless") || p.includes("slide")) return "Penyusunan Feed Carousel Edukatif";
  if (p.includes("story") || p.includes("highlight") || p.includes("sorotan")) return "Desain Story & Sampul Highlight Interaktif";
  if (p.includes("spanduk") || p.includes("promo") || p.includes("flash sale") || p.includes("hapus latar")) return "Banner Promosi & Penghapus Latar Belakang";
  if (p.includes("animasi") || p.includes("reels") || p.includes("video") || p.includes("mp4")) return "Animasi Elemen & Video Pendek Reels";
  if (p.includes("kalender") || p.includes("content pillar") || p.includes("jadwal")) return "Perencanaan Pilar Konten & Kalender Unggahan";

  // Bahasa Inggris Kerja
  if (p.includes("introduce") || p.includes("networking") || p.includes("perkenalan")) return "Professional Self-Introduction & Networking";
  if (p.includes("polite") || p.includes("etiquette") || p.includes("colleague") || p.includes("sopan")) return "Office Etiquette & Workplace Politeness";
  if (p.includes("email") || p.includes("subject line") || p.includes("inquiry")) return "Professional Email Writing & Clear Subject Lines";
  if (p.includes("telephone") || p.includes("call") || p.includes("appointment") || p.includes("telepon")) return "Telephone Handling & Appointment Scheduling";
  if (p.includes("meeting") || p.includes("chairperson") || p.includes("agenda") || p.includes("rapat")) return "Leading & Participating in Business Meetings";
  if (p.includes("disagree") || p.includes("opinion") || p.includes("pendapat")) return "Expressing Polite Opinions & Constructive Disagreement";
  if (p.includes("presentation") || p.includes("signposting") || p.includes("presentasi")) return "Signposting Phrases for Business Presentations";
  if (p.includes("negotiation") || p.includes("client") || p.includes("negosiasi")) return "Diplomatic Negotiation & Client Handling";
  if (p.includes("minutes") || p.includes("mom") || p.includes("notula") || p.includes("action items")) return "Official Meeting Minutes (MoM) & Action Items";
  if (p.includes("star") || p.includes("interview") || p.includes("wawancara")) return "The STAR Method for Professional Job Interviews";

  // Pembukuan UMKM
  if (p.includes("pencampuran") || p.includes("dompet") || p.includes("kas bisnis") || p.includes("rekening")) return "Pemisahan Kas Usaha & Keuangan Pribadi";
  if (p.includes("aset") || p.includes("modal awal") || p.includes("inventaris")) return "Klasifikasi Modal Awal & Aset Usaha";
  if (p.includes("kas masuk") || p.includes("kas keluar") || p.includes("buku kas")) return "Pencatatan Buku Kas Harian";
  if (p.includes("hpp") || p.includes("pokok penjualan") || p.includes("biaya bahan")) return "Kalkulasi Harga Pokok Penjualan (HPP)";
  if (p.includes("margin") || p.includes("mark-up") || p.includes("pricing") || p.includes("harga jual")) return "Penetapan Margin Keuntungan & Strategi Harga";
  if (p.includes("piutang") || p.includes("utang") || p.includes("supplier") || p.includes("pelanggan")) return "Pengelolaan Piutang Pelanggan & Utang Usaha";
  if (p.includes("stok opname") || p.includes("gudang") || p.includes("selisih fisik")) return "Manajemen Stok Opname & Rekonsiliasi Barang";
  if (p.includes("laba rugi") || p.includes("pendapatan") || p.includes("beban operasional")) return "Penyusunan Laporan Laba Rugi Sederhana";
  if (p.includes("arus kas") || p.includes("cash flow") || p.includes("boncos") || p.includes("likuiditas")) return "Pengendalian Arus Kas (Cash Flow Management)";
  if (p.includes("kredit") || p.includes("kur") || p.includes("ekspansi") || p.includes("kesehatan")) return "Analisis Kesehatan Finansial & Pengajuan Modal";

  // Fotografi Produk
  if (p.includes("cahaya") || p.includes("jendela") || p.includes("matahari") || p.includes("bayangan")) return "Pemanfaatan Pencahayaan Alami & Diffuser";
  if (p.includes("latar") || p.includes("background") || p.includes("alas")) return "Pemilihan Latar Belakang & Meja Foto Bersih";
  if (p.includes("rule of thirds") || p.includes("garis bantu") || p.includes("tiga kali tiga")) return "Komposisi Rule of Thirds & Grid Kamera";
  if (p.includes("flat lay") || p.includes("sudut") || p.includes("eye level")) return "Sudut Pengambilan Foto (Angle of View)";
  if (p.includes("zoom") || p.includes("tajam") || p.includes("fokus") || p.includes("resolusi")) return "Ketajaman Foto & Pembatasan Zoom Digital";
  if (p.includes("sunting") || p.includes("editing") || p.includes("terang") || p.includes("kontras")) return "Penyuntingan Dasar & Koreksi Warna Realistis";

  // Public Speaking
  if (p.includes("pembuka") || p.includes("tujuan") || p.includes("hook")) return "Teknik Pembukaan Presentasi yang Memikat";
  if (p.includes("poin utama") || p.includes("struktur") || p.includes("alur")) return "Penyusunan Struktur & Poin Kunci Presentasi";
  if (p.includes("penutup") || p.includes("ringkasan") || p.includes("ajakan")) return "Penutup Presentasi & Call to Action (CTA)";
  if (p.includes("gugup") || p.includes("napas") || p.includes("cemas") || p.includes("tenang")) return "Pengendalian Rasa Gugup & Olah Pernapasan";
  if (p.includes("kontak mata") || p.includes("bahasa tubuh") || p.includes("kepercayaan")) return "Kontak Mata & Bahasa Tubuh Profesional";
  if (p.includes("lupa") || p.includes("catatan") || p.includes("jeda") || p.includes("tanya jawab")) return "Manajemen Spontanitas & Sesi Tanya Jawab";

  // Microsoft Word
  if (p.includes("kop surat") || p.includes("instansi") || p.includes("alamat")) return "Format Kepala (Kop) Surat Resmi";
  if (p.includes("nomor surat") || p.includes("penomoran") || p.includes("lampiran") || p.includes("perihal")) return "Tata Naskah & Penomoran Surat Resmi";
  if (p.includes("kertas") || p.includes("a4") || p.includes("margin") || p.includes("ukuran")) return "Pengaturan Margin & Ukuran Kertas Resmi";
  if (p.includes("mail merge") || p.includes("massal") || p.includes("surat banyak")) return "Pemanfaatan Fitur Mail Merge untuk Surat Massal";
  if (p.includes("sumber data") || p.includes("daftar penerima") || p.includes("excel")) return "Integrasi Database Penerima ke Dokumen Word";

  if (modulJudul && modulJudul.trim()) {
    return modulJudul.trim();
  }

  return `Materi Inti Bagian ${urutan}`;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pendaftaranId = searchParams.get("pendaftaranId");
    const modulId = searchParams.get("modulId");

    if (!pendaftaranId || !modulId) {
      return NextResponse.json({ error: "Parameter pendaftaranId dan modulId wajib diisi." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // 1. Ambil pendaftaran untuk verifikasi
    const { data: pendaftaran, error: pError } = await admin
      .from("pendaftaran")
      .select("id, status, kursus_id, kursus:kursus_id(nilai_lulus)")
      .eq("id", pendaftaranId)
      .single();

    if (pError || !pendaftaran) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan." }, { status: 404 });
    }

    // 2. Ambil riwayat percobaan terakhir
    const { data: attempts, error: attError } = await admin
      .from("percobaan_kuis")
      .select("nomor_percobaan, nilai, jumlah_benar, jumlah_soal, lulus, jawaban, dikerjakan_pada")
      .eq("pendaftaran_id", pendaftaranId)
      .eq("modul_id", modulId)
      .order("nomor_percobaan", { ascending: false });

    if (attError || !attempts || attempts.length === 0) {
      return NextResponse.json({ feedback: null, attempts: [] });
    }

    const latestAttempt = attempts[0];
    const rawAnswers = (latestAttempt.jawaban || {}) as Record<string, string>;

    // 3. Ambil data modul untuk nama topik
    const { data: modulData } = await admin
      .from("modul")
      .select("id, urutan, judul")
      .eq("id", modulId)
      .single();

    // 4. Ambil soal dari DB (dengan kunci_jawaban)
    const { data: soalList } = await admin
      .from("soal")
      .select("id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban")
      .eq("modul_id", modulId)
      .order("urutan", { ascending: true });

    let activeSoalList: any[] = soalList || [];

    // Fallback jika soal tidak ada di DB
    if (activeSoalList.length === 0) {
      const { ALL_COURSES } = await import("@/data/courses");
      for (const c of ALL_COURSES) {
        const m = c.modul.find((mod) => mod.id === modulId || String(mod.urutan) === String(modulId));
        if (m?.soal && m.soal.length > 0) {
          activeSoalList = m.soal;
          break;
        }
      }
    }

    // 5. Susun feedback tanpa membocorkan kunci_jawaban (PRD BR-09)
    const feedback = activeSoalList.map((soal: any, idx: number) => {
      const userChoice = (rawAnswers[soal.id] || Object.values(rawAnswers)[idx] || "").trim().toUpperCase();
      const kunci = (soal.kunci_jawaban || "").trim().toUpperCase();
      const isCorrect = Boolean(userChoice && kunci && userChoice === kunci);

      const keyUser = userChoice ? userChoice.toLowerCase() : "";
      const teksUser = keyUser ? soal[`pilihan_${keyUser}`] || userChoice : "Belum dijawab";
      const topic = getStudyTopicUniversal(soal.pertanyaan, soal.urutan, modulData?.judul);

      return {
        id: soal.id,
        urutan: soal.urutan,
        pertanyaan: soal.pertanyaan,
        pilihan_a: soal.pilihan_a,
        pilihan_b: soal.pilihan_b,
        pilihan_c: soal.pilihan_c,
        pilihan_d: soal.pilihan_d,
        jawaban_user: userChoice || "-",
        teks_user: teksUser,
        benar: isCorrect,
        hint: isCorrect
          ? `Jawaban Anda tepat! Pemahaman materi pada bab "${topic}" sudah sangat baik.`
          : `💡 Coba pelajari bab "${topic}" pada materi modul di atas untuk memahami konsep yang tepat.`,
      };
    });

    const firstAttempt = attempts[attempts.length - 1];

    return NextResponse.json({
      success: true,
      nomor_percobaan: latestAttempt.nomor_percobaan,
      nilai: latestAttempt.nilai,
      jumlah_benar: latestAttempt.jumlah_benar,
      jumlah_soal: latestAttempt.jumlah_soal,
      lulus: latestAttempt.lulus,
      skor_pertama: firstAttempt?.nilai ?? latestAttempt.nilai,
      feedback: feedback,
      attempts: attempts.reverse(),
    });
  } catch (err: any) {
    console.error("Error in kuis review API:", err);
    return NextResponse.json({ error: err.message || "Gagal memuat evaluasi kuis." }, { status: 500 });
  }
}
