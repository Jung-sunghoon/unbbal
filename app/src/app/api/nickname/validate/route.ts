// © 2025 운빨(unbbal). All rights reserved.

import { NextRequest, NextResponse } from "next/server";
import { supabase, GameType } from "@/lib/supabase/client";
import { validateNickname, getErrorMessage } from "@/lib/validators/nickname";

interface ValidateRequest {
  nickname: string;
  gameType: GameType;
}

// POST /api/nickname/validate - 닉네임 유효성 검사
export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json();
    const { nickname, gameType } = body;

    // 기본 유효성 검사
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        error: validation.error,
        message: getErrorMessage(validation.error!),
      });
    }

    const trimmedNickname = nickname.trim();

    // 닉네임 중복 체크 (같은 게임 내에서)
    const { data: existing } = await supabase
      .from("game_results")
      .select("id")
      .eq("game_type", gameType)
      .eq("nickname", trimmedNickname)
      .single();

    if (existing) {
      return NextResponse.json({
        valid: false,
        error: "duplicate",
        message: getErrorMessage("duplicate"),
      });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { valid: false, error: "internal_error", message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
