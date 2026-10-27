import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Parameter userId wajib disertakan." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Hapus data relasi peserta
    await admin.from("audit_log").delete().eq("pengguna_id", userId);
    await admin.from("pendaftaran").delete().eq("peserta_id", userId);
    await admin.from("klaim_poin").delete().eq("peserta_id", userId);
    await admin.from("diskusi").delete().eq("pengguna_id", userId);

    // 2. Hapus dari public.profiles
    const { error: profileErr } = await admin.from("profiles").delete().eq("id", userId);
    if (profileErr) {
      console.warn("Peringatan saat menghapus profile:", profileErr.message);
    }

    // 3. Hapus dari auth.users via Supabase Auth Admin API
    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.warn("Peringatan saat menghapus auth user:", authErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Akun dan seluruh data Anda telah berhasil dihapus secara permanen.",
    });
  } catch (err: any) {
    console.error("Error menghapus akun:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan saat menghapus akun." },
      { status: 500 }
    );
  }
}
