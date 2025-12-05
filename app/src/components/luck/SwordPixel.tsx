// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { motion } from "framer-motion";

interface SwordPixelProps {
  level: number;
  isEnhancing: boolean;
  isDestroyed: boolean;
}

// 스프라이트 시트 정보
// sword.png: 6x5 그리드, 각 검 32x32
const SPRITE_SIZE = 32;
const SWORD_SCALE = 4; // 32px * 4 = 128px
const DISPLAY_SIZE = SPRITE_SIZE * SWORD_SCALE;

// 강화 등급별 검 위치 (sword.png에서)
// { col, row } - 0부터 시작
const LEVEL_SWORD_POSITIONS: Record<string, { col: number; row: number }> = {
  "0": { col: 0, row: 4 },   // 기본 검 (회색/일반)
  "1": { col: 2, row: 0 },   // 고급 (초록/자연)
  "2": { col: 1, row: 0 },   // 희귀 (파랑/얼음)
  "3": { col: 4, row: 3 },   // 영웅 (보라/마법)
  "4": { col: 0, row: 0 },   // 전설 (주황/불꽃)
  "5": { col: 3, row: 0 },   // 신화 (황금/태양)
};

// 레벨을 등급으로 변환
function getLevelTier(level: number): string {
  if (level <= 3) return "0";   // +0~3 기본
  if (level <= 6) return "1";   // +4~6 고급
  if (level <= 9) return "2";   // +7~9 희귀
  if (level <= 11) return "3";  // +10~11 영웅
  if (level <= 14) return "4";  // +12~14 전설
  return "5";                   // +15+ 신화
}

// 등급별 글로우 색상
const TIER_GLOW: Record<string, string> = {
  "0": "transparent",
  "1": "rgba(34, 197, 94, 0.5)",   // 초록
  "2": "rgba(59, 130, 246, 0.5)",  // 파랑
  "3": "rgba(168, 85, 247, 0.5)",  // 보라
  "4": "rgba(249, 115, 22, 0.5)",  // 주황
  "5": "rgba(234, 179, 8, 0.6)",   // 황금
};

export function SwordPixel({ level, isEnhancing, isDestroyed }: SwordPixelProps) {
  const tier = getLevelTier(level);
  const position = LEVEL_SWORD_POSITIONS[tier];
  const glowColor = TIER_GLOW[tier];

  return (
    <div className="flex items-center justify-center py-4">
      <motion.div
        className="relative"
        style={{
          width: DISPLAY_SIZE,
          height: DISPLAY_SIZE,
        }}
        animate={
          isEnhancing
            ? {
                scale: [1, 1.1, 1, 1.05, 1],
                rotate: [0, -5, 5, -3, 3, 0],
              }
            : isDestroyed
            ? { scale: 1, rotate: 0 }
            : { scale: 1, rotate: 0 }
        }
        transition={
          isEnhancing
            ? { duration: 0.5, repeat: Infinity }
            : { duration: 0.3 }
        }
      >
        {!isDestroyed ? (
          <>
            {/* 검 이미지 */}
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url('/dotImg/sword/sword.png')`,
                backgroundPosition: `-${position.col * SPRITE_SIZE * SWORD_SCALE}px -${position.row * SPRITE_SIZE * SWORD_SCALE}px`,
                backgroundSize: `${6 * SPRITE_SIZE * SWORD_SCALE}px ${5 * SPRITE_SIZE * SWORD_SCALE}px`,
                imageRendering: "pixelated",
              }}
            />

            {/* 글로우 이펙트 (등급별) */}
            {tier !== "0" && (
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                animate={{
                  boxShadow: [
                    `0 0 20px ${glowColor}`,
                    `0 0 40px ${glowColor}`,
                    `0 0 20px ${glowColor}`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* 강화 중 이펙트 */}
            {isEnhancing && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(255, 255, 255, 0)",
                    "0 0 60px rgba(255, 255, 255, 0.8)",
                    "0 0 0 rgba(255, 255, 255, 0)",
                  ],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}

            {/* 신화 등급 특별 이펙트 */}
            {tier === "5" && !isEnhancing && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  background: [
                    "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </>
        ) : (
          <>
            {/* 파괴된 검 (decay.png에서 가져옴) */}
            {/* decay.png: 세로로 여러 검, 각 검당 3단계 decay */}
            {/* 첫번째 검의 마지막(3번째) decay 사용: row 2 */}
            <div
              className="w-full h-full opacity-70"
              style={{
                backgroundImage: `url('/dotImg/sword/decay.png')`,
                backgroundPosition: `0px -${2 * SPRITE_SIZE * SWORD_SCALE}px`,
                backgroundSize: `${3 * SPRITE_SIZE * SWORD_SCALE}px auto`,
                imageRendering: "pixelated",
              }}
            />

            {/* 파괴 이펙트 */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                background: "radial-gradient(circle, rgba(139, 0, 0, 0.3) 0%, transparent 70%)",
              }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
