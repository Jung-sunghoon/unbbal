// © 2025 운빨(unbbal). All rights reserved.

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/results/[id] - 결과 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid result ID" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("game_results")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: data.id,
      gameType: data.game_type,
      score: data.score,
      metadata: data.metadata,
      createdAt: data.created_at,
      nickname: data.nickname,
      isRegistered: data.is_registered,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
