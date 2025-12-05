// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";
import { EnhanceResultContent } from "@/components/enhance/EnhanceResultContent";
import { getEnhanceGrade } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ level?: string; attempts?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const level = Number(params.level) || 0;
  const attempts = Number(params.attempts) || 0;
  const grade = getEnhanceGrade(level);

  const title = `⚔️ ${grade.grade} (${grade.title}) - +${level} 달성`;
  const description = `강화 시뮬레이터 +${level} 달성! (${attempts}회 시도) - ${grade.grade} 등급`;

  return {
    title,
    description,
    openGraph: {
      title: `강화 시뮬레이터 결과: ${grade.grade} - +${level} | 운빨`,
      description,
      url: `https://unbbal.site/enhance/result?level=${level}&attempts=${attempts}`,
      images: [
        {
          url: `https://unbbal.site/api/og/luck?grade=${grade.grade}&title=${encodeURIComponent(grade.title)}&score=${level}`,
          width: 1200,
          height: 630,
          alt: `강화 시뮬레이터 결과: ${grade.grade}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `강화 시뮬레이터 결과: ${grade.grade} - +${level}`,
      description,
      images: [`https://unbbal.site/api/og/luck?grade=${grade.grade}&title=${encodeURIComponent(grade.title)}&score=${level}`],
    },
  };
}

export default async function EnhanceResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const level = Number(params.level) || 0;
  const attempts = Number(params.attempts) || 0;

  return <EnhanceResultContent level={level} attempts={attempts} />;
}
