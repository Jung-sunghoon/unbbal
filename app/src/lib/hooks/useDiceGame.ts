// © 2025 운빨(unbbal). All rights reserved.

import { useState, useCallback } from "react";

const MAX_ROLLS = 10;

export function useDiceGame() {
  const [rolls, setRolls] = useState<number[]>([]);
  const [currentRoll, setCurrentRoll] = useState(0);

  const isComplete = rolls.length >= MAX_ROLLS;
  const sum = rolls.reduce((a, b) => a + b, 0);

  const roll = useCallback(() => {
    if (isComplete) return;

    const value = Math.floor(Math.random() * 6) + 1;
    setCurrentRoll(value);
    setRolls((prev) => [...prev, value]);
  }, [isComplete]);

  const reset = useCallback(() => {
    setRolls([]);
    setCurrentRoll(0);
  }, []);

  return {
    rolls,
    currentRoll,
    sum,
    rollCount: rolls.length,
    isComplete,
    roll,
    reset,
  };
}
