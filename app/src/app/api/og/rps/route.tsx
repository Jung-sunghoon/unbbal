// © 2025 운빨(unbbal). All rights reserved.

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streak = searchParams.get("streak") || "0";
  const streakNum = parseInt(streak, 10);

  let emoji = "🐣";
  let title = "입문";
  let color = "#9370DB";

  if (streakNum >= 10) {
    emoji = "👑";
    title = "가위바위보 신";
    color = "#FFD700";
  } else if (streakNum >= 7) {
    emoji = "🏆";
    title = "고수";
    color = "#FFA500";
  } else if (streakNum >= 5) {
    emoji = "💪";
    title = "중수";
    color = "#32CD32";
  } else if (streakNum >= 3) {
    emoji = "🌱";
    title = "초보";
    color = "#4169E1";
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAFAFA",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 20 }}>✊ AI 가위바위보</div>
        <div style={{ fontSize: 80, marginBottom: 10 }}>{emoji}</div>
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: color,
            marginBottom: 10,
          }}
        >
          {streak}연승
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: color,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#9CA3AF",
            marginTop: 40,
          }}
        >
          unbbal.site
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
