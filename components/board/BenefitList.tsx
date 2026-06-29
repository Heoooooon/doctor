// @TASK Board - 치료 장점 체크리스트
import { CheckCircle2 } from 'lucide-react'

interface BenefitListProps {
  benefits: string[]
}

export default function BenefitList({ benefits }: BenefitListProps) {
  return (
    <div className="bg-[#F8F7F9] rounded-2xl p-6 sm:p-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-5">
        이런 점이 도움이 됩니다
      </h3>
      <ul className="space-y-3" role="list">
        {benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2
              className="shrink-0 mt-0.5 text-[#0080C8]"
              size={20}
              aria-hidden="true"
            />
            <span className="text-gray-700 text-base sm:text-[18px] leading-relaxed">
              {benefit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
