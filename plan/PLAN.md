# 🎲 운빨 (unbbal) - 프로젝트 기획서

> Claude Code 바이브코딩용 기획서
> 이 파일을 프로젝트 루트에 두고 참고하면서 개발

---

## 프로젝트 개요

```yaml
서비스명: 운빨 (unbbal)
도메인: unbbal.gg (추후 연결)
배포: unbbal.vercel.app (MVP)
슬로건: "오늘 운 테스트해봐"
타겟: 한국 게이머/스트리머/시청자
수익모델: 광고 (AdSense)
```

---

## 기술 스택

```yaml
Framework: Next.js 16 (App Router)
Language: TypeScript
Styling: Tailwind CSS v4 + shadcn/ui
Bundler: Turbopack (Next.js 16 기본)
Image Gen: @vercel/og (결과 공유 이미지)
Analytics: Google Analytics 4 (또는 Vercel Analytics)
Hosting: Vercel (무료 티어)
Database: 없음 (Phase 1은 클라이언트만)
```

### 설치 명령어

```bash
npx create-next-app@latest unbbal --typescript --tailwind --eslint --app --turbopack
cd unbbal
npx shadcn@latest init
```

---

## 핵심 기능

### 1. 운빨 테스트 (/luck)

**컨셉**: 순수 운으로 오늘의 운빨 등급 측정

**User Flow**:
1. 시작 버튼 클릭
2. 3가지 미니게임 순차 진행:
   - 주사위 10번 굴리기 (기댓값 35)
   - 동전 앞면 연속 맞추기 (최대 10번)
   - 카드 뽑기 (에이스 나올 때까지)
3. 종합 점수 계산 → 등급 산정
4. 결과 페이지 + 공유

**점수 계산**:
```typescript
const calculateLuckScore = (
  diceSum: number,      // 10~60 (기댓값 35)
  coinStreak: number,   // 0~10
  cardTries: number     // 1~52
) => {
  const diceScore = 50 + (diceSum - 35) * 2;
  const coinScore = coinStreak * 10;
  const cardScore = Math.max(0, 100 - (cardTries - 1) * 2);
  return Math.round(diceScore * 0.4 + coinScore * 0.3 + cardScore * 0.3);
};
```

**등급 기준**:
| 점수 | 등급 | 타이틀 | 컬러 |
|------|------|--------|------|
| 90+ | SSS | 신의 축복 | #FFD700 |
| 80+ | SS | 대길 | #FFA500 |
| 70+ | S | 길 | #32CD32 |
| 50+ | A | 평범 | #4169E1 |
| 30+ | B | 소흉 | #9370DB |
| 0+ | F | 대흉 | #DC143C |

---

### 2. AI 가위바위보 (/rps)

**컨셉**: AI 상대로 몇 연승 가능한지 도전

**User Flow**:
1. 시작 버튼 클릭
2. 가위/바위/보 선택
3. AI와 대결 (마르코프 체인 기반 패턴 예측)
4. 이기면 연승 +1, 지면 게임 오버
5. 최종 연승 기록 + 공유

**AI 로직 (마르코프 체인)**:
```typescript
type Move = 'rock' | 'paper' | 'scissors';

// 유저의 이전 패턴을 학습해서 다음 수 예측
// 초반 2~3판은 랜덤, 이후 패턴 기반 예측
// 예측한 수를 이기는 수를 선택
```

**난이도**:
- 초반 (1-3연승): 50% 승률 (거의 랜덤)
- 중반 (4-7연승): 40% 승률 (약한 패턴 학습)
- 후반 (8+연승): 30% 승률 (강한 패턴 학습)

---

## 폴더 구조

```
unbbal/
├── app/
│   ├── page.tsx                 # 메인 (테스트 선택)
│   ├── layout.tsx               # 공통 레이아웃
│   ├── globals.css              # Tailwind v4 설정
│   │
│   ├── luck/                    # 운빨 테스트
│   │   ├── page.tsx             # 테스트 페이지
│   │   └── result/
│   │       └── page.tsx         # 결과 페이지
│   │
│   ├── rps/                     # AI 가위바위보
│   │   ├── page.tsx             # 게임 페이지
│   │   └── result/
│   │       └── page.tsx         # 결과 페이지
│   │
│   └── api/
│       └── og/
│           └── [type]/
│               └── route.tsx    # 공유 이미지 생성 API
│
├── components/
│   ├── ui/                      # shadcn/ui 컴포넌트
│   ├── TestCard.tsx             # 메인 페이지 테스트 카드
│   ├── DiceRoll.tsx             # 주사위 컴포넌트
│   ├── CoinFlip.tsx             # 동전 컴포넌트
│   ├── CardDraw.tsx             # 카드 컴포넌트
│   ├── RPSGame.tsx              # 가위바위보 게임
│   └── ResultShare.tsx          # 결과 공유 버튼
│
├── lib/
│   ├── constants.ts             # 등급 기준, 메시지 등
│   ├── utils.ts                 # 유틸 함수
│   └── hooks/
│       ├── useLuckGame.ts       # 운빨 테스트 로직
│       └── useRPSGame.ts        # 가위바위보 로직
│
├── public/
│   └── fonts/                   # 커스텀 폰트 (선택)
│
└── PLAN.md                      # 이 파일
```

---

## 페이지별 상세

### 메인 페이지 (/)

```
┌─────────────────────────────────────┐
│            🎲 운빨                   │
│       "오늘 운 테스트해봐"           │
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────┐ ┌─────────────┐   │
│   │  🎲 운빨    │ │  ✊ AI      │   │
│   │   테스트    │ │ 가위바위보  │   │
│   │             │ │             │   │
│   │ 주사위/동전 │ │  연승 도전  │   │
│   │   /카드     │ │             │   │
│   └─────────────┘ └─────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 운빨 테스트 (/luck)

```
Phase 1: 주사위
┌─────────────────────────────────────┐
│         🎲 주사위를 굴려라!          │
│              (3/10)                 │
│                                     │
│              [ 🎲 ]                 │
│               (4)                   │
│                                     │
│         현재 합계: 18               │
│                                     │
│         [ 굴리기 ]                  │
└─────────────────────────────────────┘

Phase 2: 동전
┌─────────────────────────────────────┐
│         🪙 동전 앞면 맞추기          │
│           연속 성공: 3              │
│                                     │
│              [ 🪙 ]                 │
│                                     │
│      [ 앞면 ]    [ 뒷면 ]           │
└─────────────────────────────────────┘

Phase 3: 카드
┌─────────────────────────────────────┐
│         🃏 에이스를 뽑아라!          │
│            시도: 5번째              │
│                                     │
│            [ 🂠 ]                   │
│                                     │
│          [ 카드 뽑기 ]              │
└─────────────────────────────────────┘
```

### AI 가위바위보 (/rps)

```
┌─────────────────────────────────────┐
│       ✊ AI 가위바위보 챌린지        │
│           현재 연승: 5              │
│                                     │
│    나        VS        AI           │
│   [ ? ]              [ ? ]          │
│                                     │
│   [ ✊ ]   [ ✌️ ]   [ 🖐 ]          │
│    바위      가위      보           │
└─────────────────────────────────────┘
```

### 결과 페이지 (/luck/result, /rps/result)

```
┌─────────────────────────────────────┐
│         오늘의 운빨 등급             │
│                                     │
│              [ SS ]                 │
│              대길                   │
│                                     │
│         "오늘 가챠 돌려도 됨"        │
│                                     │
│    ┌─────────────────────────┐     │
│    │ 주사위: 42점 (▲7)       │     │
│    │ 동전: 5연속             │     │
│    │ 카드: 3번째             │     │
│    └─────────────────────────┘     │
│                                     │
│   [ 공유하기 ]  [ 다시하기 ]        │
│                                     │
│   [ 다른 테스트 해보기 ]            │
└─────────────────────────────────────┘
```

---

## 디자인 가이드

### AI Slop 피하기 (중요!)

```css
/* ❌ 하지 말 것 */
.bad {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
}

/* ✅ 해야 할 것 */
.good {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 컬러 팔레트

```css
:root {
  /* Primary - 테스트별 */
  --luck-primary: #F59E0B;     /* 주황 - 운빨 */
  --rps-primary: #10B981;      /* 초록 - 가위바위보 */
  
  /* Neutral */
  --bg: #FAFAFA;
  --card: #FFFFFF;
  --border: #E5E7EB;
  --text: #111827;
  --text-secondary: #6B7280;
  
  /* Semantic */
  --success: #22C55E;
  --error: #EF4444;
}
```

### 타이포그래피

```css
/* 제목 */
font-size: 24px;
font-weight: 700;

/* 본문 */
font-size: 16px;
font-weight: 400;

/* 서브텍스트 */
font-size: 14px;
font-weight: 400;
color: var(--text-secondary);
```

### 컴포넌트 원칙

- **Button**: 한 화면에 Primary 버튼 1개만
- **Card**: 그림자보다 border 선호
- **애니메이션**: 의미 있는 것만 (주사위 굴리기 등)
- **아이콘**: 최소화, 이모지 활용 OK

---

## 결과 공유 이미지 (OG Image)

### API 엔드포인트

```
GET /api/og/luck?grade=SS&title=대길&score=85
GET /api/og/rps?streak=7
```

### 이미지 사이즈

```
width: 1200px
height: 630px
```

### 샘플 디자인

```
┌─────────────────────────────────────────────┐
│                                             │
│              🎲 운빨                         │
│                                             │
│               [ SS ]                        │
│               대길                          │
│                                             │
│          "오늘 가챠 돌려도 됨"               │
│                                             │
│            unbbal.gg                        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Phase 계획

### Phase 1 (2주) - MVP ✅ 현재

```
Week 1:
├── 프로젝트 셋업 + Vercel 배포
├── 메인 페이지 (테스트 선택)
├── 운빨 테스트 (주사위/동전/카드)
└── 결과 페이지 + 공유 이미지

Week 2:
├── AI 가위바위보
├── 모바일 최적화
├── GA4 연동
└── QA + 버그 수정
```

### Phase 2 (피드백 후)

```
├── 오늘의 운세 메시지 (등급별)
├── 로컬 기록 저장 (localStorage)
├── 광고 배치 (AdSense)
└── SEO 최적화
```

### Phase 3 (확장)

```
├── 글로벌 랭킹 (Supabase)
├── 친구 대결 (링크 공유)
├── 박자 테스트 (별도 서비스)
└── 기타 능력 테스트
```

---

## 체크리스트

### 개발 시작 전

- [ ] Next.js 16 프로젝트 생성
- [ ] Tailwind v4 설정
- [ ] shadcn/ui 초기화
- [ ] Vercel 프로젝트 연결

### MVP 완료 기준

- [ ] 메인 페이지에서 테스트 선택 가능
- [ ] 운빨 테스트 전체 플로우 동작
- [ ] AI 가위바위보 전체 플로우 동작
- [ ] 결과 공유 이미지 생성
- [ ] 모바일에서 정상 동작
- [ ] Vercel 배포 완료

### 출시 전

- [ ] OG 메타 태그 설정
- [ ] 파비콘 적용
- [ ] GA4 연동
- [ ] 404 페이지

---

## 참고 레퍼런스

### 디자인

- Linear.app (깔끔한 SaaS)
- Vercel.com (다크 테마)
- 토스 (국내 최고 UX)

### 유사 서비스

- arealme.com (테스트 사이트)
- 16personalities.com (MBTI)
- poomang.com (심리테스트)

---

## 명령어 모음

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# Vercel 배포
vercel

# shadcn 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add card
```

---

**Let's ship it! 🚀**
