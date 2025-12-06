// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { GameType } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface GameTabsProps {
  activeGame: GameType;
  onSelect: (game: GameType) => void;
}

const GAMES: { type: GameType; emoji: string; name: string }[] = [
  { type: "dice", emoji: "🎲", name: "주사위" },
  { type: "bomb", emoji: "💣", name: "폭탄" },
  { type: "enhance", emoji: "⚔️", name: "강화" },
  { type: "rps", emoji: "✊", name: "가위바위보" },
];

export function GameTabs({ activeGame, onSelect }: GameTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {GAMES.map((game) => (
        <button
          key={game.type}
          onClick={() => onSelect(game.type)}
          className={cn(
            "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer",
            activeGame === game.type
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
          )}
        >
          <span className="mr-1">{game.emoji}</span>
          <span className="hidden sm:inline">{game.name}</span>
        </button>
      ))}
    </div>
  );
}
