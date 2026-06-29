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
      <Image
        src="/images/doctors/baek-child.jpg"
        alt="보건복지부 인증 소아치과전문의 백설아 원장"
        width={2172}
        height={724}
        className="w-full h-auto block"
      />
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
