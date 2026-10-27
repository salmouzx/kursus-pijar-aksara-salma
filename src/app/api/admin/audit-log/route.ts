import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("audit_log")
      .select(`
        id,
        aksi,
        nama_tabel,
        id_data,
        dibuat_pada,
        pelaku:pelaku_id (
          nama_lengkap,
          email,
          peran
        ),
        data_sesudah
      `)
      .order("dibuat_pada", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      logs: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
