"use client";

import { useState } from "react";

export default function ShareCode({ code }: { code: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(kind: "code" | "link") {
    const text =
      kind === "code" ? code : `${window.location.origin}/join/${code}`;
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  }

  const btn =
    "border-[3px] border-black bg-white px-3 py-2 text-xs font-bold uppercase tracking-[1px] transition-colors hover:bg-black hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="border-[3px] border-black bg-black px-4 py-2 font-mono text-xl font-bold tracking-[0.3em] text-white">
        {code}
      </span>
      <button onClick={() => copy("code")} className={btn}>
        {copied === "code" ? "복사됨 ✓" : "코드 복사"}
      </button>
      <button onClick={() => copy("link")} className={btn}>
        {copied === "link" ? "복사됨 ✓" : "초대 링크 복사"}
      </button>
    </div>
  );
}
