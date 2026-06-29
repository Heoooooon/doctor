import BoardIdentityLayout from './BoardIdentityLayout'

const pillars = [
  {
    title: '최소삭제 원칙',
    description: '건강한 치아는 단 1mm도 삭제하지 않습니다.\n크라운 대신 온레이, 필링 대신 레진으로\n치아 원형을 최대한 보존합니다.',
  },
  {
    title: '신경보존 치료',
    description: 'VPT(치수보존술)로 신경을 살려\n발치와 신경치료를 최대한 늦춥니다.\n살릴 수 있는 신경은 끝까지 지킵니다.',
  },
  {
    title: '장기적 관점',
    description: '빠른 치료보다 오래 가는 치료를 목표로 합니다.\n치료 후 10년, 20년을 내다보는\n이건치과의 보존 중심 진료 철학입니다.',
  },
]

export default function NaturalToothIdentity() {
  return (
    <BoardIdentityLayout
      label="NATURAL TOOTH CARE"
      title={<>내 치아를 최대한 살리는<br /><span className="text-[#0080C8]">이건치과의 원칙</span></>}
      description={<>치아는 한 번 삭제하면 되돌릴 수 없습니다.<br />처음 치료 방향이 평생을 결정짓기에,<br />저희는 "어디까지 살릴 수 있는지"를 먼저 고민합니다.</>}
      pillars={pillars}
    />
  )
}
