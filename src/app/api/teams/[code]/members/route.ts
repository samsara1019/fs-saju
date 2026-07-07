import { NextRequest, NextResponse } from "next/server";
import { getTeamByCode, addMember, listMembers } from "@/lib/db";
import { validateMemberPayload } from "@/lib/validate";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const team = await getTeamByCode(code);
  if (!team) {
    return NextResponse.json({ error: "존재하지 않는 팀 코드입니다." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const validated = validateMemberPayload(body ?? {});
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // 기본 별명(패스왕)이 겹치는 건 자연스러운 일이므로 번호를 붙여 자동으로 구분한다.
  const existingNames = new Set((await listMembers(team.id)).map((m) => m.name));
  let finalName = validated.value.name;
  for (let n = 2; existingNames.has(finalName); n++) finalName = `${validated.value.name}${n}`;

  try {
    await addMember({
      team_id: team.id,
      is_owner: false,
      ...validated.value,
      name: finalName,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "참가에 실패했습니다." },
      { status: 500 }
    );
  }
}
