# ⚽ FS SAJU

팀원들의 생년월일로 사주를 풀어 풋살팀 케미를 분석하는 웹사이트.
포지션: 골레이로 / 피보 / 아라 / 픽소. 별명 기본값은 "패스왕" (중복 시 자동 번호).

- 방장이 팀을 만들면 6자리 **팀 코드**가 생성되고, 팀원들은 코드나 초대 링크로 참가
- 만세력(절기 기준) 기반 사주 4주 계산 — `lunar-javascript` 사용, 태어난 시간은 선택 입력
- 오행 상생·상극으로 **페어별 패스 궁합 점수** 산출 (코드에서 결정적으로 계산)
- Gemini API로 **AI 전술 리포트** 생성 — 멤버별 추천 포지션, 베스트 패스 라인, 팀 운세

## 실행

```bash
npm install
npm run dev
```

환경변수 없이도 바로 동작합니다:

- **Supabase 미설정** → 인메모리 저장소 (서버 재시작 시 데이터 소멸, 개발용)
- **GEMINI_API_KEY 미설정** → LLM 해석 없이 계산된 사주만 보여주는 미리보기 모드

## 프로덕션 설정

1. [Supabase](https://supabase.com) 프로젝트 생성 → SQL Editor에서 `supabase/schema.sql` 실행
2. `.env.local.example`을 `.env.local`로 복사하고 값 채우기
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Settings > API)
   - `GEMINI_API_KEY` ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))
3. 배포는 Vercel 권장 (환경변수 3개 등록)

> DB 접근은 전부 서버 라우트에서 service role 키로만 이루어지며, RLS가 켜져 있어
> anon 키로는 아무 테이블도 접근할 수 없습니다. 팀 코드가 사실상의 접근 토큰입니다.

## 구조

```
src/
  lib/saju.ts        # 사주 계산: 4주, 오행 분포, 일간, 페어 궁합 점수
  lib/llm.ts         # Gemini 호출 + 프롬프트 (계산은 코드, 해석만 LLM)
  lib/db.ts          # Supabase / 인메모리 저장소 추상화
  app/
    page.tsx               # 랜딩 (팀 만들기 / 코드로 참가)
    create/                # 팀 생성 (방장)
    join/[code]/           # 초대 링크로 참가
    team/[code]/           # 팀 대시보드 (선수단, 궁합 랭킹, AI 리포트)
    api/teams/...          # 팀 생성 / 멤버 추가 / 분석 API
supabase/schema.sql  # DB 스키마
```
