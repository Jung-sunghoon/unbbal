// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";
import { BombResultContent } from "@/components/bomb/BombResultContent";
import { getBombGrade } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ survival?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const survival = Number(params.survival) || 0;
  const grade = getBombGrade(survival);

  const title = `💣 ${grade.grade} (${grade.title}) - ${survival}연속 생존`;
  const description = `폭탄 피하기 ${survival}연속 생존으로 ${grade.grade} 등급 달성!`;

  return {
    title,
    description,
    openGraph: {
      title: `폭탄 피하기 결과: ${grade.grade} - ${survival}연속 생존 | 운빨`,
      description,
      url: `https://unbbal.site/bomb/result?survival=${survival}`,
      images: [
        {
          url: `https://unbbal.site/api/og/luck?grade=${grade.grade}&title=${encodeURIComponent(grade.title)}&score=${survival}`,
          width: 1200,
          height: 630,
          alt: `폭탄 피하기 결과: ${grade.grade}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `폭탄 피하기 결과: ${grade.grade} - ${survival}연속 생존`,
      description,
      images: [`https://unbbal.site/api/og/luck?grade=${grade.grade}&title=${encodeURIComponent(grade.title)}&score=${survival}`],
    },
  };
}

export default async function BombResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const survival = Number(params.survival) || 0;

  return <BombResultContent survival={survival} />;
}
