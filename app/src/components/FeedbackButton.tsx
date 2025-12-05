// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const feedbackTypes = [
  { value: "feature", label: "기능 추가", emoji: "✨" },
  { value: "bug", label: "버그 제보", emoji: "🐛" },
  { value: "improve", label: "개선 제안", emoji: "💡" },
  { value: "other", label: "기타", emoji: "💬" },
];

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("feature");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, email: email || undefined }),
      });

      if (res.ok) {
        toast.success("피드백이 전송되었습니다! 감사합니다.");
        setIsOpen(false);
        setMessage("");
        setEmail("");
        setType("feature");
      } else {
        const data = await res.json();
        toast.error(data.error || "전송에 실패했습니다.");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 min-w-[160px] bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors"
      >
        <span>💬</span>
        <span>피드백 보내기</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-card border border-border rounded-xl shadow-xl mx-4">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-1">피드백 보내기</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    의견을 보내주시면 더 나은 서비스를 만드는 데 도움이 됩니다!
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        피드백 유형
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {feedbackTypes.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setType(t.value)}
                            className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                              type === t.value
                                ? "border-[var(--luck-primary)] bg-[var(--luck-primary)]/10 text-[var(--luck-primary)]"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            {t.emoji} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="feedback-message"
                        className="text-sm font-medium mb-2 block"
                      >
                        내용 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="feedback-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="어떤 기능이 있으면 좋겠는지, 불편한 점은 무엇인지 알려주세요!"
                        className="w-full h-28 px-3 py-2 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-[var(--luck-primary)] focus:border-transparent"
                      />
                    </div>

                    {/* Email (optional) */}
                    <div>
                      <label
                        htmlFor="feedback-email"
                        className="text-sm font-medium mb-2 block"
                      >
                        이메일 <span className="text-muted-foreground">(선택)</span>
                      </label>
                      <input
                        id="feedback-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="답변 받으실 이메일"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[var(--luck-primary)] focus:border-transparent"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="flex-1"
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-[var(--luck-primary)] hover:bg-[var(--luck-primary)]/90"
                      >
                        {isSubmitting ? "전송 중..." : "보내기"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
