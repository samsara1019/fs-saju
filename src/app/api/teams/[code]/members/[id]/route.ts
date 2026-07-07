import { NextRequest, NextResponse } from "next/server";
import { getTeamByCode, listMembers, updateMember, deleteMember } from "@/lib/db";
import { validateMemberPayload } from "@/lib/validate";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  const { code, id } = await params;
  const team = await getTeamByCode(code);
  if (!team) {
    return NextResponse.json({ error: "존재하지 않는 팀 코드입니다." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const validated = validateMemberPayload(body ?? {});
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // 별명이 다른 멤버와 겹치면 자동으로 번호를 붙인다 (자기 자신은 제외).
  const others = (await listMembers(team.id)).filter((m) => m.id !== id);
  const existingNames = new Set(others.map((m) => m.name));
  let finalName = validated.value.name;
  for (let n = 2; existingNames.has(finalName); n++) finalName = `${validated.value.name}${n}`;

  try {
    const updated = await updateMember(team.id, id, { ...validated.value, name: finalName });
    if (!updated) {
      return NextResponse.json({ error: "존재하지 않는 멤버입니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  const { code, id } = await params;
  const team = await getTeamByCode(code);
  if (!team) {
    return NextResponse.json({ error: "존재하지 않는 팀 코드입니다." }, { status: 404 });
  }

  try {
    const removed = await deleteMember(team.id, id);
    if (!removed) {
      return NextResponse.json({ error: "존재하지 않는 멤버입니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
