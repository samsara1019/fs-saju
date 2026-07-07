import { NextRequest, NextResponse } from "next/server";
import { getTeamByCode, listMembers, saveAnalysis, getLatestAnalysis } from "@/lib/db";
import { analyzeTeam, teamFingerprint } from "@/lib/llm";

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

  // 멤버 구성이 마지막 분석과 동일하면 결과도 같으므로 LLM을 호출하지 않는다.
  const fingerprint = teamFingerprint(team.name, members);
  const latest = await getLatestAnalysis(team.id);
  if (latest && latest.fingerprint === fingerprint) {
    return NextResponse.json({
      content: latest.content,
      upToDate: true,
      message:
        "멤버 구성이 바뀌지 않아 현재 리포트가 이미 최적의 분석입니다. 멤버를 추가하거나 수정하면 다시 분석할 수 있어요.",
    });
  }

  try {
    const content = await analyzeTeam(team.name, members);
    await saveAnalysis(team.id, content, members.length, fingerprint);
    return NextResponse.json({ content, upToDate: false });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "분석에 실패했습니다." },
      { status: 500 }
    );
  }
}
