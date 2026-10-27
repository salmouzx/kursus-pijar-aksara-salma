import { NextResponse } from "next/server";
import { sendServerEmail } from "@/lib/server-email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toEmail, recipientName, type, courseTitle, extraData = {} } = body;

    if (!toEmail || !recipientName || !type || !courseTitle) {
      return NextResponse.json(
        { error: "Field toEmail, recipientName, type, dan courseTitle wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await sendServerEmail({
      toEmail,
      recipientName,
      type,
      courseTitle,
      extraData,
    });

    return NextResponse.json({
      success: true,
      message: `Notifikasi email jenis '${type}' berhasil diproses.`,
      dispatchedTo: toEmail,
      subject: result.subject,
      resendResult: result.resendResult,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
