import type { TreatmentContent } from '@/types/treatment'

export const pediatricTreatments: TreatmentContent[] = [
  {
    boardCategory: 'pediatric',
    treatmentType: 'pediatric-cavity',
    title: '소아충치치료',
    heroTitle: { line2: '소아충치치료' },
    subtitle: '아이의 치아는 빠르게 변할 수 있어 조기 관리가 중요합니다',
    image: '/images/treatments/pediatric/child_treat.png',
    bottomImage: '/images/treatments/pediatric/child-2.png',
    description:
      '유치의 충치는 **성인보다 진행 속도가 빠를 수 있으며,** 영구치 발육과 배열에도 영향을 줄 수 있어 **조기 발견과 관리가 중요합니다.** 아이의 협조도와 치아 상태에 맞춰 치료 방법을 선택하고, **불안감을 줄이면서 안전하게** 치료를 진행합니다.',
    benefits: [
      { tag: '유치 충치 조기 발견·관리', description: '유치 충치의 조기 발견과 관리로 영구치 발육에 도움이 됩니다.' },
      { tag: '아이 협조도에 맞춘 단계적 접근', description: '아이의 협조도에 맞춘 단계적 접근으로 불안감을 줄입니다.' },
      { tag: '진행 빠른 유치 충치 적기 치료', description: '진행 속도가 빠른 유치 충치를 적절한 시기에 치료할 수 있습니다.' },
      { tag: '씹는 기능·발음 발달을 위한 유치 유지', description: '씹는 기능과 발음 발달에 필요한 유치 기능을 유지하는 데 도움이 됩니다.' },
      { tag: '정기 검진으로 구강 건강 습관 형성', description: '정기 검진을 통해 구강 건강 습관을 함께 형성할 수 있습니다.' },
    ],
    faq: [
      {
        question: '유치는 어차피 빠지는데 치료해야 하나요?',
        answer:
          '유치는 영구치가 나올 공간을 유지하고 씹는 기능과 발음에도 중요한 역할을 합니다. 방치하면 영구치 배열이나 발육에 영향을 줄 수 있어 적절한 관리가 필요합니다.',
      },
      {
        question: '아이가 치과를 무서워하는데 어떻게 하나요?',
        answer:
          '아이의 불안감을 줄이기 위해 단계적으로 적응시키는 방법을 사용합니다. 필요한 경우 행동 조절이나 보조적 진정 방법을 함께 고려할 수 있습니다.',
      },
      {
        question: '소아 충치 치료 시 마취는 안전한가요?',
        answer:
          '소아용 국소마취는 일반적으로 안전하게 사용되고 있습니다. 아이의 체중과 상태를 고려하여 적절한 용량을 사용하며, 시술 중 상태를 지속적으로 확인합니다.',
      },
    ],
  },
  {
    boardCategory: 'pediatric',
    treatmentType: 'laughing-gas',
    title: '웃음가스치료',
    heroTitle: { line2: '웃음가스치료' },
    subtitle: '치과를 무서워하는 아이를 위한 보조적 진정 방법',
    image: '/images/treatments/pediatric/kids-2.png',
    description:
      '아산화질소(웃음가스)를 이용해\n**치료 중 아이의 불안과 긴장을 줄여주는** 보조적 진정 방법입니다.\n**의식이 유지된 상태에서** 편안함을 느낄 수 있도록 돕고,\n흡입을 멈추면 **빠르게 회복되어 일상 복귀가 가능합니다.**',
    benefits: [
      { tag: '치과 불안·공포 감소', description: '치과에 대한 불안과 공포심을 줄이는 데 도움이 됩니다.' },
      { tag: '의식 유지하며 진정 효과', description: '의식이 유지된 상태에서 진정 효과를 기대할 수 있습니다.' },
      { tag: '흡입 중단 후 빠른 회복', description: '흡입 중단 후 빠르게 회복되어 일상 복귀가 가능합니다.' },
      { tag: '치료 경험을 긍정적으로', description: '치료 경험을 긍정적으로 만들어 이후 내원에도 도움이 됩니다.' },
      { tag: '치료를 더 원활하게 진행', description: '필요한 치료를 보다 원활하게 진행하는 데 도움이 됩니다.' },
    ],
    faq: [
      {
        question: '웃음가스는 안전한가요?',
        answer:
          '아산화질소는 오래전부터 소아치과에서 사용되어 온 안전한 진정 방법입니다. 산소와 혼합하여 사용하며, 아이의 상태를 지속적으로 관찰하면서 진행합니다.',
      },
      {
        question: '모든 아이에게 사용할 수 있나요?',
        answer:
          '대부분의 아이에게 안전하게 적용할 수 있지만, 비강 호흡이 어렵거나 특정 건강 상태에 따라 사용이 제한될 수 있습니다. 사전 평가를 통해 적용 여부를 판단합니다.',
      },
      {
        question: '웃음가스 사용 후 바로 귀가할 수 있나요?',
        answer:
          '흡입을 중단하면 수분 내에 효과가 사라지므로 특별한 회복 시간 없이 귀가가 가능합니다. 다만 아이의 상태를 확인한 뒤 안내합니다.',
      },
    ],
  },
]
