// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { CoinSide } from "@/lib/hooks/useCoinGame";

interface CoinPixelProps {
  result: CoinSide | null;
  isFlipping: boolean;
  onFlipComplete?: () => void;
}

// 스프라이트 시트 정보
// coin.png: 8프레임 가로 배열, 각 프레임 약 50x50
// 프레임 0-3: heads(왕관) → edge, 프레임 4-7: edge → tails(방패)
const SPRITE_SIZE = 50;
const COIN_SCALE = 2.5; // 50px * 2.5 = 125px로 확대
const DISPLAY_SIZE = SPRITE_SIZE * COIN_SCALE;
const FRAME_COUNT = 8;

// 앞면(왕관) = 프레임 0, 뒷면(방패) = 프레임 7
const SIDE_FRAMES: Record<CoinSide, number> = {
  heads: 0,
  tails: 7,
};

export function CoinPixel({ result, isFlipping, onFlipComplete }: CoinPixelProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isFlipping) {
      setIsAnimating(true);
      let frameIndex = 0;
      let cycles = 0;
      const maxCycles = 4; // 4바퀴 회전

      const interval = setInterval(() => {
        frameIndex = (frameIndex + 1) % FRAME_COUNT;
        setCurrentFrame(frameIndex);

        if (frameIndex === 0) {
          cycles++;
        }

        // 마지막 사이클에서 결과 프레임으로 수렴
        if (cycles >= maxCycles && result) {
          clearInterval(interval);
          setCurrentFrame(SIDE_FRAMES[result]);
          setIsAnimating(false);
          onFlipComplete?.();
        }
      }, 80);

      return () => clearInterval(interval);
    }
  }, [isFlipping, result, onFlipComplete]);

  // 결과 변경 시 프레임 업데이트
  useEffect(() => {
    if (!isFlipping && result) {
      setCurrentFrame(SIDE_FRAMES[result]);
    }
  }, [result, isFlipping]);

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
                y: [0, -40, 0, -30, 0, -20, 0, -10, 0],
                rotate: [0, 5, -5, 3, -3, 0],
              }
            : { y: 0, rotate: 0 }
        }
        transition={
          isAnimating
            ? { duration: 2.5, ease: "easeOut" }
            : { duration: 0.3 }
        }
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url('/dotImg/coin/coin.png')`,
            backgroundPosition: `-${currentFrame * SPRITE_SIZE * COIN_SCALE}px 0`,
            backgroundSize: `${FRAME_COUNT * SPRITE_SIZE * COIN_SCALE}px ${SPRITE_SIZE * COIN_SCALE}px`,
            imageRendering: "pixelated",
          }}
        />

        {/* 회전 중 광택 효과 */}
        {isAnimating && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 rgba(255, 215, 0, 0)",
                "0 0 40px rgba(255, 215, 0, 0.6)",
                "0 0 0 rgba(255, 215, 0, 0)",
              ],
            }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  );
}
