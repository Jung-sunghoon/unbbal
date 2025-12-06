// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CoinSide } from "@/lib/hooks/useCoinGame";

interface CoinPixelProps {
  result: CoinSide | null;
  isFlipping: boolean;
  onFlipComplete?: () => void;
}

// 스프라이트 시트 정보
// coin.png: 2816x1536, 8프레임 가로 배열
// 프레임 0: 앞면(왕관), 프레임 7: 뒷면(방패)
const SPRITE_WIDTH = 352; // 2816 / 8
const SPRITE_HEIGHT = 1536;
const DISPLAY_SIZE = 120; // 화면 표시 크기
const FRAME_COUNT = 8;

// 물리 상수
const GRAVITY = 0.4;
const INITIAL_VELOCITY = -18;
const BOUNCE_DAMPING = 0.4;
const GROUND_Y = 0;

// 앞면(왕관) = 프레임 0, 뒷면(방패) = 프레임 7
const SIDE_FRAMES: Record<CoinSide, number> = {
  heads: 0,
  tails: 7,
};

export function CoinPixel({ result, isFlipping, onFlipComplete }: CoinPixelProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [posY, setPosY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const rotationSpeedRef = useRef(0);
  const frameAccumulatorRef = useRef(0);
  const bounceCountRef = useRef(0);
  const onFlipCompleteRef = useRef(onFlipComplete);

  // 콜백 ref 업데이트
  useEffect(() => {
    onFlipCompleteRef.current = onFlipComplete;
  }, [onFlipComplete]);

  const animate = useCallback(() => {
    // 중력 적용
    velocityRef.current += GRAVITY;
    const newY = Math.min(posY + velocityRef.current, GROUND_Y);

    // 바닥에 닿으면 바운스
    if (newY >= GROUND_Y && velocityRef.current > 0) {
      bounceCountRef.current++;

      if (bounceCountRef.current >= 3 || Math.abs(velocityRef.current) < 2) {
        // 애니메이션 종료
        setPosY(GROUND_Y);
        setIsAnimating(false);

        // 결과 프레임으로 설정
        if (result) {
          setCurrentFrame(SIDE_FRAMES[result]);
        }

        onFlipCompleteRef.current?.();
        return;
      }

      // 바운스
      velocityRef.current = -velocityRef.current * BOUNCE_DAMPING;
      rotationSpeedRef.current *= 0.6;
    }

    setPosY(newY);

    // 회전 (속도에 비례하여 프레임 변경)
    frameAccumulatorRef.current += Math.abs(rotationSpeedRef.current);

    if (frameAccumulatorRef.current >= 1) {
      const framesToAdvance = Math.floor(frameAccumulatorRef.current);
      frameAccumulatorRef.current -= framesToAdvance;

      setCurrentFrame(prev => {
        // 마지막 바운스에서 결과로 수렴
        if (bounceCountRef.current >= 2 && result) {
          const targetFrame = SIDE_FRAMES[result];
          if (prev === targetFrame) return prev;
          // 결과 프레임으로 부드럽게 수렴
          return prev < targetFrame ? prev + 1 : prev - 1;
        }
        return (prev + framesToAdvance) % FRAME_COUNT;
      });
    }

    // 회전 속도 감소
    rotationSpeedRef.current *= 0.98;

    animationRef.current = requestAnimationFrame(animate);
  }, [posY, result]);

  useEffect(() => {
    if (isFlipping && !isAnimating) {
      // 애니메이션 시작
      setIsAnimating(true);
      velocityRef.current = INITIAL_VELOCITY;
      rotationSpeedRef.current = 0.8 + Math.random() * 0.4; // 랜덤 회전 속도
      frameAccumulatorRef.current = 0;
      bounceCountRef.current = 0;
      setPosY(0);

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFlipping, isAnimating, animate]);

  // 결과 변경 시 프레임 업데이트 (애니메이션 중이 아닐 때)
  useEffect(() => {
    if (!isFlipping && !isAnimating && result) {
      setCurrentFrame(SIDE_FRAMES[result]);
    }
  }, [result, isFlipping, isAnimating]);

  return (
    <div className="flex items-center justify-center h-full">
      <div
        className="relative"
        style={{
          width: DISPLAY_SIZE,
          height: DISPLAY_SIZE,
          transform: `translateY(${posY}px)`,
          imageRendering: "pixelated",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url('/dotImg/coin/coin.png')`,
            backgroundPosition: `-${currentFrame * DISPLAY_SIZE}px 0`,
            backgroundSize: `${FRAME_COUNT * DISPLAY_SIZE}px ${DISPLAY_SIZE}px`,
            imageRendering: "pixelated",
          }}
        />

        {/* 그림자 */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/20"
          style={{
            bottom: posY - 10,
            width: DISPLAY_SIZE * (0.6 + posY / 200),
            height: 12,
            opacity: Math.max(0.1, 0.4 + posY / 100),
            filter: `blur(${4 - posY / 20}px)`,
          }}
        />
      </div>
    </div>
  );
}
