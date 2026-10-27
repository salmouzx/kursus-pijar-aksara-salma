import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modulId = searchParams.get("modulId");
    const courseSlug = searchParams.get("courseSlug");
    const modulUrutan = searchParams.get("modulUrutan");

    const admin = getSupabaseAdmin();

    // Query dari tabel Supabase jika sudah ada
    let query = admin
      .from("diskusi_modul")
      .select(`
        id,
        modul_id,
        course_slug,
        modul_urutan,
        user_id,
        user_name,
        user_role,
        user_avatar,
        judul,
        isi,
        upvotes,
        dibuat_pada,
        jawaban:jawaban_diskusi (
          id,
          diskusi_id,
          user_id,
          user_name,
          user_role,
          user_avatar,
          is_official_answer,
          isi,
          dibuat_pada
        )
      `)
      .order("dibuat_pada", { ascending: false });

    if (modulId) {
      query = query.eq("modul_id", modulId);
    } else if (courseSlug && modulUrutan) {
      query = query.eq("course_slug", courseSlug).eq("modul_urutan", Number(modulUrutan));
    }

    const { data, error } = await query;

    if (error) {
      // Jika tabel belum di-create di Supabase, kembalikan status false agar client fallback ke default
      return NextResponse.json({ success: false, fallback: true, error: error.message }, { status: 200 });
    }

    // Format data agar sesuai antarmuka DiscussionItem
    const formatted = (data || []).map((d: any) => ({
      id: d.id,
      modulId: d.modul_id,
      courseSlug: d.course_slug,
      modulUrutan: d.modul_urutan,
      userId: d.user_id,
      userName: d.user_name,
      userRole: d.user_role,
      userAvatar: d.user_avatar,
      judul: d.judul,
      isi: d.isi,
      upvotes: d.upvotes || 0,
      createdAt: d.dibuat_pada,
      jawaban: (d.jawaban || []).map((j: any) => ({
        id: j.id,
        discussionId: j.diskusi_id,
        userId: j.user_id,
        userName: j.user_name,
        userRole: j.user_role,
        userAvatar: j.user_avatar,
        isOfficialAnswer: j.is_official_answer,
        isi: j.isi,
        createdAt: j.dibuat_pada,
      })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }));

    return NextResponse.json({ success: true, discussions: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const admin = getSupabaseAdmin();

    if (action === "create_question") {
      const { modulId, courseSlug, modulUrutan, userId, userName, userRole, userAvatar, judul, isi } = body;
      if (!modulId || !judul || !isi || !userName) {
        return NextResponse.json({ error: "Kolom modulId, judul, isi, dan nama wajib diisi." }, { status: 400 });
      }

      const { data, error } = await admin
        .from("diskusi_modul")
        .insert({
          modul_id: modulId,
          course_slug: courseSlug || "",
          modul_urutan: Number(modulUrutan) || 1,
          user_id: userId || null,
          user_name: userName.trim(),
          user_role: userRole || "peserta",
          user_avatar: userAvatar || null,
          judul: judul.trim(),
          isi: isi.trim(),
          upvotes: 0,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === "create_answer") {
      const { discussionId, userId, userName, userRole, userAvatar, isOfficialAnswer, isi } = body;
      if (!discussionId || !isi || !userName) {
        return NextResponse.json({ error: "Kolom discussionId, isi, dan nama wajib diisi." }, { status: 400 });
      }

      const isOfficial = isOfficialAnswer ?? (userRole === "instruktur" || userRole === "admin");

      const { data, error } = await admin
        .from("jawaban_diskusi")
        .insert({
          diskusi_id: discussionId,
          user_id: userId || null,
          user_name: userName.trim(),
          user_role: userRole || "peserta",
          user_avatar: userAvatar || null,
          is_official_answer: isOfficial,
          isi: isi.trim(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, data });
    }

    if (action === "upvote") {
      const { discussionId } = body;
      if (!discussionId) {
        return NextResponse.json({ error: "discussionId wajib diisi." }, { status: 400 });
      }

      // Ambil upvotes sekarang
      const { data: curr } = await admin
        .from("diskusi_modul")
        .select("upvotes")
        .eq("id", discussionId)
        .maybeSingle();

      const newVotes = (curr?.upvotes || 0) + 1;
      await admin.from("diskusi_modul").update({ upvotes: newVotes }).eq("id", discussionId);

      return NextResponse.json({ success: true, upvotes: newVotes });
    }

    return NextResponse.json({ error: "Action tidak dikenali." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
