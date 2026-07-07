import { CalendarType, lunarToSolar } from "./saju";

export interface MemberPayload {
  name: string;
  birth_date: string;
  birth_time: string | null;
  calendar: CalendarType;
  position: string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const CALENDARS: CalendarType[] = ["solar", "lunar", "lunar_leap"];

/** 멤버 입력 공통 검증. 성공 시 정규화된 값, 실패 시 사용자에게 보여줄 에러 메시지. */
export function validateMemberPayload(body: {
  name?: string;
  birthDate?: string;
  birthTime?: string | null;
  calendar?: string;
  position?: string | null;
}): { ok: true; value: MemberPayload } | { ok: false; error: string } {
  const name = body.name?.trim();
  if (!name || !body.birthDate) {
    return { ok: false, error: "별명과 생년월일을 입력해주세요." };
  }
  if (!DATE_RE.test(body.birthDate)) {
    return { ok: false, error: "생년월일 형식이 올바르지 않습니다." };
  }
  if (body.birthTime && !TIME_RE.test(body.birthTime)) {
    return { ok: false, error: "시간 형식이 올바르지 않습니다." };
  }
  const calendar = (body.calendar ?? "solar") as CalendarType;
  if (!CALENDARS.includes(calendar)) {
    return { ok: false, error: "달력 종류가 올바르지 않습니다." };
  }
  if (calendar !== "solar") {
    try {
      lunarToSolar(body.birthDate, calendar === "lunar_leap");
    } catch {
      return {
        ok: false,
        error:
          calendar === "lunar_leap"
            ? "존재하지 않는 음력 윤달 날짜입니다. 해당 연도에 윤달이 있는지 확인해주세요."
            : "존재하지 않는 음력 날짜입니다.",
      };
    }
  }
  return {
    ok: true,
    value: {
      name,
      birth_date: body.birthDate,
      birth_time: body.birthTime || null,
      calendar,
      position: body.position || null,
    },
  };
}
