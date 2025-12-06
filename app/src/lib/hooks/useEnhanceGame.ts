// © 2025 운빨(unbbal). All rights reserved.

import { useState, useCallback } from "react";

export type EnhanceResult = "success" | "fail" | "destroy";

export interface EnhanceGameState {
  phase: "ready" | "playing" | "enhancing" | "result" | "destroyed";
  level: number;
  maxLevel: number;
  attemptCount: number;
  failStack: number; // 연속 실패 스택 (천장 시스템)
  maxFailStack: number; // 최대 도달 스택
  lastResult: EnhanceResult | null;
  history: Array<{ level: number; result: EnhanceResult }>;
}

// 스택당 보너스 확률 (%)
const STACK_BONUS_PER_LEVEL = 2;
const MAX_STACK = 10; // 최대 10스택 = +20%

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
    failStack: 0,
    maxFailStack: 0,
    lastResult: null,
    history: [],
  });

  const startGame = useCallback(() => {
    setState({
      phase: "playing",
      level: 0,
      maxLevel: 0,
      attemptCount: 0,
      failStack: 0,
      maxFailStack: 0,
      lastResult: null,
      history: [],
    });
  }, []);

  const enhance = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "playing") return prev;

      const baseRates = getEnhanceRates(prev.level);

      // 스택 보너스 적용 (실패에서 성공으로 확률 이동)
      const stackBonus = Math.min(prev.failStack, MAX_STACK) * STACK_BONUS_PER_LEVEL;
      const rates = {
        success: Math.min(baseRates.success + stackBonus, 100 - baseRates.destroy), // 파괴 확률은 고정
        fail: Math.max(baseRates.fail - stackBonus, 0),
        destroy: baseRates.destroy,
      };

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
      let newFailStack = prev.failStack;

      if (result === "success") {
        newLevel = prev.level + 1;
        newFailStack = 0; // 성공하면 스택 리셋
      } else if (result === "fail") {
        newFailStack = Math.min(prev.failStack + 1, MAX_STACK); // 실패하면 스택 증가
      } else if (result === "destroy") {
        newPhase = "destroyed";
        // 파괴 시 스택 유지 (결과 표시용)
      }

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
        failStack: newFailStack,
        maxFailStack: Math.max(prev.maxFailStack, newFailStack),
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
      failStack: 0,
      maxFailStack: 0,
      lastResult: null,
      history: [],
    });
  }, []);

  // 스택 보너스가 적용된 실제 확률 계산
  const baseRates = getEnhanceRates(state.level);
  const stackBonus = Math.min(state.failStack, MAX_STACK) * STACK_BONUS_PER_LEVEL;
  const rates = {
    success: Math.min(baseRates.success + stackBonus, 100 - baseRates.destroy),
    fail: Math.max(baseRates.fail - stackBonus, 0),
    destroy: baseRates.destroy,
  };

  return {
    ...state,
    rates,
    baseRates, // 기본 확률도 반환 (UI에서 보너스 표시용)
    stackBonus,
    startGame,
    enhance,
    confirmResult,
    stopGame,
    resetGame,
    getEnhanceRates,
  };
}
