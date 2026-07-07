"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function AnalyzePanel({
  code,
  memberCount,
  initialContent,
  initialUpToDate,
}: {
  code: string;
  memberCount: number;
  initialContent: string | null;
  initialUpToDate: boolean;
}) {
  const [content, setContent] = useState<string | null>(initialContent);
  // 멤버 구성이 마지막 분석과 같으면 true — 부모가 key={fingerprint}로 리마운트하므로
  // 구성이 바뀌면 이 상태는 자동으로 초기화된다.
  const [upToDate, setUpToDate] = useState(initialUpToDate);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/teams/${code}/analyze`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "분석에 실패했습니다.");
      setContent(data.content);
      setUpToDate(true);
      if (data.upToDate && data.message) setNotice(data.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const analyzed = Boolean(content);
  const blocked = upToDate && analyzed;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black pb-2">
        <h2 className="font-headline text-xl uppercase">AI 전술 리포트</h2>
        <button
          onClick={analyze}
          disabled={loading || memberCount < 1 || blocked}
          className="border-[3px] border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-white hover:text-black disabled:border-[#CCCCCC] disabled:bg-[#F0F0F0] disabled:text-neutral-400"
        >
          {loading
            ? "사주 푸는 중..."
            : blocked
              ? "최적 분석 완료 ✓"
              : analyzed
                ? "다시 분석하기"
                : memberCount === 1
                  ? "내 풋살 사주 보기"
                  : "팀 분석 시작"}
        </button>
      </div>

      {blocked && (
        <p className="mt-3 border-[3px] border-[#008000] px-4 py-3 text-sm font-semibold text-[#008000]">
          멤버 구성이 바뀌지 않아 현재 리포트가 이미 최적의 분석입니다. 멤버를
          추가하거나 수정하면 다시 분석할 수 있어요.
        </p>
      )}

      {memberCount === 1 && !analyzed && (
        <p className="mt-3 text-sm">
          혼자여도 개인 풋살 사주를 볼 수 있어요. 팀원이 모이면 팀 전체 분석으로
          업그레이드됩니다.
        </p>
      )}

      {notice && !blocked && (
        <p className="mt-4 border-[3px] border-[#008000] px-4 py-3 text-sm font-semibold text-[#008000]">
          {notice}
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
