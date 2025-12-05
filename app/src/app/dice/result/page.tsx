// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";
import { DiceResultContent } from "@/components/dice/DiceResultContent";
import { getDiceGrade } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ sum?: string; rolls?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const sum = Number(params.sum) || 0;
  const grade = getDiceGrade(sum);

  const title = `🎲 ${grade.grade} (${grade.title}) - ${sum}점`;
  const description = `주사위 10회 합계 ${sum}점으로 ${grade.grade} 등급 달성!`;

  return {
    title,
    description,
    openGraph: {
      title: `주사위 결과: ${grade.grade} - ${sum}점 | 운빨`,
      description,
      url: `https://unbbal.site/dice/result?sum=${sum}`,
      images: [
        {
          url: `https://unbbal.site/api/og/luck?grade=${grade.grade}&title=${encodeURIComponent(grade.title)}&score=${sum}`,
          width: 1200,
          height: 630,
          alt: `주사위 결과: ${grade.grade}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `주사위 결과: ${grade.grade} - ${sum}점`,
      description,
      images: [`https://unbbal.site/api/og/luck?grade=${grade.grade}&title=${encodeURIComponent(grade.title)}&score=${sum}`],
    },
  };
}

export default async function DiceResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sum = Number(params.sum) || 0;
  const rollsParam = params.rolls || "";
  const rolls = rollsParam ? rollsParam.split(",").map(Number) : [];

  return <DiceResultContent sum={sum} rolls={rolls} />;
}
