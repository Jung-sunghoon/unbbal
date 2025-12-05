// © 2025 운빨(unbbal). All rights reserved.
// https://unbbal.site

// 공통 등급 타입
export interface GradeInfo {
  grade: string;
  title: string;
  color: string;
}

// ===== 주사위 게임 =====
// 10번 굴려서 합계 (범위: 10~60, 평균: 35)
export const DICE_GRADES: Array<{ minSum: number } & GradeInfo> = [
  { minSum: 50, grade: "SSS", title: "신의 주사위", color: "#FFD700" },
  { minSum: 45, grade: "SS", title: "행운의 손", color: "#FFA500" },
  { minSum: 40, grade: "S", title: "꽤 좋은 손", color: "#32CD32" },
  { minSum: 30, grade: "A", title: "평범한 손", color: "#4169E1" },
  { minSum: 20, grade: "B", title: "아쉬운 손", color: "#9370DB" },
  { minSum: 0, grade: "F", title: "저주받은 손", color: "#DC143C" },
];

export function getDiceGrade(sum: number): GradeInfo {
  const found = DICE_GRADES.find((g) => sum >= g.minSum);
  return found || DICE_GRADES[DICE_GRADES.length - 1];
}

// ===== 폭탄 피하기 게임 =====
// 연속 생존 횟수 (6개 중 1개 폭탄, 16% 확률)
export const BOMB_GRADES: Array<{ minSurvival: number } & GradeInfo> = [
  { minSurvival: 10, grade: "SSS", title: "폭탄 해체반", color: "#FFD700" },
  { minSurvival: 7, grade: "SS", title: "지뢰 탐지견", color: "#FFA500" },
  { minSurvival: 5, grade: "S", title: "운 좋은 녀석", color: "#32CD32" },
  { minSurvival: 3, grade: "A", title: "조심성 있음", color: "#4169E1" },
  { minSurvival: 1, grade: "B", title: "초보", color: "#9370DB" },
  { minSurvival: 0, grade: "F", title: "폭사", color: "#DC143C" },
];

export function getBombGrade(survival: number): GradeInfo {
  const found = BOMB_GRADES.find((g) => survival >= g.minSurvival);
  return found || BOMB_GRADES[BOMB_GRADES.length - 1];
}

// ===== 강화 시뮬레이터 =====
// 최고 강화 수치
export const ENHANCE_GRADES: Array<{ minLevel: number } & GradeInfo> = [
  { minLevel: 15, grade: "SSS", title: "강화의 신", color: "#FFD700" },
  { minLevel: 12, grade: "SS", title: "장인", color: "#FFA500" },
  { minLevel: 10, grade: "S", title: "럭키", color: "#32CD32" },
  { minLevel: 7, grade: "A", title: "평균", color: "#4169E1" },
  { minLevel: 4, grade: "B", title: "아쉬움", color: "#9370DB" },
  { minLevel: 0, grade: "F", title: "파산", color: "#DC143C" },
];

export function getEnhanceGrade(level: number): GradeInfo {
  const found = ENHANCE_GRADES.find((g) => level >= g.minLevel);
  return found || ENHANCE_GRADES[ENHANCE_GRADES.length - 1];
}

// 등급별 메시지
export const GRADE_MESSAGES: Record<string, string[]> = {
  SSS: ["오늘 로또 사도 됨", "가챠 지금 당장 돌려", "이 운빨 실화냐?"],
  SS: ["오늘 가챠 돌려도 됨", "뭔가 좋은 일이 생길 듯", "운이 터졌다!"],
  S: ["괜찮은 하루가 될 거야", "소소한 행운 예감", "나쁘지 않아!"],
  A: ["평범한 하루", "무난무난", "기대도 실망도 없는 운"],
  B: ["조심해서 나쁠 건 없어", "오늘은 좀 쉬어가자", "다음 기회를 노려봐"],
  F: ["오늘은 집에 있어", "가챠 절대 금지", "내일의 운을 기대해보자..."],
};

// 가위바위보 타입
export type RPSMove = "rock" | "paper" | "scissors";

export const RPS_EMOJI: Record<RPSMove, string> = {
  rock: "✊",
  paper: "🖐",
  scissors: "✌️",
};

export const RPS_NAME: Record<RPSMove, string> = {
  rock: "바위",
  paper: "보",
  scissors: "가위",
};

// 승패 판정
export function getRPSResult(
  player: RPSMove,
  ai: RPSMove
): "win" | "lose" | "draw" {
  if (player === ai) return "draw";
  if (
    (player === "rock" && ai === "scissors") ||
    (player === "paper" && ai === "rock") ||
    (player === "scissors" && ai === "paper")
  ) {
    return "win";
  }
  return "lose";
}
