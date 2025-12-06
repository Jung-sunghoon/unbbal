// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { RPSGame } from "@/components/rps/RPSGame";
import { useRPSGame } from "@/lib/hooks/useRPSGame";
import { useScreenShake } from "@/lib/hooks/useScreenShake";

export default function RPSPage() {
  const router = useRouter();
  const { shakeStyle, shake } = useScreenShake();
  const {
    phase,
    streak,
    playerMove,
    aiMove,
    roundResult,
    aiMood,
    aiMessage,
    aiName,
    startGame,
    play,
    nextRound,
  } = useRPSGame();

  // 게임 오버시 화면 흔들림 + 결과 저장 및 이동
  useEffect(() => {
    if (phase === "gameover") {
      shake("medium");
      const timer = setTimeout(async () => {
        try {
          const res = await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameType: "rps",
              score: streak,
              metadata: { totalRounds: streak + 1 },
            }),
          });
          const data = await res.json();
          if (data.id) {
            router.push(`/result/${data.id}`);
          }
        } catch (error) {
          console.error("Failed to save result:", error);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, streak, router, shake]);

  return (
    <div className="flex min-h-screen flex-col bg-background" style={shakeStyle}>
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 돌아가기
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">AI 가위바위보</h1>
          <p className="text-muted-foreground">
            {aiName}에게 도전하라!
          </p>
        </header>

        {phase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 max-w-md mx-auto"
          >
            {/* AI 소개 */}
            <div className="text-center space-y-4">
              <motion.div
                className="text-8xl"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                😏
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">{aiName}</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  "{aiMessage}"
                </p>
              </div>
            </div>

            {/* 규칙 */}
            <div className="w-full p-4 rounded-lg bg-muted">
              <h3 className="font-medium mb-3 text-center">도전 규칙</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  이기면 연승 +1
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">-</span>
                  비기면 연승 유지
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✗</span>
                  지면 게임 오버!
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                AI는 당신의 패턴을 학습합니다
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                onClick={startGame}
                size="lg"
                className="w-full bg-[var(--rps-primary)] hover:bg-[var(--rps-primary)]/90 hover:shadow-lg transition-all duration-200"
              >
                도전 시작
              </Button>
            </motion.div>
          </motion.div>
        )}

        {(phase === "playing" || phase === "revealing" || phase === "result") && (
          <div className="space-y-6">
            <RPSGame
              streak={streak}
              playerMove={playerMove}
              aiMove={aiMove}
              roundResult={roundResult}
              phase={phase}
              aiMood={aiMood}
              aiMessage={aiMessage}
              aiName={aiName}
              onPlay={play}
            />

            {phase === "result" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex justify-center"
              >
                <Button
                  onClick={nextRound}
                  size="lg"
                  className="bg-[var(--rps-primary)] hover:bg-[var(--rps-primary)]/90 hover:shadow-lg transition-all duration-200"
                >
                  다음 라운드
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {phase === "gameover" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <RPSGame
              streak={streak}
              playerMove={playerMove}
              aiMove={aiMove}
              roundResult={roundResult}
              phase={phase}
              aiMood={aiMood}
              aiMessage={aiMessage}
              aiName={aiName}
              onPlay={() => {}}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="text-center space-y-2"
            >
              <p className="text-muted-foreground">결과 페이지로 이동 중...</p>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
