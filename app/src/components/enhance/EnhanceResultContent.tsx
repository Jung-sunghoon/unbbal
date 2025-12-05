// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ResultShare } from "@/components/ResultShare";
import { getEnhanceGrade } from "@/lib/constants";
import { useBestRecord } from "@/lib/hooks/useBestRecord";

const ENHANCE_MESSAGES: Record<string, string[]> = {
  SSS: ["강화의 신 그 자체", "운빨 만렙!", "레전드 장인"],
  SS: ["대단한 실력이야", "프로 강화러", "운이 좋았어!"],
  S: ["꽤 잘했어!", "나쁘지 않은 결과", "럭키!"],
  A: ["평균 이상이야", "무난한 결과", "괜찮아!"],
  B: ["아쉽네", "다음엔 더 잘할 수 있어", "욕심을 줄여봐"],
  F: ["일찍 터졌네...", "운이 없었어", "다시 도전해봐!"],
};

// 레벨별 색상
function getLevelColor(level: number): string {
  if (level >= 15) return "#FFD700";
  if (level >= 12) return "#FF6B35";
  if (level >= 10) return "#A855F7";
  if (level >= 7) return "#3B82F6";
  if (level >= 4) return "#22C55E";
  return "#9CA3AF";
}

interface EnhanceResultContentProps {
  level: number;
  attempts: number;
}

export function EnhanceResultContent({ level, attempts }: EnhanceResultContentProps) {
  const grade = getEnhanceGrade(level);
  const { bestRecord, isNewRecord, updateRecord } = useBestRecord("enhance");

  useEffect(() => {
    updateRecord(level);
  }, [level, updateRecord]);

  const message = useMemo(() => {
    const messages = ENHANCE_MESSAGES[grade.grade] || [];
    return messages[Math.floor(Math.random() * messages.length)] || "";
  }, [grade.grade]);

  const shareUrl = `https://unbbal.site/enhance/result?level=${level}&attempts=${attempts}`;
  const shareText = `⚔️ 강화 시뮬레이터: ${grade.grade} (${grade.title}) - +${level} 달성! (${attempts}회 시도)`;

  const levelColor = getLevelColor(level);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-2xl font-bold mt-4">⚔️ 강화 결과</h1>
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

            {/* 강화 수치 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-muted rounded-lg p-4 text-center relative"
            >
              {isNewRecord && (
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: -12 }}
                  className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded"
                >
                  NEW!
                </motion.div>
              )}
              <p className="text-sm text-muted-foreground">최고 강화 수치</p>
              <p className="text-6xl font-black" style={{ color: levelColor }}>
                +{level}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                시도 횟수: {attempts}회
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                최고 기록: +{bestRecord}
              </p>
            </motion.div>

            {/* 레벨별 설명 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center text-sm text-muted-foreground"
            >
              {level >= 15 && "전설의 무기를 만들었어요! 🌟"}
              {level >= 12 && level < 15 && "장인의 경지에 올랐어요! ⚡"}
              {level >= 10 && level < 12 && "고강의 세계에 입문했어요! 💜"}
              {level >= 7 && level < 10 && "안전 구간을 벗어났어요! 💙"}
              {level >= 4 && level < 7 && "순조로운 시작이에요! 💚"}
              {level < 4 && "다음엔 더 잘할 수 있어요! 🔄"}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <ResultShare
                title="강화 시뮬레이터 결과"
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
                <Link href="/enhance">다시하기</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">다른 게임</Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
