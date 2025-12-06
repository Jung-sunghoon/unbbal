// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CoinPixel } from "./CoinPixel";
import type { CoinSide, CoinFlipRecord, CoinGameState } from "@/lib/hooks/useCoinGame";

interface CoinFlipProps {
  phase: CoinGameState["phase"];
  streak: number;
  prediction: CoinSide | null;
  result: CoinSide | null;
  history: CoinFlipRecord[];
  onPredict: (side: CoinSide) => void;
  onFlip: () => void;
  onNextRound: () => void;
  onGameOver?: () => void;
}

const SIDE_LABELS: Record<CoinSide, { emoji: string; text: string }> = {
  heads: { emoji: "👑", text: "왕관" },
  tails: { emoji: "🛡️", text: "방패" },
};

export function CoinFlip({
  phase,
  streak,
  prediction,
  result,
  history,
  onPredict,
  onFlip,
  onNextRound,
  onGameOver,
}: CoinFlipProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const isCorrect = prediction === result;
  const lastRecord = history[history.length - 1];

  // 플립 시작
  useEffect(() => {
    if (phase === "flipping" && !isFlipping) {
      setIsFlipping(true);
      setShowResult(false);
      // 약간의 딜레이 후 실제 플립 실행
      setTimeout(() => {
        onFlip();
      }, 100);
    }
  }, [phase, isFlipping, onFlip]);

  const handleFlipComplete = useCallback(() => {
    setIsFlipping(false);
    setShowResult(true);
  }, []);

  // 결과 확인 후 처리
  useEffect(() => {
    if (phase === "result" && showResult && lastRecord) {
      const timer = setTimeout(() => {
        if (!lastRecord.correct) {
          onGameOver?.();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, showResult, lastRecord, onGameOver]);

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardContent className="p-6">
        {/* 연속 기록 */}
        <div className="text-center mb-4 h-14">
          <motion.div
            key={streak}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black"
            style={{
              color: streak >= 10 ? "#FFD700" :
                streak >= 7 ? "#F59E0B" :
                  streak >= 5 ? "#10B981" :
                    streak >= 3 ? "#3B82F6" : "inherit"
            }}
          >
            {streak} 연속 정답
          </motion.div>
          {streak >= 5 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-amber-500"
            >
              대단해! 운빨 폭발 중!
            </motion.p>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="text-center mb-4 h-8">
          <AnimatePresence mode="wait">
            {phase === "selecting" && (
              <motion.p
                key="selecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-muted-foreground"
              >
                앞면? 뒷면? 선택하세요!
              </motion.p>
            )}
            {phase === "flipping" && (
              <motion.p
                key="flipping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-amber-500 animate-pulse"
              >
                두근두근...
              </motion.p>
            )}
            {phase === "result" && showResult && isCorrect && (
              <motion.p
                key="correct"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-500 font-bold text-lg"
              >
                정답! 🎉
              </motion.p>
            )}
            {phase === "result" && showResult && !isCorrect && (
              <motion.p
                key="wrong"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] }}
                transition={{ x: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className="text-red-500 font-bold text-lg"
              >
                땡! 💔
              </motion.p>
            )}
            {phase === "gameover" && (
              <motion.p
                key="gameover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-500 font-bold"
              >
                게임 오버!
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* 동전 */}
        <div className="h-40 flex items-center justify-center relative">
          <CoinPixel
            result={result}
            isFlipping={isFlipping}
            onFlipComplete={handleFlipComplete}
          />

          {/* 정답 시 골드 파티클 */}
          <AnimatePresence>
            {showResult && isCorrect && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`star-${i}`}
                    className="absolute pointer-events-none text-yellow-400"
                    style={{
                      left: "50%",
                      top: "50%",
                      fontSize: `${14 + Math.random() * 10}px`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: (Math.random() - 0.5) * 120,
                      y: (Math.random() - 0.5) * 120,
                      opacity: [1, 1, 0],
                      scale: [0, 1.2, 0],
                      rotate: [0, 360],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    {i % 2 === 0 ? "✦" : "★"}
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* 예측 표시 */}
        <div className="text-center mb-4 h-6">
          {prediction && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground"
            >
              내 선택: {SIDE_LABELS[prediction].emoji} {SIDE_LABELS[prediction].text}
            </motion.p>
          )}
        </div>

        {/* 히스토리 */}
        {history.length > 0 && (
          <div className="flex justify-center gap-1 mb-6 flex-wrap">
            {history.map((record, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  record.correct
                    ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
                }`}
              >
                {record.correct ? "O" : "X"}
              </motion.div>
            ))}
          </div>
        )}

        {/* 버튼들 */}
        <div className="h-12">
          {/* 선택 버튼 */}
          {phase === "selecting" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={() => onPredict("heads")}
                  size="lg"
                  className="w-full bg-amber-500 hover:bg-amber-600 hover:shadow-lg transition-all duration-200"
                >
                  👑 왕관
                </Button>
              </motion.div>
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={() => onPredict("tails")}
                  size="lg"
                  className="w-full bg-slate-500 hover:bg-slate-600 hover:shadow-lg transition-all duration-200"
                >
                  🛡️ 방패
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* 다음 라운드 버튼 */}
          {phase === "result" && showResult && isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onNextRound}
                size="lg"
                className="w-full bg-green-500 hover:bg-green-600 hover:shadow-lg transition-all duration-200"
              >
                다음 라운드! ({streak + 1}번째)
              </Button>
            </motion.div>
          )}

          {/* 플리핑 중 */}
          {phase === "flipping" && (
            <div className="text-center text-muted-foreground">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                🪙
              </motion.span>
              {" "}던지는 중...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
