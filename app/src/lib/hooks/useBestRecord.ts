// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useEffect, useCallback } from "react";

type GameType = "dice" | "bomb" | "enhance" | "rps";

interface BestRecords {
  dice: number;      // 최고 합계
  bomb: number;      // 최고 생존 라운드
  enhance: number;   // 최고 강화 수치
  rps: number;       // 최고 연승
}

const STORAGE_KEY = "unbbal_best_records";

const DEFAULT_RECORDS: BestRecords = {
  dice: 0,
  bomb: 0,
  enhance: 0,
  rps: 0,
};

function getStoredRecords(): BestRecords {
  if (typeof window === "undefined") return DEFAULT_RECORDS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_RECORDS, ...JSON.parse(stored) };
    }
  } catch {
    // localStorage 접근 실패 시
  }
  return DEFAULT_RECORDS;
}

function saveRecords(records: BestRecords): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage 저장 실패 시
  }
}

export function useBestRecord(gameType: GameType) {
  const [bestRecord, setBestRecord] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // 초기 로드
  useEffect(() => {
    const records = getStoredRecords();
    setBestRecord(records[gameType]);
  }, [gameType]);

  // 기록 업데이트
  const updateRecord = useCallback((newScore: number) => {
    const records = getStoredRecords();

    if (newScore > records[gameType]) {
      records[gameType] = newScore;
      saveRecords(records);
      setBestRecord(newScore);
      setIsNewRecord(true);
      return true; // 신기록
    }

    setIsNewRecord(false);
    return false;
  }, [gameType]);

  // 신기록 플래그 리셋
  const resetNewRecordFlag = useCallback(() => {
    setIsNewRecord(false);
  }, []);

  return {
    bestRecord,
    isNewRecord,
    updateRecord,
    resetNewRecordFlag,
  };
}
