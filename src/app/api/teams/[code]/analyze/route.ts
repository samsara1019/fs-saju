import { NextRequest, NextResponse } from "next/server";
import { getTeamByCode, listMembers, saveAnalysis } from "@/lib/db";
import { analyzeTeam } from "@/lib/llm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const team = await getTeamByCode(code);
  if (!team) {
    return NextResponse.json({ error: "존재하지 않는 팀 코드입니다." }, { status: 404 });
  }

  const members = await listMembers(team.id);
  if (members.length < 1) {
    return NextResponse.json(
      { error: "분석할 멤버가 없습니다." },
      { status: 400 }
    );
  }

  try {
    const content = await analyzeTeam(team.name, members);
    await saveAnalysis(team.id, content, members.length);
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "분석에 실패했습니다." },
      { status: 500 }
    );
  }
}
