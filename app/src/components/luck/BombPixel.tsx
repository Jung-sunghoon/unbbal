// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BoxState, BombGameState } from "@/lib/hooks/useBombGame";

interface BombPixelProps {
  boxes: BoxState[];
  selectedBox: number | null;
  phase: BombGameState["phase"];
  onSelectBox: (id: number) => void;
  onRevealComplete: () => void;
}

// 폭탄 스프라이트 정보
const BOMB_SIZE = 32; // 원본 크기
const BOMB_SCALE = 3; // 32px * 3 = 96px
const DISPLAY_SIZE = BOMB_SIZE * BOMB_SCALE;

// 폭발 스프라이트 시트 정보 (1280x80, 16프레임)
const EXPLOSION_COLS = 16;
const EXPLOSION_FRAME_SIZE = 80;

interface SingleBombProps {
  id: number;
  isOpened: boolean;
  hasBomb: boolean;
  isSelected: boolean;
  isRevealing: boolean;
  canSelect: boolean;
  onSelect: () => void;
  onRevealComplete: () => void;
}

const FUSE_FRAMES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function SingleBomb({
  id,
  isOpened,
  hasBomb,
  isSelected,
  isRevealing,
  canSelect,
  onSelect,
  onRevealComplete,
}: SingleBombProps) {
  const [fuseFrame, setFuseFrame] = useState(0);
  const [explosionFrame, setExplosionFrame] = useState(0);
  const [showExplosion, setShowExplosion] = useState(false);
  const [isDud, setIsDud] = useState(false);
  const hasCompleted = useRef(false);

  // 기본 심지 애니메이션 (항상 불 붙어있음)
  useEffect(() => {
    if (isDud || showExplosion) return; // 불발이거나 폭발 중이면 멈춤

    const interval = setInterval(() => {
      setFuseFrame((prev) => (prev + 1) % FUSE_FRAMES.length);
    }, 100);

    return () => clearInterval(interval);
  }, [isDud, showExplosion]);

  // 선택 시 결과 처리
  useEffect(() => {
    if (isRevealing && isSelected) {
      hasCompleted.current = false;

      if (hasBomb) {
        // 진짜 폭탄 → 폭발
        setTimeout(() => {
          setShowExplosion(true);
        }, 300);
      } else {
        // 불발탄 → 불 꺼짐
        setTimeout(() => {
          setIsDud(true);
          if (!hasCompleted.current) {
            hasCompleted.current = true;
            setTimeout(() => onRevealComplete(), 500);
          }
        }, 300);
      }
    }
  }, [isRevealing, isSelected, hasBomb, onRevealComplete]);

  // 폭발 애니메이션
  useEffect(() => {
    if (showExplosion) {
      let frame = 0;
      const explosionInterval = setInterval(() => {
        setExplosionFrame(frame);
        frame++;
        if (frame >= EXPLOSION_COLS) {
          clearInterval(explosionInterval);
          if (!hasCompleted.current) {
            hasCompleted.current = true;
            setTimeout(() => onRevealComplete(), 300);
          }
        }
      }, 60);

      return () => clearInterval(explosionInterval);
    }
  }, [showExplosion, onRevealComplete]);

  // 리셋 상태
  useEffect(() => {
    if (!isOpened) {
      setFuseFrame(0);
      setExplosionFrame(0);
      setShowExplosion(false);
      setIsDud(false);
      hasCompleted.current = false;
    }
  }, [isOpened]);

  return (
    <motion.div
      className={`relative cursor-pointer ${canSelect && !isOpened ? "hover:scale-110" : ""} transition-transform`}
      style={{
        width: DISPLAY_SIZE,
        height: DISPLAY_SIZE,
      }}
      onClick={() => canSelect && !isOpened && onSelect()}
      whileHover={canSelect && !isOpened ? { y: -8 } : {}}
      whileTap={canSelect && !isOpened ? { scale: 0.95 } : {}}
    >
      {/* 폭발 이펙트 */}
      <AnimatePresence>
        {showExplosion && (
          <motion.div
            className="absolute z-20 pointer-events-none"
            style={{
              width: DISPLAY_SIZE,
              height: DISPLAY_SIZE,
              left: 0,
              top: 0,
              backgroundImage: `url('/dotImg/explosion/spritesheet.png')`,
              backgroundPosition: `-${explosionFrame * DISPLAY_SIZE}px 0`,
              backgroundSize: `${EXPLOSION_COLS * DISPLAY_SIZE}px ${DISPLAY_SIZE}px`,
              imageRendering: "pixelated",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* 폭탄 이미지 */}
      {!showExplosion && (
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `url('/dotImg/bomb/${isDud ? "off1" : FUSE_FRAMES[fuseFrame]}.png')`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            imageRendering: "pixelated",
          }}
          animate={
            isRevealing && isSelected && hasBomb
              ? { rotate: [-2, 2, -2, 2, 0], scale: [1, 1.05, 1] }
              : {}
          }
          transition={{ duration: 0.2, repeat: hasBomb && isRevealing ? Infinity : 0 }}
        />
      )}

      {/* 불발 텍스트 */}
      {isDud && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-lg font-bold text-green-600 bg-background/80 px-2 py-1 rounded">불발!</span>
        </motion.div>
      )}


      {/* 번호 표시 */}
      {!isOpened && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-0.5 rounded text-xs font-bold">
          {id + 1}
        </div>
      )}
    </motion.div>
  );
}

export function BombPixel({
  boxes,
  selectedBox,
  phase,
  onSelectBox,
  onRevealComplete,
}: BombPixelProps) {
  const canSelect = phase === "playing";
  const isRevealing = phase === "revealing";

  return (
    <div className="w-full py-4">
      {/* 2x3 그리드 */}
      <div className="grid grid-cols-3 gap-4 justify-items-center max-w-md mx-auto">
        {boxes.map((box) => (
          <SingleBomb
            key={box.id}
            id={box.id}
            isOpened={box.isOpened}
            hasBomb={box.hasBomb}
            isSelected={selectedBox === box.id}
            isRevealing={isRevealing && selectedBox === box.id}
            canSelect={canSelect}
            onSelect={() => onSelectBox(box.id)}
            onRevealComplete={onRevealComplete}
          />
        ))}
      </div>
    </div>
  );
}
