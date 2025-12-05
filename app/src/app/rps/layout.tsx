// © 2025 운빨(unbbal). All rights reserved.

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 가위바위보",
  description: "AI 상대로 몇 연승 가능? 6가지 전략을 사용하는 똑똑한 AI와 가위바위보 대결! 연승 기록에 도전해보세요.",
  openGraph: {
    title: "AI 가위바위보 | 운빨",
    description: "AI 상대로 몇 연승 가능? 똑똑한 AI와 가위바위보 대결!",
    url: "https://unbbal.site/rps",
  },
};

export default function RPSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
