import type { Metadata } from "next";
import Link from "next/link";
import JoinByCode from "@/components/JoinByCode";
import ContactLink from "@/components/ContactLink";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FAQ = [
  {
    q: "풋살팀 사주 분석이란 무엇인가요?",
    a: "팀원들의 생년월일로 사주팔자(사주 4주)를 계산해 풋살팀의 궁합과 케미를 분석하는 것입니다. FS SAJU는 만세력 기반으로 오행(목·화·토·금·수) 분포를 계산하고, 팀 전체의 강점과 보완점, 멤버별 역할까지 알려드립니다.",
  },
  {
    q: "풋살팀 궁합은 어떻게 계산하나요?",
    a: "두 선수의 일간 오행이 서로 돕는 상생 관계인지, 부딪히는 상극·충 관계인지, 대화가 잘 통하는 천간합인지 분석해 페어별 패스 궁합 점수를 매깁니다. 서로 부족한 오행을 채워주는 보완 관계와 음양 조화도 함께 반영됩니다.",
  },
  {
    q: "팀 사주 분석에 무엇이 필요한가요?",
    a: "팀원들의 생년월일만 있으면 됩니다. 양력은 물론 음력(윤달 포함)도 지원하며, 태어난 시간을 알면 시주까지 포함해 더 정확해집니다. 방장이 팀을 만들어 코드를 공유하면 팀원들이 각자 입력합니다.",
  },
  {
    q: "포지션 추천은 어떻게 이루어지나요?",
    a: "사주의 일간과 오행 기질을 풋살 포지션(골레이로·픽소·아라·피보)에 대응시켜 추천합니다. 예를 들어 안정적인 토(土) 기운은 빌드업의 축인 픽소, 폭발력의 화(火) 기운은 해결사 피보와 어울립니다.",
  },
];

export default function Home() {
  return (
    <div className="grid gap-12">
      <div className="grid gap-5">
        <p className="font-mono text-sm uppercase tracking-[2px]">FS SAJU — Futsal × Saju</p>
        <h1 className="font-headline text-4xl uppercase leading-none sm:text-5xl">
          패스가 안 맞는 건
          <br />
          <span className="bg-black px-2 text-white">사주</span> 때문일지도?
        </h1>
        <p className="max-w-md text-base leading-relaxed">
          팀원들의 생년월일로 사주를 풀어 오행 밸런스, 베스트 패스 라인, 추천
          포지션까지 분석합니다. 한 명만 입력해도 개인 풋살 사주가 나오고, 팀원이
          추가될 때마다 관계 분석이 업데이트됩니다.
        </p>
      </div>

      <div className="grid max-w-md gap-4">
        <Link
          href="/create"
          className="border-[3px] border-black bg-black px-6 py-4 text-center text-lg font-bold uppercase tracking-[2px] text-white transition-colors hover:bg-white hover:text-black"
        >
          새 팀 만들기 (방장)
        </Link>
        <JoinByCode />
        <p className="text-center text-xs">
          내 팀 코드를 잊어버렸다면?{" "}
          <ContactLink location="home">💬 카톡으로 문의하세요</ContactLink>
        </p>
      </div>

      <div className="grid gap-0 border-[3px] border-black sm:grid-cols-3">
        {[
          ["01", "사주 풀이", "만세력 기반으로 사주 4주와 오행을 정확히 계산. 한 명만 있어도 개인 풋살 사주 제공."],
          ["02", "패스 궁합", "상생·상극·천간합·충 관계로 페어별 케미 점수 산출. 멤버가 늘 때마다 자동 갱신."],
          ["03", "AI 전술 리포트", "LLM이 팀 내 역할, 포지션 추천, 팀 운영 조언까지 풀어드립니다."],
        ].map(([num, title, desc], i) => (
          <div
            key={title}
            className={`p-5 ${i > 0 ? "border-t-[3px] border-black sm:border-l-[3px] sm:border-t-0" : ""}`}
          >
            <div className="font-mono text-sm">{num}</div>
            <div className="mt-1 font-headline text-base uppercase">{title}</div>
            <div className="mt-2 text-xs leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 border-b-[3px] border-black pb-2 font-headline text-xl uppercase">
          자주 묻는 질문
        </h2>
        <div className="grid gap-0 border-[3px] border-black">
          {FAQ.map((item, i) => (
            <details key={item.q} className={i > 0 ? "border-t-[3px] border-black" : ""}>
              <summary className="cursor-pointer p-4 font-bold hover:bg-black hover:text-white">
                {item.q}
              </summary>
              <p className="border-t-2 border-black p-4 text-sm leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "FS SAJU",
              url: siteUrl,
              applicationCategory: "EntertainmentApplication",
              inLanguage: "ko",
              description:
                "풋살팀 사주 궁합 분석 — 생년월일로 팀 오행 밸런스, 패스 궁합, 포지션 추천을 제공합니다.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            },
          ]),
        }}
      />
    </div>
  );
}
