// © 2025 운빨(unbbal). All rights reserved.

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const RPS_GRADES = [
  { minStreak: 15, grade: "SSS", title: "전설", color: "#FFD700" },
  { minStreak: 10, grade: "SS", title: "신", color: "#FFA500" },
  { minStreak: 7, grade: "S", title: "고수", color: "#32CD32" },
  { minStreak: 5, grade: "A", title: "중수", color: "#4169E1" },
  { minStreak: 3, grade: "B", title: "초보", color: "#9370DB" },
  { minStreak: 0, grade: "F", title: "입문", color: "#DC143C" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streak = searchParams.get("streak") || "0";
  const fireCount = searchParams.get("fire") || "0";
  const streakNum = parseInt(streak, 10);
  const fireNum = parseInt(fireCount, 10);

  const gradeInfo = RPS_GRADES.find((g) => streakNum >= g.minStreak) || RPS_GRADES[RPS_GRADES.length - 1];

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
          backgroundColor: "#D1FAE5",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 상단 로고 */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 36 }}>🍀</span>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#374151" }}>운빨</span>
        </div>

        {/* 게임 타입 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 64 }}>✊</span>
          <span style={{ fontSize: 36, fontWeight: 600, color: "#374151" }}>AI 가위바위보</span>
        </div>

        {/* 등급 */}
        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            color: gradeInfo.color,
            lineHeight: 1,
            textShadow: "4px 4px 0px rgba(0,0,0,0.1)",
          }}
        >
          {gradeInfo.grade}
        </div>

        {/* 타이틀 */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: gradeInfo.color,
            marginTop: 8,
          }}
        >
          {gradeInfo.title}
        </div>

        {/* 점수 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 40,
            color: "#6B7280",
            marginTop: 24,
            padding: "12px 32px",
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 12,
          }}
        >
          <span>{streak}연승</span>
          {fireNum > 0 && (
            <span style={{ color: "#EF4444" }}>🔥 x{fireNum}</span>
          )}
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 28,
            color: "#9CA3AF",
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
