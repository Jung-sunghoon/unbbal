// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "폭탄 피하기",
  description: "6개 상자 중 1개에 숨겨진 폭탄을 피해라! 연속 생존 횟수로 등급 결정. 3D 상자 애니메이션으로 즐기는 스릴 넘치는 운빨 게임.",
  openGraph: {
    title: "폭탄 피하기 | 운빨",
    description: "6개 상자 중 폭탄을 피해라! 몇 번 연속 생존할 수 있을까?",
    url: "https://unbbal.gg/bomb",
  },
};

export default function BombLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
