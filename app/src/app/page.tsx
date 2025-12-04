// © 2025 운빨(unbbal). All rights reserved.

import { TestCard } from "@/components/TestCard";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            <span className="mr-2">🍀</span>
            운빨
          </h1>
          <p className="text-lg text-muted-foreground">
            운빨로 놀자!
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <TestCard
            href="/dice"
            emoji="🎲"
            title="주사위 굴리기"
            description="10번 굴려서 합계로 운빨 측정!"
            accentColor="#F59E0B"
          />
          <TestCard
            href="/bomb"
            emoji="💣"
            title="폭탄 피하기"
            description="6개 상자 중 폭탄을 피해라!"
            accentColor="#EF4444"
          />
          <TestCard
            href="/enhance"
            emoji="⚔️"
            title="강화 시뮬레이터"
            description="몇 강까지 올릴 수 있을까?"
            accentColor="#8B5CF6"
          />
          <TestCard
            href="/rps"
            emoji="✊"
            title="AI 가위바위보"
            description="AI 상대로 몇 연승 가능?"
            accentColor="#10B981"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
