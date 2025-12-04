// © 2025 운빨(unbbal). All rights reserved.

import Script from "next/script";

export function GoogleAdSense() {
  // 프로덕션 환경에서만 광고 로드
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!adsenseId) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
