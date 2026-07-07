import { NextRequest, NextResponse } from "next/server";
import { getTeamByCode, addMember, listMembers } from "@/lib/db";

interface JoinBody {
  name?: string;
  birthDate?: string;
  birthTime?: string | null;
  position?: string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const team = await getTeamByCode(code);
  if (!team) {
    return NextResponse.json({ error: "존재하지 않는 팀 코드입니다." }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as JoinBody | null;
  const name = body?.name?.trim();

  if (!name || !body?.birthDate) {
    return NextResponse.json({ error: "이름과 생년월일을 입력해주세요." }, { status: 400 });
  }
  if (!DATE_RE.test(body.birthDate)) {
    return NextResponse.json({ error: "생년월일 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (body.birthTime && !TIME_RE.test(body.birthTime)) {
    return NextResponse.json({ error: "시간 형식이 올바르지 않습니다." }, { status: 400 });
  }

  // 기본 별명(패스왕)이 겹치는 건 자연스러운 일이므로 번호를 붙여 자동으로 구분한다.
  const existingNames = new Set((await listMembers(team.id)).map((m) => m.name));
  let finalName = name;
  for (let n = 2; existingNames.has(finalName); n++) finalName = `${name}${n}`;

  try {
    await addMember({
      team_id: team.id,
      name: finalName,
      birth_date: body.birthDate,
      birth_time: body.birthTime || null,
      position: body.position || null,
      is_owner: false,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "참가에 실패했습니다." },
      { status: 500 }
    );
  }
}
