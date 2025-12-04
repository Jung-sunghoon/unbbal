// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Box3D } from "./Box3D";
import type { BombGameState } from "@/lib/hooks/useBombGame";

interface BombGameProps {
  phase: BombGameState["phase"];
  boxes: BombGameState["boxes"];
  survivalCount: number;
  selectedBox: number | null;
  onSelectBox: (id: number) => void;
  onRevealComplete: () => void;
  onNextRound: () => void;
}

export function BombGame({
  phase,
  boxes,
  survivalCount,
  selectedBox,
  onSelectBox,
  onRevealComplete,
  onNextRound,
}: BombGameProps) {
  const isSafe = phase === "safe";
  const isExploded = phase === "exploded";
  const isRevealing = phase === "revealing";

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
              color: survivalCount >= 7 ? "#FFD700" :
                survivalCount >= 5 ? "#F59E0B" :
                  survivalCount >= 3 ? "#10B981" : "inherit"
            }}
          >
            {survivalCount} 연속 생존
          </motion.div>
          {survivalCount >= 5 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[#F59E0B]"
            >
              대단해! 계속 가보자!
            </motion.p>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="text-center mb-4 h-8">
          <AnimatePresence mode="wait">
            {phase === "playing" && (
              <motion.p
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-muted-foreground"
              >
                상자를 선택하세요 (6개 중 1개에 폭탄!)
              </motion.p>
            )}
            {isRevealing && (
              <motion.p
                key="revealing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-muted-foreground"
              >
                열리는 중...
              </motion.p>
            )}
            {isSafe && (
              <motion.p
                key="safe"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-500 font-bold text-lg"
              >
                안전! 🎉
              </motion.p>
            )}
            {isExploded && (
              <motion.p
                key="exploded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] }}
                transition={{ x: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className="text-red-500 font-bold text-lg"
              >
                펑! 💥
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* 3D 상자들 */}
        <Box3D
          boxes={boxes}
          selectedBox={selectedBox}
          phase={phase}
          onSelectBox={onSelectBox}
          onRevealComplete={onRevealComplete}
        />

        {/* 다음 라운드 버튼 */}
        <div className="mt-4 h-12">
          <AnimatePresence>
            {isSafe && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={onNextRound}
                  size="lg"
                  className="w-full bg-green-500 hover:bg-green-600"
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
