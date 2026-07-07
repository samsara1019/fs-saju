import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-5 pt-20 text-center">
      <p className="font-headline text-6xl">404</p>
      <h1 className="font-headline text-2xl uppercase">골대를 벗어났어요</h1>
      <p className="text-sm">존재하지 않는 팀 코드이거나 잘못된 주소입니다.</p>
      <Link
        href="/"
        className="mt-2 border-[3px] border-black bg-black px-5 py-3 text-sm font-bold uppercase tracking-[2px] text-white transition-colors hover:bg-white hover:text-black"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
