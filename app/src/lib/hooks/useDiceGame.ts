// © 2025 운빨(unbbal). All rights reserved.

import { useState, useCallback } from "react";

const MAX_ROLLS = 10;

export interface DiceRollInfo {
  value: number;
  isBonus: boolean;
}

export function useDiceGame() {
  const [rolls, setRolls] = useState<DiceRollInfo[]>([]);
  const [currentRoll, setCurrentRoll] = useState(0);
  const [bonusCount, setBonusCount] = useState(0); // 보너스 기회
  const [isBonusRoll, setIsBonusRoll] = useState(false); // 현재 롤이 보너스인지
  const [totalBonusUsed, setTotalBonusUsed] = useState(0); // 총 사용한 보너스

  // 기본 10회 완료 여부 (보너스 제외)
  const baseRollCount = rolls.filter(r => !r.isBonus).length;
  const isBaseComplete = baseRollCount >= MAX_ROLLS;
  // 보너스 없으면 게임 완료
  const isComplete = isBaseComplete && bonusCount === 0;
  const sum = rolls.reduce((a, b) => a + b.value, 0);

  const roll = useCallback(() => {
    if (isComplete) return;

    const value = Math.floor(Math.random() * 6) + 1;
    const isBonus = isBaseComplete && bonusCount > 0;

    setCurrentRoll(value);
    setIsBonusRoll(isBonus);
    setRolls((prev) => [...prev, { value, isBonus }]);

    if (isBonus) {
      setBonusCount((prev) => prev - 1);
      setTotalBonusUsed((prev) => prev + 1);
    }

    // 6이 나오면 보너스 기회 추가 (보너스 롤에서도 적용!)
    if (value === 6) {
      setBonusCount((prev) => prev + 1);
    }
  }, [isComplete, isBaseComplete, bonusCount]);

  const reset = useCallback(() => {
    setRolls([]);
    setCurrentRoll(0);
    setBonusCount(0);
    setIsBonusRoll(false);
    setTotalBonusUsed(0);
  }, []);

  return {
    rolls,
    currentRoll,
    sum,
    rollCount: rolls.length,
    baseRollCount,
    bonusCount,
    isBonusRoll,
    totalBonusUsed,
    isBaseComplete,
    isComplete,
    roll,
    reset,
  };
}
