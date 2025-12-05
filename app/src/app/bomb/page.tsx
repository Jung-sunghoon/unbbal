// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { WireBombGame } from "@/components/luck/WireBombGame";
import { useWireBombGame } from "@/lib/hooks/useWireBombGame";

export default function BombPage() {
  const router = useRouter();
  const [gamePhase, setGamePhase] = useState<"intro" | "playing" | "gameover">("intro");
  const {
    phase,
    wires,
    survivalCount,
    lastCutWire,
    startGame,
    cutWire,
    confirmCut,
    nextRound,
  } = useWireBombGame();

  // 폭발시 phase 변경
  useEffect(() => {
    if (phase === "exploded" && gamePhase === "playing") {
      setGamePhase("gameover");
    }
  }, [phase, gamePhase]);

  // gameover 상태에서 결과 페이지로 이동
  useEffect(() => {
    if (gamePhase === "gameover") {
      const timer = setTimeout(() => {
        router.push(`/bomb/result?survival=${survivalCount}`);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, survivalCount, router]);

  const handleStart = () => {
    startGame();
    setGamePhase("playing");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">💣 폭탄 해제</h1>
          <p className="text-muted-foreground">
            올바른 순서로 선을 잘라 폭탄을 해제하라!
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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              💣
            </motion.div>

            <div className="w-full p-4 rounded-lg bg-muted">
              <h3 className="font-medium mb-3 text-center">게임 규칙</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span>🌈</span>
                  7개의 무지개 색 전선이 연결되어 있어요
                </li>
                <li className="flex items-center gap-2">
                  <span>✂️</span>
                  힌트를 보고 올바른 순서로 전선을 자르세요
                </li>
                <li className="flex items-center gap-2">
                  <span>💥</span>
                  순서가 틀리면 폭발!
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  7개 전선을 모두 자르면 폭탄 해제 성공!
                </p>
              </div>
            </div>

            <Button
              onClick={handleStart}
              size="lg"
              className="w-full bg-red-500 hover:bg-red-600"
            >
              폭탄 해제 시작!
            </Button>
          </motion.div>
        )}

        {/* 게임 플레이 */}
        {gamePhase === "playing" && phase !== "exploded" && (
          <WireBombGame
            phase={phase}
            wires={wires}
            survivalCount={survivalCount}
            lastCutWire={lastCutWire}
            onCutWire={cutWire}
            onCutComplete={confirmCut}
            onNextRound={nextRound}
          />
        )}

        {/* 게임 오버 */}
        {gamePhase === "gameover" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <WireBombGame
              phase={phase}
              wires={wires}
              survivalCount={survivalCount}
              lastCutWire={lastCutWire}
              onCutWire={() => {}}
              onCutComplete={() => {}}
              onNextRound={() => {}}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <p className="text-muted-foreground mt-2">결과 페이지로 이동 중...</p>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
