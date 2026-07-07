// 사이트 절대 URL — 메타데이터/sitemap/robots/JSON-LD에서 공통 사용.
// 끝의 슬래시를 제거해 `${siteUrl}/create` 조합 시 이중 슬래시를 방지한다.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fs-saju.vercel.app"
).replace(/\/+$/, "");
