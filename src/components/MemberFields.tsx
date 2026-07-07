"use client";

export const POSITIONS = ["무관", "골레이로", "피보", "아라", "픽소"];

export interface MemberInput {
  name: string;
  birthDate: string;
  birthTime: string;
  position: string;
}

export const emptyMember: MemberInput = {
  name: "",
  birthDate: "",
  birthTime: "",
  position: "무관",
};

const inputClass =
  "w-full border-[3px] border-black bg-[#F0F0F0] px-3 py-2.5 font-mono text-sm placeholder:text-neutral-500 focus:shadow-[inset_0_0_0_2px_#000] focus:outline-none";
const labelClass =
  "grid gap-1 font-headline text-xs uppercase tracking-wide";

export default function MemberFields({
  value,
  onChange,
}: {
  value: MemberInput;
  onChange: (next: MemberInput) => void;
}) {
  const set = (patch: Partial<MemberInput>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4">
      <label className={labelClass}>
        별명
        <input
          required
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="패스왕"
          maxLength={20}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          생년월일
          <input
            required
            type="date"
            value={value.birthDate}
            onChange={(e) => set({ birthDate: e.target.value })}
            min="1930-01-01"
            max="2020-12-31"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          태어난 시간 (선택)
          <input
            type="time"
            value={value.birthTime}
            onChange={(e) => set({ birthTime: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
      <p className="-mt-2 text-xs text-neutral-600">
        시간을 알면 시주까지 포함해 더 정확한 사주가 나옵니다. 몰라도 괜찮아요.
      </p>

      <label className={labelClass}>
        희망 포지션
        <select
          value={value.position}
          onChange={(e) => set({ position: e.target.value })}
          className={inputClass}
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
