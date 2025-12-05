// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useRef, useEffect } from "react";

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 min-w-[160px] bg-[#FFDD00] text-black font-medium rounded-lg hover:bg-[#FFCC00] transition-colors"
      >
        <span>☕</span>
        <span>후원하기</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[180px]">
          <a
            href="https://www.buymeacoffee.com/unbbal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">☕</span>
            <span className="font-medium">Buy Me a Coffee</span>
          </a>
          <a
            href="https://qr.kakaopay.com/Ej87OcN6N"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-t border-border"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">💛</span>
            <span className="font-medium">카카오페이</span>
          </a>
        </div>
      )}
    </div>
  );
}
