// © 2025 운빨(unbbal). All rights reserved.

import Image from "next/image";
import Link from "next/link";
import { TestCard } from "@/components/TestCard";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image
              src="/favicon.png"
              alt="운빨 로고"
              width={48}
              height={48}
              className="rounded-lg"
              style={{ imageRendering: "pixelated" }}
            />
            <h1 className="text-4xl font-bold">운빨</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            운빨로 놀자!
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <TestCard
            href="/dice"
            image="/dotImg/dice/six sided die.png"
            spriteConfig={{
              width: 48,
              height: 48,
              bgSize: "288px 720px",
              bgPosition: "0 0",
            }}
            title="주사위 굴리기"
            description="10번 굴려서 합계로 운빨 측정!"
            accentColor="#F59E0B"
          />
          <TestCard
            href="/bomb"
            animatedFrames={[
              "/dotImg/bomb/1.png",
              "/dotImg/bomb/2.png",
              "/dotImg/bomb/3.png",
              "/dotImg/bomb/4.png",
              "/dotImg/bomb/5.png",
              "/dotImg/bomb/6.png",
              "/dotImg/bomb/7.png",
              "/dotImg/bomb/8.png",
              "/dotImg/bomb/9.png",
              "/dotImg/bomb/10.png",
            ]}
            title="폭탄 피하기"
            description="6개 중 진짜 폭탄을 피해라!"
            accentColor="#EF4444"
          />
          <TestCard
            href="/enhance"
            image="/dotImg/sword/sword.png"
            spriteConfig={{
              width: 48,
              height: 48,
              bgSize: "288px 240px",
              bgPosition: "0 0",
            }}
            title="강화 시뮬레이터"
            description="몇 강까지 올릴 수 있을까?"
            accentColor="#8B5CF6"
          />
          <TestCard
            href="/rps"
            image="/dotImg/hand/rock.png"
            title="AI 가위바위보"
            description="AI 상대로 몇 연승 가능?"
            accentColor="#10B981"
          />
          <TestCard
            href="/coin"
            image="/dotImg/coin/coin.png"
            spriteConfig={{
              width: 50,
              height: 50,
              bgSize: "400px 50px",
              bgPosition: "0 0",
            }}
            title="동전 던지기"
            description="앞면? 뒷면? 연속으로 맞춰봐!"
            accentColor="#FFD700"
          />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            🏆 명예의 전당 보기
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
