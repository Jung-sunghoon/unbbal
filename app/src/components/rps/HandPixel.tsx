// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { motion } from "framer-motion";
import type { RPSMove } from "@/lib/constants";

interface HandPixelProps {
  move: RPSMove;
  size?: number;
  isRevealing?: boolean;
}

// 이미지 경로 매핑
const HAND_IMAGES: Record<RPSMove, string> = {
  rock: "/dotImg/hand/rock.png",
  paper: "/dotImg/hand/paper.png",
  scissors: "/dotImg/hand/scissors.png",
};

// 한글 이름
const HAND_NAMES: Record<RPSMove, string> = {
  rock: "주먹",
  paper: "보",
  scissors: "가위",
};

export function HandPixel({ move, size = 80, isRevealing = false }: HandPixelProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={isRevealing ? { scale: 0, rotate: -180 } : false}
      animate={isRevealing ? { scale: 1, rotate: 0 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <motion.div
        className="relative"
        style={{
          width: size,
          height: size,
        }}
        whileHover={{ scale: 1.1 }}
      >
        <img
          src={HAND_IMAGES[move]}
          alt={HAND_NAMES[move]}
          className="w-full h-full"
          style={{
            imageRendering: "pixelated",
            transform: "scale(1)",
          }}
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}
