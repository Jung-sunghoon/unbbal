// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "동전 던지기",
  description: "앞면? 뒷면? 동전을 던져서 연속으로 맞춰봐! 순수 운빨로 몇 연속까지 갈 수 있을까?",
  openGraph: {
    title: "동전 던지기 | 운빨",
    description: "앞면? 뒷면? 연속으로 맞춰봐! 순수 운빨 테스트!",
    url: "https://unbbal.site/coin",
    images: [
      {
        url: "https://unbbal.site/api/og/game?game=coin",
        width: 1200,
        height: 630,
        alt: "동전 던지기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "동전 던지기 | 운빨",
    description: "앞면? 뒷면? 연속으로 맞춰봐! 순수 운빨 테스트!",
    images: ["https://unbbal.site/api/og/game?game=coin"],
  },
};

export default function CoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
