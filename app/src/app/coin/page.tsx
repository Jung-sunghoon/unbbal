// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { CoinFlip } from "@/components/luck/CoinFlip";
import { useCoinGame } from "@/lib/hooks/useCoinGame";
import { useScreenShake } from "@/lib/hooks/useScreenShake";

export default function CoinPage() {
  const router = useRouter();
  const [gamePhase, setGamePhase] = useState<"intro" | "playing" | "ending">("intro");
  const { phase, streak, prediction, result, history, startGame, predict, flip, nextRound, reset } = useCoinGame();
  const { shake, shakeStyle } = useScreenShake();

  const handleStart = () => {
    reset();
    startGame();
    setGamePhase("playing");
  };

  const handleGameOver = useCallback(() => {
    shake("medium");
    setGamePhase("ending");
  }, [shake]);

  // 결과 저장 및 페이지 이동
  useEffect(() => {
    if (gamePhase === "ending") {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameType: "coin",
              score: streak,
              metadata: {
                history: history.map(h => ({
                  prediction: h.prediction,
                  result: h.result,
                  correct: h.correct,
                })),
              },
            }),
          });
          const data = await res.json();
          if (data.id) {
            router.push(`/result/${data.id}`);
          }
        } catch (error) {
          console.error("Failed to save result:", error);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, streak, history, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background" style={shakeStyle}>
        <main className="flex-1 container mx-auto px-4 py-12">
          <header className="text-center mb-8">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              ← 메인으로
            </Link>
            <h1 className="text-3xl font-bold mt-4 mb-2">🪙 동전 던지기</h1>
            <p className="text-muted-foreground">
              앞면? 뒷면? 운빨로 맞춰봐!
            </p>
          </header>

          {/* 인트로 화면 */}
          {gamePhase === "intro" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 max-w-md mx-auto"
            >
              <motion.div
                className="text-8xl"
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                🪙
              </motion.div>

              <div className="w-full p-4 rounded-lg bg-muted">
                <h3 className="font-medium mb-3 text-center">게임 규칙</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span>👑</span>
                    동전의 앞면(왕관) 또는 뒷면(방패)을 예측
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🎯</span>
                    맞추면 다음 라운드, 틀리면 게임 오버
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🔥</span>
                    <span className="text-amber-600 dark:text-amber-400">연속으로 맞출수록 높은 점수!</span>
                  </li>
                </ul>
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground">
                    순수 50:50 확률, 오직 운빨!
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="w-full bg-amber-500 hover:bg-amber-600 hover:shadow-lg transition-all duration-200"
                >
                  시작하기
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* 게임 플레이 */}
          {gamePhase === "playing" && (
            <CoinFlip
              phase={phase}
              streak={streak}
              prediction={prediction}
              result={result}
              history={history}
              onPredict={predict}
              onFlip={flip}
              onNextRound={nextRound}
              onGameOver={handleGameOver}
            />
          )}

          {/* 엔딩 화면 */}
          {gamePhase === "ending" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-xl font-bold text-muted-foreground">
                결과 저장 중...
              </p>
            </motion.div>
          )}
        </main>

        <Footer />
    </div>
  );
}
