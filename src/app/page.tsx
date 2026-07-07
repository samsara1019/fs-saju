import Link from "next/link";
import JoinByCode from "@/components/JoinByCode";

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
    </div>
  );
}
