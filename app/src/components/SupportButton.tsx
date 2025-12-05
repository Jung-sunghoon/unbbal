// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 min-w-[160px] bg-[#FFDD00] text-black font-medium rounded-lg hover:bg-[#FFCC00] transition-colors"
      >
        <span>☕</span>
        <span>후원하기</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
            >
              <div className="bg-card border border-border rounded-xl shadow-xl mx-4 p-6">
                <h2 className="text-xl font-bold mb-4 text-center">후원하기</h2>

                <div className="space-y-4">
                  {/* 카카오페이 QR */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      카카오페이로 QR 스캔
                    </p>
                    <div className="bg-white p-3 rounded-lg inline-block">
                      <Image
                        src="/qrcode.png"
                        alt="카카오페이 QR 코드"
                        width={180}
                        height={180}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">또는</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Buy Me a Coffee */}
                  <a
                    href="https://www.buymeacoffee.com/unbbal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#FFDD00] text-black font-medium rounded-lg hover:bg-[#FFCC00] transition-colors"
                  >
                    <span>☕</span>
                    <span>Buy Me a Coffee</span>
                  </a>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
