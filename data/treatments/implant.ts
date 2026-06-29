import type { TreatmentContent } from '@/types/treatment'

export const implantTreatments: TreatmentContent[] = [
  {
    boardCategory: 'implant',
    treatmentType: 'all-on',
    title: '올온 임플란트',
    subtitle: '여러 치아를 잃은 경우, 전체 기능 회복을 함께 고민합니다',
    image: '/images/treatments/implant/all-on (1).jpg',
    sideImage: '/images/allon/all-on-slide.jpg',
    description: '4~6개의 임플란트로 위 또는 아래 전체 치아를 한 번에 완성하는 치료',
    richContent: `### ❓ 기존 틀니와 뭐가 다른가요?

일반 틀니는 매일 빼고 끼워야 하며, 씹는 힘이 자연치아의 **30%에 불과**합니다.

올온 임플란트는 **4~6개의 임플란트**로 전체 치아를 고정식으로 완성해, 틀니 없이 자연치아처럼 사용할 수 있습니다.`,
    indications: [
      '치아가 대부분 없거나 발치가 필요한 분',
      '틀니가 불편하고 잘 맞지 않는 분',
      '씹는 기능이 떨어져 일상생활이 불편한 분',
      '한 번에 전체 치아를 해결하고 싶은 분',
    ],
    steps: [
      { title: '정밀 진단 & 계획', desc: 'CT와 구강 스캔으로 뼈 상태, 신경 위치를 분석하고 임플란트 위치를 디지털로 설계합니다.', icon: 'ScanLine' },
      { title: '임플란트 식립', desc: '계획된 위치에 4~6개의 임플란트를 정밀하게 심습니다. 상태에 따라 당일 임시치아 연결도 가능합니다.', icon: 'Zap' },
      { title: '치유 및 골유착', desc: '임플란트와 뼈가 결합하는 기간 동안 임시 보철로 일상생활을 유지합니다.', icon: 'Shield' },
      { title: '최종 보철 완성', desc: '골유착 확인 후 맞춤 제작된 고정식 보철로 교체합니다.', icon: 'Link' },
      { title: '정기 관리', desc: '주기적 점검으로 임플란트와 보철의 장기 안정성을 관리합니다.', icon: 'CalendarDays' },
    ],
    benefitsTitle: '올온 임플란트의 장점',
    benefits: [
      { tag: '소수 임플란트로 전체 치아 기능 회복', description: '소수의 임플란트로 전체 치아 기능 회복을 계획할 수 있습니다.', icon: 'BadgeCheck' },
      { tag: '틀니 불편함에서 벗어나기', description: '틀니 사용에 따른 불편함을 줄이는 데 도움이 될 수 있습니다.', icon: 'Smile' },
      { tag: '뼈 이식 최소화 가능', description: '뼈 이식 없이도 식립이 가능한 경우가 있어 수술 부담을 줄일 수 있습니다.', icon: 'Shield' },
      { tag: '안정적인 씹는 기능 회복', description: '보철 구조를 함께 설계하여 안정적인 씹는 기능 회복을 기대할 수 있습니다.', icon: 'Sparkles' },
      { tag: '개인 맞춤 치료 계획', description: '환자 상태에 맞춰 치료 계획을 개별적으로 수립할 수 있습니다.', icon: 'ClipboardCheck' },
    ],
    comparison: {
      leftLabel: '일반 틀니',
      rightLabel: '올온 임플란트',
      rows: [
        { label: '착용 방식', icon: 'BadgeCheck', leftText: '매일 빼고 끼움', rightText: '고정식 (빼지 않음)' },
        { label: '씹는 힘', icon: 'Utensils', leftText: '자연치아의 약 30%', rightText: '자연치아의 70~80% 회복 가능' },
        { label: '불편함', icon: 'Clock', leftText: '이물감, 헐거움, 잇몸 통증', rightText: '이물감 적고, 안정적' },
        { label: '심미성', icon: 'Smile', leftText: '잇몸 노출, 부자연스러움', rightText: '자연치아와 유사한 심미성' },
        { label: '관리', icon: 'Tooth', leftText: '세정 필요, 관리 번거로움', rightText: '일반 치아처럼 관리 가능' },
      ],
    },
    bottomCta: '적은 부담으로 전체 치아의 기능과 자신감을 되찾아 드립니다.',
    faq: [
      {
        question: '치아가 거의 없으면 모두 많은 개수의 임플란트가 필요한가요?',
        answer:
          '반드시 그렇지는 않습니다. 잔존 뼈 상태와 교합 조건에 따라 소수의 임플란트로 전체 보철을 지지하는 방식을 고려할 수 있습니다.',
      },
      {
        question: '틀니를 사용 중인데도 가능할까요?',
        answer:
          '현재 틀니를 사용 중이더라도 구강 상태를 평가한 뒤 임플란트 전환을 고려할 수 있습니다. 뼈 상태와 전신 건강을 함께 확인합니다.',
      },
      {
        question: '수술 후 바로 치아를 사용할 수 있나요?',
        answer:
          '상태에 따라 수술 당일 임시 보철을 연결할 수 있는 경우도 있지만, 최종 보철까지는 일정 기간의 치유 과정이 필요합니다.',
      },
    ],
  },
  {
    boardCategory: 'implant',
    treatmentType: 'immediate-loading',
    title: '즉시로딩 임플란트',
    subtitle: '임플란트 식립 당일, 임시치아까지 연결해 일상 공백을 줄입니다',
    image: '/images/treatments/implant/immediate_2.webp',
    beforeImage: '/images/treatments/implant/immediate-before.jpg',
    afterImage: '/images/treatments/implant/immediate_2.jpg',
    description: '치아 없는 기간을 최소화하기 위해, 임플란트 식립 당일 임시치아 연결까지 함께 계획하는 치료',
    richContent: `### ❓ 일반 임플란트와 뭐가 다른가요?

일반 임플란트는 뼈와 결합하는 동안 **3~6개월을 기다려야** 합니다.

즉시로딩은 식립 당일 바로 임시치아를 연결해, **치아 없는 기간 없이** 일상으로 복귀할 수 있습니다.`,
    indications: [
      '빠진 치아로 당장 일상생활이 불편한 분',
      '치료 기간을 최대한 줄이고 싶은 분',
      '중요한 일정이 있어 긴 공백이 어려운 분',
      '뼈 상태와 초기 고정력이 충분한 분',
    ],
    steps: [
      { title: '정밀 진단 & 적합성 평가', desc: 'CT와 구강 스캔으로 뼈 밀도, 초기 고정력 등 즉시로딩 가능 여부를 엄격히 평가합니다.', icon: 'ScanLine' },
      { title: '임플란트 식립', desc: '계획된 위치에 임플란트를 정밀하게 심습니다.', icon: 'Zap' },
      { title: '당일 임시치아 연결', desc: '초기 고정력 확인 후 수술 당일 임시치아를 바로 연결합니다.', icon: 'Link' },
      { title: '치유 및 골유착', desc: '임플란트와 뼈가 결합하는 동안 임시치아로 일상을 유지합니다.', icon: 'Shield' },
      { title: '최종 보철 완성', desc: '골유착 확인 후 맞춤 제작된 최종 보철로 교체합니다.', icon: 'CalendarDays' },
    ],
    benefitsTitle: '즉시로딩 임플란트의 장점',
    benefits: [
      { tag: '당일 임시치아 연결', description: '식립 당일 임시치아를 연결해 심미적·기능적 공백을 줄일 수 있습니다.', icon: 'Zap' },
      { tag: '치아 없는 기간 최소화', description: '치아가 없는 불편한 기간을 줄여 일상 복귀를 빠르게 계획할 수 있습니다.', icon: 'Smile' },
      { tag: '전체 치료 기간 단축', description: '적절한 증례에서는 최종 보철까지의 전체 흐름을 효율적으로 줄일 수 있습니다.', icon: 'Clock' },
      { tag: '초기 고정력 정밀 평가', description: '뼈 밀도와 초기 고정력을 확인해 가능한 경우에만 적용합니다.', icon: 'Shield' },
      { tag: '중요 일정 전 심미 회복', description: '긴 치아 공백이 부담되는 분께 심미적인 회복 계획을 세울 수 있습니다.', icon: 'BadgeCheck' },
    ],
    comparison: {
      leftLabel: '일반 임플란트',
      rightLabel: '즉시로딩 임플란트',
      rows: [
        { label: '임시치아', icon: 'Link', leftText: '골유착 후 연결', rightText: '식립 당일 연결 가능' },
        { label: '치아 공백', icon: 'Smile', leftText: '수개월간 불편 가능', rightText: '공백 기간 최소화' },
        { label: '식사', icon: 'Utensils', leftText: '초기 식사 제한', rightText: '부드러운 음식부터 가능' },
        { label: '치료 기간', icon: 'Clock', leftText: '최종 보철까지 3~6개월', rightText: '전체 기간 단축 가능' },
        { label: '적용 조건', icon: 'Shield', leftText: '일반적인 증례에 적용', rightText: '초기 고정력 충분할 때 적용' },
      ],
    },
    bottomCta: '치아 없는 시간을 줄이고, 당일의 불편을 다음 일상으로 이어가지 않도록 함께합니다.',
    faq: [
      {
        question: '즉시로딩은 누구나 가능한가요?',
        answer:
          '모든 경우에 적용되는 것은 아닙니다. 뼈 밀도, 초기 고정력, 교합 상태 등을 종합적으로 평가하여 적용 가능 여부를 판단합니다.',
      },
      {
        question: '당일 연결한 치아로 바로 식사할 수 있나요?',
        answer:
          '당일부터 부드러운 음식 섭취는 가능합니다. 단단한 음식은 최종 보철 장착 후에 드시는 것을 권장합니다.',
      },
      {
        question: '즉시로딩이 일반 임플란트보다 위험한가요?',
        answer:
          '엄격한 적합성 평가를 통과한 분께만 적용하기 때문에, 조건이 맞는다면 안전하게 진행할 수 있습니다. 정밀한 진단과 숙련된 술기가 핵심입니다.',
      },
    ],
  },
  {
    boardCategory: 'implant',
    treatmentType: 'navigation',
    title: '네비게이션 임플란트',
    heroTitle: { line1: '네비게이션', line2: '임플란트' },
    subtitle: '디지털 분석을 바탕으로 계획하는 임플란트 치료',
    image: '/images/treatments/implant/navigation.jpg',
    description:
      '**구강스캔과 CT를 바탕으로 임플란트 위치를 미리 계획**하고 이를 토대로 정밀한 식립을 돕는 치료 방식입니다. 디지털 데이터를 활용해 **뼈 상태, 신경 위치, 보철 방향** 등을 사전에 분석하여 보다 예측 가능한 치료를 계획할 수 있습니다.',
    richContent: `### 💡 한 줄 요약

"3D CT 데이터를 바탕으로 컴퓨터가 최적의 위치를 설계하고, **그대로 정밀하게 식립**하는 첨단 임플란트"

---

### ❓ 왜 더 안전한가요?

턱 안에는 신경과 혈관이 지나고 있습니다. 네비게이션 임플란트는 수술 전 **3D로 완벽하게 시뮬레이션**해 신경 손상 위험을 최소화하고, 계획한 위치 그대로 **오차 없이** 심습니다.

---

`,
    benefits: [
      { tag: '디지털 분석으로 사전 위치 계획', description: '사전 디지털 분석을 통해 식립 위치를 미리 계획할 수 있습니다.' },
      { tag: '신경·혈관 위치 사전 파악', description: '신경, 혈관 등 주요 구조물과의 관계를 사전에 파악하는 데 도움이 됩니다.' },
      { tag: '가이드 활용 정밀 식립', description: '가이드를 활용하여 계획대로 식립하는 데 도움이 됩니다.' },
      { tag: '절개 최소화로 빠른 회복', description: '절개 범위를 줄여 회복 과정에 도움이 될 수 있습니다.' },
      { tag: '보철까지 고려한 통합 계획', description: '보철 방향까지 고려한 통합적인 치료 계획이 가능합니다.' },
    ],
    faq: [
      {
        question: '네비게이션 임플란트는 일반 임플란트와 어떻게 다른가요?',
        answer:
          '디지털 데이터를 기반으로 식립 위치를 미리 계획하고 가이드를 활용한다는 점에서 차이가 있습니다. 보다 예측 가능한 치료를 돕는 방식입니다.',
      },
      {
        question: '모든 임플란트에 네비게이션을 적용하나요?',
        answer:
          '증례의 복잡도와 해부학적 조건에 따라 적용 여부를 판단합니다. 필요한 경우 디지털 가이드를 활용하여 정밀도를 높입니다.',
      },
      {
        question: '치료 기간이 더 오래 걸리나요?',
        answer:
          '사전 분석과 가이드 제작 과정이 추가되지만, 수술 자체는 보다 효율적으로 진행될 수 있습니다. 전체 치료 기간은 증례에 따라 다릅니다.',
      },
    ],
  },
  {
    boardCategory: 'implant',
    treatmentType: 'sinus-lift',
    title: '상악동 거상술',
    heroTitle: { line2: '상악동 거상술' },
    subtitle:
      '위 어금니 뼈가 부족한 경우, 임플란트를 위한 기반을 함께 만듭니다',
    videoUrl: 'https://youtu.be/RmQSCxLQpKA',
    description:
      '위 어금니 부위의 **뼈 높이가 부족한 경우** 상악동 공간을 조절하여 임플란트 식립을 위한 기반을 마련하는 치료입니다. **상악동 막을 조심스럽게 거상한 뒤 뼈 이식재를 적용**하여 충분한 뼈 높이를 확보하고, 이후 임플란트 식립을 진행합니다.',
    richContent: `### 💡 한 줄 요약

"위턱 어금니 쪽 뼈가 부족할 때, 공간을 확보해 뼈를 이식하고 **임플란트를 심을 수 있게 만드는** 치료"

### ⚠️ 이런 분께 특히 필요합니다

- 위 어금니 임플란트에서 "**뼈가 부족하다**"는 말을 들은 분
- 치아가 **빠진 지 오래된** 분
- 다른 병원에서 **임플란트가 어렵다고** 한 분`,
    benefits: [
      { tag: '뼈 부족해도 임플란트 가능', description: '뼈가 부족한 경우에도 임플란트 치료를 고려할 수 있습니다.' },
      { tag: '상악동 공간으로 뼈 높이 확보', description: '상악동 공간을 활용하여 뼈 높이를 확보하는 데 도움이 됩니다.' },
      { tag: '장기 안정성을 위한 기반 확보', description: '임플란트의 장기적 안정성을 높이는 기반을 마련할 수 있습니다.' },
      { tag: '식립과 동시 진행 가능한 경우도', description: '증례에 따라 임플란트 식립과 동시에 진행할 수 있습니다.' },
      { tag: '정밀 영상 분석으로 안전 계획', description: '정밀한 영상 분석을 통해 안전하게 계획할 수 있습니다.' },
    ],
    faq: [
      {
        question: '상악동 거상술은 위험하지 않나요?',
        answer:
          'CT 등 정밀 영상을 통해 상악동 상태를 사전에 분석하고 안전하게 계획합니다. 숙련된 술자의 경험과 정밀한 진단이 중요합니다.',
      },
      {
        question: '뼈 이식과 임플란트를 동시에 할 수 있나요?',
        answer:
          '잔존 뼈 높이에 따라 동시 진행이 가능한 경우도 있고, 뼈 이식 후 충분한 치유를 거친 뒤 식립하는 경우도 있습니다.',
      },
      {
        question: '치료 후 회복 기간은 얼마나 걸리나요?',
        answer:
          '뼈 이식 범위와 개인의 회복 속도에 따라 다르지만, 일반적으로 수개월의 치유 기간이 필요할 수 있습니다.',
      },
    ],
  },
  {
    boardCategory: 'implant',
    treatmentType: 'diabetes',
    title: '당뇨 환자 임플란트',
    heroTitle: { line1: '당뇨환자', line2: '임플란트' },
    subtitle: '혈당 조절 상태를 함께 살피며 계획하는 임플란트 치료',
    beforeImage: '/images/treatments/implant/impl-before.jpg?v=2',
    afterImage: '/images/treatments/implant/impl-after.jpg',
    description:
      '당뇨가 있는 경우에도 **혈당 조절 상태와 전신 건강을 확인**하면서 임플란트 치료를 계획할 수 있습니다. **당화혈색소 수치, 복용 약물, 상처 치유 경과** 등을 종합적으로 평가하여 **안전한 치료 시기와 방법**을 함께 결정합니다.',
    richContent: `### ❓ 당뇨 환자는 왜 더 신중해야 하나요?

당뇨가 있으면 면역력이 낮아지고 상처 회복이 느려 **감염 위험이 높습니다.** 혈당이 잘 조절되지 않으면 임플란트와 뼈가 제대로 결합하지 못할 수도 있습니다. 하지만 혈당이 **안정적으로 관리되는 상태**라면 철저한 계획 아래 안전하게 진행할 수 있습니다.

### 🦷 당뇨가 있다고 임플란트를 포기할 이유는 없습니다.
철저한 혈당 모니터링과 **체계적인 치료 계획**으로 안전하게 완성합니다.`,
    benefits: [
      { tag: '혈당 조절 확인 후 치료 시기 결정', description: '혈당 조절 상태를 확인한 뒤 안전한 치료 시기를 판단할 수 있습니다.' },
      { tag: '당뇨 상태 맞춤 수술 계획', description: '당뇨 관리 상태에 맞춰 수술 계획을 조절할 수 있습니다.' },
      { tag: '감염 위험 줄이는 사전 준비', description: '감염 위험을 줄이기 위한 사전 준비를 함께 진행합니다.' },
      { tag: '주치의 협의로 통합 관리', description: '주치의와의 협의를 통해 통합적인 관리를 계획할 수 있습니다.' },
      { tag: '회복 과정 혈당 관리 안내', description: '치료 후 회복 과정에서도 혈당 관리를 함께 안내합니다.' },
    ],
    faq: [
      {
        question: '당뇨가 있으면 임플란트를 할 수 없나요?',
        answer:
          '당뇨 자체가 절대적인 금기는 아닙니다. 혈당 조절이 잘 되고 있다면 임플란트 치료를 고려할 수 있으며, 당화혈색소 등을 확인하여 판단합니다.',
      },
      {
        question: '혈당 조절이 완벽해야 하나요?',
        answer:
          '완벽한 조절보다는 안정적인 관리 상태가 중요합니다. 주치의와 협의하여 적절한 치료 시기를 함께 결정합니다.',
      },
      {
        question: '당뇨 환자는 회복이 더 오래 걸리나요?',
        answer:
          '혈당 조절 상태에 따라 회복 속도에 차이가 있을 수 있습니다. 감염 예방과 관리를 함께 진행하여 안전한 회복을 돕습니다.',
      },
    ],
  },
]
