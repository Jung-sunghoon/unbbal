// © 2025 운빨(unbbal). All rights reserved.

/**
 * 강화 레벨별 성공 확률 반환 (30강까지)
 * +0~+6: 70%, +7~+9: 50%, +10~+14: 30%
 * +15~+19: 10%, +20~+24: 5%, +25~+29: 3%, +30: 1%
 */
function getSuccessRate(level: number): number {
  if (level <= 5) return 0.7;
  if (level <= 8) return 0.5;
  if (level <= 13) return 0.3;
  if (level <= 18) return 0.1;
  if (level <= 23) return 0.05;
  if (level <= 28) return 0.03;
  return 0.01;
}

/**
 * 목표 레벨까지의 누적 성공 확률 계산
 * @param targetLevel 목표 강화 레벨 (예: 15)
 * @returns 0에서 targetLevel까지 연속 성공할 확률
 */
export function calculateCumulativeProbability(targetLevel: number): number {
  if (targetLevel <= 0) return 1;

  let probability = 1;
  for (let i = 0; i < targetLevel; i++) {
    probability *= getSuccessRate(i);
  }
  return probability;
}

/**
 * 확률을 읽기 좋은 문자열로 포맷
 * @param prob 0~1 사이의 확률 값
 * @returns 포맷된 문자열 (예: "0.00016%")
 */
export function formatProbability(prob: number): string {
  const percentage = prob * 100;

  if (percentage >= 1) {
    return `${percentage.toFixed(1)}%`;
  }
  if (percentage >= 0.01) {
    return `${percentage.toFixed(2)}%`;
  }
  if (percentage >= 0.0001) {
    return `${percentage.toFixed(4)}%`;
  }
  // 아주 작은 확률은 지수 표기
  return `${percentage.toExponential(2)}%`;
}
