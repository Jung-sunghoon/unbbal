// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";
import { RPSResultContent } from "@/components/rps/RPSResultContent";

function getStreakGrade(streak: number) {
  if (streak >= 10) return { title: "가위바위보의 신", tier: "SSS" };
  if (streak >= 7) return { title: "고수", tier: "SS" };
  if (streak >= 5) return { title: "중수", tier: "S" };
  if (streak >= 3) return { title: "초보", tier: "A" };
  if (streak >= 1) return { title: "입문", tier: "B" };
  return { title: "...", tier: "F" };
}

interface PageProps {
  searchParams: Promise<{ streak?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const streak = Number(params.streak) || 0;
  const grade = getStreakGrade(streak);

  const title = `✊ ${grade.tier} (${grade.title}) - ${streak}연승`;
  const description = `AI 가위바위보 ${streak}연승 달성! - ${grade.title}`;

  return {
    title,
    description,
    openGraph: {
      title: `가위바위보 결과: ${grade.tier} - ${streak}연승 | 운빨`,
      description,
      url: `https://unbbal.site/rps/result?streak=${streak}`,
      images: [
        {
          url: `https://unbbal.site/api/og/rps?streak=${streak}`,
          width: 1200,
          height: 630,
          alt: `가위바위보 결과: ${streak}연승`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `가위바위보 결과: ${grade.tier} - ${streak}연승`,
      description,
      images: [`https://unbbal.site/api/og/rps?streak=${streak}`],
    },
  };
}

export default async function RPSResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const streak = Number(params.streak) || 0;

  return <RPSResultContent streak={streak} />;
}
