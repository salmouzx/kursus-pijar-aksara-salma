import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const admin = getSupabaseAdmin();

    let query = admin
      .from("ulasan_kursus")
      .select("*")
      .order("dibuat_pada", { ascending: false });

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data, error } = await query;

    if (error) {
      // Jika tabel belum di-create, fallback gracefully
      return NextResponse.json({ success: false, fallback: true, error: error.message }, { status: 200 });
    }

    const formatted = (data || []).map((r: any) => ({
      id: r.id,
      courseId: r.course_id,
      userId: r.user_id,
      userName: r.user_name,
      userRole: r.user_role,
      userAvatar: r.user_avatar,
      rating: r.rating,
      komentar: r.komentar,
      isVerifiedStudent: r.is_verified_student,
      kursusJudul: r.kursus_judul,
      createdAt: r.dibuat_pada,
    }));

    return NextResponse.json({ success: true, reviews: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      courseId,
      userId,
      userName,
      userRole = "Peserta",
      userAvatar,
      rating,
      komentar,
      kursusJudul,
    } = body;

    if (!courseId || !rating || !komentar || !userName) {
      return NextResponse.json(
        { error: "Field courseId, rating, komentar, dan userName wajib diisi." },
        { status: 400 }
      );
    }

    const parsedRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("ulasan_kursus")
      .insert({
        course_id: courseId,
        user_id: userId || null,
        user_name: userName.trim(),
        user_role: userRole,
        user_avatar: userAvatar || null,
        rating: parsedRating,
        komentar: komentar.trim(),
        is_verified_student: true,
        kursus_judul: kursusJudul || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
