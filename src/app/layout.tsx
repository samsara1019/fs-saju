import type { Metadata } from "next";
import { Archivo_Black, Work_Sans, Space_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { siteUrl, gtmId } from "@/lib/site";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
});
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FS SAJU — 풋살팀 사주 궁합 · 팀 사주 분석",
    template: "%s | FS SAJU",
  },
  description:
    "풋살팀 사주 분석 서비스 FS SAJU. 팀원들의 생년월일(양력·음력)만 입력하면 사주 오행으로 풋살팀 궁합, 베스트 패스 라인, 포지션 추천까지. 팀 코드로 간편하게 팀원을 초대하세요.",
  keywords: [
    "팀 사주 분석",
    "풋살팀 사주",
    "풋살팀 궁합",
    "팀 궁합 테스트",
    "사주 궁합",
    "오행 궁합",
    "풋살 포지션 추천",
    "팀 케미 분석",
    "모임 궁합",
    "풋살",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "FS SAJU",
    title: "FS SAJU — 풋살팀 사주 궁합 · 팀 사주 분석",
    description:
      "생년월일만으로 풋살팀 궁합을 분석합니다. 오행 밸런스, 패스 라인, 포지션 추천까지.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FS SAJU — 풋살팀 사주 궁합 · 팀 사주 분석",
    description:
      "생년월일만으로 풋살팀 궁합을 분석합니다. 오행 밸런스, 패스 라인, 포지션 추천까지.",
  },
  robots: { index: true, follow: true },
  verification: {
    // 서치콘솔(URL 접두어 속성) HTML 태그 검증값 — Vercel 환경변수로 주입
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${archivoBlack.variable} ${workSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white font-sans text-black">
        {/* Google Tag Manager (noscript) — body 최상단 */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6">
          <header className="flex items-center justify-between border-b-[5px] border-black py-6">
            <Link href="/" className="font-headline text-xl uppercase tracking-tight">
              ⚽ FS SAJU
            </Link>
            <span className="hidden font-mono text-xs uppercase tracking-widest sm:inline">
              Futsal × Saju
            </span>
          </header>
          <main className="flex-1 pb-16 pt-8">{children}</main>
          <footer className="border-t-[3px] border-black py-6 text-center text-xs">
            재미로 보는 사주 분석입니다 — 진짜 실력은 연습이 만듭니다 🏃
          </footer>
        </div>
      </body>
    </html>
  );
}
