import { notFound } from "next/navigation";
import { getTeamByCode, listMembers, getLatestAnalysis, usingMemoryStore } from "@/lib/db";
import { buildTeamData } from "@/lib/llm";
import { formatPillars, Element } from "@/lib/saju";
import ShareCode from "@/components/ShareCode";
import AnalyzePanel from "@/components/AnalyzePanel";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

const ELEMENTS: Element[] = ["목", "화", "토", "금", "수"];
const ELEMENT_HANJA: Record<Element, string> = {
  목: "木", 화: "火", 토: "土", 금: "金", 수: "水",
};

function relationChipClass(relationType: string): string {
  switch (relationType) {
    case "상생":
    case "천간합":
      return "border-[#008000] text-[#008000]";
    case "상극":
      return "border-[#FFA500] text-[#FFA500]";
    case "충":
      return "border-[#FF0000] text-[#FF0000]";
    default:
      return "border-black text-black";
  }
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const team = await getTeamByCode(code);
  if (!team) notFound();

  const members = await listMembers(team.id);
  const { withSaju, pairs, teamSummary } = buildTeamData(members);
  const latest = await getLatestAnalysis(team.id);
  const maxCount = Math.max(1, ...ELEMENTS.map((el) => teamSummary.counts[el]));

  return (
    <div className="grid gap-10">
      <AutoRefresh />

      <div>
        <p className="font-mono text-xs uppercase tracking-[2px]">Team</p>
        <h1 className="mt-1 font-headline text-4xl uppercase leading-none">{team.name}</h1>
        <div className="mt-5">
          <ShareCode code={team.code} />
        </div>
        {usingMemoryStore && (
          <p className="mt-4 border-[3px] border-[#FFA500] px-4 py-2 text-xs font-semibold text-[#FFA500]">
            로컬 개발 모드 — Supabase 미설정. 데이터는 서버 재시작 시 사라집니다.
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-4 border-b-[3px] border-black pb-2 font-headline text-xl uppercase">
          선수단 <span className="font-mono">{members.length}</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {withSaju.map(({ member, saju, profile }) => (
            <div key={member.id} className="border-[3px] border-black">
              <div className="flex items-center justify-between border-b-[3px] border-black bg-black px-4 py-2 text-white">
                <span className="font-headline text-sm uppercase">
                  {member.is_owner && "👑 "}
                  {member.name}
                </span>
                <span className="font-mono text-xs">{member.position ?? "포지션 무관"}</span>
              </div>
              <div className="grid gap-2 p-4">
                <p className="font-mono text-xs">{formatPillars(saju)}</p>
                <p className="text-xs">
                  {saju.animal}띠 · 일간 {saju.dayMaster.stem}({saju.dayMaster.yinYang}
                  {saju.dayMaster.element})
                </p>
                <div className="flex gap-1 font-mono text-xs">
                  {ELEMENTS.map((el) => {
                    const count = saju.elementCounts[el];
                    return (
                      <span
                        key={el}
                        title={`${el}(${ELEMENT_HANJA[el]}) ${count}개`}
                        className={`border-2 px-1.5 py-0.5 ${
                          count === 0
                            ? "border-[#CCCCCC] text-neutral-400"
                            : "border-black"
                        }`}
                      >
                        {ELEMENT_HANJA[el]}
                        {count}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-1 border-t-[3px] border-black pt-2">
                  <p className="font-headline text-xs uppercase">{profile.role}</p>
                  <p className="mt-1 text-xs leading-relaxed">{profile.style}</p>
                  <p className="mt-1 text-xs">
                    추천 포지션: <strong>{profile.positions.join(", ")}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-[5px] border-black bg-black p-5 text-white">
        <h2 className="font-headline text-xl uppercase">팀 오행 밸런스</h2>
        <div className="mt-4 grid gap-1 font-mono text-sm">
          {ELEMENTS.map((el) => (
            <div key={el} className="flex items-center gap-3">
              <span className="w-10">
                {el}({ELEMENT_HANJA[el]})
              </span>
              <div className="h-4 flex-1 border border-white">
                <div
                  className="h-full bg-white"
                  style={{ width: `${(teamSummary.counts[el] / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right">{teamSummary.counts[el]}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 text-sm leading-relaxed">
          <p>
            <span className="font-headline text-xs uppercase">강점 — </span>
            {teamSummary.strengthComment}
          </p>
          <p>
            <span className="font-headline text-xs uppercase">보완 — </span>
            {teamSummary.weaknessComment}
          </p>
        </div>
      </section>

      {pairs.length > 0 ? (
        <section>
          <h2 className="mb-4 border-b-[3px] border-black pb-2 font-headline text-xl uppercase">
            패스 궁합 랭킹
          </h2>
          <div className="grid gap-3">
            {pairs.map((p) => (
              <div key={`${p.a}-${p.b}`} className="border-[3px] border-black p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">
                    {p.a} ↔ {p.b}
                  </span>
                  <span
                    className={`border-2 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[1px] ${relationChipClass(p.relationType)}`}
                  >
                    {p.relationType}
                  </span>
                  <span className="font-mono text-sm font-bold">{p.score}점</span>
                </div>
                <div className="mt-2 h-3 w-full border-2 border-black">
                  <div className="h-full bg-black" style={{ width: `${p.score}%` }} />
                </div>
                {p.reasons[0] && (
                  <p className="mt-2 text-xs leading-relaxed">{p.reasons[0]}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="border-[3px] border-black p-5">
          <h2 className="font-headline text-xl uppercase">패스 궁합</h2>
          <p className="mt-2 text-sm">
            팀원이 참가하면 페어별 궁합(상생·천간합·상극·충)이 여기에 자동으로
            나타납니다. 위의 초대 링크를 공유해 보세요.
          </p>
        </section>
      )}

      <AnalyzePanel
        code={team.code}
        memberCount={members.length}
        initialContent={latest?.content ?? null}
      />
    </div>
  );
}
