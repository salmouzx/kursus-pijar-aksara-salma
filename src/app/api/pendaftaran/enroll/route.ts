import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendServerEmail } from "@/lib/server-email";

export async function POST(request: Request) {
  try {
    const { kursusId, pesertaId, metodeBayar } = await request.json();

    if (!kursusId || !pesertaId) {
      return NextResponse.json(
        { error: "Parameter kursusId dan pesertaId wajib diisi." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Ambil data kursus dan validasi status (BR-01)
    const { data: kursus, error: kursusErr } = await admin
      .from("kursus")
      .select("id, judul, slug, harga, kuota, status")
      .eq("id", kursusId)
      .single();

    if (kursusErr || !kursus) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    if (kursus.status !== "terbit") {
      return NextResponse.json(
        { error: "Kursus ini belum diterbitkan atau pendaftaran telah ditutup." },
        { status: 400 }
      );
    }

    // 2. Cek apakah peserta sudah memiliki pendaftaran aktif atau menunggu bayar (BR-05)
    const { data: existingActive, error: existErr } = await admin
      .from("pendaftaran")
      .select("id, status")
      .eq("kursus_id", kursusId)
      .eq("peserta_id", pesertaId)
      .in("status", ["aktif", "menunggu_bayar", "selesai"])
      .maybeSingle();

    if (existErr) {
      console.error("Error checking existing enrollment:", existErr);
    }

    if (existingActive) {
      if (existingActive.status === "aktif" || existingActive.status === "selesai") {
        return NextResponse.json(
          {
            error: "Anda sudah terdaftar aktif di kursus ini. Silakan langsung ke Ruang Belajar.",
            redirectUrl: `/belajar/${kursus.slug}/1`,
          },
          { status: 400 }
        );
      }
      if (existingActive.status === "menunggu_bayar") {
        return NextResponse.json(
          {
            error: "Anda sudah memiliki pendaftaran yang menunggu pembayaran untuk kursus ini.",
            redirectUrl: "/kursus-saya",
          },
          { status: 400 }
        );
      }
    }

    // 3. Cek sisa kuota (BR-06)
    const { data: sisaKursiData, error: sisaErr } = await admin.rpc("hitung_sisa_kursi", {
      target_kursus_id: kursusId,
    });

    if (!sisaErr && typeof sisaKursiData === "number" && sisaKursiData <= 0) {
      return NextResponse.json(
        { error: "Mohon maaf, kuota kursi untuk kursus ini telah penuh." },
        { status: 400 }
      );
    }

    const isFree = kursus.harga === 0;
    const now = new Date();

    // Ambil data profil peserta untuk notifikasi & pembuatan invoice Mayar
    const { data: profile } = await admin
      .from("profiles")
      .select("nama_lengkap, email, no_hp")
      .eq("id", pesertaId)
      .maybeSingle();

    // 4. Buat pendaftaran
    if (isFree) {
      // PROTOTYPE PRESENTASI: Kursus gratis langsung aktif (BR-07)
      const { data: newPendaftaran, error: insertErr } = await admin
        .from("pendaftaran")
        .insert({
          kursus_id: kursusId,
          peserta_id: pesertaId,
          status: "aktif",
          nominal: 0,
          metode_bayar: "gratis",
          dibayar_pada: now.toISOString(),
          didaftarkan_pada: now.toISOString(),
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("Error creating free enrollment:", insertErr);
        return NextResponse.json(
          { error: "Gagal memproses pendaftaran gratis: " + insertErr.message },
          { status: 500 }
        );
      }

      // Catat audit log
      await admin.from("audit_log").insert({
        pengguna_id: pesertaId,
        tabel: "pendaftaran",
        aksi: "daftar_kursus_gratis",
        data_sesudah: { pendaftaran_id: newPendaftaran.id, kursus_id: kursusId, status: "aktif" },
      });

      // Trigger notifikasi email pendaftaran aktif (PRD Bab 11.2)
      try {
        if (profile?.email) {
          await sendServerEmail({
            toEmail: profile.email,
            recipientName: profile.nama_lengkap || "Peserta Pijar",
            type: "pendaftaran_aktif",
            courseTitle: kursus.judul,
            extraData: { courseSlug: kursus.slug },
          });
        }
      } catch (e) {
        console.warn("Gagal mengirim notifikasi pendaftaran aktif:", e);
      }

      return NextResponse.json({
        success: true,
        isFree: true,
        pendaftaranId: newPendaftaran.id,
        status: "aktif",
        slug: kursus.slug,
        redirectUrl: `/belajar/${kursus.slug}/1`,
        message: "Pendaftaran kursus gratis berhasil! Akses materi langsung aktif.",
      });
    } else {
      // KURSUS BERBAYAR: Integrasi Mayar Live & Status 'menunggu_bayar' (BR-07)
      const batasBayar = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      let invoiceCode = `INV-MAYAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      let paymentLink: string | null = null;

      // Panggil API Mayar jika MAYAR_API_KEY tersedia
      const mayarApiKey = process.env.MAYAR_API_KEY;
      if (mayarApiKey) {
        // Coba endpoint production (api.mayar.id) lalu sandbox (api.mayar.io)
        for (const host of ["api.mayar.id", "api.mayar.io"]) {
          try {
            const mayarRes = await fetch(`https://${host}/hl/v2/invoices/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${mayarApiKey}`,
              },
              body: JSON.stringify({
                name: profile?.nama_lengkap || "Peserta Pijar Aksara",
                email: profile?.email || "peserta@pijaraksara.id",
                mobile: profile?.no_hp || "081234567890",
                description: `Pembayaran Kursus: ${kursus.judul}`,
                items: [
                  {
                    description: `Kursus ${kursus.judul}`,
                    quantity: 1,
                    rate: kursus.harga,
                  },
                ],
              }),
            });

            if (mayarRes.ok) {
              const mayarData = await mayarRes.json();
              if (mayarData?.data) {
                paymentLink = mayarData.data.link || null;
                if (mayarData.data.invoiceCode) {
                  invoiceCode = mayarData.data.invoiceCode;
                } else if (mayarData.data.id) {
                  invoiceCode = mayarData.data.id;
                }
                break;
              }
            }
          } catch (mErr) {
            console.warn(`Gagal memanggil API Mayar di ${host}:`, mErr);
          }
        }
      }

      // Validasi paymentLink hanya jika link transaksi invoice / payment link yang sah
      if (
        paymentLink &&
        !(
          paymentLink.includes("/invoices/") ||
          paymentLink.includes("/inv/") ||
          paymentLink.includes("/pl/") ||
          paymentLink.includes("pub-invoices")
        )
      ) {
        paymentLink = null;
      }

      const { data: newPendaftaran, error: insertErr } = await admin
        .from("pendaftaran")
        .insert({
          kursus_id: kursusId,
          peserta_id: pesertaId,
          status: "menunggu_bayar",
          nominal: kursus.harga,
          metode_bayar: metodeBayar || "mayar",
          batas_bayar: batasBayar.toISOString(),
          mayar_invoice_id: paymentLink || invoiceCode,
          didaftarkan_pada: now.toISOString(),
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error("Error creating paid enrollment:", insertErr);
        return NextResponse.json(
          { error: "Gagal memproses pendaftaran berbayar: " + insertErr.message },
          { status: 500 }
        );
      }

      // Catat audit log
      await admin.from("audit_log").insert({
        pengguna_id: pesertaId,
        tabel: "pendaftaran",
        aksi: "daftar_kursus_berbayar",
        data_sesudah: {
          pendaftaran_id: newPendaftaran.id,
          kursus_id: kursusId,
          status: "menunggu_bayar",
          nominal: kursus.harga,
          mayar_invoice_id: invoiceCode,
          payment_link: paymentLink,
        },
      });

      return NextResponse.json({
        success: true,
        isFree: false,
        pendaftaranId: newPendaftaran.id,
        status: "menunggu_bayar",
        nominal: kursus.harga,
        invoiceCode: invoiceCode,
        paymentLink: paymentLink,
        batasBayar: batasBayar.toISOString(),
        redirectUrl: "/peserta/tagihan",
        message: "Pendaftaran berhasil dicatat. Selesaikan pembayaran Mayar dalam 24 jam.",
      });
    }
  } catch (err: any) {
    console.error("Unexpected error in enrollment API:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server saat mendaftar kursus." },
      { status: 500 }
    );
  }
}
