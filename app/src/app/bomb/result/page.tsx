// © 2025 운빨(unbbal). All rights reserved.

import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// 기존 URL 접근 시 게임 페이지로 리다이렉트
export default function BombResultPage() {
  redirect("/bomb");
}
