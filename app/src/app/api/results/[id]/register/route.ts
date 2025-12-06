// © 2025 운빨(unbbal). All rights reserved.

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { validateNickname } from "@/lib/validators/nickname";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface RegisterRequest {
  nickname: string;
}

// POST /api/results/[id]/register - 명예의 전당 등록
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: RegisterRequest = await request.json();
    const { nickname } = body;

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: "invalid_id" },
        { status: 400 }
      );
    }

    // 닉네임 유효성 검사
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const trimmedNickname = nickname.trim();

    // 결과 조회
    const { data: result, error: fetchError } = await supabase
      .from("game_results")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !result) {
      return NextResponse.json(
        { success: false, error: "not_found" },
        { status: 404 }
      );
    }

    // 이미 등록된 경우
    if (result.is_registered) {
      return NextResponse.json(
        { success: false, error: "already_registered" },
        { status: 400 }
      );
    }

    // 닉네임 중복 체크 (같은 게임 내에서)
    const { data: existing } = await supabase
      .from("game_results")
      .select("id")
      .eq("game_type", result.game_type)
      .eq("nickname", trimmedNickname)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "duplicate" },
        { status: 400 }
      );
    }

    // 등록 처리
    const { error: updateError } = await supabase
      .from("game_results")
      .update({
        nickname: trimmedNickname,
        is_registered: true,
        registered_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { success: false, error: "update_failed" },
        { status: 500 }
      );
    }

    // 순위 계산
    const { count } = await supabase
      .from("game_results")
      .select("*", { count: "exact", head: true })
      .eq("game_type", result.game_type)
      .eq("is_registered", true)
      .gt("score", result.score);

    const rank = (count ?? 0) + 1;

    return NextResponse.json({
      success: true,
      rank,
      nickname: trimmedNickname,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
