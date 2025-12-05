// © 2025 운빨(unbbal). All rights reserved.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!apiKey || !adminEmail) {
      console.error("RESEND_API_KEY or ADMIN_EMAIL is not configured");
      return NextResponse.json(
        { error: "이메일 서비스가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const { type, message, email } = await request.json();

    if (!type || !message) {
      return NextResponse.json(
        { error: "피드백 유형과 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const typeLabels: Record<string, string> = {
      feature: "기능 추가 요청",
      bug: "버그 제보",
      improve: "개선 제안",
      other: "기타",
    };

    const { error } = await resend.emails.send({
      from: "운빨 피드백 <onboarding@resend.dev>",
      to: adminEmail,
      subject: `[운빨 피드백] ${typeLabels[type] || type}`,
      html: `
        <h2>새로운 피드백이 도착했습니다!</h2>
        <p><strong>유형:</strong> ${typeLabels[type] || type}</p>
        <p><strong>내용:</strong></p>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 8px;">${message}</p>
        ${email ? `<p><strong>답변 받을 이메일:</strong> ${email}</p>` : ""}
        <hr />
        <p style="color: #666; font-size: 12px;">운빨 (unbbal.site) 피드백 시스템</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "이메일 전송에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
