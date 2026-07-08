"use client";

import { useState } from "react";
import type { PairInfo } from "@/lib/llm";

// 패스 궁합 관계 그래프 — 멤버를 원형으로 배치하고 모든 페어를 선으로 연결한다.
// 선 색상·굵기는 점수 구간(RawBlock 상태색: 초록/주황/빨강), 선 위에 점수 라벨.
// 팀원(노드)이나 선을 hover/탭하면 관련 관계만 강조하고 나머지는 흐리게 처리한다.

const SIZE = 440;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 132;
const DIM = 0.1; // 강조되지 않은 요소의 투명도

function scoreColor(score: number): string {
  return score >= 65 ? "#008000" : score >= 45 ? "#FFA500" : "#FF0000";
}

type Focus =
  | { type: "node"; name: string }
  | { type: "edge"; key: string }
  | null;

const edgeKey = (p: PairInfo) => `${p.a}|${p.b}`;

export default function ChemistryGraph({
  names,
  pairs,
}: {
  names: string[];
  pairs: PairInfo[];
}) {
  const [focus, setFocus] = useState<Focus>(null);

  const pos = new Map(
    names.map((name, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / names.length;
      return [name, { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) }];
    })
  );

  function edgeActive(p: PairInfo): boolean {
    if (!focus) return true;
    if (focus.type === "node") return p.a === focus.name || p.b === focus.name;
    return edgeKey(p) === focus.key;
  }

  function nodeActive(name: string): boolean {
    if (!focus) return true;
    if (focus.type === "node") {
      return (
        name === focus.name ||
        pairs.some((p) => edgeActive(p) && (p.a === name || p.b === name))
      );
    }
    const [a, b] = focus.key.split("|");
    return name === a || name === b;
  }

  // 모바일: 같은 대상을 다시 탭하면 해제
  const toggleNode = (name: string) =>
    setFocus((f) => (f?.type === "node" && f.name === name ? null : { type: "node", name }));
  const toggleEdge = (key: string) =>
    setFocus((f) => (f?.type === "edge" && f.key === key ? null : { type: "edge", key }));

  // 라벨을 선의 중점(0.5)이 아니라 0.38 지점에 둬서, 중심을 지나는 대각선들의
  // 라벨이 한가운데서 겹치지 않게 한다.
  const T = 0.38;

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="팀원 간 패스 궁합 관계 그래프"
        className="mx-auto block w-full max-w-md"
        onMouseLeave={() => setFocus(null)}
      >
        {/* 배경 — 빈 곳 탭/클릭 시 강조 해제 */}
        <rect
          x={0}
          y={0}
          width={SIZE}
          height={SIZE}
          fill="transparent"
          onClick={() => setFocus(null)}
        />

        {/* 관계선 */}
        {pairs.map((p) => {
          const a = pos.get(p.a);
          const b = pos.get(p.b);
          if (!a || !b) return null;
          const key = edgeKey(p);
          const active = edgeActive(p);
          return (
            <g
              key={`edge-${key}`}
              className="transition-opacity duration-150"
              opacity={active ? 1 : DIM}
              onMouseEnter={() => setFocus({ type: "edge", key })}
              onClick={() => toggleEdge(key)}
              style={{ cursor: "pointer" }}
            >
              <title>{`${p.a} ↔ ${p.b}: ${p.score}점 (${p.label} · ${p.relationType})`}</title>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={scoreColor(p.score)}
                strokeWidth={
                  (1.5 + (p.score / 100) * 3.5) * (active && focus ? 1.6 : 1)
                }
              />
              {/* hover 판정용 투명 굵은 선 (가는 선도 쉽게 집히도록) */}
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="transparent"
                strokeWidth={16}
              />
            </g>
          );
        })}

        {/* 점수 라벨 */}
        {pairs.map((p) => {
          const a = pos.get(p.a);
          const b = pos.get(p.b);
          if (!a || !b) return null;
          const key = edgeKey(p);
          const active = edgeActive(p);
          const lx = a.x + (b.x - a.x) * T;
          const ly = a.y + (b.y - a.y) * T;
          return (
            <g
              key={`label-${key}`}
              className="transition-opacity duration-150"
              opacity={active ? 1 : DIM}
              onMouseEnter={() => setFocus({ type: "edge", key })}
              onClick={() => toggleEdge(key)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={lx - 17}
                y={ly - 11}
                width={34}
                height={22}
                fill={active && focus ? scoreColor(p.score) : "#ffffff"}
                stroke={scoreColor(p.score)}
                strokeWidth={2}
              />
              <text
                x={lx}
                y={ly + 4.5}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill={active && focus ? "#ffffff" : "#000000"}
                className="font-mono"
              >
                {p.score}
              </text>
            </g>
          );
        })}

        {/* 멤버 노드 + 이름 */}
        {names.map((name) => {
          const n = pos.get(name);
          if (!n) return null;
          const active = nodeActive(name);
          const isFocusedNode = focus?.type === "node" && focus.name === name;
          const dx = n.x - CX;
          const dy = n.y - CY;
          const dist = Math.hypot(dx, dy) || 1;
          const labelX = n.x + (dx / dist) * 30;
          const labelY = n.y + (dy / dist) * 30;
          return (
            <g
              key={`node-${name}`}
              className="transition-opacity duration-150"
              opacity={active ? 1 : DIM}
              onMouseEnter={() => setFocus({ type: "node", name })}
              onClick={() => toggleNode(name)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={n.x - (isFocusedNode ? 10 : 7)}
                y={n.y - (isFocusedNode ? 10 : 7)}
                width={isFocusedNode ? 20 : 14}
                height={isFocusedNode ? 20 : 14}
                fill="#000000"
              />
              <text
                x={labelX}
                y={labelY + 5}
                textAnchor="middle"
                fontSize={isFocusedNode ? 16 : 14}
                fontWeight={800}
                fill="#000000"
              >
                {name}
              </text>
              {/* hover 판정용 투명 히트 영역 */}
              <circle cx={n.x} cy={n.y} r={26} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* 범례 */}
      <div className="mt-2 flex flex-wrap justify-center gap-4 font-mono text-xs">
        {[
          ["#008000", "65점 이상 — 좋은 궁합"],
          ["#FFA500", "45~64점 — 무난"],
          ["#FF0000", "45점 미만 — 노력 필요"],
        ].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-neutral-600">
        팀원이나 선에 마우스를 올리면(모바일은 탭) 관련 관계만 강조됩니다
      </p>
    </div>
  );
}
