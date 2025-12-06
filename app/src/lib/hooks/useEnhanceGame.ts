// © 2025 운빨(unbbal). All rights reserved.

import { useState, useCallback } from "react";

export type EnhanceResult = "success" | "fail" | "destroy";

export interface EnhanceGameState {
  phase: "ready" | "playing" | "enhancing" | "result" | "destroyed";
  level: number;
  maxLevel: number;
  attemptCount: number;
  lastResult: EnhanceResult | null;
  history: Array<{ level: number; result: EnhanceResult }>;
}

interface EnhanceRates {
  success: number;
  fail: number;
  destroy: number;
}

// 강화 확률 테이블 (30강까지)
function getEnhanceRates(level: number): EnhanceRates {
  if (level <= 6) {
    return { success: 70, fail: 30, destroy: 0 };
  } else if (level <= 9) {
    return { success: 50, fail: 30, destroy: 20 };
  } else if (level <= 14) {
    return { success: 30, fail: 40, destroy: 30 };
  } else if (level <= 19) {
    return { success: 10, fail: 40, destroy: 50 };
  } else if (level <= 24) {
    return { success: 5, fail: 35, destroy: 60 };
  } else if (level <= 29) {
    return { success: 3, fail: 27, destroy: 70 };
  } else {
    return { success: 1, fail: 19, destroy: 80 };
  }
}

export function useEnhanceGame() {
  const [state, setState] = useState<EnhanceGameState>({
    phase: "ready",
    level: 0,
    maxLevel: 0,
    attemptCount: 0,
    lastResult: null,
    history: [],
  });

  const startGame = useCallback(() => {
    setState({
      phase: "playing",
      level: 0,
      maxLevel: 0,
      attemptCount: 0,
      lastResult: null,
      history: [],
    });
  }, []);

  const enhance = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "playing") return prev;

      const rates = getEnhanceRates(prev.level);
      const roll = Math.random() * 100;

      let result: EnhanceResult;
      if (roll < rates.success) {
        result = "success";
      } else if (roll < rates.success + rates.fail) {
        result = "fail";
      } else {
        result = "destroy";
      }

      return {
        ...prev,
        phase: "enhancing",
        lastResult: result,
      };
    });
  }, []);

  const confirmResult = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "enhancing" || !prev.lastResult) return prev;

      const result = prev.lastResult;
      let newLevel = prev.level;
      let newPhase: EnhanceGameState["phase"] = "playing";

      if (result === "success") {
        newLevel = prev.level + 1;
      } else if (result === "destroy") {
        newPhase = "destroyed";
      }
      // fail: level stays same

      const newHistory = [
        ...prev.history,
        { level: prev.level, result },
      ];

      return {
        ...prev,
        phase: newPhase,
        level: newLevel,
        maxLevel: Math.max(prev.maxLevel, newLevel),
        attemptCount: prev.attemptCount + 1,
        history: newHistory,
      };
    });
  }, []);

  const stopGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "result",
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState({
      phase: "ready",
      level: 0,
      maxLevel: 0,
      attemptCount: 0,
      lastResult: null,
      history: [],
    });
  }, []);

  const rates = getEnhanceRates(state.level);

  return {
    ...state,
    rates,
    startGame,
    enhance,
    confirmResult,
    stopGame,
    resetGame,
    getEnhanceRates,
  };
}
