"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** 팀원이 새로 참가하면 대시보드가 자동으로 갱신되도록 주기적으로 서버 데이터를 다시 가져온다. */
export default function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
