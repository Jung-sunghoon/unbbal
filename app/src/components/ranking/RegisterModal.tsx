// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GameType } from "@/lib/supabase/client";
import { getErrorMessage, ValidationError } from "@/lib/validators/nickname";

interface RegisterModalProps {
  resultId: string;
  gameType: GameType;
  score: number;
  onSuccess: (rank: number, nickname: string) => void;
  onClose: () => void;
}

export function RegisterModal({
  resultId,
  gameType,
  score,
  onSuccess,
  onClose,
}: RegisterModalProps) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 닉네임 유효성 검사 (debounced)
  const validateNickname = useCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setError(null);
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/nickname/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: value, gameType }),
      });
      const data = await res.json();

      if (!data.valid) {
        setError(data.message);
      } else {
        setError(null);
      }
    } catch {
      setError("검증 중 오류가 발생했습니다");
    } finally {
      setIsValidating(false);
    }
  }, [gameType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (error || isValidating || nickname.trim().length < 2) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/results/${resultId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess(data.rank, data.nickname);
      } else {
        setError(getErrorMessage(data.error as ValidationError));
      }
    } catch {
      setError("등록 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-background rounded-lg border shadow-lg overflow-hidden"
        >
          {/* 헤더 */}
          <div className="bg-muted px-4 py-3 border-b">
            <h2 className="font-bold text-lg">🏆 명예의 전당 등록</h2>
          </div>

          {/* 내용 */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              점수 <span className="font-bold text-foreground">{score}</span>점으로
              명예의 전당에 등록합니다
            </div>

            {/* 닉네임 입력 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  validateNickname(e.target.value);
                }}
                placeholder="2~10자 한글, 영문, 숫자"
                maxLength={10}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              {isValidating && (
                <p className="text-sm text-muted-foreground">검증 중...</p>
              )}
            </div>

            {/* 안내 */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 같은 게임 내에서 닉네임 중복 불가</p>
              <p>• 부적절한 닉네임은 사용할 수 없습니다</p>
              <p>• 등록 후 수정/삭제가 불가능합니다</p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isSubmitting ||
                  isValidating ||
                  !!error ||
                  nickname.trim().length < 2
                }
              >
                {isSubmitting ? "등록 중..." : "등록하기"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
