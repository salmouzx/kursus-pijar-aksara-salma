import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message, modulJudul, modulMateri, courseTitle, userName } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const q = message.toLowerCase().trim();
    const materiContext = (modulMateri || "").toLowerCase();

    // 1. Cek apakah ada Google Gemini API Key di environment variable (Opsional)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Anda adalah Tutor AI Resmi di Lembaga Kursus Pijar Aksara.
Anda sedang mendampingi peserta bernama ${userName || "Peserta"} yang sedang mempelajari kursus "${courseTitle}" pada modul "${modulJudul}".
Rangkuman materi modul saat ini:
"${(modulMateri || "").slice(0, 1000)}"

Pertanyaan peserta: "${message}".
Jawablah dengan ramah, suportif, terstruktur (gunakan poin-poin/langkah mudah dipahami), dan bahasa Indonesia yang jelas.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const geminiData = await geminiRes.json();
        const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return NextResponse.json({
            success: true,
            reply: generatedText,
            source: "gemini-api",
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini API fallback to internal smart engine:", geminiErr);
      }
    }

    // 2. SMART LOCAL AI KNOWLEDGE ENGINE (100% Gratis, Tanpa API Key Eksternal, Super Cepat)
    let aiResponse = "";

    // Kategori: EXCEL
    if (q.includes("vlookup") || q.includes("lookup") || q.includes("cari data")) {
      aiResponse = `💡 **Panduan Rumus VLOOKUP:**
Rumus VLOOKUP digunakan untuk mencari data vertikal dari kolom kiri ke kolom kanan tabel referensi.

**Sintaks Dasar:**
\`=VLOOKUP(nilai_dicari, tabel_referensi, nomor_kolom_hasil, [range_lookup])\`

*Tips Praktis:*
1. **nilai_dicari**: Sel kunci (misal: kode barang atau NIK karyawan).
2. **tabel_referensi**: Blok tabel data dan tekan **F4** agar referensi menjadi absolut ($A$2:$D$50).
3. **nomor_kolom_hasil**: Hitung urutan kolom dari kiri tabel mulai dari 1.
4. **range_lookup**: Selalu isi **0** atau **FALSE** untuk pencarian data yang persis/akurat (exact match).`;
    } else if (q.includes("accounting") || q.includes("currency") || q.includes("format uang") || q.includes("rupiah")) {
      aiResponse = `💰 **Perbedaan Format Accounting vs Currency di Excel:**

1. **Format Accounting (Standar Laporan Audit)**:
   - Simbol mata uang (Rp) rata di sisi paling kiri sel.
   - Nilai angka rata di sisi paling kanan sel.
   - Angka nol (0) otomatis ditampilkan sebagai strip (\`-\`).
   - Sangat disarankan untuk rekap keuangan bulanan kantor agar angka desimal dan ribuan sejajar lurus ke bawah.

2. **Format Currency**:
   - Simbol mata uang (Rp) menempel tepat di depan angka pertama.
   - Angka nol tetap tertulis \`Rp 0\`.`;
    } else if (q.includes("shortcut") || q.includes("tombol cepat") || q.includes("cepat") || q.includes("keyboard")) {
      aiResponse = `⚡ **Shortcut Keyboard Excel Penting di Kantor:**

* **Navigasi & Blok Cepat:**
  - \`Shift + Spasi\` : Memblok seluruh baris aktif.
  - \`Ctrl + Spasi\` : Memblok seluruh kolom aktif.
  - \`Ctrl + Tanda Panah\` : Loncat langsung ke sel ujung data terisi tanpa scroll mouse.
  - \`Ctrl + Shift + Tanda Panah\` : Memblok data sampai baris/kolom paling akhir seketika.
* **Format & Rumus:**
  - \`Alt + =\` : AutoSUM otomatis (penjumlahan cepat).
  - \`F4\` : Mengunci referensi rumus menjadi Absolut ($) seketika.`;
    } else if (q.includes("sum") || q.includes("average") || q.includes("count") || q.includes("hitung")) {
      aiResponse = `📊 **Fungsi Agregasi Dasar:**
- \`=SUM(A1:A10)\` : Menjumlahkan seluruh angka di rentang sel.
- \`=AVERAGE(A1:A10)\` : Menghitung nilai rata-rata.
- \`=COUNT(A1:A10)\` : Menghitung sel yang berisi *angka saja*.
- \`=COUNTA(A1:A10)\` : Menghitung sel yang terisi (baik angka, teks, maupun simbol).
- \`=COUNTIF(A1:A10, "Lulus")\` : Menghitung sel dengan kriteria tertentu.`;
    } 

    // Kategori: CANVA & DESAIN
    else if (q.includes("canva") || q.includes("desain") || q.includes("ukuran") || q.includes("piksel") || q.includes("feed")) {
      aiResponse = `🎨 **Tips Desain Media Sosial di Canva:**

1. **Rasio Ideal Feed Instagram:**
   - Gunakan ukuran potret **4:5 (1080 x 1350 piksel)**. Format ini memakan layar feed pengguna ponsel lebih luas dibandingkan ukuran persegi 1:1, sehingga pesan promosi jauh lebih menonjol.
2. **Hirarki Tipografi (Maksimal 2 Jenis Font):**
   - Gunakan font tebal (*bold sans-serif*) untuk judul utama.
   - Gunakan font bersih (*clean legible*) untuk isi teks.
3. **Penyelarasan Warna (Brand Kit):**
   - Terapkan aturan 60-30-10: 60% warna dasar (background netral), 30% warna identitas brand, dan 10% warna aksen kontras untuk tombol Call-to-Action.`;
    }

    // Kategori: BAHASA INGGRIS KERJA
    else if (q.includes("email") || q.includes("english") || q.includes("inggris") || q.includes("meeting") || q.includes("formal")) {
      aiResponse = `💼 **Panduan Komunikasi Bisnis & Email Bahasa Inggris:**

* **Subject Line Efektif:**
  - \`[Action Required] Project Alpha Progress Update - 26 Oct\`
  - \`Meeting Request: Budget Review for Q4\`
* **Kalimat Pembuka Profesional:**
  - *"I hope this email finds you well."*
  - *"Thank you for your prompt response regarding the invoice."*
* **Menyampaikan Pendapat Sopan (Polite Disagreement):**
  - *"I see your point, however, we might also consider..."*
  - *"That is a valid approach, but from our previous experience..."*
* **Penutup Email:**
  - *"Looking forward to hearing from you."*
  - *"Best regards / Sincerely."*`;
    }

    // Kategori: PEMBUKUAN UMKM
    else if (q.includes("pembukuan") || q.includes("umkm") || q.includes("hpp") || q.includes("kas") || q.includes("untung")) {
      aiResponse = `📈 **Prinsip Utama Pembukuan UMKM:**

1. **Pemisahan Kas Usaha & Kas Pribadi (Aturan Emas):**
   - Jangan pernah menyatukan dompet/rekening usaha dengan kebutuhan belanja rumah tangga. Tetapkan "gaji pemilik" bulanan tetap untuk diri Anda sendiri.
2. **Kalkulasi Harga Pokok Penjualan (HPP):**
   - \`HPP = Biaya Bahan Baku + Tenaga Kerja Langsung + Biaya Kemasan/Overhead\`
   - Pastikan HPP sudah dihitung tepat sebelum menentukan margin keuntungan dan harga jual ke konsumen.
3. **Buku Kas Harian:**
   - Selalu catat kas masuk dan kas keluar pada hari yang sama (jangan ditunda), agar rekonsiliasi fisik uang dan catatan selalu klop.`;
    }

    // General Contextual Response
    else {
      aiResponse = `Halo **${userName || "Peserta"}**! Mengenai modul **"${modulJudul}"**:

Inti pembelajaran pada topik ini menekankan pemahaman praktis yang siap Anda terapkan langsung di dunia kerja kantor maupun pengelolaan usaha.

📌 **Poin Rekomendasi Tutor:**
- Selesaikan membaca materi di modul ini dengan teliti.
- Lakukan latihan mandiri sesuai studi kasus yang diberikan.
- Jika sudah selesai membaca, jangan lupa klik tombol **"Tandai materi sudah dibaca"** agar kuis evaluasi terbuka.

Ada bagian rumus, istilah, atau langkah kerja tertentu yang ingin Anda tanyakan lebih mendalam?`;
    }

    return NextResponse.json({
      success: true,
      reply: aiResponse,
      source: "pijar-nlp-engine",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses pesan AI." },
      { status: 500 }
    );
  }
}
