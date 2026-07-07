// GA4 이벤트 태깅 — GTM dataLayer로 커스텀 이벤트를 push한다.
// GTM에서 "맞춤 이벤트" 트리거 + GA4 이벤트 태그로 매핑해 GA4로 전송된다.
//
// 이벤트 목록 (파라미터):
// - team_create      : 팀 생성 완료 (calendar, has_birth_time, position)
// - team_join        : 팀 참가 완료 (calendar, has_birth_time, position)
// - join_code_submit : 랜딩에서 팀 코드 입력 후 이동
// - share_copy       : 팀 코드/초대 링크 복사 (kind: code | link)
// - analyze_start    : AI 분석 요청 (member_count)
// - analyze_complete : AI 분석 성공 (member_count, cached: 동일 구성이라 기존 결과 반환 여부)
// - analyze_error    : AI 분석 실패 (member_count)
// - member_edit      : 멤버 정보 수정 완료
// - member_delete    : 멤버 삭제 완료

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer ??= [];
  window.dataLayer.push({ event, ...params });
}
