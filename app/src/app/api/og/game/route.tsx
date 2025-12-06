// © 2025 운빨(unbbal). All rights reserved.

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

type GameType = "dice" | "bomb" | "enhance" | "rps";

const GAME_INFO: Record<GameType, { emoji: string; name: string; bgColor: string; description: string }> = {
  dice: {
    emoji: "🎲",
    name: "주사위 굴리기",
    bgColor: "#FEF3C7",
    description: "10번 굴려서 운빨 측정!",
  },
  bomb: {
    emoji: "💣",
    name: "폭탄 피하기",
    bgColor: "#FEE2E2",
    description: "진짜 폭탄을 피해라!",
  },
  enhance: {
    emoji: "⚔️",
    name: "강화 시뮬레이터",
    bgColor: "#F3E8FF",
    description: "몇 강까지 갈 수 있을까?",
  },
  rps: {
    emoji: "✊",
    name: "AI 가위바위보",
    bgColor: "#D1FAE5",
    description: "AI 상대로 연승 도전!",
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameType = (searchParams.get("game") || "dice") as GameType;

  const game = GAME_INFO[gameType] || GAME_INFO.dice;

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
          backgroundColor: game.bgColor,
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

        {/* 게임 이모지 */}
        <div
          style={{
            fontSize: 120,
            marginBottom: 24,
          }}
        >
          {game.emoji}
        </div>

        {/* 게임 이름 */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#1F2937",
            marginBottom: 16,
          }}
        >
          {game.name}
        </div>

        {/* 설명 */}
        <div
          style={{
            fontSize: 36,
            color: "#6B7280",
          }}
        >
          {game.description}
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
