// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RPSMove, RPS_EMOJI, RPS_NAME } from "@/lib/constants";
import type { RPSGameState } from "@/lib/hooks/useRPSGame";

interface RPSGameProps {
  streak: number;
  playerMove: RPSMove | null;
  aiMove: RPSMove | null;
  roundResult: "win" | "lose" | "draw" | null;
  phase: RPSGameState["phase"];
  aiMood: RPSGameState["aiMood"];
  aiMessage: string;
  aiName: string;
  onPlay: (move: RPSMove) => void;
}

// AI 표정 이모지
const AI_FACE: Record<RPSGameState["aiMood"], string> = {
  confident: "😏",
  nervous: "😰",
  angry: "😤",
  shocked: "😱",
  smug: "😎",
};

export function RPSGame({
  streak,
  playerMove,
  aiMove,
  roundResult,
  phase,
  aiMood,
  aiMessage,
  aiName,
  onPlay,
}: RPSGameProps) {
  const isRevealing = phase === "revealing";
  const showResult = phase === "result" || phase === "gameover";

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* AI 프로필 */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <motion.div
            key={aiMood}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-4xl"
          >
            {AI_FACE[aiMood]}
          </motion.div>
          <div className="flex-1">
            <p className="font-bold text-sm">{aiName}</p>
            <motion.p
              key={aiMessage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-muted-foreground"
            >
              "{aiMessage}"
            </motion.p>
          </div>
        </div>

        {/* 연승 카운터 */}
        <div className="text-center">
          <motion.div
            key={streak}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black"
            style={{ color: streak >= 5 ? "#F59E0B" : streak >= 3 ? "#10B981" : "inherit" }}
          >
            {streak} 연승
          </motion.div>
          {streak >= 5 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[#F59E0B]"
            >
              불타오르는 연승!
            </motion.p>
          )}
        </div>

        {/* 대결 영역 */}
        <div className="flex items-center justify-center gap-6">
          {/* 플레이어 */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">나</p>
            <motion.div
              className="w-24 h-24 flex items-center justify-center rounded-xl bg-muted"
              animate={
                isRevealing
                  ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }
                  : {}
              }
              transition={{ duration: 0.3 }}
            >
              <span className="text-5xl">
                {playerMove ? RPS_EMOJI[playerMove] : "❓"}
              </span>
            </motion.div>
          </div>

          {/* VS */}
          <motion.div
            className="text-2xl font-black text-muted-foreground"
            animate={isRevealing ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: isRevealing ? Infinity : 0 }}
          >
            VS
          </motion.div>

          {/* AI */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">AI</p>
            <motion.div
              className="w-24 h-24 flex items-center justify-center rounded-xl bg-muted"
              animate={
                isRevealing
                  ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                  : phase === "playing"
                  ? { rotate: [0, 5, -5, 0] }
                  : {}
              }
              transition={{
                duration: isRevealing ? 0.3 : 0.5,
                repeat: phase === "playing" ? Infinity : 0,
              }}
            >
              <AnimatePresence mode="wait">
                {isRevealing ? (
                  <motion.span
                    key="revealing"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="text-5xl"
                  >
                    {aiMove ? RPS_EMOJI[aiMove] : "🤖"}
                  </motion.span>
                ) : showResult && aiMove ? (
                  <motion.span
                    key="result"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-5xl"
                  >
                    {RPS_EMOJI[aiMove]}
                  </motion.span>
                ) : (
                  <motion.span
                    key="waiting"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-5xl"
                  >
                    🤖
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* 결과 표시 */}
        <AnimatePresence>
          {showResult && roundResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.p
                className={`text-3xl font-black ${
                  roundResult === "win"
                    ? "text-green-500"
                    : roundResult === "lose"
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
                animate={
                  roundResult === "win"
                    ? { scale: [1, 1.1, 1] }
                    : roundResult === "lose"
                    ? { x: [-5, 5, -5, 5, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                {roundResult === "win" && "승리!"}
                {roundResult === "lose" && "패배..."}
                {roundResult === "draw" && "무승부"}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 선택 버튼 */}
        {phase === "playing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {(["rock", "paper", "scissors"] as RPSMove[]).map((move, i) => (
              <motion.div
                key={move}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onPlay(move)}
                  variant="outline"
                  className="w-full h-24 flex flex-col gap-2 hover:bg-[var(--rps-primary)]/10 hover:border-[var(--rps-primary)] hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-4xl">{RPS_EMOJI[move]}</span>
                  <span className="text-xs font-medium">{RPS_NAME[move]}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
