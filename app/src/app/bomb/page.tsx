// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { BombGame } from "@/components/luck/BombGame";
import { useBombGame } from "@/lib/hooks/useBombGame";
import { useScreenShake } from "@/lib/hooks/useScreenShake";

const BOMB_FRAMES = [
  "/dotImg/bomb/1.png",
  "/dotImg/bomb/2.png",
  "/dotImg/bomb/3.png",
  "/dotImg/bomb/4.png",
  "/dotImg/bomb/5.png",
  "/dotImg/bomb/6.png",
  "/dotImg/bomb/7.png",
  "/dotImg/bomb/8.png",
  "/dotImg/bomb/9.png",
  "/dotImg/bomb/10.png",
];

export default function BombPage() {
  const router = useRouter();
  const [gamePhase, setGamePhase] = useState<"intro" | "playing" | "gameover">("intro");
  const [bombFrame, setBombFrame] = useState(0);
  const { shakeStyle, shake } = useScreenShake();

  // 인트로 폭탄 애니메이션
  useEffect(() => {
    if (gamePhase !== "intro") return;
    const interval = setInterval(() => {
      setBombFrame((prev) => (prev + 1) % BOMB_FRAMES.length);
    }, 100);
    return () => clearInterval(interval);
  }, [gamePhase]);

  const {
    phase,
    boxes,
    survivalCount,
    selectedBox,
    bombCount,
    startGame,
    selectBox,
    confirmResult,
    nextRound,
  } = useBombGame();

  // 폭발시 phase 변경 + 화면 흔들림
  useEffect(() => {
    if (phase === "exploded" && gamePhase === "playing") {
      shake("heavy");
      setGamePhase("gameover");
    }
  }, [phase, gamePhase, shake]);

  // gameover 상태에서 결과 페이지로 이동
  useEffect(() => {
    if (gamePhase === "gameover") {
      const timer = setTimeout(() => {
        sessionStorage.setItem("bomb_completed", "true");
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
    <div className="flex min-h-screen flex-col bg-background" style={shakeStyle}>
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">💣 폭탄 피하기</h1>
          <p className="text-muted-foreground">
            진짜 폭탄을 피해라! 점점 어려워져!
          </p>
        </header>

        {/* 인트로 */}
        {gamePhase === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 max-w-md mx-auto"
          >
            <div className="relative">
              <img
                src={BOMB_FRAMES[bombFrame]}
                alt="폭탄"
                className="w-24 h-24"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            <div className="w-full p-4 rounded-lg bg-muted">
              <h3 className="font-medium mb-3 text-center">게임 규칙</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span>💣</span>
                  6개의 폭탄 중 진짜를 피하세요!
                </li>
                <li className="flex items-center gap-2">
                  <span>📈</span>
                  5라운드마다 진짜 폭탄 +1 (최대 4개)
                </li>
                <li className="flex items-center gap-2">
                  <span>💥</span>
                  진짜 폭탄을 고르면 펑!
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  몇 라운드나 생존할 수 있을까?
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
                className="w-full bg-red-500 hover:bg-red-600 hover:shadow-lg transition-all duration-200"
              >
                게임 시작!
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* 게임 플레이 */}
        {gamePhase === "playing" && phase !== "exploded" && (
          <BombGame
            phase={phase}
            boxes={boxes}
            survivalCount={survivalCount}
            selectedBox={selectedBox}
            bombCount={bombCount}
            onSelectBox={selectBox}
            onRevealComplete={confirmResult}
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
            <BombGame
              phase={phase}
              boxes={boxes}
              survivalCount={survivalCount}
              selectedBox={selectedBox}
              bombCount={bombCount}
              onSelectBox={() => {}}
              onRevealComplete={() => {}}
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
