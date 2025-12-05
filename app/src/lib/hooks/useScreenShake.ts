// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useCallback } from "react";

export type ShakeIntensity = "light" | "medium" | "heavy";

const SHAKE_CONFIG: Record<ShakeIntensity, { duration: number; intensity: number }> = {
  light: { duration: 200, intensity: 3 },
  medium: { duration: 300, intensity: 6 },
  heavy: { duration: 500, intensity: 10 },
};

export function useScreenShake() {
  const [isShaking, setIsShaking] = useState(false);
  const [shakeStyle, setShakeStyle] = useState({});

  const shake = useCallback((intensity: ShakeIntensity = "medium") => {
    const config = SHAKE_CONFIG[intensity];
    setIsShaking(true);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < config.duration) {
        const progress = elapsed / config.duration;
        const decay = 1 - progress;
        const x = (Math.random() - 0.5) * config.intensity * decay * 2;
        const y = (Math.random() - 0.5) * config.intensity * decay * 2;
        setShakeStyle({ transform: `translate(${x}px, ${y}px)` });
        requestAnimationFrame(animate);
      } else {
        setShakeStyle({});
        setIsShaking(false);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return { isShaking, shakeStyle, shake };
}
