// © 2025 운빨(unbbal). All rights reserved.

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          backgroundColor: "#FFFBEB",
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

        {/* 트로피 이모지 */}
        <div
          style={{
            fontSize: 120,
            marginBottom: 24,
          }}
        >
          🏆
        </div>

        {/* 제목 */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#B45309",
            marginBottom: 16,
          }}
        >
          명예의 전당
        </div>

        {/* 설명 */}
        <div
          style={{
            fontSize: 36,
            color: "#6B7280",
          }}
        >
          최고의 운빨러들을 확인하세요!
        </div>

        {/* 게임 아이콘들 */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
          }}
        >
          <span style={{ fontSize: 48 }}>🎲</span>
          <span style={{ fontSize: 48 }}>💣</span>
          <span style={{ fontSize: 48 }}>⚔️</span>
          <span style={{ fontSize: 48 }}>✊</span>
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
