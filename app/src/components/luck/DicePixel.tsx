// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface DicePixelProps {
  value: number;
  isRolling: boolean;
  onRollComplete?: () => void;
}

// 스프라이트 시트 정보
// six sided die.png: 7열 x 12행, 각 주사위 16x16
const SPRITE_SIZE = 16;
const DICE_SCALE = 8; // 16px * 8 = 128px로 확대
const DISPLAY_SIZE = SPRITE_SIZE * DICE_SCALE;

// 주사위 면 위치 (0부터 시작, 첫번째 행 = 흰색 주사위)
// 열 순서: 1, 2, 3, 4, 5, 6, 빈칸
const FACE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 1, y: 0 },
  3: { x: 2, y: 0 },
  4: { x: 3, y: 0 },
  5: { x: 4, y: 0 },
  6: { x: 5, y: 0 },
};

export function DicePixel({ value, isRolling, onRollComplete }: DicePixelProps) {
  const [displayValue, setDisplayValue] = useState(value || 1);
  const [isAnimating, setIsAnimating] = useState(false);

  // 굴리기 애니메이션
  useEffect(() => {
    if (isRolling) {
      setIsAnimating(true);

      // 빠르게 면 변경 (슬롯머신 효과)
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 50);

      // 1.5초 후 멈춤
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setDisplayValue(value);
        setIsAnimating(false);
        onRollComplete?.();
      }, 1500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isRolling, value, onRollComplete]);

  // 값이 변경되면 표시 업데이트
  useEffect(() => {
    if (!isRolling) {
      setDisplayValue(value || 1);
    }
  }, [value, isRolling]);

  const position = FACE_POSITIONS[displayValue] || FACE_POSITIONS[1];

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative"
        style={{
          width: DISPLAY_SIZE,
          height: DISPLAY_SIZE,
          imageRendering: "pixelated",
        }}
        animate={
          isAnimating
            ? {
                rotate: [0, 10, -10, 15, -15, 10, -10, 5, -5, 0],
                y: [0, -20, 0, -15, 0, -10, 0, -5, 0],
                scale: [1, 1.1, 1, 1.05, 1],
              }
            : { rotate: 0, y: 0, scale: 1 }
        }
        transition={
          isAnimating
            ? { duration: 1.5, ease: "easeOut" }
            : { duration: 0.3 }
        }
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url('/dotImg/dice/six sided die.png')`,
            backgroundPosition: `-${position.x * SPRITE_SIZE * DICE_SCALE}px -${position.y * SPRITE_SIZE * DICE_SCALE}px`,
            backgroundSize: `${7 * SPRITE_SIZE * DICE_SCALE}px ${12 * SPRITE_SIZE * DICE_SCALE}px`,
            imageRendering: "pixelated",
          }}
        />

        {/* 굴리는 중 이펙트 */}
        {isAnimating && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              boxShadow: [
                "0 0 0 rgba(59, 130, 246, 0)",
                "0 0 30px rgba(59, 130, 246, 0.5)",
                "0 0 0 rgba(59, 130, 246, 0)",
              ],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  );
}
