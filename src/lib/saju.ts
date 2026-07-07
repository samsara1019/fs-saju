// 사주 계산 — lunar-javascript의 팔자(八字) 계산을 기반으로
// 한글 변환, 오행 분포, 페어 궁합 점수를 산출한다.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar, Lunar } = require("lunar-javascript");

export type Element = "목" | "화" | "토" | "금" | "수";

/** solar: 양력 / lunar: 음력 평달 / lunar_leap: 음력 윤달 */
export type CalendarType = "solar" | "lunar" | "lunar_leap";

export const CALENDAR_LABEL: Record<CalendarType, string> = {
  solar: "양력",
  lunar: "음력",
  lunar_leap: "음력(윤달)",
};

export interface Pillar {
  stem: string; // 천간 (한글)
  branch: string; // 지지 (한글)
  stemElement: Element;
  branchElement: Element;
}

export interface SajuResult {
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    time: Pillar | null; // 태어난 시간을 모르면 null
  };
  dayMaster: {
    stem: string; // 일간
    element: Element;
    yinYang: "양" | "음";
  };
  elementCounts: Record<Element, number>;
  dominantElement: Element;
  lackingElements: Element[];
  animal: string; // 띠
}

const STEM_KO: Record<string, string> = {
  甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무",
  己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계",
};
const BRANCH_KO: Record<string, string> = {
  子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사",
  午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해",
};
const STEM_ELEMENT: Record<string, Element> = {
  甲: "목", 乙: "목", 丙: "화", 丁: "화", 戊: "토",
  己: "토", 庚: "금", 辛: "금", 壬: "수", 癸: "수",
};
const BRANCH_ELEMENT: Record<string, Element> = {
  子: "수", 丑: "토", 寅: "목", 卯: "목", 辰: "토", 巳: "화",
  午: "화", 未: "토", 申: "금", 酉: "금", 戌: "토", 亥: "수",
};
const STEM_YANG = new Set(["甲", "丙", "戊", "庚", "壬"]);
const BRANCH_ANIMAL: Record<string, string> = {
  子: "쥐", 丑: "소", 寅: "호랑이", 卯: "토끼", 辰: "용", 巳: "뱀",
  午: "말", 未: "양", 申: "원숭이", 酉: "닭", 戌: "개", 亥: "돼지",
};

// 상생: 목→화→토→금→수→목
const GENERATES: Record<Element, Element> = {
  목: "화", 화: "토", 토: "금", 금: "수", 수: "목",
};
// 상극: 목→토, 토→수, 수→화, 화→금, 금→목
const CONTROLS: Record<Element, Element> = {
  목: "토", 토: "수", 수: "화", 화: "금", 금: "목",
};

const ELEMENTS: Element[] = ["목", "화", "토", "금", "수"];

function toPillar(ganzhi: string): Pillar {
  const [stem, branch] = [ganzhi[0], ganzhi[1]];
  return {
    stem: STEM_KO[stem],
    branch: BRANCH_KO[branch],
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
  };
}

/**
 * 음력 생일을 양력 "YYYY-MM-DD"로 변환한다. 존재하지 않는 음력 날짜(30일이 없는 달,
 * 윤달이 없는 해 등)면 lunar-javascript가 던지는 에러를 그대로 전파한다.
 */
export function lunarToSolar(birthDate: string, leap: boolean): string {
  const [y, m, d] = birthDate.split("-").map(Number);
  const lunar = Lunar.fromYmd(y, leap ? -m : m, d);
  const solar = lunar.getSolar();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${solar.getYear()}-${pad(solar.getMonth())}-${pad(solar.getDay())}`;
}

/**
 * birthDate: "YYYY-MM-DD", birthTime: "HH:mm" 또는 null, calendar: 양력/음력/음력(윤달).
 * 음력이면 양력으로 변환 후 계산한다.
 * 시간을 모르면 정오로 계산하되 시주는 제외한다 (자시 경계에 걸릴 위험이 가장 적은 시각).
 */
export function calculateSaju(
  birthDate: string,
  birthTime: string | null,
  calendar: CalendarType = "solar"
): SajuResult {
  const solarDate =
    calendar === "solar" ? birthDate : lunarToSolar(birthDate, calendar === "lunar_leap");
  const [y, m, d] = solarDate.split("-").map(Number);
  const [hh, mm] = birthTime ? birthTime.split(":").map(Number) : [12, 0];

  const solar = Solar.fromYmdHms(y, m, d, hh, mm, 0);
  const eightChar = solar.getLunar().getEightChar();

  const year = toPillar(eightChar.getYear());
  const month = toPillar(eightChar.getMonth());
  const day = toPillar(eightChar.getDay());
  const time = birthTime ? toPillar(eightChar.getTime()) : null;

  const counts: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of [year, month, day, time]) {
    if (!p) continue;
    counts[p.stemElement]++;
    counts[p.branchElement]++;
  }

  const dominantElement = ELEMENTS.reduce((a, b) => (counts[b] > counts[a] ? b : a));
  const lackingElements = ELEMENTS.filter((e) => counts[e] === 0);

  const dayStemHanja = eightChar.getDay()[0] as string;
  const yearBranchHanja = eightChar.getYear()[1] as string;

  return {
    pillars: { year, month, day, time },
    dayMaster: {
      stem: day.stem,
      element: day.stemElement,
      yinYang: STEM_YANG.has(dayStemHanja) ? "양" : "음",
    },
    elementCounts: counts,
    dominantElement,
    lackingElements,
    animal: BRANCH_ANIMAL[yearBranchHanja],
  };
}

// 천간합: 갑기합(토), 을경합(금), 병신합(수), 정임합(목), 무계합(화)
const STEM_HAP: [string, string][] = [
  ["갑", "기"], ["을", "경"], ["병", "신"], ["정", "임"], ["무", "계"],
];
// 지지충: 자오, 축미, 인신, 묘유, 진술, 사해
const BRANCH_CHUNG: [string, string][] = [
  ["자", "오"], ["축", "미"], ["인", "신"], ["묘", "유"], ["진", "술"], ["사", "해"],
];

function isPair(pairs: [string, string][], a: string, b: string): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export interface PairChemistry {
  score: number; // 0~100
  label: string;
  relationType: string; // 상생 | 천간합 | 같은 오행 | 상극 | 충 | 무난
  reasons: string[];
}

/**
 * 두 선수의 패스 궁합. 관계 유형은 이음(ieum.one) 친구 궁합의 분류를 따른다:
 * 상생 / 천간합 / 같은 오행 / 상극 / 충(沖).
 * - 일간 오행의 상생/상극/동기 관계 (기본 점수)
 * - 일간 천간합 (대화·콜플레이 보너스), 일지 충 (에너지 충돌 감점)
 * - 서로 부족한 오행을 상대가 채워주는지 (보완 보너스)
 * - 음양 조화
 */
export function pairChemistry(a: SajuResult, b: SajuResult): PairChemistry {
  let score = 50;
  const reasons: string[] = [];
  let relationType = "무난";
  const ea = a.dayMaster.element;
  const eb = b.dayMaster.element;

  if (GENERATES[ea] === eb || GENERATES[eb] === ea) {
    score += 25;
    relationType = "상생";
    const [giver, receiver] = GENERATES[ea] === eb ? [ea, eb] : [eb, ea];
    reasons.push(`일간이 상생 관계(${giver}生${receiver}) — 함께 뛰면 힘이 나고 패스 흐름이 자연스럽게 이어지는 조합`);
  } else if (CONTROLS[ea] === eb || CONTROLS[eb] === ea) {
    score -= 15;
    relationType = "상극";
    reasons.push(`일간이 상극 관계(${ea}·${eb}) — 플레이 의견이 부딪힐 수 있지만 서로를 발전시키는 자극제`);
  } else if (ea === eb) {
    score += 10;
    relationType = "같은 오행";
    reasons.push(`일간이 같은 ${ea} 기운 — 공감대가 넓고 움직임 예측이 쉽지만 약점도 겹치는 조합`);
  }

  if (isPair(STEM_HAP, a.dayMaster.stem, b.dayMaster.stem)) {
    score += 15;
    if (relationType === "무난" || relationType === "상극") relationType = "천간합";
    reasons.push(`일간 천간합(${a.dayMaster.stem}${b.dayMaster.stem}합) — 대화가 잘 통해 콜 플레이와 약속된 패턴에 강한 조합`);
  }

  if (isPair(BRANCH_CHUNG, a.pillars.day.branch, b.pillars.day.branch)) {
    score -= 20;
    relationType = "충";
    reasons.push(`일지 충(${a.pillars.day.branch}${b.pillars.day.branch}沖) — 강한 에너지가 정면으로 부딪히는 관계, 같은 공간보다 역할을 나누면 오히려 시너지`);
  }

  const aFills = b.lackingElements.includes(a.dominantElement);
  const bFills = a.lackingElements.includes(b.dominantElement);
  if (aFills && bFills) {
    score += 20;
    reasons.push("서로 부족한 오행을 정확히 채워주는 상호 보완 관계");
  } else if (aFills || bFills) {
    score += 10;
    reasons.push("한쪽이 상대의 부족한 오행을 채워주는 관계");
  }

  if (a.dayMaster.yinYang !== b.dayMaster.yinYang) {
    score += 5;
    reasons.push("음양이 달라 완급 조절이 잘 맞는 편");
  }

  score = Math.max(5, Math.min(98, score));

  const label =
    score >= 80 ? "환상의 호흡" :
    score >= 65 ? "좋은 궁합" :
    score >= 45 ? "무난한 조합" : "노력이 필요한 조합";

  return { score, label, relationType, reasons };
}

// ---------- 개인 풋살 프로필 (오행별 그룹 내 역할 — 이음 분류의 풋살 버전) ----------

export interface FutsalProfile {
  role: string; // 팀 내 역할
  positions: string[]; // 추천 포지션
  style: string; // 플레이 스타일 한 줄
}

const ELEMENT_PROFILE: Record<Element, FutsalProfile> = {
  목: {
    role: "리더 · 추진자",
    positions: ["아라", "픽소"],
    style: "먼저 치고 나가며 팀을 끌어올리는 돌파형 엔진",
  },
  화: {
    role: "분위기 메이커",
    positions: ["피보", "아라"],
    style: "순간 폭발력으로 경기 흐름을 바꾸는 해결사",
  },
  토: {
    role: "중재자 · 조율자",
    positions: ["픽소", "골레이로"],
    style: "중심을 잡고 볼을 배급하는 빌드업의 축",
  },
  금: {
    role: "현실주의자 · 마무리",
    positions: ["피보", "픽소"],
    style: "냉정한 판단과 결정력, 마무리 한 방",
  },
  수: {
    role: "전략가 · 참모",
    positions: ["골레이로", "아라"],
    style: "경기 전체 흐름을 읽는 플레이메이커",
  },
};

export function futsalProfile(saju: SajuResult): FutsalProfile {
  const base = ELEMENT_PROFILE[saju.dayMaster.element];
  if (saju.dominantElement !== saju.dayMaster.element) {
    const dom = ELEMENT_PROFILE[saju.dominantElement];
    return {
      role: base.role,
      positions: [base.positions[0], dom.positions[0]].filter(
        (p, i, arr) => arr.indexOf(p) === i
      ),
      style: `${base.style} — 사주에 ${saju.dominantElement} 기운이 강해 ${dom.role.split(" · ")[0]} 면모도 겸비`,
    };
  }
  return base;
}

// ---------- 팀 오행 분포 분석 (그룹 궁합) ----------

export interface TeamElementSummary {
  counts: Record<Element, number>;
  strongest: Element;
  missing: Element[];
  strengthComment: string;
  weaknessComment: string;
}

const TEAM_STRENGTH: Record<Element, string> = {
  목: "추진력의 팀 — 먼저 움직이고 먼저 압박하는 전방 기세가 강점",
  화: "화력의 팀 — 분위기를 타면 무섭게 몰아치는 공격 본능이 강점",
  토: "안정감의 팀 — 쉽게 무너지지 않는 조직력과 볼 소유가 강점",
  금: "결정력의 팀 — 기회를 놓치지 않는 냉정한 마무리가 강점",
  수: "두뇌의 팀 — 상대를 읽고 공간을 파고드는 전술 이해도가 강점",
};

const TEAM_WEAKNESS: Record<Element, string> = {
  목: "목(木) 부족 — 먼저 치고 나가는 추진력이 아쉬울 때 선제 압박을 약속으로 정해두세요",
  화: "화(火) 부족 — 결정적 순간의 폭발력이 아쉬울 수 있으니 세트피스를 준비하세요",
  토: "토(土) 부족 — 중심을 잡아줄 축이 약하니 빌드업 역할을 명확히 정하세요",
  금: "금(金) 부족 — 마무리가 아쉬울 수 있으니 슈팅 연습에 시간을 쓰세요",
  수: "수(水) 부족 — 흐름 조절이 약하니 리드할 때 템포를 늦추는 약속이 필요해요",
};

export function teamElementSummary(sajus: SajuResult[]): TeamElementSummary {
  const counts: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const s of sajus) {
    for (const el of ELEMENTS) counts[el] += s.elementCounts[el];
  }
  const strongest = ELEMENTS.reduce((a, b) => (counts[b] > counts[a] ? b : a));
  const missing = ELEMENTS.filter((el) => counts[el] === 0);
  const scarcest = ELEMENTS.reduce((a, b) => (counts[b] < counts[a] ? b : a));

  return {
    counts,
    strongest,
    missing,
    strengthComment: TEAM_STRENGTH[strongest],
    weaknessComment: TEAM_WEAKNESS[missing[0] ?? scarcest],
  };
}

export function formatPillars(saju: SajuResult): string {
  const { year, month, day, time } = saju.pillars;
  const f = (p: Pillar) => `${p.stem}${p.branch}`;
  return `${f(year)}년 ${f(month)}월 ${f(day)}일${time ? ` ${f(time)}시` : ""}`;
}
