"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MemberFields, { emptyMember, MemberInput } from "@/components/MemberFields";

export default function JoinForm({ code }: { code: string }) {
  const router = useRouter();
  const [member, setMember] = useState<MemberInput>(emptyMember);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${code}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: member.name,
          birthDate: member.birthDate,
          birthTime: member.birthTime || null,
          calendar: member.calendar,
          position: member.position === "무관" ? null : member.position,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "참가에 실패했습니다.");
      router.push(`/team/${code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "참가에 실패했습니다.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <MemberFields value={member} onChange={setMember} />

      {error && (
        <p className="border-[3px] border-[#FF0000] px-4 py-3 text-sm font-semibold text-[#FF0000]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="border-[3px] border-black bg-black px-6 py-3 font-bold uppercase tracking-[2px] text-white transition-colors hover:bg-white hover:text-black disabled:border-[#CCCCCC] disabled:bg-[#F0F0F0] disabled:text-neutral-400"
      >
        {submitting ? "참가하는 중..." : "팀 참가하기"}
      </button>
    </form>
  );
}
