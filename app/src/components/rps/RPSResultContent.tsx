// © 2025 운빨(unbbal). All rights reserved.

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ResultShare } from "@/components/ResultShare";

const AI_NAME = "가위바위보의 신";

function getStreakGrade(streak: number) {
  if (streak >= 10) return { title: "가위바위보의 신", emoji: "👑", color: "#FFD700", tier: "SSS" };
  if (streak >= 7) return { title: "고수", emoji: "🏆", color: "#FFA500", tier: "SS" };
  if (streak >= 5) return { title: "중수", emoji: "💪", color: "#32CD32", tier: "S" };
  if (streak >= 3) return { title: "초보", emoji: "🌱", color: "#4169E1", tier: "A" };
  if (streak >= 1) return { title: "입문", emoji: "🐣", color: "#9370DB", tier: "B" };
  return { title: "...", emoji: "💀", color: "#DC143C", tier: "F" };
}

function getStreakMessage(streak: number) {
  if (streak >= 10) return "AI를 완전히 압도했어요!";
  if (streak >= 7) return "AI 패턴을 완벽하게 읽었네요!";
  if (streak >= 5) return "꽤 잘했어요!";
  if (streak >= 3) return "괜찮은 실력이에요";
  if (streak >= 1) return "다음엔 더 잘할 수 있어요!";
  return "AI가 너무 강했나봐요...";
}

function getAIReaction(streak: number) {
  if (streak >= 10) return { face: "😱", message: "불가능해... 어떻게...?!" };
  if (streak >= 7) return { face: "😰", message: "제법인데... 다음엔 안 봐줘." };
  if (streak >= 5) return { face: "😤", message: "운이 좋았을 뿐이야!" };
  if (streak >= 3) return { face: "😏", message: "아직 멀었어." };
  if (streak >= 1) return { face: "😎", message: "그게 최선이야?" };
  return { face: "🤣", message: "ㅋㅋㅋㅋㅋ" };
}

interface RPSResultContentProps {
  streak: number;
}

export function RPSResultContent({ streak }: RPSResultContentProps) {
  const grade = getStreakGrade(streak);
  const message = getStreakMessage(streak);
  const aiReaction = getAIReaction(streak);

  const shareUrl = `https://unbbal.site/rps/result?streak=${streak}`;
  const shareText = `AI 가위바위보 ${streak}연승 달성! - ${grade.title}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 홈으로
          </Link>
          <h1 className="text-2xl font-bold mt-4">가위바위보 결과</h1>
        </header>

        <Card className="w-full max-w-md mx-auto mb-6 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, delay: 0.2 }}
              className="text-7xl mb-2"
            >
              {grade.emoji}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="text-5xl font-black" style={{ color: grade.color }}>
                {streak}연승
              </CardTitle>
              <p className="text-xl font-bold mt-1" style={{ color: grade.color }}>
                {grade.tier} - {grade.title}
              </p>
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

            {/* AI 반응 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <span className="text-3xl">{aiReaction.face}</span>
              <div>
                <p className="font-bold text-sm">{AI_NAME}</p>
                <p className="text-sm text-muted-foreground">&quot;{aiReaction.message}&quot;</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <ResultShare
                title="AI 가위바위보 결과"
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
                <Link href="/rps">다시 도전</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">다른 테스트</Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
