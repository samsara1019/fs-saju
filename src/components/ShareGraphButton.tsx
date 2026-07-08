"use client";

import { useState } from "react";
import type { PairInfo } from "@/lib/llm";
import { scoreColor, circleLayout, LABEL_T } from "@/lib/graphLayout";
import { siteUrl } from "@/lib/site";
import { track } from "@/lib/analytics";

const KO_SANS = "'Apple SD Gothic Neo','Noto Sans KR',sans-serif";

async function drawShareImage(
  teamName: string,
  names: string[],
  pairs: PairInfo[]
): Promise<Blob> {
  await document.fonts.ready;

  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  // 배경 + RawBlock 프레임
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 16;
  ctx.strokeRect(28, 28, S - 56, S - 56);

  // 헤더
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.font = `700 26px 'Space Mono',${KO_SANS}`;
  ctx.fillText("⚽ FS SAJU — FUTSAL × SAJU", S / 2, 108);
  ctx.font = `900 62px 'Archivo Black',${KO_SANS}`;
  ctx.fillText(teamName, S / 2, 186);
  ctx.font = `600 30px 'Work Sans',${KO_SANS}`;
  ctx.fillText("팀 사주 패스 궁합", S / 2, 236);

  // 그래프 — 하단 이름 라벨이 푸터 CTA 바(y≈948부터)를 침범하지 않는 크기로
  const cx = S / 2;
  const cy = 585;
  const R = 245;
  const pos = circleLayout(names, cx, cy, R);

  for (const p of pairs) {
    const a = pos.get(p.a);
    const b = pos.get(p.b);
    if (!a || !b) continue;
    ctx.strokeStyle = scoreColor(p.score);
    ctx.lineWidth = 4 + (p.score / 100) * 8;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  for (const p of pairs) {
    const a = pos.get(p.a);
    const b = pos.get(p.b);
    if (!a || !b) continue;
    const lx = a.x + (b.x - a.x) * LABEL_T;
    const ly = a.y + (b.y - a.y) * LABEL_T;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = scoreColor(p.score);
    ctx.lineWidth = 4;
    ctx.fillRect(lx - 38, ly - 25, 76, 50);
    ctx.strokeRect(lx - 38, ly - 25, 76, 50);
    ctx.fillStyle = "#000000";
    ctx.font = `700 30px 'Space Mono',${KO_SANS}`;
    ctx.fillText(String(p.score), lx, ly + 11);
  }

  for (const name of names) {
    const n = pos.get(name);
    if (!n) continue;
    ctx.fillStyle = "#000000";
    ctx.fillRect(n.x - 14, n.y - 14, 28, 28);
    const dx = n.x - cx;
    const dy = n.y - cy;
    const dist = Math.hypot(dx, dy) || 1;
    ctx.font = `800 34px 'Work Sans',${KO_SANS}`;
    ctx.fillText(name, n.x + (dx / dist) * 62, n.y + (dy / dist) * 62 + 12);
  }

  // 푸터 CTA
  const domain = siteUrl.replace(/^https?:\/\//, "");
  ctx.fillStyle = "#000000";
  ctx.fillRect(28, S - 28 - 104, S - 56, 104);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 34px 'Work Sans',${KO_SANS}`;
  ctx.fillText(`우리 팀도 해보려면? → ${domain}`, S / 2, S - 28 - 42);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

export default function ShareGraphButton({
  teamName,
  names,
  pairs,
}: {
  teamName: string;
  names: string[];
  pairs: PairInfo[];
}) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function share() {
    setState("busy");
    try {
      const blob = await drawShareImage(teamName, names, pairs);
      const file = new File([blob], `fs-saju-${teamName}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        track("share_image", { method: "webshare" });
        await navigator.share({
          files: [file],
          title: `${teamName} 팀 사주 패스 궁합`,
          text: `⚽ ${teamName}의 사주 궁합 그래프 — 우리 팀도 해보려면? ${siteUrl}`,
        });
      } else {
        track("share_image", { method: "download" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fs-saju-${teamName}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // 사용자가 공유 시트를 닫은 경우 등 — 조용히 원복
      setState("idle");
    }
  }

  return (
    <button
      onClick={share}
      disabled={state === "busy"}
      className="border-[3px] border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-white hover:text-black disabled:border-[#CCCCCC] disabled:bg-[#F0F0F0] disabled:text-neutral-400"
    >
      {state === "busy" ? "이미지 만드는 중..." : state === "done" ? "완료 ✓" : "이미지로 공유하기 📤"}
    </button>
  );
}
