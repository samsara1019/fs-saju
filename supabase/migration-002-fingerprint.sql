-- 동일한 팀 구성 재분석 방지: analyses에 팀 구성 해시 컬럼 추가
-- (schema.sql로 새로 만든 DB에는 불필요)
-- Supabase 대시보드 > SQL Editor에서 실행하세요.
alter table analyses add column if not exists fingerprint text;
