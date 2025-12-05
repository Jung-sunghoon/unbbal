// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WireState } from "@/lib/hooks/useWireBombGame";

// SSR에서 Three.js 로드 방지
const WireBomb3D = dynamic(() => import("./WireBomb3D").then(mod => ({ default: mod.WireBomb3D })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 sm:h-80 flex items-center justify-center bg-muted rounded-lg">
      <span className="text-4xl animate-pulse">💣</span>
    </div>
  ),
});

interface WireBombGameProps {
  phase: "ready" | "playing" | "cutting" | "safe" | "exploded";
  wires: WireState[];
  survivalCount: number;
  lastCutWire: number | null;
  onCutWire: (wireId: number) => void;
  onCutComplete: () => void;
  onNextRound: () => void;
}

export function WireBombGame({
  phase,
  wires,
  survivalCount,
  lastCutWire,
  onCutWire,
  onCutComplete,
  onNextRound,
}: WireBombGameProps) {
  const isSafe = phase === "safe";
  const isExploded = phase === "exploded";
  const isCutting = phase === "cutting";
  const hasCalledComplete = useRef(false);

  // 안전장치: cutting 상태가 2초 이상 지속되면 강제로 완료 처리
  useEffect(() => {
    if (isCutting) {
      hasCalledComplete.current = false;
      const safetyTimer = setTimeout(() => {
        if (!hasCalledComplete.current) {
          hasCalledComplete.current = true;
          onCutComplete();
        }
      }, 2000);
      return () => clearTimeout(safetyTimer);
    }
  }, [isCutting, onCutComplete]);

  const handleCutComplete = () => {
    if (!hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onCutComplete();
    }
  };

  // 잘린 선 개수
  const cutCount = wires.filter(w => w.isCut).length;
  const progress = (cutCount / 7) * 100;

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden">
      <CardContent className="p-6">
        {/* 생존 카운터 */}
        <div className="text-center mb-4">
          <motion.div
            key={survivalCount}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black"
            style={{
              color: survivalCount >= 5 ? "#FFD700" :
                survivalCount >= 3 ? "#F59E0B" :
                  survivalCount >= 1 ? "#10B981" : "inherit"
            }}
          >
            {survivalCount} 라운드 클리어
          </motion.div>
        </div>

        {/* 진행률 바 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">해제 진행률</span>
            <span className="text-sm text-muted-foreground">{cutCount}/7</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full"
              style={{
                background: "linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)"
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="text-center mb-4 min-h-[60px]">
          <AnimatePresence mode="wait">
            {phase === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-1"
              >
                <p className="text-lg font-medium">어떤 선을 자를까요? ✂️</p>
                <p className="text-sm text-muted-foreground">
                  남은 선: {7 - cutCount}개 중 1개가 폭탄!
                </p>
              </motion.div>
            )}
            {isCutting && (
              <motion.p
                key="cutting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-muted-foreground"
              >
                ✂️ 자르는 중...
              </motion.p>
            )}
            {isSafe && (
              <motion.div
                key="safe"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-500"
              >
                <p className="font-bold text-xl">🎉 폭탄 해제 성공!</p>
                <p className="text-sm">모든 선을 올바른 순서로 잘랐습니다!</p>
              </motion.div>
            )}
            {isExploded && (
              <motion.div
                key="exploded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] }}
                transition={{ x: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className="text-red-500"
              >
                <p className="font-bold text-xl">💥 펑!</p>
                <p className="text-sm">잘못된 선을 잘랐습니다!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3D 폭탄 */}
        <WireBomb3D
          wires={wires}
          phase={phase}
          lastCutWire={lastCutWire}
          onCutWire={onCutWire}
          onCutComplete={handleCutComplete}
        />

        {/* 전선 상태 표시 */}
        <div className="flex justify-center gap-1 mt-4 flex-wrap">
          {wires.map((wire) => (
            <motion.div
              key={wire.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                wire.isCut
                  ? wire.isCorrect
                    ? "border-green-500 bg-green-500/20"
                    : "border-red-500 bg-red-500/20"
                  : "border-transparent"
              }`}
              style={{
                backgroundColor: wire.isCut ? undefined : wire.color,
                opacity: wire.isCut ? 0.5 : 1,
              }}
            >
              {wire.isCut && (wire.isCorrect ? "✓" : "✗")}
            </motion.div>
          ))}
        </div>

        {/* 다음 라운드 버튼 */}
        <div className="mt-4 h-12">
          <AnimatePresence>
            {isSafe && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onNextRound}
                  size="lg"
                  className="w-full bg-green-500 hover:bg-green-600 hover:shadow-lg transition-all duration-200"
                >
                  다음 라운드 도전! ({survivalCount + 1}번째)
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
