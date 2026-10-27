import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const courseSlug = (formData.get("courseSlug") as string) || "umum";
    const modulUrutan = (formData.get("modulUrutan") as string) || "1";

    if (!file) {
      return NextResponse.json({ error: "File PDF tidak ditemukan." }, { status: 400 });
    }

    // 1. Validasi Ekstensi dan Tipe File (Wajib PDF - PRD Bab 10.4)
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Format file tidak valid. Hanya file PDF yang diperbolehkan (PRD Bab 10.4)." },
        { status: 400 }
      );
    }

    // 2. Validasi Batas Maksimal Ukuran File (Maksimal 10 MB - PRD Bab 10.4)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas maksimal 10 MB (PRD Bab 10.4)." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const bucketName = "materi";

    // 3. Pastikan bucket 'materi' privat ada di Supabase Storage
    try {
      const { data: buckets } = await admin.storage.listBuckets();
      const bucketExists = (buckets || []).some((b: any) => b.name === bucketName);
      if (!bucketExists) {
        await admin.storage.createBucket(bucketName, {
          public: false, // Bucket privat (PRD Bab 8 & 10.4)
          fileSizeLimit: MAX_SIZE_BYTES,
          allowedMimeTypes: ["application/pdf"],
        });
      }
    } catch (bErr) {
      console.warn("Info cek bucket materi:", bErr);
    }

    // 4. Generate path file yang aman & terorganisir
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const storagePath = `${courseSlug}/modul_${modulUrutan}_${timestamp}_${cleanFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 5. Unggah ke Supabase Storage
    const { data: uploadData, error: uploadError } = await admin.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Gagal mengunggah PDF ke storage:", uploadError);
      return NextResponse.json(
        { error: `Gagal mengunggah file ke Supabase Storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File materi PDF berhasil diunggah ke Supabase Storage.",
      path: storagePath,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error("Error upload PDF:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan internal saat mengunggah file." },
      { status: 500 }
    );
  }
}
