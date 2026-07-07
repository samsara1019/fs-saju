import { NextRequest, NextResponse } from "next/server";
import { createTeam, addMember } from "@/lib/db";

interface CreateTeamBody {
  teamName?: string;
  owner?: {
    name?: string;
    birthDate?: string;
    birthTime?: string | null;
    position?: string | null;
  };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as CreateTeamBody | null;
  const teamName = body?.teamName?.trim();
  const owner = body?.owner;

  if (!teamName || !owner?.name?.trim() || !owner.birthDate) {
    return NextResponse.json({ error: "팀 이름과 방장 정보를 입력해주세요." }, { status: 400 });
  }
  if (!DATE_RE.test(owner.birthDate)) {
    return NextResponse.json({ error: "생년월일 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (owner.birthTime && !TIME_RE.test(owner.birthTime)) {
    return NextResponse.json({ error: "시간 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const team = await createTeam(teamName);
    await addMember({
      team_id: team.id,
      name: owner.name.trim(),
      birth_date: owner.birthDate,
      birth_time: owner.birthTime || null,
      position: owner.position || null,
      is_owner: true,
    });
    return NextResponse.json({ code: team.code });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "팀 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
