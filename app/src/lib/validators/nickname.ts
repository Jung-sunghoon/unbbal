// © 2025 운빨(unbbal). All rights reserved.

// 욕설 리스트 (한국어)
const PROFANITY_LIST = [
  // 기본 욕설
  "시발", "씨발", "씨팔", "시팔", "씨바", "시바",
  "ㅅㅂ", "ㅆㅂ", "ㅅㅃ", "ㅆㅃ",
  // 개-
  "개새끼", "개색끼", "개새기", "개색기", "개색", "개샛키", "개세끼",
  "ㄱㅅㄲ", "ㄱㅅ끼",
  // 병신
  "병신", "븅신", "빙신", "ㅂㅅ", "ㅃㅅ",
  // 지랄
  "지랄", "지랼", "ㅈㄹ", "ㅉㄹ",
  // 부모 관련
  "니애미", "느금마", "니엄마", "니미", "니애비", "느금",
  // 성기 관련
  "좆", "자지", "보지", "ㅈㄴ", "존나", "졸라", "ㅈㅈ",
  // 기타
  "꺼져", "닥쳐", "뒤져", "뒈져", "디져", "죽어",
  "미친놈", "미친년", "또라이", "찐따", "등신",
  "씹", "애미", "애비",
];

// 유사 문자 치환 패턴
const SUBSTITUTIONS: Record<string, string[]> = {
  "ㅅ": ["s", "$", "5", "ㅆ"],
  "ㅂ": ["b", "8", "ㅃ", "v"],
  "ㅈ": ["j", "z", "ㅉ"],
  "ㄱ": ["g", "9", "ㄲ"],
  "ㄴ": ["n", "2"],
  "ㄷ": ["d", "ㄸ"],
  "ㄹ": ["r", "l"],
  "ㅁ": ["m"],
  "ㅇ": ["o", "0"],
  "ㅋ": ["k", "ㅋㅋ"],
  "ㅌ": ["t"],
  "ㅍ": ["p", "f"],
  "ㅎ": ["h"],
  "a": ["@", "4"],
  "e": ["3"],
  "i": ["1", "!"],
  "o": ["0"],
  "s": ["$", "5"],
};

export type ValidationError =
  | "too_short"
  | "too_long"
  | "invalid_chars"
  | "profanity"
  | "duplicate";

export interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
}

/**
 * 텍스트 정규화 (대소문자 통일, 유사 문자 치환)
 */
function normalizeText(text: string): string {
  let result = text.toLowerCase();

  // 공백 및 특수문자 제거
  result = result.replace(/[\s._\-]/g, "");

  // 유사 문자 치환
  for (const [char, subs] of Object.entries(SUBSTITUTIONS)) {
    for (const sub of subs) {
      result = result.split(sub.toLowerCase()).join(char);
    }
  }

  return result;
}

/**
 * 욕설 포함 여부 체크
 */
function containsProfanity(text: string): boolean {
  const normalized = normalizeText(text);

  for (const word of PROFANITY_LIST) {
    const normalizedWord = normalizeText(word);
    if (normalized.includes(normalizedWord)) {
      return true;
    }
  }

  return false;
}

/**
 * 닉네임 유효성 검사
 */
export function validateNickname(nickname: string): ValidationResult {
  const trimmed = nickname.trim();

  // 1. 길이 체크 (2-10자)
  if (trimmed.length < 2) {
    return { valid: false, error: "too_short" };
  }
  if (trimmed.length > 10) {
    return { valid: false, error: "too_long" };
  }

  // 2. 허용 문자 체크 (한글, 영문, 숫자, 언더스코어)
  if (!/^[가-힣a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: "invalid_chars" };
  }

  // 3. 욕설 필터
  if (containsProfanity(trimmed)) {
    return { valid: false, error: "profanity" };
  }

  return { valid: true };
}

/**
 * 에러 메시지 반환
 */
export function getErrorMessage(error: ValidationError): string {
  switch (error) {
    case "too_short":
      return "닉네임은 2자 이상이어야 합니다";
    case "too_long":
      return "닉네임은 10자 이하여야 합니다";
    case "invalid_chars":
      return "한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다";
    case "profanity":
      return "부적절한 단어가 포함되어 있습니다";
    case "duplicate":
      return "이미 사용 중인 닉네임입니다";
    default:
      return "알 수 없는 오류입니다";
  }
}
