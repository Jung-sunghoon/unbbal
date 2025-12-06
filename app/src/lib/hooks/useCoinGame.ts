// © 2025 운빨(unbbal). All rights reserved.

import { useState, useCallback } from "react";

export type CoinSide = "heads" | "tails";

export interface CoinFlipRecord {
  prediction: CoinSide;
  result: CoinSide;
  correct: boolean;
}

export interface CoinGameState {
  phase: "ready" | "selecting" | "flipping" | "result" | "gameover";
  streak: number;
  prediction: CoinSide | null;
  result: CoinSide | null;
  history: CoinFlipRecord[];
}

const initialState: CoinGameState = {
  phase: "ready",
  streak: 0,
  prediction: null,
  result: null,
  history: [],
};

export function useCoinGame() {
  const [state, setState] = useState<CoinGameState>(initialState);

  const startGame = useCallback(() => {
    setState({
      ...initialState,
      phase: "selecting",
    });
  }, []);

  const predict = useCallback((side: CoinSide) => {
    setState((prev) => ({
      ...prev,
      phase: "flipping",
      prediction: side,
    }));
  }, []);

  const flip = useCallback(() => {
    const result: CoinSide = Math.random() < 0.5 ? "heads" : "tails";

    setState((prev) => {
      const correct = prev.prediction === result;
      const newRecord: CoinFlipRecord = {
        prediction: prev.prediction!,
        result,
        correct,
      };

      return {
        ...prev,
        phase: "result",
        result,
        history: [...prev.history, newRecord],
        streak: correct ? prev.streak + 1 : prev.streak,
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState((prev) => {
      const lastRecord = prev.history[prev.history.length - 1];

      if (!lastRecord?.correct) {
        return {
          ...prev,
          phase: "gameover",
        };
      }

      return {
        ...prev,
        phase: "selecting",
        prediction: null,
        result: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    startGame,
    predict,
    flip,
    nextRound,
    reset,
  };
}
