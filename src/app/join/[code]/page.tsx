import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamByCode, listMembers } from "@/lib/db";
import JoinForm from "@/components/JoinForm";

// 초대 링크 미리보기(카톡 등)용 제목은 제공하되, 팀 코드가 노출되는 페이지라 색인은 막는다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const team = await getTeamByCode(code);
  return {
    title: team ? `${team.name} 팀에 참가하기` : "팀 참가",
    description: "생년월일을 입력하고 우리 팀 사주 궁합 분석에 합류하세요.",
    robots: { index: false, follow: false },
  };
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const team = await getTeamByCode(code);
  if (!team) notFound();

  const members = await listMembers(team.id);

  return (
    <div className="mx-auto max-w-md">
      <p className="font-mono text-xs uppercase tracking-[2px]">팀 참가</p>
      <h1 className="mt-1 font-headline text-3xl uppercase">{team.name}</h1>
      <p className="mt-2 text-sm">
        현재 <strong>{members.length}명</strong>이 함께하고 있어요:{" "}
        {members.map((m) => m.name).join(", ")}
      </p>

      <div className="mt-6 border-[3px] border-black p-5">
        <JoinForm code={team.code} />
      </div>
    </div>
  );
}
