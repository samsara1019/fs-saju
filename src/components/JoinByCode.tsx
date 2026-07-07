"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <form
      className="flex gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (trimmed) router.push(`/join/${trimmed}`);
      }}
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="팀 코드 (예: AB3K9M)"
        maxLength={6}
        className="min-w-0 flex-1 border-[3px] border-black bg-[#F0F0F0] px-4 py-4 text-center font-mono text-lg tracking-[0.3em] placeholder:tracking-normal placeholder:text-neutral-500 focus:shadow-[inset_0_0_0_2px_#000] focus:outline-none"
      />
      <button
        type="submit"
        disabled={code.trim().length < 4}
        className="border-[3px] border-black bg-white px-5 font-bold uppercase tracking-[2px] transition-colors hover:bg-black hover:text-white disabled:border-[#CCCCCC] disabled:bg-[#F0F0F0] disabled:text-neutral-400 disabled:hover:bg-[#F0F0F0] disabled:hover:text-neutral-400"
      >
        참가
      </button>
    </form>
  );
}
