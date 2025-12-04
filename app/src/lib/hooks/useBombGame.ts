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
}

function createBoxes(): BoxState[] {
  const bombIndex = Math.floor(Math.random() * BOX_COUNT);
  return Array.from({ length: BOX_COUNT }, (_, i) => ({
    id: i,
    isOpened: false,
    hasBomb: i === bombIndex,
  }));
}

export function useBombGame() {
  const [state, setState] = useState<BombGameState>({
    phase: "ready",
    boxes: createBoxes(),
    survivalCount: 0,
    selectedBox: null,
  });

  const startGame = useCallback(() => {
    setState({
      phase: "playing",
      boxes: createBoxes(),
      survivalCount: 0,
      selectedBox: null,
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

    setState(prev => ({
      ...prev,
      phase: "playing",
      boxes: createBoxes(),
      selectedBox: null,
    }));
  }, [state.phase]);

  const resetGame = useCallback(() => {
    setState({
      phase: "ready",
      boxes: createBoxes(),
      survivalCount: 0,
      selectedBox: null,
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
