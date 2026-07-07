// 데이터 저장 레이어.
// SUPABASE 환경변수가 설정되어 있으면 Supabase를, 없으면 인메모리 저장소를 사용한다.
// (인메모리는 로컬 개발용 — 서버 재시작 시 데이터가 사라진다)
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";

const generateCode = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

export interface Team {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface Member {
  id: string;
  team_id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  birth_time: string | null; // HH:mm
  position: string | null; // 골레이로 | 픽소 | 알라 | 피보 | 무관
  is_owner: boolean;
  created_at: string;
}

export interface Analysis {
  id: string;
  team_id: string;
  content: string;
  member_count: number;
  created_at: string;
}

// 플레이스홀더(xxxx, eyJ..., sk-ant-...)나 URL이 아닌 값(API 키를 URL 자리에 붙여넣는 실수 등)이
// 들어 있으면 미설정으로 간주하고 인메모리로 폴백한다 — "fetch failed"로 죽는 것보다 낫다.
function resolveSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (url.includes("xxxx") || key === "eyJ...") return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { url, key };
}

function getSupabase(): SupabaseClient | null {
  const config = resolveSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, { auth: { persistSession: false } });
}

export const usingMemoryStore = !resolveSupabaseConfig();

// ---------- 인메모리 폴백 ----------
interface MemoryStore {
  teams: Map<string, Team>;
  members: Map<string, Member[]>;
  analyses: Map<string, Analysis[]>;
}
const g = globalThis as unknown as { __futsalSajuStore?: MemoryStore };
function memStore(): MemoryStore {
  g.__futsalSajuStore ??= { teams: new Map(), members: new Map(), analyses: new Map() };
  return g.__futsalSajuStore;
}
let memId = 0;
const nextId = () => `mem-${++memId}-${generateCode()}`;

// ---------- 공개 API ----------

export async function createTeam(name: string): Promise<Team> {
  const code = generateCode();
  const sb = getSupabase();
  if (!sb) {
    const team: Team = { id: nextId(), code, name, created_at: new Date().toISOString() };
    memStore().teams.set(code, team);
    return team;
  }
  const { data, error } = await sb.from("teams").insert({ code, name }).select().single();
  if (error) throw new Error(`팀 생성 실패: ${error.message}`);
  return data as Team;
}

export async function getTeamByCode(code: string): Promise<Team | null> {
  const normalized = code.trim().toUpperCase();
  const sb = getSupabase();
  if (!sb) return memStore().teams.get(normalized) ?? null;
  const { data, error } = await sb.from("teams").select().eq("code", normalized).maybeSingle();
  if (error) throw new Error(`팀 조회 실패: ${error.message}`);
  return data as Team | null;
}

export async function addMember(
  input: Omit<Member, "id" | "created_at">
): Promise<Member> {
  const sb = getSupabase();
  if (!sb) {
    const member: Member = { ...input, id: nextId(), created_at: new Date().toISOString() };
    const list = memStore().members.get(input.team_id) ?? [];
    list.push(member);
    memStore().members.set(input.team_id, list);
    return member;
  }
  const { data, error } = await sb.from("members").insert(input).select().single();
  if (error) throw new Error(`멤버 추가 실패: ${error.message}`);
  return data as Member;
}

export async function listMembers(teamId: string): Promise<Member[]> {
  const sb = getSupabase();
  if (!sb) return memStore().members.get(teamId) ?? [];
  const { data, error } = await sb
    .from("members")
    .select()
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`멤버 조회 실패: ${error.message}`);
  return (data ?? []) as Member[];
}

export async function saveAnalysis(
  teamId: string,
  content: string,
  memberCount: number
): Promise<Analysis> {
  const sb = getSupabase();
  if (!sb) {
    const analysis: Analysis = {
      id: nextId(),
      team_id: teamId,
      content,
      member_count: memberCount,
      created_at: new Date().toISOString(),
    };
    const list = memStore().analyses.get(teamId) ?? [];
    list.push(analysis);
    memStore().analyses.set(teamId, list);
    return analysis;
  }
  const { data, error } = await sb
    .from("analyses")
    .insert({ team_id: teamId, content, member_count: memberCount })
    .select()
    .single();
  if (error) throw new Error(`분석 저장 실패: ${error.message}`);
  return data as Analysis;
}

export async function getLatestAnalysis(teamId: string): Promise<Analysis | null> {
  const sb = getSupabase();
  if (!sb) {
    const list = memStore().analyses.get(teamId) ?? [];
    return list[list.length - 1] ?? null;
  }
  const { data, error } = await sb
    .from("analyses")
    .select()
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`분석 조회 실패: ${error.message}`);
  return data as Analysis | null;
}
