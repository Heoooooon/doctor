import type { Clinician } from '@/lib/clinicians/domain'

export type ClinicianFormValue = {
  readonly name: string
  readonly role: string
  readonly title: string
  readonly specialty: string
  readonly subRole: string
  readonly specialtyDetail: string
  readonly image: string
  readonly careers: string
  readonly memberships: string
  readonly letter: string
  readonly teamCardZoom: string
  readonly teamCardShiftYPercent: string
  readonly profileImageFit: '' | 'cover' | 'contain-natural-ratio'
  readonly sortOrder: string
  readonly isActive: boolean
}

export function emptyClinicianForm(sortOrder: number): ClinicianFormValue {
  return {
    name: '',
    role: '원장',
    title: '',
    specialty: '',
    subRole: '',
    specialtyDetail: '',
    image: '',
    careers: '',
    memberships: '',
    letter: '',
    teamCardZoom: '1',
    teamCardShiftYPercent: '',
    profileImageFit: '',
    sortOrder: String(sortOrder),
    isActive: true,
  }
}

export function clinicianToForm(clinician: Clinician): ClinicianFormValue {
  return {
    name: clinician.name,
    role: clinician.role,
    title: clinician.title ?? '',
    specialty: clinician.specialty ?? '',
    subRole: clinician.subRole ?? '',
    specialtyDetail: clinician.specialtyDetail ?? '',
    image: clinician.image,
    careers: clinician.careers.join('\n'),
    memberships: clinician.memberships?.join('\n') ?? '',
    letter: clinician.letter ?? '',
    teamCardZoom: String(clinician.presentation?.teamCardZoom ?? 1),
    teamCardShiftYPercent:
      clinician.presentation?.teamCardShiftYPercent === undefined
        ? ''
        : String(clinician.presentation.teamCardShiftYPercent),
    profileImageFit: clinician.presentation?.profileImageFit ?? '',
    sortOrder: String(clinician.sortOrder),
    isActive: clinician.isActive,
  }
}

export function formToPayload(form: ClinicianFormValue) {
  const nullableNumber = (value: string): number | null => {
    const trimmed = value.trim()
    return trimmed.length === 0 ? null : Number(trimmed)
  }
  return {
    name: form.name,
    role: form.role,
    title: form.title,
    specialty: form.specialty,
    subRole: form.subRole,
    specialtyDetail: form.specialtyDetail,
    image: form.image,
    careers: form.careers.split('\n'),
    memberships: form.memberships.split('\n'),
    letter: form.letter,
    teamCardZoom: nullableNumber(form.teamCardZoom),
    teamCardShiftYPercent: nullableNumber(form.teamCardShiftYPercent),
    profileImageFit: form.profileImageFit,
    sortOrder: Number(form.sortOrder),
    isActive: form.isActive,
  }
}
