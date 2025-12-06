// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { motion } from "framer-motion";
import { GameType, RankingEntry } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface RankingTableProps {
  gameType: GameType;
  rankings: RankingEntry[];
  loading: boolean;
  total: number;
}

// 게임별 점수 포맷
function formatScore(score: number, gameType: GameType): string {
  switch (gameType) {
    case "dice":
      return `${score}점`;
    case "bomb":
      return `${score}회`;
    case "enhance":
      return `+${score}`;
    case "rps":
      return `${score}연승`;
    case "coin":
      return `${score}회`;
    default:
      return `${score}`;
  }
}

// 게임별 색상
const GAME_COLORS: Record<GameType, string> = {
  dice: "#F59E0B",
  bomb: "#EF4444",
  enhance: "#A855F7",
  rps: "#10B981",
  coin: "#FFD700",
};

// 순위별 스타일
function getRankStyle(rank: number) {
  if (rank === 1) return { bg: "bg-yellow-50 dark:bg-yellow-950/30", text: "text-yellow-600 dark:text-yellow-400", badge: "bg-yellow-100 text-yellow-700" };
  if (rank === 2) return { bg: "bg-gray-50 dark:bg-gray-800/30", text: "text-gray-500", badge: "bg-gray-100 text-gray-600" };
  if (rank === 3) return { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 text-orange-700" };
  return { bg: "", text: "text-muted-foreground", badge: "" };
}

export function RankingTable({ gameType, rankings, loading, total }: RankingTableProps) {
  const gameColor = GAME_COLORS[gameType];

  if (loading) {
    return (
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="bg-muted px-4 py-3 border-b">
          <div className="h-5 w-32 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3 gap-4">
              <div className="w-8 h-8 bg-muted-foreground/20 rounded-lg animate-pulse" />
              <div className="flex-1 h-4 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="w-16 h-4 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="bg-muted px-4 py-3 border-b">
          <h2 className="font-bold text-lg">TOP 50</h2>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-4xl mb-2">🏆</p>
          <p>아직 등록된 기록이 없습니다</p>
          <p className="text-sm mt-1">첫 번째 명예의 전당 주인공이 되어보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="bg-muted px-4 py-3 border-b flex justify-between items-center">
        <h2 className="font-bold text-lg">TOP 50</h2>
        <span className="text-sm text-muted-foreground">총 {total}명</span>
      </div>

      {/* 랭킹 목록 */}
      <div className="divide-y">
        {rankings.map((entry, index) => {
          const rankStyle = getRankStyle(entry.rank);
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={cn(
                "flex items-center px-4 py-3 hover:bg-muted/50 transition-colors",
                rankStyle.bg
              )}
            >
              {/* 순위 */}
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                  rankStyle.badge || "text-muted-foreground"
                )}
              >
                {entry.rank <= 3 ? (
                  <span className="text-lg">
                    {entry.rank === 1 && "🥇"}
                    {entry.rank === 2 && "🥈"}
                    {entry.rank === 3 && "🥉"}
                  </span>
                ) : (
                  entry.rank
                )}
              </div>

              {/* 닉네임 */}
              <div className="flex-1 ml-4 font-medium truncate">
                {entry.nickname}
              </div>

              {/* 점수 */}
              <div
                className="font-bold text-lg"
                style={{ color: gameColor }}
              >
                {formatScore(entry.score, gameType)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
