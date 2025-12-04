// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { Button } from "@/components/ui/button";

interface ResultShareProps {
  title: string;
  text: string;
  url: string;
}

export function ResultShare({ title, text, url }: ResultShareProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었습니다!");
    } catch {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      handleCopyLink();
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${text}\n`
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Button onClick={handleShare} className="flex-1" variant="default">
        공유하기
      </Button>
      <Button onClick={handleTwitterShare} className="flex-1" variant="outline">
        X(트위터) 공유
      </Button>
      <Button onClick={handleCopyLink} className="flex-1" variant="outline">
        링크 복사
      </Button>
    </div>
  );
}
