// © 2025 운빨(unbbal). All rights reserved.

import { NextRequest, NextResponse } from "next/server";
import { supabase, GameType } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ gameType: string }>;
}

// GET /api/ranking/[gameType] - 게임별 랭킹 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { gameType } = await params;

    // 게임 타입 검증
    if (!["dice", "bomb", "enhance", "rps"].includes(gameType)) {
      return NextResponse.json(
        { error: "Invalid game type" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 50);

    // 랭킹 조회 (높은 점수 순, 같은 점수면 먼저 등록한 순)
    const { data, error, count } = await supabase
      .from("game_results")
      .select("id, nickname, score, created_at", { count: "exact" })
      .eq("game_type", gameType)
      .eq("is_registered", true)
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch ranking" },
        { status: 500 }
      );
    }

    const rankings = (data || []).map((item, index) => ({
      rank: index + 1,
      id: item.id,
      nickname: item.nickname,
      score: item.score,
      createdAt: item.created_at,
    }));

    return NextResponse.json({
      rankings,
      total: count || 0,
      gameType: gameType as GameType,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
