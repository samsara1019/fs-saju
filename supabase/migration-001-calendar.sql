-- 음력 지원: members에 달력 종류 컬럼 추가 (이미 schema.sql로 새로 만든 DB에는 불필요)
-- Supabase 대시보드 > SQL Editor에서 실행하세요.
alter table members add column if not exists calendar text not null default 'solar';
