import type { Metadata } from "next";
import { Archivo_Black, Work_Sans, Space_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "FS SAJU — 풋살팀 사주 궁합 분석",
  description: "팀원들의 사주로 알아보는 풋살 팀 케미. 베스트 패스 라인과 추천 포지션까지.",
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
