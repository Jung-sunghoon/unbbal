// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { GameTabs } from "@/components/ranking/GameTabs";
import { RankingTable } from "@/components/ranking/RankingTable";
import { GameType, RankingEntry } from "@/lib/supabase/client";

export function RankingPageContent() {
  const [activeGame, setActiveGame] = useState<GameType>("dice");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ranking/${activeGame}?limit=50`);
        const data = await res.json();
        setRankings(data.rankings || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch rankings:", error);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [activeGame]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← 메인으로
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">🏆 명예의 전당</h1>
          <p className="text-muted-foreground">
            각 게임의 최고 기록 보유자들
          </p>
        </header>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* 게임 선택 탭 */}
          <GameTabs activeGame={activeGame} onSelect={setActiveGame} />

          {/* 랭킹 테이블 */}
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RankingTable
              gameType={activeGame}
              rankings={rankings}
              loading={loading}
              total={total}
            />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
