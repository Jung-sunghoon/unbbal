// © 2025 운빨(unbbal). All rights reserved.

import { NextRequest, NextResponse } from "next/server";
import { supabase, GameType } from "@/lib/supabase/client";

interface CreateResultRequest {
  gameType: GameType;
  score: number;
  metadata?: Record<string, unknown>;
}

// POST /api/results - 게임 결과 저장
export async function POST(request: NextRequest) {
  try {
    const body: CreateResultRequest = await request.json();
    const { gameType, score, metadata = {} } = body;

    // 유효성 검사
    if (!gameType || !["dice", "bomb", "enhance", "rps"].includes(gameType)) {
      return NextResponse.json(
        { error: "Invalid game type" },
        { status: 400 }
      );
    }

    if (typeof score !== "number" || score < 0) {
      return NextResponse.json(
        { error: "Invalid score" },
        { status: 400 }
      );
    }

    // 게임별 점수 범위 검증
    const maxScores: Record<GameType, number> = {
      dice: 60,      // 주사위 10번 * 6 최대
      bomb: 100,     // 생존 횟수 (합리적 상한)
      enhance: 30,   // 강화 수치 (합리적 상한)
      rps: 100,      // 연승 횟수 (합리적 상한)
    };

    if (score > maxScores[gameType]) {
      return NextResponse.json(
        { error: "Score out of range" },
        { status: 400 }
      );
    }

    // DB에 저장
    const { data, error } = await supabase
      .from("game_results")
      .insert({
        game_type: gameType,
        score,
        metadata,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save result" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
