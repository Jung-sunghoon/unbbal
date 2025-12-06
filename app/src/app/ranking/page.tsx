// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";
import { RankingPageContent } from "@/components/ranking/RankingPageContent";

export const metadata: Metadata = {
  title: "명예의 전당 | 운빨",
  description: "운빨 게임 명예의 전당 - 최고 기록 보유자들",
  openGraph: {
    title: "명예의 전당 | 운빨",
    description: "운빨 게임 명예의 전당 - 최고 기록 보유자들",
    url: "https://unbbal.site/ranking",
  },
};

export default function RankingPage() {
  return <RankingPageContent />;
}
