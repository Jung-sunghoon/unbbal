// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ResultShare } from "@/components/ResultShare";
import { RegisterModal } from "@/components/ranking/RegisterModal";
import { GameType } from "@/lib/supabase/client";
import { getEnhanceGrade, getDiceGrade, getBombGrade, getCoinGrade } from "@/lib/constants";
import { formatProbability } from "@/lib/enhance-probability";

interface ResultPageContentProps {
  id: string;
  gameType: GameType;
  score: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  nickname: string | null;
  isRegistered: boolean;
}

// 게임별 등급 함수
function getGrade(gameType: GameType, score: number) {
  switch (gameType) {
    case "dice":
      return getDiceGrade(score);
    case "bomb":
      return getBombGrade(score);
    case "enhance":
      return getEnhanceGrade(score);
    case "rps":
      if (score >= 10) return { grade: "SSS", title: "가위바위보의 신", color: "#FFD700" };
      if (score >= 7) return { grade: "SS", title: "고수", color: "#FFA500" };
      if (score >= 5) return { grade: "S", title: "중수", color: "#32CD32" };
      if (score >= 3) return { grade: "A", title: "초보", color: "#4169E1" };
      if (score >= 1) return { grade: "B", title: "입문", color: "#9370DB" };
      return { grade: "F", title: "...", color: "#DC143C" };
    case "coin":
      return getCoinGrade(score);
    default:
      return { grade: "?", title: "알 수 없음", color: "#666666" };
  }
}

// 게임별 메시지
const GAME_MESSAGES: Record<GameType, Record<string, string[]>> = {
  dice: {
    SSS: ["신이 주사위를 굴려줬다", "운빨 만렙", "가챠 지금 당장!"],
    SS: ["오늘 뭔가 좋은 일 생길듯", "행운의 손이네", "럭키!"],
    S: ["꽤 괜찮은 결과", "나쁘지 않아", "굿굿"],
    A: ["평균적인 결과", "무난무난", "보통이야"],
    B: ["조금 아쉽네", "다음엔 더 잘 나올거야", "흠..."],
    F: ["오늘은 좀 쉬어가", "주사위가 날 싫어해", "저주받은 손..."],
  },
  bomb: {
    SSS: ["폭탄이 무서워하는 사람", "폭탄 해체 전문가", "운빨 만렙!"],
    SS: ["폭탄 냄새를 맡는다", "위험 감지 능력자", "대단해!"],
    S: ["꽤 운이 좋네", "폭탄 피하기 달인", "굿굿!"],
    A: ["나쁘지 않아", "적당히 운이 좋아", "평균 이상!"],
    B: ["아쉽네", "다음엔 더 잘할 수 있어", "조심조심"],
    F: ["바로 터졌네...", "운이 없었어", "다시 도전해봐!"],
  },
  enhance: {
    LEGEND: ["신화 달성...", "이게 가능해?!", "역대급 운빨"],
    EX: ["초월자의 경지", "인간 승리", "경이로운 기록"],
    SSS: ["강화의 신 그 자체", "운빨 만렙!", "대장인"],
    SS: ["대단한 실력이야", "프로 강화러", "운이 좋았어!"],
    S: ["꽤 잘했어!", "나쁘지 않은 결과", "럭키!"],
    A: ["평균 이상이야", "무난한 결과", "괜찮아!"],
    B: ["아쉽네", "다음엔 더 잘할 수 있어", "욕심을 줄여봐"],
    F: ["일찍 터졌네...", "운이 없었어", "다시 도전해봐!"],
  },
  rps: {
    SSS: ["AI를 완전히 압도했어요!", "불가능을 가능으로!", "전설이 되었다"],
    SS: ["AI 패턴을 완벽하게 읽었네요!", "고수의 경지", "대단해!"],
    S: ["꽤 잘했어요!", "실력자네요", "굿!"],
    A: ["괜찮은 실력이에요", "나쁘지 않아요", "평균 이상!"],
    B: ["다음엔 더 잘할 수 있어요!", "아쉽네요", "화이팅!"],
    F: ["AI가 너무 강했나봐요...", "다시 도전해봐요!", "ㅠㅠ"],
  },
  coin: {
    SSS: ["예언자의 경지!", "동전이 말을 걸어왔나?", "운빨 만렙!"],
    SS: ["점쟁이 재능 있어", "감이 좋네!", "대단해!"],
    S: ["꽤 잘 맞추네", "운이 좋았어", "굿!"],
    A: ["괜찮은 결과야", "나쁘지 않아", "평균 이상!"],
    B: ["다음엔 더 잘할 수 있어", "아쉽네", "화이팅!"],
    F: ["50:50인데...", "운이 없었어", "다시 도전!"],
  },
};

// 게임별 정보
const GAME_INFO: Record<GameType, { title: string; emoji: string; path: string; scoreLabel: string; scoreFormat: (score: number, metadata: Record<string, unknown>) => string }> = {
  dice: {
    title: "주사위 굴리기",
    emoji: "🎲",
    path: "/dice",
    scoreLabel: "10회 합계",
    scoreFormat: (score) => `${score}점`,
  },
  bomb: {
    title: "폭탄 피하기",
    emoji: "💣",
    path: "/bomb",
    scoreLabel: "연속 생존",
    scoreFormat: (score) => `${score}회`,
  },
  enhance: {
    title: "강화 시뮬레이터",
    emoji: "⚔️",
    path: "/enhance",
    scoreLabel: "최고 강화",
    scoreFormat: (score) => `+${score}`,
  },
  rps: {
    title: "AI 가위바위보",
    emoji: "✊",
    path: "/rps",
    scoreLabel: "연승",
    scoreFormat: (score) => `${score}연승`,
  },
  coin: {
    title: "동전 던지기",
    emoji: "🪙",
    path: "/coin",
    scoreLabel: "연속 정답",
    scoreFormat: (score) => `${score}회`,
  },
};

export function ResultPageContent({
  id,
  gameType,
  score,
  metadata,
  nickname,
  isRegistered,
}: ResultPageContentProps) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);
  const [registeredNickname, setRegisteredNickname] = useState(nickname);
  const [registeredRank, setRegisteredRank] = useState<number | null>(null);

  const grade = getGrade(gameType, score);
  const gameInfo = GAME_INFO[gameType];
  const messages = GAME_MESSAGES[gameType][grade.grade] || [];

  const message = useMemo(() => {
    return messages[Math.floor(Math.random() * messages.length)] || "";
  }, [messages]);

  const shareUrl = `https://unbbal.site/result/${id}`;
  const shareText = `${gameInfo.emoji} ${gameInfo.title}: ${grade.grade} (${grade.title}) - ${gameInfo.scoreFormat(score, metadata)}`;

  const handleRegisterSuccess = (rank: number, name: string) => {
    setRegistered(true);
    setRegisteredNickname(name);
    setRegisteredRank(rank);
    setShowRegisterModal(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-2xl font-bold mt-4">
            {gameInfo.emoji} {gameInfo.title} 결과
          </h1>
        </header>

        <Card className="w-full max-w-md mx-auto mb-6 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, delay: 0.2 }}
              className="text-7xl font-black mb-2"
              style={{ color: grade.color }}
            >
              {grade.grade}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="text-2xl" style={{ color: grade.color }}>
                {grade.title}
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-lg text-muted-foreground"
            >
              &quot;{message}&quot;
            </motion.p>

            {/* 점수 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-muted rounded-lg p-4 text-center relative"
            >
              <p className="text-sm text-muted-foreground">{gameInfo.scoreLabel}</p>
              <p className="text-5xl font-black" style={{ color: grade.color }}>
                {gameInfo.scoreFormat(score, metadata)}
              </p>

              {gameType === "dice" && Array.isArray(metadata.rolls) && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">굴린 기록</p>
                  <div className="flex justify-center gap-1 flex-wrap">
                    {(metadata.rolls as number[]).map((roll, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                          roll >= 5 ? "bg-amber-500 text-white" :
                          roll <= 2 ? "bg-red-100 text-red-600" :
                          "bg-muted-foreground/20"
                        }`}
                      >
                        {roll}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {gameType === "enhance" && typeof metadata.attempts === "number" && (
                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  <p className="text-sm text-muted-foreground">
                    시도 횟수: {metadata.attempts}회
                  </p>
                  {typeof metadata.cumulativeProbability === "number" && (
                    <p className="text-sm text-muted-foreground">
                      누적 확률: {formatProbability(metadata.cumulativeProbability)}
                    </p>
                  )}
                </div>
              )}

              {gameType === "rps" && typeof metadata.fireCount === "number" && metadata.fireCount > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-[#F59E0B]">
                    🔥 불타오른 횟수: {metadata.fireCount}회
                  </p>
                </div>
              )}

              {gameType === "coin" && Array.isArray(metadata.history) && metadata.history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">맞춘 기록</p>
                  <div className="flex justify-center gap-1 flex-wrap">
                    {(metadata.history as Array<{ correct: boolean }>).map((record, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                          record.correct
                            ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {record.correct ? "O" : "X"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* 등록 상태 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {registered ? (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    명예의 전당 등록됨
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {registeredNickname}
                    {registeredRank && ` (${registeredRank}위)`}
                  </p>
                  <Link
                    href="/ranking"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    명예의 전당 보기 →
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={() => setShowRegisterModal(true)}
                  variant="outline"
                  className="w-full"
                >
                  🏆 명예의 전당에 기록 남기기
                </Button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <ResultShare
                title={`${gameInfo.title} 결과`}
                text={shareText}
                url={shareUrl}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex gap-3"
            >
              <Button asChild variant="outline" className="flex-1">
                <Link href={gameInfo.path}>다시하기</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">다른 게임</Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* 등록 모달 */}
      {showRegisterModal && (
        <RegisterModal
          resultId={id}
          gameType={gameType}
          score={score}
          onSuccess={handleRegisterSuccess}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}
