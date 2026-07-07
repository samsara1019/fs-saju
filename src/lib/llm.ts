// LLM 팀 분석.
// 사주 계산(만세력)은 코드에서 정확히 끝내고, LLM에는 계산된 사주 데이터를 주고
// 풋살 맥락의 해석(포지션 추천, 패스 라인, 팀 운영 조언)만 맡긴다.
// GEMINI_API_KEY가 없으면 목(mock) 분석을 반환한다.
import { GoogleGenAI } from "@google/genai";
import type { Member } from "./db";
import {
  calculateSaju,
  pairChemistry,
  formatPillars,
  futsalProfile,
  teamElementSummary,
  SajuResult,
  FutsalProfile,
  TeamElementSummary,
} from "./saju";

export interface MemberWithSaju {
  member: Member;
  saju: SajuResult;
  profile: FutsalProfile;
}

export interface PairInfo {
  a: string;
  b: string;
  score: number;
  label: string;
  relationType: string;
  reasons: string[];
}

export function buildTeamData(members: Member[]): {
  withSaju: MemberWithSaju[];
  pairs: PairInfo[];
  teamSummary: TeamElementSummary;
} {
  const withSaju = members.map((member) => {
    const saju = calculateSaju(member.birth_date, member.birth_time);
    return { member, saju, profile: futsalProfile(saju) };
  });

  const pairs: PairInfo[] = [];
  for (let i = 0; i < withSaju.length; i++) {
    for (let j = i + 1; j < withSaju.length; j++) {
      const chem = pairChemistry(withSaju[i].saju, withSaju[j].saju);
      pairs.push({
        a: withSaju[i].member.name,
        b: withSaju[j].member.name,
        ...chem,
      });
    }
  }
  pairs.sort((x, y) => y.score - x.score);

  return { withSaju, pairs, teamSummary: teamElementSummary(withSaju.map((w) => w.saju)) };
}

function memberBrief({ member, saju, profile }: MemberWithSaju): string {
  const counts = Object.entries(saju.elementCounts)
    .map(([e, c]) => `${e}${c}`)
    .join(" ");
  return [
    `- ${member.name} (${member.birth_date}${member.birth_time ? ` ${member.birth_time}` : ", 시간 미상"}, 희망 포지션: ${member.position ?? "무관"})`,
    `  사주: ${formatPillars(saju)} / 띠: ${saju.animal}띠`,
    `  일간: ${saju.dayMaster.stem}(${saju.dayMaster.yinYang}${saju.dayMaster.element}) / 오행 분포: ${counts} / 강한 오행: ${saju.dominantElement} / 부족한 오행: ${saju.lackingElements.length ? saju.lackingElements.join(",") : "없음"}`,
    `  오행 기반 역할: ${profile.role} / 계산된 추천 포지션: ${profile.positions.join(", ")} / 스타일: ${profile.style}`,
  ].join("\n");
}

export async function analyzeTeam(teamName: string, members: Member[]): Promise<string> {
  const { withSaju, pairs, teamSummary } = buildTeamData(members);
  const solo = withSaju.length === 1;

  const commonHeader = `당신은 사주명리학에 정통하면서 풋살 전술도 잘 아는 분석가입니다.
아래는 풋살팀 "${teamName}" 멤버들의 사주 데이터입니다. 만세력 계산은 이미 정확히 끝난 값이므로 그대로 사용하세요.

## 멤버 사주
${withSaju.map(memberBrief).join("\n")}

## 풋살 포지션 참고 (이 서비스의 포지션 명칭: 골레이로, 피보, 아라, 픽소)
- 골레이로(골키퍼): 안정감, 침착함, 수(水)·토(土) 기운과 어울림
- 픽소(수비/빌드업): 중심을 잡는 토(土), 판단력의 금(金)
- 아라(윙/측면): 속도와 활동량, 목(木)·화(火)의 추진력
- 피보(최전방 공격): 결정력과 순간 폭발력, 화(火)·금(金)`;

  const prompt = solo
    ? `${commonHeader}

## 요청
아직 팀원이 모이지 않아 이 한 명의 "개인 풋살 사주" 리포트를 씁니다. 다음 구성으로 마크다운 리포트를 한국어로 작성하세요. 재미있고 생동감 있게, 그러나 실제 사주 데이터(일간, 오행 분포)를 구체적으로 인용하며 근거를 대세요.

# ⚽ ${withSaju[0].member.name}의 풋살 사주
## 타고난 기질 — 일간과 오행 분포로 본 성향 (3~4문장)
## 그라운드 위의 나 — 플레이 스타일과 강점/약점
## 추천 포지션 — 가장 어울리는 포지션과 이유 (희망 포지션이 있으면 비교)
## 잘 맞는 동료 유형 — 어떤 오행/기질의 팀원을 영입하면 좋을지
## 오늘의 풋살 운세 한 줄 — 유쾌한 마무리`
    : `${commonHeader}

## 팀 오행 분포 (전원 합산)
${Object.entries(teamSummary.counts).map(([e, c]) => `${e}${c}`).join(" ")} / 최강: ${teamSummary.strongest} / 강점: ${teamSummary.strengthComment} / 보완점: ${teamSummary.weaknessComment}

## 페어 궁합 (오행 상생·상극, 천간합, 충 기반 계산값, 높은 순)
${pairs.map((p) => `- ${p.a} ↔ ${p.b}: ${p.score}점 (${p.label}, 관계 유형: ${p.relationType}) — ${p.reasons.join("; ") || "특이 관계 없음"}`).join("\n")}

## 요청
다음 구성으로 마크다운 분석 리포트를 한국어로 작성하세요. 재미있고 생동감 있게, 그러나 각 멤버의 실제 사주 데이터(일간, 오행 분포)를 구체적으로 인용하며 근거를 대세요. 희망 포지션이 사주와 맞으면 칭찬하고, 다르면 대안을 부드럽게 제시하세요.

# ⚽ ${teamName} 사주 전술 분석
## 팀 총평 — 팀 전체 오행 밸런스와 팀 컬러 (3~4문장)
## 멤버별 분석 — 각 멤버: 사주 특징 2~3문장 + 팀 내 역할(리더/분위기메이커/중재자/현실주의자/전략가) + 추천 포지션과 이유
## 베스트 패스 라인 — 궁합 상위 2~3개 페어를 뽑아 관계 유형(상생/천간합 등)을 언급하며 왜 잘 맞는지, 경기에서 어떻게 활용할지
## 주의할 조합 — 상극·충 등 궁합이 낮은 페어가 있다면 어떤 상황에서 어긋나기 쉬운지 + 보완법 (없으면 생략)
## 이달의 팀 운세 한 줄 — 유쾌한 마무리 조언`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.endsWith("...")) {
    return mockAnalysis(teamName, withSaju, pairs);
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text;
  if (!text) throw new Error("LLM 응답이 비어 있습니다");
  return text;
}

function mockAnalysis(
  teamName: string,
  withSaju: MemberWithSaju[],
  pairs: PairInfo[]
): string {
  const memberLines = withSaju
    .map(
      ({ member, saju, profile }) =>
        `### ${member.name}\n일간 ${saju.dayMaster.stem}(${saju.dayMaster.yinYang}${saju.dayMaster.element}), ${saju.animal}띠. 강한 오행은 **${saju.dominantElement}**${saju.lackingElements.length ? `, 부족한 오행은 ${saju.lackingElements.join("·")}` : ""}. 사주: ${formatPillars(saju)}\n\n팀 내 역할 **${profile.role}** — ${profile.style}. 추천 포지션: ${profile.positions.join(", ")}`
    )
    .join("\n\n");

  const bestPairs = pairs
    .slice(0, 3)
    .map((p) => `- **${p.a} ↔ ${p.b}** (${p.score}점, ${p.label} · ${p.relationType}): ${p.reasons[0] ?? "무난한 흐름"}`)
    .join("\n");

  return `# ⚽ ${teamName} 사주 전술 분석

> ⚠️ **미리보기 모드** — \`GEMINI_API_KEY\`가 설정되지 않아 계산된 사주 데이터만 표시합니다. API 키를 설정하면 상세한 LLM 해석 리포트가 생성됩니다.

## 멤버별 사주

${memberLines}

## 페어 궁합 상위

${bestPairs || "- 멤버가 2명 이상이면 페어 궁합이 표시됩니다."}
`;
}
