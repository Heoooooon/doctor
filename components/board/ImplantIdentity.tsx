import BoardIdentityLayout from './BoardIdentityLayout'

const pillars = [
  {
    title: '디지털 정밀 진단',
    description: '3D CT 데이터 기반으로 시술 계획을 수립하고\n맞춤 수술 가이드를 제작합니다.\n정확한 위치에, 안전하게 식립합니다.',
  },
  {
    title: '수면 편안함',
    description: '진정 마취로 수술 중 불편함을 최소화합니다.\n무서움 없이, 깨어나면 끝나는\n편안한 임플란트 수술을 경험하세요.',
  },
  {
    title: '장기적 안정성',
    description: '뼈와 완전히 융합되는 반영구 솔루션입니다.\n정기 검진과 올바른 관리로\n평생 함께하는 치아를 만듭니다.',
  },
]

export default function ImplantIdentity() {
  return (
    <BoardIdentityLayout
      label="IMPLANT SOLUTION"
      title={<>상실된 치아,<br /><span className="text-[#0080C8]">가장 자연스럽게 복원합니다</span></>}
      description={<>임플란트는 단순히 치아를 채우는 것이 아닙니다.<br />뼈와 하나가 되어 평생 함께할 수 있도록,<br />이건치과는 처음부터 끝까지 정확하게 접근합니다.</>}
      pillars={pillars}
    />
  )
}
