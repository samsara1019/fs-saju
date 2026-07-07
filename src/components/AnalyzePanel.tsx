"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function AnalyzePanel({
  code,
  memberCount,
  initialContent,
}: {
  code: string;
  memberCount: number;
  initialContent: string | null;
}) {
  const [content, setContent] = useState<string | null>(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${code}/analyze`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "분석에 실패했습니다.");
      setContent(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black pb-2">
        <h2 className="font-headline text-xl uppercase">AI 전술 리포트</h2>
        <button
          onClick={analyze}
          disabled={loading || memberCount < 1}
          className="border-[3px] border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-white hover:text-black disabled:border-[#CCCCCC] disabled:bg-[#F0F0F0] disabled:text-neutral-400"
        >
          {loading
            ? "사주 푸는 중..."
            : content
              ? "다시 분석하기"
              : memberCount === 1
                ? "내 풋살 사주 보기"
                : "팀 분석 시작"}
        </button>
      </div>

      {memberCount === 1 && (
        <p className="mt-3 text-sm">
          혼자여도 개인 풋살 사주를 볼 수 있어요. 팀원이 모이면 팀 전체 분석으로
          업그레이드됩니다.
        </p>
      )}

      {error && (
        <p className="mt-4 border-[3px] border-[#FF0000] px-4 py-3 text-sm font-semibold text-[#FF0000]">
          {error}
        </p>
      )}

      {loading && (
        <div className="mt-4 border-[3px] border-black p-6 text-center font-mono text-sm">
          만세력을 펼치고 오행을 읽는 중입니다... (10~30초)
        </div>
      )}

      {content && !loading && (
        <div className="report mt-4 border-[3px] border-black p-6">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </section>
  );
}
