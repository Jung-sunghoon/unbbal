// © 2025 운빨(unbbal). All rights reserved.

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get("grade") || "A";
  const title = searchParams.get("title") || "평범";
  const score = searchParams.get("score") || "50";

  const gradeColors: Record<string, string> = {
    SSS: "#FFD700",
    SS: "#FFA500",
    S: "#32CD32",
    A: "#4169E1",
    B: "#9370DB",
    F: "#DC143C",
  };

  const color = gradeColors[grade] || "#4169E1";

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
        <div style={{ fontSize: 48, marginBottom: 20 }}>🎲 운빨</div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: color,
            marginBottom: 10,
          }}
        >
          {grade}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: color,
            marginBottom: 20,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 36, color: "#6B7280" }}>{score}점</div>
        <div
          style={{
            fontSize: 24,
            color: "#9CA3AF",
            marginTop: 40,
          }}
        >
          unbbal.gg
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
