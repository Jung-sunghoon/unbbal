// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ResultShare } from "@/components/ResultShare";
import { getDiceGrade } from "@/lib/constants";
import { useBestRecord } from "@/lib/hooks/useBestRecord";

const DICE_MESSAGES: Record<string, string[]> = {
  SSS: ["신이 주사위를 굴려줬다", "운빨 만렙", "가챠 지금 당장!"],
  SS: ["오늘 뭔가 좋은 일 생길듯", "행운의 손이네", "럭키!"],
  S: ["꽤 괜찮은 결과", "나쁘지 않아", "굿굿"],
  A: ["평균적인 결과", "무난무난", "보통이야"],
  B: ["조금 아쉽네", "다음엔 더 잘 나올거야", "흠..."],
  F: ["오늘은 좀 쉬어가", "주사위가 날 싫어해", "저주받은 손..."],
};

interface DiceResultContentProps {
  sum: number;
  rolls: number[];
}

export function DiceResultContent({ sum, rolls }: DiceResultContentProps) {
  const grade = getDiceGrade(sum);
  const { bestRecord, isNewRecord, updateRecord } = useBestRecord("dice");

  useEffect(() => {
    updateRecord(sum);
  }, [sum, updateRecord]);

  const message = useMemo(() => {
    const messages = DICE_MESSAGES[grade.grade] || [];
    return messages[Math.floor(Math.random() * messages.length)] || "";
  }, [grade.grade]);

  const shareUrl = `https://unbbal.site/dice/result?sum=${sum}&rolls=${rolls.join(",")}`;
  const shareText = `🎲 주사위 굴리기: ${grade.grade} (${grade.title}) - 합계 ${sum}점`;

  const average = rolls.length > 0 ? (sum / rolls.length).toFixed(1) : "0";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-2xl font-bold mt-4">🎲 주사위 결과</h1>
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

            {/* 합계 */}
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
              <p className="text-sm text-muted-foreground">10회 합계</p>
              <p className="text-5xl font-black" style={{ color: grade.color }}>
                {sum}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                평균 {average} / 기대값 3.5
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                최고 기록: {bestRecord}점
              </p>
            </motion.div>

            {/* 히스토리 */}
            {rolls.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="py-2"
              >
                <p className="text-sm text-muted-foreground text-center mb-2">굴린 기록</p>
                <div className="flex justify-center gap-1 flex-wrap">
                  {rolls.map((roll, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.05 }}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                        roll >= 5 ? "bg-[var(--luck-primary)] text-white" :
                        roll <= 2 ? "bg-red-100 text-red-600" :
                        "bg-muted"
                      }`}
                    >
                      {roll}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <ResultShare
                title="주사위 굴리기 결과"
                text={shareText}
                url={shareUrl}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex gap-3"
            >
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dice">다시하기</Link>
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
