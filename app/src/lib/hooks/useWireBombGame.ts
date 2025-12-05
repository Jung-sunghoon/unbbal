// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useCallback } from "react";

// 무지개 7색: 빨주노초파남보
export const WIRE_COLORS = [
  { id: 0, name: "빨강", color: "#FF0000" },
  { id: 1, name: "주황", color: "#FF7F00" },
  { id: 2, name: "노랑", color: "#FFFF00" },
  { id: 3, name: "초록", color: "#00FF00" },
  { id: 4, name: "파랑", color: "#0000FF" },
  { id: 5, name: "남색", color: "#4B0082" },
  { id: 6, name: "보라", color: "#9400D3" },
] as const;

export interface WireState {
  id: number;
  color: string;
  colorName: string;
  isCut: boolean;
  isBomb: boolean;
  isCorrect: boolean | null; // null = 아직 안 자름, true = 안전, false = 폭탄
}

export interface WireBombGameState {
  phase: "ready" | "playing" | "cutting" | "safe" | "exploded";
  wires: WireState[];
  bombWireId: number;
  survivalCount: number;
  lastCutWire: number | null;
}

function createWires(): { wires: WireState[]; bombWireId: number } {
  const bombWireId = Math.floor(Math.random() * 7);

  const wires = WIRE_COLORS.map((wire) => ({
    id: wire.id,
    color: wire.color,
    colorName: wire.name,
    isCut: false,
    isBomb: wire.id === bombWireId,
    isCorrect: null,
  }));

  return { wires, bombWireId };
}

export function useWireBombGame() {
  const initialData = createWires();
  const [state, setState] = useState<WireBombGameState>({
    phase: "ready",
    wires: initialData.wires,
    bombWireId: initialData.bombWireId,
    survivalCount: 0,
    lastCutWire: null,
  });

  const startGame = useCallback(() => {
    const { wires, bombWireId } = createWires();
    setState({
      phase: "playing",
      wires,
      bombWireId,
      survivalCount: 0,
      lastCutWire: null,
    });
  }, []);

  const cutWire = useCallback((wireId: number) => {
    if (state.phase !== "playing") return;

    const wire = state.wires.find(w => w.id === wireId);
    if (!wire || wire.isCut) return;

    const isCorrect = !wire.isBomb;

    setState(prev => ({
      ...prev,
      phase: "cutting",
      lastCutWire: wireId,
      wires: prev.wires.map(w =>
        w.id === wireId ? { ...w, isCut: true, isCorrect } : w
      ),
    }));
  }, [state.phase, state.wires]);

  const confirmCut = useCallback(() => {
    if (state.phase !== "cutting" || state.lastCutWire === null) return;

    const wire = state.wires.find(w => w.id === state.lastCutWire);
    if (!wire) return;

    if (wire.isBomb) {
      // 폭탄! 폭발!
      setState(prev => ({
        ...prev,
        phase: "exploded",
      }));
    } else {
      // 안전!
      const cutCount = state.wires.filter(w => w.isCut).length;

      if (cutCount >= 6) {
        // 6개 안전한 선 다 자름 - 해제 성공!
        setState(prev => ({
          ...prev,
          phase: "safe",
          survivalCount: prev.survivalCount + 1,
        }));
      } else {
        // 계속 진행
        setState(prev => ({
          ...prev,
          phase: "playing",
        }));
      }
    }
  }, [state.phase, state.lastCutWire, state.wires]);

  const nextRound = useCallback(() => {
    if (state.phase !== "safe") return;

    const { wires, bombWireId } = createWires();
    setState(prev => ({
      ...prev,
      phase: "playing",
      wires,
      bombWireId,
      lastCutWire: null,
    }));
  }, [state.phase]);

  const resetGame = useCallback(() => {
    const { wires, bombWireId } = createWires();
    setState({
      phase: "ready",
      wires,
      bombWireId,
      survivalCount: 0,
      lastCutWire: null,
    });
  }, []);

  return {
    ...state,
    startGame,
    cutWire,
    confirmCut,
    nextRound,
    resetGame,
  };
}
