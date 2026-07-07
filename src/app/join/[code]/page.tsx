import { notFound } from "next/navigation";
import { getTeamByCode, listMembers } from "@/lib/db";
import JoinForm from "@/components/JoinForm";

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
