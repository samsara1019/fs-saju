import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "풋살팀 만들기 — 팀 사주 분석 시작",
  description:
    "풋살팀을 만들고 팀 코드를 공유하세요. 팀원들의 생년월일로 풋살팀 사주 궁합과 포지션 추천을 받을 수 있습니다.",
  alternates: { canonical: "/create" },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
