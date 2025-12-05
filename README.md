# 🍀 운빨 (unbbal)

운빨로 놀자! 다양한 운빨 게임을 즐길 수 있는 웹 플랫폼입니다.

**Live Demo**: [https://unbbal.gg](https://unbbal.gg)

## 🎮 게임 목록

### 🎲 주사위 굴리기
- 주사위를 10번 굴려서 합계로 운빨 측정
- Three.js 3D 주사위 애니메이션
- 평균 35점, 최대 60점

### 💣 폭탄 피하기
- 6개 상자 중 1개에 숨겨진 폭탄을 피해라 (16% 확률)
- 연속 생존 횟수로 등급 결정
- 3D 상자 열림 애니메이션

### ⚔️ 강화 시뮬레이터
- +0에서 시작해서 강화 도전
- +7부터 파괴 확률 등장
- 레벨별 색상 변화 + 파티클 이펙트

### ✊ AI 가위바위보
- Iocaine Powder 스타일 멀티 전략 AI
- 6가지 전략 조합 (빈도 분석, 마르코프 체인, WSLS 등)
- AI 페르소나 + 도발 메시지

## 🛠 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **3D Graphics**: Three.js (React Three Fiber)
- **Animation**: Framer Motion

## 🚀 시작하기

### 필수 조건
- Node.js 18+
- npm or yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/Jung-sunghoon/unbbal.git
cd unbbal/app

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속

### 빌드

```bash
npm run build
npm run start
```

## 📁 프로젝트 구조

```
unbbal/
├── app/                    # Next.js 앱
│   ├── src/
│   │   ├── app/           # 페이지 라우트
│   │   │   ├── dice/      # 주사위 게임
│   │   │   ├── bomb/      # 폭탄 피하기
│   │   │   ├── enhance/   # 강화 시뮬레이터
│   │   │   └── rps/       # AI 가위바위보
│   │   ├── components/    # React 컴포넌트
│   │   │   ├── luck/      # 운빨 게임 컴포넌트
│   │   │   ├── rps/       # 가위바위보 컴포넌트
│   │   │   └── ui/        # shadcn/ui 컴포넌트
│   │   └── lib/           # 유틸리티 & 훅
│   │       ├── hooks/     # 게임 로직 훅
│   │       └── constants.ts
│   └── public/            # 정적 파일
└── README.md
```

## 🎯 등급 시스템

모든 게임은 SSS ~ F 등급으로 결과를 평가합니다.

| 등급 | 설명 |
|------|------|
| SSS | 전설의 운빨 |
| SS | 엄청난 행운 |
| S | 좋은 운 |
| A | 평균 이상 |
| B | 아쉬움 |
| F | 다음 기회에... |

## 🎨 에셋 출처

- Dice sprites: [Dice Roll](https://kicked-in-teeth.itch.io/dice-roll) by Kicked-in-Teeth (CC-BY-SA)

## 📄 라이선스

© 2025 운빨(unbbal). All rights reserved.

## 🤝 기여

이슈와 PR은 언제나 환영합니다!
