// © 2025 운빨(unbbal). All rights reserved.
// https://unbbal.gg

import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import "./globals.css";

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/PretendardVariable.woff2",
      weight: "45 920",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "운빨 - 오늘 운 테스트해봐",
  description: "주사위, 동전, 카드로 오늘의 운빨을 테스트하고, AI와 가위바위보 대결을 해보세요!",
  keywords: ["운빨", "운 테스트", "가위바위보", "주사위", "운세"],
  openGraph: {
    title: "운빨 - 오늘 운 테스트해봐",
    description: "주사위, 동전, 카드로 오늘의 운빨을 테스트하고, AI와 가위바위보 대결을 해보세요!",
    url: "https://unbbal.gg",
    siteName: "운빨",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "운빨 - 오늘 운 테스트해봐",
    description: "주사위, 동전, 카드로 오늘의 운빨을 테스트해보세요!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <GoogleAdSense />
      </head>
      <body
        className={`${pretendard.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
