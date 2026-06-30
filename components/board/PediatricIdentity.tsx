import Image from 'next/image'
import BoardIdentityLayout from './BoardIdentityLayout'

const pillars = [
  {
    title: '편안한 진료 환경',
    description: '아이가 무서움 없이 치료받을 수 있도록\n공간과 소통 방식 모두 아이 눈높이에 맞췄습니다.\n첫 경험이 평생 치과 습관을 결정합니다.',
  },
  {
    title: '예방 중심',
    description: '충치가 생기기 전에 막는 것이 최선입니다.\n실란트, 불소도포, 조기 발견으로\n건강한 영구치가 자랄 수 있게 돕습니다.',
  },
  {
    title: '성장기 맞춤',
    description: '아이의 성장 단계에 맞는 치료 계획을 수립합니다.\n골격 발달과 치열 변화를 지속적으로 관찰하며\n적절한 시기에 필요한 치료를 안내합니다.',
  },
]

export function PediatricCredentialSection() {
  return (
    <section className="pt-16 sm:pt-20">
      {/* 데스크탑/태블릿: 원래 합성 배너 + 텍스트 오버레이 (변경 금지) */}
      <div className="relative hidden md:block">
        <Image
          src="/images/doctors/baek-child-clean.jpg"
          alt="보건복지부 인증 소아치과전문의 백설아 원장"
          width={2172}
          height={724}
          className="w-full h-auto block"
        />
        <div className="absolute left-[8%] top-[28.5%] w-[46%]">
          <h2 className="font-black text-[#0080C8] leading-none text-[7.2vw]">
            소아치과
          </h2>
          <p className="mt-[1vw] font-bold text-[#2B2D42] leading-[1.3] text-[2.7vw]">
            아이를 보듬는 마음으로<br />
            정성껏 진료합니다.
          </p>
          <div className="mt-[1vw] flex items-center gap-[1.4vw]">
            <Image
              src="/images/logo/egun-logo.png"
              alt="서울이건치과"
              width={1000}
              height={400}
              className="h-[2.8vw] w-auto"
            />
            <span className="block w-px self-stretch bg-gray-300" />
            <div className="leading-tight">
              <p className="font-bold text-[#2B2D42] text-[1.9vw]">원장 백설아</p>
              <p className="text-gray-500 text-[1.4vw]">소아치과전문의</p>
            </div>
          </div>
        </div>
      </div>
      {/* 모바일: 새 이미지(의료진·자격증) + 인비절라인형 텍스트 */}
      <div className="md:hidden">
        <div className="relative w-full overflow-hidden">
          <Image
            src="/images/doctors/baek-child-cert.jpg"
            alt="보건복지부 인증 소아치과전문의 백설아 원장"
            width={1193}
            height={724}
            className="w-full h-auto block"
            priority
          />
        </div>
        <div className="px-6 pt-6 pb-6 text-center bg-gradient-to-br from-[#eef4fb] to-[#dde8f4]">
          <span className="inline-block rounded-full bg-[#0080C8] text-white font-semibold tracking-wide text-[12px] px-3.5 py-1 mb-2.5">
            아이를 위한 따뜻한 진료
          </span>
          <h2 className="font-black leading-none tracking-tight text-[#0080C8] text-[40px] mb-2">
            소아치과
          </h2>
          <p className="font-bold text-[#2B2D42] leading-snug text-[16px] mb-2">
            아이를 보듬는 마음으로 정성껏 진료합니다.
          </p>
          <p className="text-[#5b6b87] text-[13px]">원장 백설아 · 소아치과전문의</p>
        </div>
      </div>
    </section>
  )
}

export default function PediatricIdentity() {
  return (
    <>
      <BoardIdentityLayout
      frosted
      label="PEDIATRIC DENTISTRY"
      title={<>아이의 첫 치과,<br /><span className="text-[#0080C8]">평생 구강 건강의 시작</span></>}
      description={<>아이가 치과를 무서워하지 않도록 하는 것이 먼저입니다.<br />편안한 첫 경험이 평생의 구강 건강 습관을 만들고,<br />소아 전문의가 성장 단계마다 함께합니다.</>}
      pillars={pillars}
    />
    </>
  )
}
