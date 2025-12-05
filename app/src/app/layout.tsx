// © 2025 운빨(unbbal). All rights reserved.
// https://unbbal.site

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
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
  title: {
    default: "운빨 - 운빨로 놀자!",
    template: "%s | 운빨",
  },
  description: "주사위 굴리기, 폭탄 피하기, 강화 시뮬레이터, AI 가위바위보까지! 다양한 운빨 게임으로 오늘의 운을 테스트해보세요.",
  keywords: ["운빨", "운 테스트", "가위바위보", "주사위", "폭탄 피하기", "강화 시뮬레이터", "운세", "럭키 게임", "미니게임"],
  authors: [{ name: "운빨" }],
  creator: "운빨",
  metadataBase: new URL("https://unbbal.site"),
  openGraph: {
    title: "운빨 - 운빨로 놀자!",
    description: "주사위 굴리기, 폭탄 피하기, 강화 시뮬레이터, AI 가위바위보까지! 다양한 운빨 게임으로 오늘의 운을 테스트해보세요.",
    url: "https://unbbal.site",
    siteName: "운빨",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "운빨 - 운빨로 놀자!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "운빨 - 운빨로 놀자!",
    description: "주사위, 폭탄 피하기, 강화, AI 가위바위보로 운빨 테스트!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "TFppyk2rxziVx2BDqqoHjO1KZCaKCFU0TuckpmJFvvs",
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
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
