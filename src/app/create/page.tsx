"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MemberFields, { emptyMember, MemberInput } from "@/components/MemberFields";
import { track } from "@/lib/analytics";

export default function CreateTeamPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [owner, setOwner] = useState<MemberInput>(emptyMember);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          owner: {
            name: owner.name,
            birthDate: owner.birthDate,
            birthTime: owner.birthTime || null,
            calendar: owner.calendar,
            position: owner.position === "무관" ? null : owner.position,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "팀 생성에 실패했습니다.");
      track("team_create", {
        calendar: owner.calendar,
        has_birth_time: Boolean(owner.birthTime),
        position: owner.position,
      });
      router.push(`/team/${data.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "팀 생성에 실패했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-headline text-3xl uppercase">새 팀 만들기</h1>
      <p className="mt-2 text-sm">
        방장의 정보를 입력하면 팀 코드가 만들어지고, 방장의 개인 풋살 사주도 바로
        볼 수 있습니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
        <label className="grid gap-1 font-headline text-xs uppercase tracking-wide">
          팀 이름
          <input
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="FS SAJU"
            maxLength={30}
            className="w-full border-[3px] border-black bg-[#F0F0F0] px-3 py-2.5 font-mono text-sm placeholder:text-neutral-500 focus:shadow-[inset_0_0_0_2px_#000] focus:outline-none"
          />
        </label>

        <div className="border-[3px] border-black p-5">
          <h2 className="mb-4 font-headline text-sm uppercase">방장 정보 👑</h2>
          <MemberFields value={owner} onChange={setOwner} />
        </div>

        {error && (
          <p className="border-[3px] border-[#FF0000] px-4 py-3 text-sm font-semibold text-[#FF0000]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="border-[3px] border-black bg-black px-6 py-4 text-lg font-bold uppercase tracking-[2px] text-white transition-colors hover:bg-white hover:text-black disabled:border-[#CCCCCC] disabled:bg-[#F0F0F0] disabled:text-neutral-400"
        >
          {submitting ? "팀 만드는 중..." : "팀 만들고 코드 받기"}
        </button>
      </form>
    </div>
  );
}
