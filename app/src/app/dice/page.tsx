// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { DiceRoll } from "@/components/luck/DiceRoll";
import { useDiceGame } from "@/lib/hooks/useDiceGame";

export default function DicePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "playing">("intro");
  const { rolls, rollCount, currentRoll, sum, roll, reset } = useDiceGame();

  const handleStart = () => {
    reset();
    setPhase("playing");
  };

  const handleComplete = useCallback(async () => {
    // 애니메이션 끝난 후 결과 저장 및 이동
    setTimeout(async () => {
      try {
        const res = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameType: "dice",
            score: sum,
            metadata: { rolls },
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
  }, [router, sum, rolls]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🎲 주사위 굴리기</h1>
          <p className="text-muted-foreground">
            10번 굴려서 운빨을 측정해봐!
          </p>
        </header>

        {/* 인트로 화면 */}
        {phase === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 max-w-md mx-auto"
          >
            <motion.div
              className="text-8xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎲
            </motion.div>

            <div className="w-full p-4 rounded-lg bg-muted">
              <h3 className="font-medium mb-3 text-center">게임 규칙</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span>🎯</span>
                  주사위를 10번 굴려요
                </li>
                <li className="flex items-center gap-2">
                  <span>➕</span>
                  나온 숫자의 합계로 등급 결정
                </li>
                <li className="flex items-center gap-2">
                  <span>📊</span>
                  평균: 35 / 최대: 60
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  40점 이상이면 꽤 좋은 운빨!
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
                className="w-full bg-[var(--luck-primary)] hover:bg-[var(--luck-primary)]/90 hover:shadow-lg transition-all duration-200"
              >
                시작하기
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* 게임 플레이 */}
        {phase === "playing" && (
          <DiceRoll
            rollCount={rollCount}
            currentRoll={currentRoll}
            totalSum={sum}
            rolls={rolls}
            onRoll={roll}
            onComplete={handleComplete}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
