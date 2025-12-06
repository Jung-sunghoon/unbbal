// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { EnhanceGame } from "@/components/luck/EnhanceGame";
import { useEnhanceGame } from "@/lib/hooks/useEnhanceGame";
import { useScreenShake } from "@/lib/hooks/useScreenShake";
import { calculateCumulativeProbability } from "@/lib/enhance-probability";

export default function EnhancePage() {
  const router = useRouter();
  const [gamePhase, setGamePhase] = useState<"intro" | "playing" | "ending">("intro");
  const { shakeStyle, shake } = useScreenShake();
  const {
    phase,
    level,
    maxLevel,
    attemptCount,
    failStack,
    maxFailStack,
    lastResult,
    rates,
    stackBonus,
    startGame,
    enhance,
    confirmResult,
    stopGame,
  } = useEnhanceGame();

  // 파괴 또는 종료 시 phase 변경 + 화면 흔들림
  useEffect(() => {
    if ((phase === "destroyed" || phase === "result") && gamePhase === "playing") {
      if (phase === "destroyed") {
        shake("heavy");
      }
      setGamePhase("ending");
    }
  }, [phase, gamePhase, shake]);

  // ending 상태에서 결과 저장 및 이동
  useEffect(() => {
    if (gamePhase === "ending") {
      const delay = phase === "destroyed" ? 2000 : 500;
      const timer = setTimeout(async () => {
        try {
          const res = await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameType: "enhance",
              score: maxLevel,
              metadata: {
                attempts: attemptCount,
                maxFailStack: maxFailStack,
                cumulativeProbability: calculateCumulativeProbability(maxLevel),
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
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, phase, maxLevel, attemptCount, maxFailStack, router]);

  const handleStart = () => {
    startGame();
    setGamePhase("playing");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" style={shakeStyle}>
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">⚔️ 강화 시뮬레이터</h1>
          <p className="text-muted-foreground">
            몇 강까지 올릴 수 있을까?
          </p>
        </header>

        {/* 인트로 */}
        {gamePhase === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 max-w-md mx-auto"
          >
            <motion.div
              className="text-8xl"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚔️
            </motion.div>

            <div className="w-full p-4 rounded-lg bg-muted">
              <h3 className="font-medium mb-3 text-center">게임 규칙</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span>📈</span>
                  +0에서 시작해서 강화 도전
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span>
                  성공하면 강화 수치 +1
                </li>
                <li className="flex items-center gap-2">
                  <span>❌</span>
                  실패하면 수치 유지
                </li>
                <li className="flex items-center gap-2">
                  <span>💥</span>
                  <span className="text-red-400">+7부터 파괴 확률 등장!</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🔥</span>
                  <span className="text-orange-400">실패마다 성공률 +2% (최대 +20%)</span>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  천장 시스템: 연속 실패하면 성공률이 올라가요!
                </p>
              </div>
            </div>

            <div className="w-full p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2 text-center">강화 확률</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-muted-foreground">+0~+6:</div>
                <div className="text-green-500">70% 성공</div>
                <div className="text-muted-foreground">+7~+9:</div>
                <div><span className="text-green-500">50%</span> / <span className="text-red-400">20% 파괴</span></div>
                <div className="text-muted-foreground">+10~+14:</div>
                <div><span className="text-green-500">30%</span> / <span className="text-red-400">30% 파괴</span></div>
                <div className="text-muted-foreground">+15~+19:</div>
                <div><span className="text-green-500">10%</span> / <span className="text-red-400">50% 파괴</span></div>
                <div className="text-muted-foreground">+20~+24:</div>
                <div><span className="text-green-500">5%</span> / <span className="text-red-400">60% 파괴</span></div>
                <div className="text-muted-foreground">+25~+29:</div>
                <div><span className="text-green-500">3%</span> / <span className="text-red-400">70% 파괴</span></div>
                <div className="text-muted-foreground">+30:</div>
                <div><span className="text-green-500">1%</span> / <span className="text-red-400">80% 파괴</span></div>
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
                className="w-full bg-purple-500 hover:bg-purple-600 hover:shadow-lg transition-all duration-200"
              >
                강화 시작!
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* 게임 플레이 */}
        {gamePhase === "playing" && phase !== "destroyed" && phase !== "result" && (
          <EnhanceGame
            phase={phase}
            level={level}
            maxLevel={maxLevel}
            attemptCount={attemptCount}
            failStack={failStack}
            lastResult={lastResult}
            rates={rates}
            stackBonus={stackBonus}
            onEnhance={enhance}
            onConfirm={confirmResult}
            onStop={stopGame}
          />
        )}

        {/* 게임 오버 */}
        {gamePhase === "ending" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <EnhanceGame
              phase={phase}
              level={level}
              maxLevel={maxLevel}
              attemptCount={attemptCount}
              failStack={failStack}
              lastResult={lastResult}
              rates={rates}
              stackBonus={stackBonus}
              onEnhance={() => {}}
              onConfirm={() => {}}
              onStop={() => {}}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              {phase === "destroyed" ? (
                <>
                  <p className="text-red-500 text-2xl font-bold">💥 파괴됨!</p>
                  <p className="text-muted-foreground mt-2">결과 페이지로 이동 중...</p>
                </>
              ) : (
                <>
                  <p className="text-green-500 text-xl font-bold">저장 완료!</p>
                  <p className="text-muted-foreground mt-2">결과 페이지로 이동 중...</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
