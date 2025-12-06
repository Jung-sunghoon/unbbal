// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useCallback, useRef } from "react";
import { RPSMove, getRPSResult } from "@/lib/constants";

export interface RPSGameState {
  phase: "ready" | "countdown" | "playing" | "revealing" | "result" | "gameover";
  streak: number;
  bestStreak: number;
  totalGames: number;
  fireCount: number; // 5연승 달성 횟수
  isOnFire: boolean; // 현재 불타오르는 중 (5연승 이상)
  playerMove: RPSMove | null;
  aiMove: RPSMove | null;
  roundResult: "win" | "lose" | "draw" | null;
  aiMood: "confident" | "nervous" | "angry" | "shocked" | "smug";
  aiMessage: string;
}

const MOVES: RPSMove[] = ["rock", "paper", "scissors"];

// 상대 수를 이기는 수
const getCounter = (move: RPSMove): RPSMove => {
  if (move === "rock") return "paper";
  if (move === "paper") return "scissors";
  return "rock";
};

// 상대 수에게 지는 수
const getLoser = (move: RPSMove): RPSMove => {
  if (move === "rock") return "scissors";
  if (move === "paper") return "rock";
  return "paper";
};

// ===== Iocaine Powder 스타일 다중 전략 AI =====
interface Strategy {
  name: string;
  predict: () => RPSMove | null;
  score: number;
}

function useIocaineAI() {
  const history = useRef<Array<{ player: RPSMove; ai: RPSMove; result: "win" | "lose" | "draw" }>>([]);
  const strategyScores = useRef<Record<string, number>>({});

  // 전략 1: 빈도 분석 - 가장 많이 낸 수의 카운터
  const frequencyStrategy = (): RPSMove | null => {
    if (history.current.length < 2) return null;
    const counts = { rock: 0, paper: 0, scissors: 0 };
    history.current.forEach(h => counts[h.player]++);

    let maxMove: RPSMove = "rock";
    let maxCount = 0;
    for (const move of MOVES) {
      if (counts[move] > maxCount) {
        maxCount = counts[move];
        maxMove = move;
      }
    }
    return getCounter(maxMove);
  };

  // 전략 2: 마르코프 체인 - 이전 수 다음에 뭘 내나
  const markovStrategy = (): RPSMove | null => {
    if (history.current.length < 3) return null;
    const lastPlayerMove = history.current[history.current.length - 1].player;

    const transitions: Record<RPSMove, number> = { rock: 0, paper: 0, scissors: 0 };
    for (let i = 0; i < history.current.length - 1; i++) {
      if (history.current[i].player === lastPlayerMove) {
        transitions[history.current[i + 1].player]++;
      }
    }

    let maxMove: RPSMove = "rock";
    let maxCount = 0;
    for (const move of MOVES) {
      if (transitions[move] > maxCount) {
        maxCount = transitions[move];
        maxMove = move;
      }
    }
    return maxCount > 0 ? getCounter(maxMove) : null;
  };

  // 전략 3: Win-Stay Lose-Shift - 이겼으면 유지, 졌으면 변경
  const wsLsStrategy = (): RPSMove | null => {
    if (history.current.length < 2) return null;
    const last = history.current[history.current.length - 1];

    // 유저가 이겼으면 같은 수 유지할 확률 높음
    if (last.result === "win") {
      return getCounter(last.player);
    }
    // 유저가 졌으면 이긴 수로 바꿀 확률 높음
    if (last.result === "lose") {
      return getCounter(getCounter(last.player));
    }
    return null;
  };

  // 전략 4: 안티 갬블러 - 같은 수 연속은 피한다는 심리
  const antiGamblerStrategy = (): RPSMove | null => {
    if (history.current.length < 2) return null;
    const last = history.current[history.current.length - 1];
    const secondLast = history.current[history.current.length - 2];

    // 두 번 연속 같은 수 냈으면 바꿀 확률 높음
    if (last.player === secondLast?.player) {
      // 바꿀 두 수 중 하나의 카운터
      const others = MOVES.filter(m => m !== last.player);
      return getCounter(others[Math.floor(Math.random() * 2)]);
    }
    return null;
  };

  // 전략 5: 최근 패턴 - 최근 3수 패턴 반복 감지
  const recentPatternStrategy = (): RPSMove | null => {
    if (history.current.length < 6) return null;
    const recent3 = history.current.slice(-3).map(h => h.player);

    // 이전에 같은 패턴이 있었나 찾기
    for (let i = 0; i < history.current.length - 4; i++) {
      const pattern = history.current.slice(i, i + 3).map(h => h.player);
      if (pattern[0] === recent3[0] && pattern[1] === recent3[1] && pattern[2] === recent3[2]) {
        // 그 다음에 뭘 냈나
        if (i + 3 < history.current.length) {
          return getCounter(history.current[i + 3].player);
        }
      }
    }
    return null;
  };

  // 전략 6: 메타 전략 - 내가 예측할 걸 상대가 알고 그 카운터를 낸다고 예측
  const metaStrategy = (): RPSMove | null => {
    const freq = frequencyStrategy();
    if (freq) {
      // 상대가 내 빈도 전략을 읽었다면, 그 카운터의 카운터
      return getCounter(getCounter(freq));
    }
    return null;
  };

  const strategies: Strategy[] = [
    { name: "frequency", predict: frequencyStrategy, score: 0 },
    { name: "markov", predict: markovStrategy, score: 0 },
    { name: "wsls", predict: wsLsStrategy, score: 0 },
    { name: "antiGambler", predict: antiGamblerStrategy, score: 0 },
    { name: "recentPattern", predict: recentPatternStrategy, score: 0 },
    { name: "meta", predict: metaStrategy, score: 0 },
  ];

  const getAIMove = (difficulty: number): RPSMove => {
    // 각 전략의 예측 수집
    const predictions: Array<{ name: string; move: RPSMove }> = [];

    for (const strategy of strategies) {
      const move = strategy.predict();
      if (move) {
        predictions.push({ name: strategy.name, move });
      }
    }

    // 예측이 없으면 랜덤
    if (predictions.length === 0) {
      return MOVES[Math.floor(Math.random() * 3)];
    }

    // 난이도에 따라 전략 사용 확률 조절
    // difficulty 0~1 사이, 높을수록 AI가 강함
    if (Math.random() > difficulty) {
      return MOVES[Math.floor(Math.random() * 3)];
    }

    // 가장 성적 좋은 전략 우선 사용
    const scores = strategyScores.current;
    predictions.sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0));

    // 투표 시스템: 여러 전략이 같은 수를 추천하면 가중치
    const votes: Record<RPSMove, number> = { rock: 0, paper: 0, scissors: 0 };
    predictions.forEach((p, i) => {
      const weight = 1 + (scores[p.name] || 0) * 0.2; // 0.1 → 0.2 (성적 좋은 전략 더 신뢰)
      votes[p.move] += weight / (i * 0.5 + 1); // 상위 전략에 더 큰 가중치
    });

    let bestMove: RPSMove = "rock";
    let bestVote = 0;
    for (const move of MOVES) {
      if (votes[move] > bestVote) {
        bestVote = votes[move];
        bestMove = move;
      }
    }

    return bestMove;
  };

  const recordResult = (playerMove: RPSMove, aiMove: RPSMove, result: "win" | "lose" | "draw") => {
    history.current.push({ player: playerMove, ai: aiMove, result });

    // 각 전략의 예측이 맞았는지 점수 업데이트
    for (const strategy of strategies) {
      const predicted = strategy.predict();
      if (predicted) {
        // AI 입장에서 이겼으면 (유저가 졌으면) 점수 +1
        // AI 입장에서 졌으면 점수 -1
        if (predicted === aiMove && result === "lose") {
          strategyScores.current[strategy.name] = (strategyScores.current[strategy.name] || 0) + 1;
        } else if (predicted === aiMove && result === "win") {
          strategyScores.current[strategy.name] = (strategyScores.current[strategy.name] || 0) - 1;
        }
      }
    }
  };

  const reset = () => {
    history.current = [];
    strategyScores.current = {};
  };

  const getHistory = () => history.current;

  return { getAIMove, recordResult, reset, getHistory };
}

// ===== AI 페르소나 =====
const AI_NAME = "가위바위보의 신";

interface TauntSet {
  confident: string[];
  nervous: string[];
  angry: string[];
  shocked: string[];
  smug: string[];
  intro: string[];
  win: string[];
  lose: string[];
  draw: string[];
}

const AI_TAUNTS: TauntSet = {
  confident: [
    "읽었다.",
    "네 패턴, 다 보여.",
    "그거 내려고 했지?",
    "3수 앞을 본다.",
    "운빨은 없다. 실력이다.",
  ],
  nervous: [
    "흠... 제법인데?",
    "운이 좋았을 뿐이야.",
    "아직 본 실력 아님.",
    "긴장하는 거 아니야...",
  ],
  angry: [
    "...뭐?",
    "말이 안 돼.",
    "이건 버그야.",
    "다시 해.",
  ],
  shocked: [
    "어...?",
    "잠깐, 뭐지?",
    "이럴 리가...",
  ],
  smug: [
    "ㅋ",
    "너무 쉬운데?",
    "다음은 뭘 낼까~",
    "가위바위보의 신이다.",
  ],
  intro: [
    "나는 가위바위보의 신이다.",
    "네 패턴을 읽어주지.",
    "몇 연승까지 갈 수 있을까?",
  ],
  win: [
    "승리!",
    "이겼다!",
    "예상대로.",
  ],
  lose: [
    "으악!",
    "졌다...!",
    "이번엔 운이 좋았어.",
  ],
  draw: [
    "비겼네.",
    "흥, 눈치 빠르네.",
    "다음엔 안 봐줘.",
  ],
};

function getAIMood(streak: number, result: "win" | "lose" | "draw" | null): RPSGameState["aiMood"] {
  if (result === "win" && streak >= 5) return "shocked";
  if (result === "win" && streak >= 3) return "angry";
  if (result === "win") return "nervous";
  if (result === "lose") return "smug";
  if (streak === 0) return "confident";
  if (streak >= 5) return "nervous";
  return "confident";
}

function getAIMessage(mood: RPSGameState["aiMood"], result: "win" | "lose" | "draw" | null, isIntro = false): string {
  if (isIntro) {
    return AI_TAUNTS.intro[Math.floor(Math.random() * AI_TAUNTS.intro.length)];
  }

  if (result === "win") {
    return AI_TAUNTS.lose[Math.floor(Math.random() * AI_TAUNTS.lose.length)];
  }
  if (result === "lose") {
    return AI_TAUNTS.win[Math.floor(Math.random() * AI_TAUNTS.win.length)];
  }
  if (result === "draw") {
    return AI_TAUNTS.draw[Math.floor(Math.random() * AI_TAUNTS.draw.length)];
  }

  const taunts = AI_TAUNTS[mood];
  return taunts[Math.floor(Math.random() * taunts.length)];
}

// ===== 메인 훅 =====
export function useRPSGame() {
  const [state, setState] = useState<RPSGameState>({
    phase: "ready",
    streak: 0,
    bestStreak: 0,
    totalGames: 0,
    fireCount: 0,
    isOnFire: false,
    playerMove: null,
    aiMove: null,
    roundResult: null,
    aiMood: "confident",
    aiMessage: getAIMessage("confident", null, true),
  });

  const ai = useIocaineAI();

  const startGame = useCallback(() => {
    ai.reset();
    setState({
      phase: "playing",
      streak: 0,
      bestStreak: 0,
      totalGames: 0,
      fireCount: 0,
      isOnFire: false,
      playerMove: null,
      aiMove: null,
      roundResult: null,
      aiMood: "confident",
      aiMessage: getAIMessage("confident", null),
    });
  }, [ai]);

  const play = useCallback((playerMove: RPSMove) => {
    // 난이도: 연승에 따라 AI가 점점 강해짐
    // 0연승: 55%, 5연승: 75%, 10연승: 95%
    const difficulty = Math.min(0.55 + state.streak * 0.04, 0.95);
    const aiMove = ai.getAIMove(difficulty);

    const result = getRPSResult(playerMove, aiMove);
    ai.recordResult(playerMove, aiMove, result);

    const newStreak = result === "win" ? state.streak + 1 : state.streak;
    const newBestStreak = Math.max(state.bestStreak, newStreak);
    const mood = getAIMood(newStreak, result);
    const message = getAIMessage(mood, result);

    // 5연승 달성 체크 (5, 10, 15... 연승마다 fireCount 증가)
    const justHitFire = result === "win" && newStreak > 0 && newStreak % 5 === 0;
    const newIsOnFire = newStreak >= 5;

    // 먼저 revealing 단계로 (드라마틱 연출)
    setState(prev => ({
      ...prev,
      phase: "revealing",
      playerMove,
      aiMove,
    }));

    // 잠시 후 결과 공개
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        phase: result === "lose" ? "gameover" : "result",
        roundResult: result,
        streak: newStreak,
        bestStreak: newBestStreak,
        totalGames: prev.totalGames + 1,
        fireCount: justHitFire ? prev.fireCount + 1 : prev.fireCount,
        isOnFire: newIsOnFire,
        aiMood: mood,
        aiMessage: message,
      }));
    }, 800);
  }, [ai, state.streak, state.bestStreak]);

  const nextRound = useCallback(() => {
    const mood = getAIMood(state.streak, null);
    setState(prev => ({
      ...prev,
      phase: "playing",
      playerMove: null,
      aiMove: null,
      roundResult: null,
      aiMood: mood,
      aiMessage: getAIMessage(mood, null),
    }));
  }, [state.streak]);

  const resetGame = useCallback(() => {
    ai.reset();
    setState({
      phase: "ready",
      streak: 0,
      bestStreak: 0,
      totalGames: 0,
      fireCount: 0,
      isOnFire: false,
      playerMove: null,
      aiMove: null,
      roundResult: null,
      aiMood: "confident",
      aiMessage: getAIMessage("confident", null, true),
    });
  }, [ai]);

  return {
    ...state,
    aiName: AI_NAME,
    startGame,
    play,
    nextRound,
    resetGame,
  };
}
