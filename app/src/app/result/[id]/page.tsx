// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultPageContent } from "@/components/result/ResultPageContent";
import { supabase, GameType } from "@/lib/supabase/client";
import { getEnhanceGrade, getDiceGrade, getBombGrade, getCoinGrade } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
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
      // RPS는 별도 등급 함수가 없으므로 간단히 처리
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

// 게임별 제목
const GAME_TITLES: Record<GameType, string> = {
  dice: "주사위 굴리기",
  bomb: "폭탄 피하기",
  enhance: "강화 시뮬레이터",
  rps: "AI 가위바위보",
  coin: "동전 던지기",
};

// 게임별 이모지
const GAME_EMOJIS: Record<GameType, string> = {
  dice: "🎲",
  bomb: "💣",
  enhance: "⚔️",
  rps: "✊",
  coin: "🪙",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const { data } = await supabase
    .from("game_results")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) {
    return { title: "결과를 찾을 수 없음 | 운빨" };
  }

  const gameType = data.game_type as GameType;
  const grade = getGrade(gameType, data.score);
  const emoji = GAME_EMOJIS[gameType];
  const gameTitle = GAME_TITLES[gameType];

  const title = `${emoji} ${grade.grade} (${grade.title}) | ${gameTitle}`;
  const description = `${gameTitle} 결과: ${grade.grade} 등급 - 점수 ${data.score}`;

  // RPS는 별도 OG 라우트 사용
  const ogUrl = gameType === "rps"
    ? `https://unbbal.site/api/og/rps?streak=${data.score}&fire=${data.metadata?.fireCount || 0}`
    : `https://unbbal.site/api/og/luck?game=${gameType}&grade=${grade.grade}&title=${encodeURIComponent(grade.title)}&score=${data.score}`;

  return {
    title,
    description,
    openGraph: {
      title: `${gameTitle} 결과: ${grade.grade} | 운빨`,
      description,
      url: `https://unbbal.site/result/${id}`,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `${gameTitle} 결과: ${grade.grade}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${gameTitle} 결과: ${grade.grade}`,
      description,
      images: [ogUrl],
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;

  // UUID 형식 검증
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const { data, error } = await supabase
    .from("game_results")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <ResultPageContent
      id={data.id}
      gameType={data.game_type}
      score={data.score}
      metadata={data.metadata}
      createdAt={data.created_at}
      nickname={data.nickname}
      isRegistered={data.is_registered}
    />
  );
}
