// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "주사위 굴리기",
  description: "주사위를 10번 굴려서 합계로 오늘의 운빨을 측정해보세요! 평균 35점, 최대 60점. 3D 주사위 애니메이션으로 즐기는 운빨 테스트.",
  openGraph: {
    title: "주사위 굴리기 | 운빨",
    description: "주사위를 10번 굴려서 합계로 오늘의 운빨을 측정해보세요!",
    url: "https://unbbal.site/dice",
    images: [
      {
        url: "https://unbbal.site/api/og/game?game=dice",
        width: 1200,
        height: 630,
        alt: "주사위 굴리기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "주사위 굴리기 | 운빨",
    description: "주사위를 10번 굴려서 합계로 오늘의 운빨을 측정해보세요!",
    images: ["https://unbbal.site/api/og/game?game=dice"],
  },
};

export default function DiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
