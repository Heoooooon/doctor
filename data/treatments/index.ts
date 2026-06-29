import type { TreatmentContent } from '@/types/treatment'

export { naturalToothTreatments } from './natural-tooth'
export { implantTreatments } from './implant'
export { cosmeticTreatments } from './cosmetic'
export { orthodonticsTreatments } from './orthodontics'
export { pediatricTreatments } from './pediatric'

import { naturalToothTreatments } from './natural-tooth'
import { implantTreatments } from './implant'
import { cosmeticTreatments } from './cosmetic'
import { orthodonticsTreatments } from './orthodontics'
import { pediatricTreatments } from './pediatric'

export const allTreatments: TreatmentContent[] = [
  ...naturalToothTreatments,
  ...implantTreatments,
  ...cosmeticTreatments,
  ...orthodonticsTreatments,
  ...pediatricTreatments,
]

export function getTreatmentsByCategory(
  category: string,
): TreatmentContent[] {
  return allTreatments.filter((t) => t.boardCategory === category)
}

export function getTreatmentByType(
  treatmentType: string,
): TreatmentContent | undefined {
  return allTreatments.find((t) => t.treatmentType === treatmentType)
}
