// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useCallback } from "react";

const BOX_COUNT = 6;

export interface BoxState {
  id: number;
  isOpened: boolean;
  hasBomb: boolean;
}

export interface BombGameState {
  phase: "ready" | "playing" | "revealing" | "safe" | "exploded";
  boxes: BoxState[];
  survivalCount: number;
  selectedBox: number | null;
  bombCount: number;
}

// 라운드에 따른 폭탄 개수 계산 (5라운드마다 +1, 최대 4개)
function getBombCount(survivalCount: number): number {
  return Math.min(1 + Math.floor(survivalCount / 5), 4);
}

function createBoxes(bombCount: number = 1): BoxState[] {
  // 랜덤으로 bombCount개의 폭탄 위치 선택
  const bombIndices = new Set<number>();
  while (bombIndices.size < bombCount) {
    bombIndices.add(Math.floor(Math.random() * BOX_COUNT));
  }

  return Array.from({ length: BOX_COUNT }, (_, i) => ({
    id: i,
    isOpened: false,
    hasBomb: bombIndices.has(i),
  }));
}

export function useBombGame() {
  const [state, setState] = useState<BombGameState>({
    phase: "ready",
    boxes: createBoxes(1),
    survivalCount: 0,
    selectedBox: null,
    bombCount: 1,
  });

  const startGame = useCallback(() => {
    setState({
      phase: "playing",
      boxes: createBoxes(1),
      survivalCount: 0,
      selectedBox: null,
      bombCount: 1,
    });
  }, []);

  const selectBox = useCallback((boxId: number) => {
    if (state.phase !== "playing") return;

    const box = state.boxes.find(b => b.id === boxId);
    if (!box || box.isOpened) return;

    // 박스 열기 시작
    setState(prev => ({
      ...prev,
      phase: "revealing",
      selectedBox: boxId,
      boxes: prev.boxes.map(b =>
        b.id === boxId ? { ...b, isOpened: true } : b
      ),
    }));
  }, [state.phase, state.boxes]);

  const confirmResult = useCallback(() => {
    if (state.phase !== "revealing" || state.selectedBox === null) return;

    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (!box) return;

    if (box.hasBomb) {
      // 폭발!
      setState(prev => ({
        ...prev,
        phase: "exploded",
      }));
    } else {
      // 생존! 다음 라운드
      setState(prev => ({
        ...prev,
        phase: "safe",
        survivalCount: prev.survivalCount + 1,
      }));
    }
  }, [state.phase, state.selectedBox, state.boxes]);

  const nextRound = useCallback(() => {
    if (state.phase !== "safe") return;

    const newSurvivalCount = state.survivalCount;
    const newBombCount = getBombCount(newSurvivalCount);

    setState(prev => ({
      ...prev,
      phase: "playing",
      boxes: createBoxes(newBombCount),
      selectedBox: null,
      bombCount: newBombCount,
    }));
  }, [state.phase, state.survivalCount]);

  const resetGame = useCallback(() => {
    setState({
      phase: "ready",
      boxes: createBoxes(1),
      survivalCount: 0,
      selectedBox: null,
      bombCount: 1,
    });
  }, []);

  return {
    ...state,
    startGame,
    selectBox,
    confirmResult,
    nextRound,
    resetGame,
  };
}
