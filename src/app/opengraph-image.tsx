import { ImageResponse } from "next/og";

export const alt = "FS SAJU — 풋살팀 사주 궁합 분석";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 한글 폰트 파일 없이도 깨지지 않도록 라틴 텍스트만 사용한 브루탈리즘 OG 이미지
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          border: "24px solid #000000",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, letterSpacing: 6 }}>
          FUTSAL × SAJU
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 160,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          <span>FS</span>
          <span
            style={{
              background: "#000000",
              color: "#ffffff",
              padding: "0 24px",
              alignSelf: "flex-start",
            }}
          >
            SAJU
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 32,
            letterSpacing: 3,
          }}
        >
          <span>TEAM CHEMISTRY BY BIRTHDAY</span>
          <span>⚽</span>
        </div>
      </div>
    ),
    size
  );
}
