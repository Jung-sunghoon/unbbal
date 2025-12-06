// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DicePixel } from "./DicePixel";
import type { DiceRollInfo } from "@/lib/hooks/useDiceGame";

interface DiceRollProps {
  rollCount: number;
  baseRollCount: number;
  currentRoll: number;
  totalSum: number;
  rolls: DiceRollInfo[];
  bonusCount: number;
  isBonusRoll: boolean;
  onRoll: () => void;
  onComplete?: () => void;
}

// 굴린 숫자에 따른 반응
function getRollReaction(value: number): { emoji: string; text: string; color: string } {
  if (value === 6) return { emoji: "🔥", text: "완벽!", color: "#F59E0B" };
  if (value === 5) return { emoji: "✨", text: "좋아!", color: "#10B981" };
  if (value === 4) return { emoji: "👍", text: "괜찮아", color: "#3B82F6" };
  if (value === 3) return { emoji: "😐", text: "보통", color: "#6B7280" };
  if (value === 2) return { emoji: "😅", text: "아쉬워", color: "#9370DB" };
  return { emoji: "💀", text: "으악", color: "#DC143C" };
}

export function DiceRoll({ rollCount, baseRollCount, currentRoll, totalSum, rolls, bonusCount, isBonusRoll, onRoll, onComplete }: DiceRollProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [displaySum, setDisplaySum] = useState(0);
  const [floatingNumber, setFloatingNumber] = useState<{ value: number; key: number; isBonus?: boolean } | null>(null);
  const [showReaction, setShowReaction] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showBonusGain, setShowBonusGain] = useState(false);
  const prevRollRef = useRef(0);
  const keyRef = useRef(0);
  const isBaseComplete = baseRollCount >= 10;
  const isComplete = isBaseComplete && bonusCount === 0;

  const handleRoll = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    setShowReaction(false);
    setShowBonusGain(false);
    onRoll();
  }, [isRolling, onRoll]);

  // currentRoll이 변경되면 애니메이션 시작
  useEffect(() => {
    if (currentRoll > 0 && currentRoll !== prevRollRef.current) {
      prevRollRef.current = currentRoll;
      setIsRolling(true);
      setFloatingNumber(null);

      // 안전장치: 3D 애니메이션이 2.5초 내에 완료되지 않으면 강제 완료
      const safetyTimer = setTimeout(() => {
        setIsRolling(prev => {
          if (prev) {
            // 아직 rolling 상태면 강제로 완료 처리
            setDisplaySum(totalSum);
            keyRef.current += 1;
            setFloatingNumber({ value: currentRoll, key: keyRef.current });
            setShowReaction(true);
            return false;
          }
          return prev;
        });
      }, 2500);

      return () => clearTimeout(safetyTimer);
    }
  }, [currentRoll, totalSum]);

  const handleRollComplete = useCallback(() => {
    setIsRolling(false);
    setDisplaySum(totalSum);
    keyRef.current += 1;
    setFloatingNumber({ value: currentRoll, key: keyRef.current, isBonus: isBonusRoll });
    setShowReaction(true);

    // 6이 나오면 보너스 획득 알림 표시
    if (currentRoll === 6) {
      setShowBonusGain(true);
    }

    // 기본 10회 완료 + 보너스 없음이면 게임 완료
    if (isComplete) {
      setIsFinished(true);
      onComplete?.();
    }
  }, [totalSum, currentRoll, isBonusRoll, isComplete, onComplete]);

  const reaction = getRollReaction(currentRoll);
  const progress = Math.min((baseRollCount / 10) * 100, 100);

  // 평균 계산 (35가 기대값, 기본 10회 기준)
  const average = baseRollCount > 0 ? (totalSum / rollCount).toFixed(1) : "0";
  const isAboveAverage = rollCount > 0 && totalSum / rollCount > 3.5;

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardContent className="p-6">
        {/* 프로그레스 바 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">진행률</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{baseRollCount}/10</span>
              {bonusCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-medium text-amber-500"
                >
                  +{bonusCount} 보너스
                </motion.span>
              )}
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--luck-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* 보너스 획득 알림 */}
        <AnimatePresence>
          {showBonusGain && !isRolling && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-center"
            >
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                🎁 보너스 굴림 획득!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 픽셀아트 주사위 */}
        <div className="h-44 flex items-center justify-center relative overflow-visible">
          <DicePixel
            value={currentRoll > 0 ? currentRoll : 1}
            isRolling={isRolling}
            onRollComplete={handleRollComplete}
          />

          {/* 6 나왔을 때 황금 스파클 효과 */}
          <AnimatePresence>
            {showReaction && !isRolling && currentRoll === 6 && (
              <>
                {/* 황금 광채 */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  style={{
                    background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)",
                  }}
                />
                {/* 황금 별 파티클 */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`gold-star-${i}`}
                    className="absolute pointer-events-none text-yellow-400"
                    style={{
                      left: "50%",
                      top: "50%",
                      fontSize: `${16 + Math.random() * 12}px`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: (Math.random() - 0.5) * 150,
                      y: (Math.random() - 0.5) * 150,
                      opacity: [1, 1, 0],
                      scale: [0, 1.5, 0],
                      rotate: [0, 360],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    {i % 3 === 0 ? "★" : i % 3 === 1 ? "✦" : "✧"}
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* 1 나왔을 때 어둠 효과 */}
          <AnimatePresence>
            {showReaction && !isRolling && currentRoll === 1 && (
              <>
                {/* 어두운 안개 */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  style={{
                    background: "radial-gradient(circle, rgba(50,0,0,0.4) 0%, transparent 70%)",
                  }}
                />
                {/* 해골 이모지 떨어짐 */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`skull-${i}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${20 + (i * 12)}%`,
                      top: "0%",
                      fontSize: "20px",
                    }}
                    initial={{ y: -20, opacity: 0, rotate: 0 }}
                    animate={{
                      y: [0, 120],
                      opacity: [0, 1, 1, 0],
                      rotate: [0, (Math.random() - 0.5) * 60],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      ease: "easeIn",
                    }}
                  >
                    💀
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* 반응 이모지 */}
          <AnimatePresence>
            {showReaction && !isRolling && currentRoll > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-2 right-4 text-center"
              >
                <span className="text-3xl">{reaction.emoji}</span>
                <p className="text-xs font-medium" style={{ color: reaction.color }}>
                  {reaction.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 합계 & 통계 */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <p className="text-sm text-muted-foreground mb-1">현재 합계</p>
            <motion.p
              key={displaySum}
              initial={displaySum > 0 ? { scale: 1.3 } : false}
              animate={{ scale: 1 }}
              className="text-5xl font-black"
              style={{
                color: displaySum >= 40 ? "#F59E0B" : displaySum >= 30 ? "#10B981" : "inherit"
              }}
            >
              {displaySum}
            </motion.p>

            {/* 떠오르는 숫자 효과 */}
            <AnimatePresence>
              {floatingNumber && (
                <motion.span
                  key={floatingNumber.key}
                  initial={{ opacity: 1, y: 0, x: 20 }}
                  animate={{ opacity: 0, y: -50 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute left-full top-1/2 -translate-y-1/2 text-2xl font-bold whitespace-nowrap"
                  style={{ color: reaction.color }}
                >
                  +{floatingNumber.value}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* 평균 표시 */}
          {rollCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm mt-2 ${isAboveAverage ? "text-green-500" : "text-muted-foreground"}`}
            >
              평균: {average} {isAboveAverage ? "↑" : ""}
            </motion.p>
          )}
        </div>

        {/* 히스토리 (미니 주사위) - 롤링 중에는 마지막 값 숨김 */}
        {rolls.length > 0 && (
          <div className="flex justify-center gap-1 mb-6 flex-wrap">
            {(isRolling ? rolls.slice(0, -1) : rolls).map((rollInfo, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold relative ${
                  rollInfo.value >= 5 ? "bg-[var(--luck-primary)] text-white" :
                  rollInfo.value <= 2 ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400" :
                  "bg-muted"
                } ${rollInfo.isBonus ? "ring-2 ring-amber-400" : ""}`}
              >
                {rollInfo.value}
                {rollInfo.isBonus && (
                  <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* 굴리기 버튼 */}
        <div className="h-12">
          {!isFinished ? (
            <motion.div
              whileHover={!isRolling && !isComplete ? { scale: 1.02 } : {}}
              whileTap={!isRolling && !isComplete ? { scale: 0.98 } : {}}
            >
              <Button
                onClick={handleRoll}
                disabled={isRolling || isComplete}
                size="lg"
                className={`w-full transition-all duration-200 ${
                  isBaseComplete && bonusCount > 0
                    ? "bg-amber-500 hover:bg-amber-600 hover:shadow-lg"
                    : "bg-[var(--luck-primary)] hover:bg-[var(--luck-primary)]/90 hover:shadow-lg"
                }`}
              >
                {isRolling ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    >
                      🎲
                    </motion.span>
                    굴리는 중...
                  </span>
                ) : isBaseComplete && bonusCount > 0 ? (
                  `⭐ 보너스 굴리기 (${bonusCount}회)`
                ) : (
                  `굴리기 (${10 - baseRollCount}회 남음)`
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                🎉 완료! 결과 확인 중...
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
