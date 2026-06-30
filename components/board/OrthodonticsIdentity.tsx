import Image from 'next/image'
import BoardIdentityLayout from './BoardIdentityLayout'

const pillars = [
  {
    title: '투명교정 전문',
    description: '인비절라인 공인 프로바이더로\n눈에 띄지 않는 투명 장치로 교정합니다.\n일상을 방해하지 않는 교정을 경험하세요.',
  },
  {
    title: '성장기 교정',
    description: '아이의 골격 발달 단계를 고려한 맞춤 치료입니다.\n적절한 시기에 시작하는 교정이\n평생 구강 건강의 기반이 됩니다.',
  },
  {
    title: '교합 중심',
    description: '치아 배열만이 아닌 기능적 교합을 목표합니다.\n씹는 힘, 턱 관절, 안면 균형까지\n전체적인 조화를 고려합니다.',
  },
]

function HeroText({ center = false }: { center?: boolean }) {
  return (
    <div className={center ? 'text-center' : 'text-left'}>
      <span className={`inline-block rounded-full bg-[#3F6FB5] text-white font-semibold tracking-wide ${center ? 'text-[12px] px-3.5 py-1 mb-2.5' : 'text-[13px] sm:text-[15px] px-4 py-1.5 mb-4'}`}>
        이건교정
      </span>
      <h1 className={`font-black leading-none tracking-tight text-[#1f2d4d] ${center ? 'text-[34px] mb-2' : 'text-[min(76px,4.8vw)] whitespace-nowrap mb-3'}`}>
        인비절라인
      </h1>
      <p className={`font-bold text-[#2b3a5c] leading-snug ${center ? 'text-[16px] mb-2' : 'text-[19px] sm:text-[24px] lg:text-[28px] mb-4 whitespace-nowrap'}`}>
        티 나지 않게 자연스러운 투명교정
      </p>
      <p className={`text-[#5b6b87] leading-relaxed ${center ? 'text-[13px]' : 'text-[14px] sm:text-[17px]'}`}>
        일상에 부담을 줄이면서 심미성과 편안함을 고려한 교정 계획
      </p>
    </div>
  )
}

export function OrthodonticsHeroBanner() {
  return (
    <section className="pt-16 sm:pt-20 bg-gradient-to-br from-[#eef4fb] to-[#dde8f4]">
      {/* ── 데스크탑/태블릿: 배경 합성 배너 (의료진·장치·우측 패널 포함) ── */}
      <div
        className="relative hidden md:block w-full overflow-hidden"
        style={{ aspectRatio: '2172 / 724' }}
      >
        <Image
          src="/images/doctors/ortho-main.jpg"
          alt="인비절라인 투명교정"
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover object-center"
        />
        {/* 텍스트 — 의료진 오른쪽 빈 공간 (장치 왼쪽까지) */}
        <div className="absolute inset-y-0 left-[25%] lg:left-[26%] flex flex-col justify-center w-[24%]">
          <HeroText />
        </div>
      </div>

      {/* ── 모바일: 새 합성 이미지 + 텍스트 (데스크탑 배너는 변경 금지) ── */}
      <div className="md:hidden">
        <div className="relative w-full overflow-hidden">
          <Image
            src="/images/board/invisalign-doctor.jpg"
            alt="인비절라인 투명교정"
            width={2200}
            height={1320}
            className="w-full h-auto block"
            priority
          />
        </div>
        <div className="px-6 pt-7 pb-6">
          <HeroText center />
        </div>
      </div>
    </section>
  )
}

export default function OrthodonticsIdentity() {
  return (
    <BoardIdentityLayout
      label="ORTHODONTICS"
      title={<>가지런한 치아,<br /><span className="text-[#0080C8]">건강한 교합을 만듭니다</span></>}
      description={<>교정은 외모만의 문제가 아닙니다.<br />올바른 교합은 치아 수명과 전신 건강에 직결됩니다.<br />이건치과 교정과 전문의가 함께합니다.</>}
      pillars={pillars}
    />
  )
}
