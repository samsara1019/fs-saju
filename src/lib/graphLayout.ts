// 궁합 그래프 공용 기하/색상 — 화면 SVG(ChemistryGraph)와 공유 이미지(ShareGraphButton)가 함께 쓴다.

export function scoreColor(score: number): string {
  return score >= 65 ? "#008000" : score >= 45 ? "#FFA500" : "#FF0000";
}

/** 멤버들을 원형(별자리형)으로 배치한 좌표 */
export function circleLayout(
  names: string[],
  cx: number,
  cy: number,
  r: number
): Map<string, { x: number; y: number }> {
  return new Map(
    names.map((name, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / names.length;
      return [name, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }];
    })
  );
}

/** 라벨을 선의 중점이 아닌 이 비율 지점에 둬서 중앙 교차점에서 겹치지 않게 한다 */
export const LABEL_T = 0.38;
