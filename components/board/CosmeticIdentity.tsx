import BoardIdentityLayout from './BoardIdentityLayout'

const pillars = [
  {
    title: '최소 삭제',
    description: '치아를 최대한 살리면서 아름다움을 더합니다.\n라미네이트, 올세라믹 모두\n불필요한 삭제 없이 진행합니다.',
  },
  {
    title: '자연스러운 색감',
    description: '디지털 색조 매칭으로\n옆 치아와 자연스럽게 어우러집니다.\n누가 봐도 내 치아처럼 보이는 결과를 만듭니다.',
  },
  {
    title: '기능과 심미',
    description: '아름다움과 저작 기능을 동시에 고려합니다.\n예쁘기만 한 치아가 아닌\n잘 씹히고 오래 가는 보철을 제작합니다.',
  },
]

export default function CosmeticIdentity() {
  return (
    <BoardIdentityLayout
      label="COSMETIC & PROSTHETICS"
      title={<>자연스러운 아름다움,<br /><span className="text-[#0080C8]">기능까지 완벽하게</span></>}
      description={<>심미보철은 단순한 외모 개선이 아닙니다.<br />치아의 기능을 지키면서 자연스러운 아름다움을 더하는 것,<br />이건치과가 추구하는 심미 철학입니다.</>}
      pillars={pillars}
    />
  )
}
