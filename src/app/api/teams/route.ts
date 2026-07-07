import { NextRequest, NextResponse } from "next/server";
import { createTeam, addMember } from "@/lib/db";
import { validateMemberPayload } from "@/lib/validate";

interface CreateTeamBody {
  teamName?: string;
  owner?: {
    name?: string;
    birthDate?: string;
    birthTime?: string | null;
    calendar?: string;
    position?: string | null;
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as CreateTeamBody | null;
  const teamName = body?.teamName?.trim();

  if (!teamName || !body?.owner) {
    return NextResponse.json({ error: "팀 이름과 방장 정보를 입력해주세요." }, { status: 400 });
  }
  const validated = validateMemberPayload(body.owner);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const team = await createTeam(teamName);
    await addMember({ team_id: team.id, is_owner: true, ...validated.value });
    return NextResponse.json({ code: team.code });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "팀 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
