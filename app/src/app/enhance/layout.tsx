// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "강화 시뮬레이터",
  description: "아이템을 몇 강까지 올릴 수 있을까? +7부터 파괴 확률 등장! 메이플 스타일 강화 시뮬레이터로 운빨을 테스트해보세요.",
  openGraph: {
    title: "강화 시뮬레이터 | 운빨",
    description: "아이템을 몇 강까지 올릴 수 있을까? +7부터 파괴 확률!",
    url: "https://unbbal.site/enhance",
    images: [
      {
        url: "https://unbbal.site/api/og/game?game=enhance",
        width: 1200,
        height: 630,
        alt: "강화 시뮬레이터",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "강화 시뮬레이터 | 운빨",
    description: "아이템을 몇 강까지 올릴 수 있을까? +7부터 파괴 확률!",
    images: ["https://unbbal.site/api/og/game?game=enhance"],
  },
};

export default function EnhanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
