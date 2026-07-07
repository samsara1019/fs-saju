"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MemberFields, { MemberInput } from "@/components/MemberFields";

export interface EditableMember {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string | null;
  calendar: string;
  position: string | null;
}

export default function MemberActions({
  code,
  member,
}: {
  code: string;
  member: EditableMember;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<MemberInput>({
    name: member.name,
    birthDate: member.birth_date,
    birthTime: member.birth_time ?? "",
    calendar: member.calendar ?? "solar",
    position: member.position ?? "무관",
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${code}/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value.name,
          birthDate: value.birthDate,
          birthTime: value.birthTime || null,
          calendar: value.calendar,
          position: value.position === "무관" ? null : value.position,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "수정에 실패했습니다.");
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`${member.name} 선수를 팀에서 삭제할까요?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${code}/members/${member.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "삭제에 실패했습니다.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
      setBusy(false);
    }
  }

  const smallBtn =
    "border-2 border-black bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-[1px] transition-colors hover:bg-black hover:text-white disabled:border-[#CCCCCC] disabled:text-neutral-400 disabled:hover:bg-white";

  return (
    <div className="border-t-2 border-black px-4 py-2">
      {!editing ? (
        <div className="flex gap-2">
          <button className={smallBtn} disabled={busy} onClick={() => setEditing(true)}>
            수정
          </button>
          <button
            className={`${smallBtn} border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000] hover:text-white`}
            disabled={busy}
            onClick={remove}
          >
            삭제
          </button>
        </div>
      ) : (
        <form onSubmit={save} className="grid gap-4 py-2">
          <MemberFields value={value} onChange={setValue} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="border-[3px] border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-white hover:text-black disabled:border-[#CCCCCC] disabled:bg-[#F0F0F0] disabled:text-neutral-400"
            >
              {busy ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(false)}
              className="border-[3px] border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-[1px] transition-colors hover:bg-black hover:text-white"
            >
              취소
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="mt-2 border-2 border-[#FF0000] px-3 py-2 text-xs font-semibold text-[#FF0000]">
          {error}
        </p>
      )}
    </div>
  );
}
