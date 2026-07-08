"use client";

import { track } from "@/lib/analytics";

const KAKAO_CHAT_URL = "http://pf.kakao.com/_HFbwX/chat";

/** 카카오톡 채널 1:1 채팅 링크 — RawBlock 규칙상 링크는 하이퍼링크 블루 */
export default function ContactLink({
  children,
  location,
}: {
  children: React.ReactNode;
  location: string; // GA 이벤트용 위치 구분 (home | footer 등)
}) {
  return (
    <a
      href={KAKAO_CHAT_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("contact_click", { location })}
      className="font-semibold text-[#0000FF] underline hover:no-underline"
    >
      {children}
    </a>
  );
}
