import Link from 'next/link'
import Image from 'next/image'

export default function DoctorGroup() {
  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">

      {/* ── 모바일 이미지 (하단바 높이만큼 위로 올려 인물 전체 노출) ── */}
      <div
        className="md:hidden absolute inset-x-0 top-0 overflow-hidden"
        style={{ bottom: 'var(--mobile-bottom-bar-height)' }}
      >
        <Image
          src="/images/doctors/doctor-team-mobile.webp"
          alt="서울이건치과 의료진"
          fill
          sizes="100vw"
          className="object-cover object-bottom"
        />
        {/* 상단 텍스트 영역만 살짝 어둡게 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%)',
          }}
        />
      </div>

      {/* ── 데스크탑 이미지 ── */}
      <Image
        src="/images/doctors/doctors-team-desktop.webp"
        alt="서울이건치과 의료진"
        fill
        sizes="100vw"
        priority
        className="hidden md:block object-cover object-[72%_center]"
      />

      {/* ── 모바일 텍스트 + 버튼 (상단 가운데 정렬) ── */}
      <div
        className="md:hidden absolute inset-x-0 z-10 flex flex-col items-center text-center px-7"
        style={{ top: 'calc(var(--mobile-header-height) + 50px)' }}
      >
        {/* 헤드라인 */}
        <h2 className="text-white text-[28px] font-bold leading-tight tracking-tight">
          한자리에서<br />변하지 않는 마음
        </h2>

        {/* 구분선 */}
        <div className="w-10 h-[1.5px] bg-white/50 my-4" />

        {/* 서브카피 */}
        <p className="text-white/75 text-[18px] font-light leading-snug mb-6">
          마음을 담아 정성을 다하여
        </p>

        {/* 버튼 */}
        <Link
          href="/about#doctor-intro"
          className="inline-flex items-center justify-center gap-2
            h-[48px] px-7 rounded-full
            bg-[#0080C8] text-white text-[18px] font-semibold
            shadow-[0_4px_20px_rgba(0,128,200,0.4)]
            transition-all duration-200 active:bg-[#006EAA]"
        >
          이건진료진 소개
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ── 데스크탑 텍스트 + 버튼 (왼쪽 여백) ── */}
      <div className="hidden md:flex absolute left-[6.4%] top-1/2 -translate-y-1/2 z-10 flex-col items-start">
        <h2
          className="text-[#2B2D42] font-bold leading-[1.15] tracking-tight"
          style={{ fontSize: 'clamp(34px, 3.6vw, 54px)' }}
        >
          한자리에서<br />변하지 않는 마음
        </h2>

        <div className="w-12 h-px bg-[#2B2D42]/40 my-5" />

        <p
          className="text-[#2B2D42]/75 font-light"
          style={{ fontSize: 'clamp(16px, 1.4vw, 21px)' }}
        >
          서울대학교 출신 2인 대표원장
        </p>

        <Link
          href="/about#doctor-intro"
          className="mt-8 inline-flex items-center justify-center gap-2
            min-h-[44px] px-5 w-[150px]
            rounded-none bg-white/10 text-gray-800
            border border-gray-700/60 backdrop-blur-[2px]
            text-[18px] font-semibold
            transition-all duration-200
            hover:bg-white/35 hover:border-[#0080C8] hover:text-[#0080C8]"
        >
          자세히보기
        </Link>
      </div>
    </section>
  )
}
