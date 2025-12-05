// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TestCardProps {
  href: string;
  emoji?: string;
  image?: string;
  spriteConfig?: {
    width: number;
    height: number;
    bgSize: string;
    bgPosition: string;
  };
  animatedFrames?: string[];
  title: string;
  description: string;
  accentColor: string;
}

export function TestCard({ href, emoji, image, spriteConfig, animatedFrames, title, description, accentColor }: TestCardProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  // 스프라이트 애니메이션
  useEffect(() => {
    if (!animatedFrames || animatedFrames.length === 0) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % animatedFrames.length);
    }, 100);

    return () => clearInterval(interval);
  }, [animatedFrames]);

  const currentImage = animatedFrames ? animatedFrames[frameIndex] : image;

  return (
    <Link href={href} className="block">
      <Card className="group h-full transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer border border-border">
        <CardHeader className="text-center pb-2">
          <div
            className="flex justify-center mb-2 transition-transform group-hover:scale-110"
            style={{ filter: `drop-shadow(0 2px 4px ${accentColor}40)` }}
          >
            {currentImage && spriteConfig ? (
              <div
                style={{
                  width: spriteConfig.width,
                  height: spriteConfig.height,
                  backgroundImage: `url('${currentImage}')`,
                  backgroundSize: spriteConfig.bgSize,
                  backgroundPosition: spriteConfig.bgPosition,
                  imageRendering: "pixelated",
                }}
              />
            ) : currentImage ? (
              <img
                src={currentImage}
                alt={title}
                className="w-12 h-12"
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <span className="text-5xl">{emoji}</span>
            )}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center text-sm">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
