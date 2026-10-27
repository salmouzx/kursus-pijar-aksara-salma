import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, nama_lengkap, no_hp } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Parameter userId wajib disertakan." },
        { status: 400 }
      );
    }

    if (!nama_lengkap || nama_lengkap.trim().length === 0) {
      return NextResponse.json(
        { error: "Nama lengkap tidak boleh kosong." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("profiles")
      .update({
        nama_lengkap: nama_lengkap.trim(),
        no_hp: no_hp ? no_hp.trim() : null,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal memperbarui profil: " + error.message },
        { status: 500 }
      );
    }

    // Update juga user metadata di auth.users agar konsisten
    try {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { nama_lengkap: nama_lengkap.trim(), no_hp: no_hp ? no_hp.trim() : null },
      });
    } catch (e) {
      // Abaikan jika metadata auth opsional
    }

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui!",
      profile: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server saat memperbarui profil." },
      { status: 500 }
    );
  }
}
