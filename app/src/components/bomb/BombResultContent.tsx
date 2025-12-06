// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ResultShare } from "@/components/ResultShare";
import { getBombGrade } from "@/lib/constants";
import { useBestRecord } from "@/lib/hooks/useBestRecord";

const BOMB_MESSAGES: Record<string, string[]> = {
  SSS: ["폭탄이 무서워하는 사람", "폭탄 해체 전문가", "운빨 만렙!"],
  SS: ["폭탄 냄새를 맡는다", "위험 감지 능력자", "대단해!"],
  S: ["꽤 운이 좋네", "폭탄 피하기 달인", "굿굿!"],
  A: ["나쁘지 않아", "적당히 운이 좋아", "평균 이상!"],
  B: ["아쉽네", "다음엔 더 잘할 수 있어", "조심조심"],
  F: ["바로 터졌네...", "운이 없었어", "다시 도전해봐!"],
};

interface BombResultContentProps {
  survival: number;
}

export function BombResultContent({ survival }: BombResultContentProps) {
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);
  const grade = getBombGrade(survival);
  const { bestRecord, isNewRecord, updateRecord } = useBestRecord("bomb");

  // 직접 URL 접근 방지
  useEffect(() => {
    const completed = sessionStorage.getItem("bomb_completed");
    if (!completed) {
      router.replace("/bomb");
      return;
    }
    sessionStorage.removeItem("bomb_completed");
    setIsValid(true);
  }, [router]);

  // 기록 업데이트
  useEffect(() => {
    if (isValid) updateRecord(survival);
  }, [survival, updateRecord, isValid]);

  if (!isValid) return null;

  const message = useMemo(() => {
    const messages = BOMB_MESSAGES[grade.grade] || [];
    return messages[Math.floor(Math.random() * messages.length)] || "";
  }, [grade.grade]);

  const shareUrl = `https://unbbal.site/bomb/result?survival=${survival}`;
  const shareText = `💣 폭탄 피하기: ${grade.grade} (${grade.title}) - ${survival}연속 생존!`;

  // 생존 확률 계산 (16% 폭발 확률로 n번 연속 생존)
  const survivalRate = survival > 0 ? Math.pow(5/6, survival) * 100 : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-2xl font-bold mt-4">💣 폭탄 피하기 결과</h1>
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

            {/* 생존 횟수 */}
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
              <p className="text-sm text-muted-foreground">연속 생존</p>
              <p className="text-5xl font-black" style={{ color: grade.color }}>
                {survival}회
              </p>
              {survival > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  확률: {survivalRate.toFixed(1)}%
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                최고 기록: {bestRecord}회
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <ResultShare
                title="폭탄 피하기 결과"
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
                <Link href="/bomb">다시하기</Link>
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
