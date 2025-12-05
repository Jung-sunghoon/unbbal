// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useCallback } from "react";

// 무지개 7색: 빨주노초파남보
export const WIRE_COLORS = [
  { id: 0, name: "빨강", color: "#FF0000", hex: "#FF0000" },
  { id: 1, name: "주황", color: "#FF7F00", hex: "#FF7F00" },
  { id: 2, name: "노랑", color: "#FFFF00", hex: "#FFFF00" },
  { id: 3, name: "초록", color: "#00FF00", hex: "#00FF00" },
  { id: 4, name: "파랑", color: "#0000FF", hex: "#0000FF" },
  { id: 5, name: "남색", color: "#4B0082", hex: "#4B0082" },
  { id: 6, name: "보라", color: "#9400D3", hex: "#9400D3" },
] as const;

export interface WireState {
  id: number;
  color: string;
  colorName: string;
  isCut: boolean;
  isCorrect: boolean | null; // null = 아직 안 자름, true = 정답, false = 오답
}

export interface WireBombGameState {
  phase: "ready" | "playing" | "cutting" | "safe" | "exploded";
  wires: WireState[];
  correctOrder: number[]; // 정답 순서
  currentStep: number; // 현재 몇 번째 선을 잘라야 하는지
  survivalCount: number;
  lastCutWire: number | null;
  hintsRevealed: number; // 힌트로 공개된 순서 개수
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createWires(): WireState[] {
  return WIRE_COLORS.map((wire) => ({
    id: wire.id,
    color: wire.color,
    colorName: wire.name,
    isCut: false,
    isCorrect: null,
  }));
}

function createCorrectOrder(): number[] {
  // 0-6 숫자를 랜덤하게 섞어서 정답 순서 생성
  return shuffleArray([0, 1, 2, 3, 4, 5, 6]);
}

export function useWireBombGame() {
  const [state, setState] = useState<WireBombGameState>({
    phase: "ready",
    wires: createWires(),
    correctOrder: createCorrectOrder(),
    currentStep: 0,
    survivalCount: 0,
    lastCutWire: null,
    hintsRevealed: 0,
  });

  const startGame = useCallback(() => {
    const newOrder = createCorrectOrder();
    setState({
      phase: "playing",
      wires: createWires(),
      correctOrder: newOrder,
      currentStep: 0,
      survivalCount: 0,
      lastCutWire: null,
      hintsRevealed: 1, // 첫 번째 힌트만 공개
    });
  }, []);

  const cutWire = useCallback((wireId: number) => {
    if (state.phase !== "playing") return;

    const wire = state.wires.find(w => w.id === wireId);
    if (!wire || wire.isCut) return;

    const isCorrect = state.correctOrder[state.currentStep] === wireId;

    setState(prev => ({
      ...prev,
      phase: "cutting",
      lastCutWire: wireId,
      wires: prev.wires.map(w =>
        w.id === wireId ? { ...w, isCut: true, isCorrect } : w
      ),
    }));
  }, [state.phase, state.wires, state.correctOrder, state.currentStep]);

  const confirmCut = useCallback(() => {
    if (state.phase !== "cutting" || state.lastCutWire === null) return;

    const wire = state.wires.find(w => w.id === state.lastCutWire);
    if (!wire) return;

    if (!wire.isCorrect) {
      // 틀림 - 폭발!
      setState(prev => ({
        ...prev,
        phase: "exploded",
      }));
    } else {
      // 맞음!
      const nextStep = state.currentStep + 1;

      if (nextStep >= 7) {
        // 모든 선을 다 자름 - 생존!
        setState(prev => ({
          ...prev,
          phase: "safe",
          currentStep: nextStep,
          survivalCount: prev.survivalCount + 1,
        }));
      } else {
        // 다음 선으로
        setState(prev => ({
          ...prev,
          phase: "playing",
          currentStep: nextStep,
          hintsRevealed: Math.min(nextStep + 1, 3), // 최대 3개까지만 힌트
        }));
      }
    }
  }, [state.phase, state.lastCutWire, state.wires, state.currentStep]);

  const nextRound = useCallback(() => {
    if (state.phase !== "safe") return;

    const newOrder = createCorrectOrder();
    setState(prev => ({
      ...prev,
      phase: "playing",
      wires: createWires(),
      correctOrder: newOrder,
      currentStep: 0,
      lastCutWire: null,
      hintsRevealed: 1,
    }));
  }, [state.phase]);

  const resetGame = useCallback(() => {
    setState({
      phase: "ready",
      wires: createWires(),
      correctOrder: createCorrectOrder(),
      currentStep: 0,
      survivalCount: 0,
      lastCutWire: null,
      hintsRevealed: 0,
    });
  }, []);

  // 현재 잘라야 할 선의 힌트 (첫 번째만)
  const getHints = useCallback(() => {
    const hints: string[] = [];
    for (let i = 0; i < state.hintsRevealed && i < state.correctOrder.length; i++) {
      if (i >= state.currentStep) {
        const wireId = state.correctOrder[i];
        const wire = WIRE_COLORS.find(w => w.id === wireId);
        if (wire) {
          hints.push(wire.name);
        }
      }
    }
    return hints;
  }, [state.hintsRevealed, state.correctOrder, state.currentStep]);

  return {
    ...state,
    startGame,
    cutWire,
    confirmCut,
    nextRound,
    resetGame,
    getHints,
  };
}
