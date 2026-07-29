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
      {/* 데스크탑/태블릿: 파스텔 배경 + 문구 중앙 + 오른쪽 누끼 사진 */}
      <div className="relative hidden md:block overflow-hidden h-[295px] lg:h-[395px]">
        <Image
          src="/images/treatments/pediatric/ped-banner-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
          priority
        />
        <div className="relative flex h-full items-center justify-center gap-x-[4vw]">
          <div>
            <span className="inline-block rounded-full bg-[#0080C8] text-white font-semibold tracking-wide text-[0.85vw] px-[1vw] py-[0.3vw] mb-[0.7vw]">
              아이를 위한 따뜻한 진료
            </span>
            <h2 className="font-black text-[#0080C8] leading-none text-[3.2vw]">
              소아치과
            </h2>
            <p className="mt-[0.7vw] font-bold text-[#2B2D42] leading-[1.3] text-[1.3vw]">
              아이를 보듬는 마음으로 정성껏 진료합니다.
            </p>
            <div className="mt-[0.9vw] flex items-center gap-[1vw]">
              <Image
                src="/images/logo/egun-logo.png"
                alt="서울이건치과"
                width={1000}
                height={400}
                className="h-[1.7vw] w-auto"
              />
              <span className="block w-px self-stretch bg-gray-300" />
              <div className="leading-tight">
                <p className="font-bold text-[#2B2D42] text-[1.1vw]">원장 김진아</p>
                <p className="text-gray-500 text-[0.85vw]">소아치과 전문의</p>
              </div>
            </div>
          </div>
          <div className="h-full self-end shrink-0">
            <Image
              src="/images/doctors/doctor-kim2-cut.png"
              alt="서울이건치과 소아진료 김진아 원장"
              width={839}
              height={850}
              className="h-full w-auto block"
              style={{ transform: 'scale(1.05)', transformOrigin: 'bottom center' }}
            />
          </div>
        </div>
      </div>
      {/* 모바일 */}
      <div className="md:hidden">
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#eef4fb] to-[#dde8f4] flex justify-center">
          <Image
            src="/images/doctors/doctor-kimjina-cut.png"
            alt="서울이건치과 소아진료 김진아 원장"
            width={1080}
            height={1350}
            className="w-[72%] h-auto block"
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
          <p className="text-[#5b6b87] text-[13px]">원장 김진아 · 소아치과 전문의</p>
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
      description={<>아이가 치과를 무서워하지 않도록 하는 것이 먼저입니다.<br />편안한 첫 경험이 평생의 구강 건강 습관을 만들고,<br />소아진료 경험을 갖춘 원장이 성장 단계마다 함께합니다.</>}
      pillars={pillars}
    />
    </>
  )
}
