// © 2025 운빨(unbbal). All rights reserved.

"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EnhanceGameState, EnhanceResult } from "@/lib/hooks/useEnhanceGame";

// SSR에서 Three.js 로드 방지
const Item3D = dynamic(() => import("./Item3D").then(mod => ({ default: mod.Item3D })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg">
      <span className="text-4xl animate-pulse">⚔️</span>
    </div>
  ),
});

interface EnhanceGameProps {
  phase: EnhanceGameState["phase"];
  level: number;
  maxLevel: number;
  attemptCount: number;
  lastResult: EnhanceResult | null;
  rates: { success: number; fail: number; destroy: number };
  onEnhance: () => void;
  onConfirm: () => void;
  onStop: () => void;
}

// 레벨별 색상
function getLevelColor(level: number): string {
  if (level >= 15) return "#FFD700";
  if (level >= 12) return "#FF6B35";
  if (level >= 10) return "#A855F7";
  if (level >= 7) return "#3B82F6";
  if (level >= 4) return "#22C55E";
  return "#9CA3AF";
}

export function EnhanceGame({
  phase,
  level,
  maxLevel,
  attemptCount,
  lastResult,
  rates,
  onEnhance,
  onConfirm,
  onStop,
}: EnhanceGameProps) {
  const levelColor = getLevelColor(level);
  const isEnhancing = phase === "enhancing";
  const isPlaying = phase === "playing";
  const isDestroyed = phase === "destroyed";

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden">
      <CardContent className="p-6">
        {/* 강화 수치 */}
        <div className="text-center mb-4">
          <motion.div
            key={level}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black"
            style={{ color: levelColor }}
          >
            +{level}
          </motion.div>
          <p className="text-sm text-muted-foreground mt-1">
            시도 횟수: {attemptCount}회
          </p>
        </div>

        {/* 결과 메시지 */}
        <div className="text-center mb-4 h-8">
          <AnimatePresence mode="wait">
            {isEnhancing && (
              <motion.p
                key="enhancing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-yellow-500 font-medium"
              >
                강화 중...
              </motion.p>
            )}
            {isPlaying && lastResult === "success" && (
              <motion.p
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-green-500 font-bold text-lg"
              >
                성공! ✨
              </motion.p>
            )}
            {isPlaying && lastResult === "fail" && (
              <motion.p
                key="fail"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-400 font-bold text-lg"
              >
                실패... 😢
              </motion.p>
            )}
            {isDestroyed && (
              <motion.p
                key="destroyed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] }}
                transition={{ x: { duration: 0.5 } }}
                exit={{ opacity: 0 }}
                className="text-red-500 font-bold text-xl"
              >
                파괴! 💥
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* 3D 아이템 */}
        <Item3D level={level} phase={phase} lastResult={lastResult} />

        {/* 확률 표시 */}
        {!isDestroyed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted rounded-lg p-3 mb-4"
          >
            <p className="text-sm text-center text-muted-foreground mb-2">
              +{level} → +{level + 1} 강화 확률
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-green-500">성공 {rates.success}%</span>
              <span className="text-yellow-500">실패 {rates.fail}%</span>
              {rates.destroy > 0 && (
                <span className="text-red-500">파괴 {rates.destroy}%</span>
              )}
            </div>
            {level >= 7 && (
              <p className="text-xs text-center text-red-400 mt-2">
                ⚠️ 파괴 시 게임 오버!
              </p>
            )}
          </motion.div>
        )}

        {/* 버튼들 */}
        <div className="space-y-3">
          {isEnhancing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onConfirm}
                size="lg"
                className="w-full bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg transition-all duration-200"
              >
                결과 확인
              </Button>
            </motion.div>
          )}

          {isPlaying && !isEnhancing && (
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
                  onClick={onEnhance}
                  size="lg"
                  className="w-full transition-all duration-200 hover:shadow-lg hover:brightness-110"
                  style={{
                    backgroundColor: levelColor,
                    boxShadow: `0 0 0 0 ${levelColor}40`
                  }}
                >
                  강화하기
                </Button>
              </motion.div>
              {level > 0 && (
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={onStop}
                    size="lg"
                    variant="outline"
                    className="w-full transition-all duration-200 hover:shadow-md hover:bg-muted"
                  >
                    여기서 멈추기
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
