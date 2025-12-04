// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export function AdUnit({ adSlot, adFormat = "auto", className = "" }: AdUnitProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch {
      // AdSense 에러 무시
    }
  }, []);

  // 프로덕션 환경에서만 광고 표시
  if (process.env.NODE_ENV !== "production") {
    return (
      <div className={`bg-muted rounded-lg p-4 text-center text-sm text-muted-foreground ${className}`}>
        [광고 영역 - 프로덕션에서 표시됩니다]
      </div>
    );
  }

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!adsenseId) {
    return null;
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={adsenseId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
}
