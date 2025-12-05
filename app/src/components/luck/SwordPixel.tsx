// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

// 스파클 파티클 위치 (8개)
const SPARKLE_POSITIONS = [
  { x: -20, y: -30 },
  { x: 20, y: -25 },
  { x: -35, y: 0 },
  { x: 35, y: 5 },
  { x: -25, y: 30 },
  { x: 25, y: 35 },
  { x: 0, y: -40 },
  { x: 0, y: 45 },
];

export function SwordPixel({ level, isEnhancing, isDestroyed }: SwordPixelProps) {
  const tier = getLevelTier(level);
  const glowColor = TIER_GLOW[tier];

  // 등급 변경 감지 (진화 효과용)
  const prevTierRef = useRef(tier);
  const [isEvolving, setIsEvolving] = useState(false);
  const [showNewSword, setShowNewSword] = useState(true);
  const [displayTier, setDisplayTier] = useState(tier); // 실제로 보여줄 등급

  useEffect(() => {
    // 등급이 올라갔을 때만 진화 효과
    if (tier !== prevTierRef.current && tier > prevTierRef.current && !isDestroyed) {
      // 이전 등급 유지한 채로 트랜지션 시작
      setIsEvolving(true);
      setShowNewSword(false);
      // displayTier는 아직 이전 값 유지

      // 1단계: 실루엣으로 변하면서 빛나기 (0.8초)
      // 2단계: 새로운 검 등장 (0.5초)
      setTimeout(() => {
        setDisplayTier(tier); // 이제 새 등급으로 변경
        setShowNewSword(true);
      }, 800);

      setTimeout(() => {
        setIsEvolving(false);
      }, 1500);
    } else if (tier !== displayTier && !isEvolving) {
      // 진화가 아닌 경우 (레벨 다운 등) 바로 반영
      setDisplayTier(tier);
    }
    prevTierRef.current = tier;
  }, [tier, isDestroyed, displayTier, isEvolving]);

  // 실제로 보여줄 검 위치
  const position = LEVEL_SWORD_POSITIONS[displayTier];

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
                scale: [1, 1.15, 1, 1.1, 1],
                rotate: [0, -3, 3, -2, 2, 0],
              }
            : isDestroyed
            ? { scale: 1, rotate: 0 }
            : { scale: 1, rotate: 0 }
        }
        transition={
          isEnhancing
            ? { duration: 0.6, repeat: Infinity }
            : { duration: 0.3 }
        }
      >
        {!isDestroyed ? (
          <>
            {/* 강화 중 배경 광채 */}
            {isEnhancing && (
              <motion.div
                className="absolute inset-[-50%] pointer-events-none"
                animate={{
                  background: [
                    "radial-gradient(circle, rgba(255,215,0,0) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,215,0,0) 0%, transparent 70%)",
                  ],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* 검 이미지 */}
            <AnimatePresence mode="wait">
              {isEvolving && !showNewSword ? (
                // 진화 중: 실루엣 + 빛나는 효과
                <motion.div
                  key="evolving"
                  className="w-full h-full relative z-10"
                  style={{
                    backgroundImage: `url('/dotImg/sword/sword.png')`,
                    backgroundPosition: `-${position.col * SPRITE_SIZE * SWORD_SCALE}px -${position.row * SPRITE_SIZE * SWORD_SCALE}px`,
                    backgroundSize: `${6 * SPRITE_SIZE * SWORD_SCALE}px ${5 * SPRITE_SIZE * SWORD_SCALE}px`,
                    imageRendering: "pixelated",
                  }}
                  initial={{ filter: "brightness(1)" }}
                  animate={{
                    filter: [
                      "brightness(1) contrast(1)",
                      "brightness(3) contrast(0) saturate(0)",
                      "brightness(5) contrast(0) saturate(0)",
                      "brightness(10) contrast(0)",
                    ],
                    scale: [1, 1.1, 1.2, 1.3],
                  }}
                  transition={{ duration: 0.8, ease: "easeIn" }}
                />
              ) : (
                // 일반 또는 진화 완료 후
                <motion.div
                  key={`sword-${tier}`}
                  className="w-full h-full relative z-10"
                  style={{
                    backgroundImage: `url('/dotImg/sword/sword.png')`,
                    backgroundPosition: `-${position.col * SPRITE_SIZE * SWORD_SCALE}px -${position.row * SPRITE_SIZE * SWORD_SCALE}px`,
                    backgroundSize: `${6 * SPRITE_SIZE * SWORD_SCALE}px ${5 * SPRITE_SIZE * SWORD_SCALE}px`,
                    imageRendering: "pixelated",
                  }}
                  initial={isEvolving ? { scale: 1.5, filter: "brightness(3)" } : false}
                  animate={{
                    scale: 1,
                    filter: isEnhancing
                      ? [
                          "brightness(1) saturate(1)",
                          "brightness(1.5) saturate(1.3)",
                          "brightness(1) saturate(1)",
                          "brightness(1.8) saturate(1.5)",
                          "brightness(1) saturate(1)",
                        ]
                      : "brightness(1) saturate(1)",
                  }}
                  transition={
                    isEvolving
                      ? { duration: 0.5, ease: "easeOut" }
                      : isEnhancing
                      ? { duration: 0.4, repeat: Infinity }
                      : { duration: 0.3 }
                  }
                />
              )}
            </AnimatePresence>

            {/* 진화 이펙트: 빛 폭발 */}
            <AnimatePresence>
              {isEvolving && (
                <motion.div
                  className="absolute inset-[-100%] pointer-events-none z-20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1.5, 2],
                    background: [
                      "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.5) 30%, transparent 60%)",
                      "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,215,0,0.8) 40%, transparent 70%)",
                      "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.3) 50%, transparent 80%)",
                      "radial-gradient(circle, transparent 0%, transparent 100%)",
                    ],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>

            {/* 진화 이펙트: 별 파티클 */}
            <AnimatePresence>
              {isEvolving && showNewSword && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={`star-${i}`}
                      className="absolute text-yellow-400 pointer-events-none z-30"
                      style={{
                        left: "50%",
                        top: "50%",
                        fontSize: `${12 + Math.random() * 8}px`,
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                      animate={{
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200,
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

            {/* 글로우 이펙트 (등급별) */}
            {tier !== "0" && !isEnhancing && (
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

            {/* 강화 중 스파클 파티클 */}
            {isEnhancing && (
              <>
                {SPARKLE_POSITIONS.map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-300 pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      fontSize: "16px",
                    }}
                    initial={{ x: pos.x, y: pos.y, opacity: 0, scale: 0 }}
                    animate={{
                      x: [pos.x, pos.x + (Math.random() - 0.5) * 20],
                      y: [pos.y, pos.y - 20, pos.y],
                      opacity: [0, 1, 0],
                      scale: [0, 1.2, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    ✦
                  </motion.div>
                ))}
              </>
            )}

            {/* 강화 중 메인 글로우 */}
            {isEnhancing && (
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)",
                    "0 0 60px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 255, 255, 0.5)",
                    "0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)",
                  ],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}

            {/* 강화 중 플래시 이펙트 */}
            {isEnhancing && (
              <motion.div
                className="absolute inset-[-20%] pointer-events-none"
                animate={{
                  opacity: [0, 0.8, 0],
                  background: [
                    "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0) 50%, transparent 100%)",
                    "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                    "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0) 50%, transparent 100%)",
                  ],
                }}
                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.5 }}
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
            {/* 파괴 초기 플래시 */}
            <motion.div
              className="absolute inset-[-50%] pointer-events-none z-30"
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,100,100,0.5) 40%, transparent 70%)",
              }}
            />

            {/* 파괴 파편들 */}
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const distance = 80 + Math.random() * 60;
              const size = 8 + Math.random() * 12;
              return (
                <motion.div
                  key={`shard-${i}`}
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: size,
                    height: size,
                    background: i % 3 === 0
                      ? "linear-gradient(135deg, #888 0%, #444 100%)"
                      : i % 3 === 1
                      ? "linear-gradient(135deg, #666 0%, #333 100%)"
                      : "linear-gradient(135deg, #aaa 0%, #555 100%)",
                    clipPath: i % 2 === 0
                      ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                      : "polygon(0% 0%, 100% 30%, 80% 100%, 20% 70%)",
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                  }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance + 30,
                    opacity: 0,
                    scale: 0.3,
                    rotate: 360 + Math.random() * 360,
                  }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.4,
                    ease: "easeOut",
                    delay: Math.random() * 0.1,
                  }}
                />
              );
            })}

            {/* 파괴된 검 (decay.png에서 가져옴) */}
            <motion.div
              className="w-full h-full opacity-70"
              style={{
                backgroundImage: `url('/dotImg/sword/decay.png')`,
                backgroundPosition: `0px -${2 * SPRITE_SIZE * SWORD_SCALE}px`,
                backgroundSize: `${3 * SPRITE_SIZE * SWORD_SCALE}px auto`,
                imageRendering: "pixelated",
              }}
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            />

            {/* 연기/먼지 이펙트 */}
            <motion.div
              className="absolute inset-[-30%] pointer-events-none z-10"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                background: "radial-gradient(circle, rgba(100, 100, 100, 0.4) 0%, transparent 60%)",
              }}
            />

            {/* 파괴 이펙트 - 지속적인 빨간 글로우 */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
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
