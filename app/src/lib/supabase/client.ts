// © 2025 운빨(unbbal). All rights reserved.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export type GameType = "dice" | "bomb" | "enhance" | "rps";

export interface GameResult {
  id: string;
  game_type: GameType;
  score: number;
  metadata: Record<string, unknown>;
  created_at: string;
  nickname: string | null;
  is_registered: boolean;
  registered_at: string | null;
}

export interface RankingEntry {
  rank: number;
  nickname: string;
  score: number;
  created_at: string;
}
