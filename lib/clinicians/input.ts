import {
  isRecord,
  optionalNumber,
  optionalString,
  profileImageFit,
  requiredString,
  stringList,
  type ParseResult,
} from './parsing.ts'

export type ClinicianInput = {
  readonly name: string
  readonly role: string
  readonly title: string | null
  readonly specialty: string
  readonly subRole: string
  readonly specialtyDetail: string
  readonly image: string
  readonly careers: readonly string[]
  readonly memberships: readonly string[]
  readonly letter: string | null
  readonly teamCardZoom: number | null
  readonly teamCardShiftYPercent: number | null
  readonly profileImageFit: 'cover' | 'contain-natural-ratio' | null
  readonly sortOrder: number
  readonly isActive: boolean
}

export function parseClinicianInput(value: unknown): ParseResult<ClinicianInput> {
  if (!isRecord(value)) {
    return { ok: false, error: '요청 형식이 올바르지 않습니다.' }
  }
  const name = requiredString(value, 'name', '의료진 이름을 입력해 주세요.')
  if (!name.ok) return name
  const role = requiredString(value, 'role', '직책을 입력해 주세요.')
  if (!role.ok) return role
  const specialty = requiredString(
    value,
    'specialty',
    '진료 분야를 입력해 주세요.',
  )
  if (!specialty.ok) return specialty
  const image = requiredString(
    value,
    'image',
    '프로필 이미지를 등록해 주세요.',
  )
  if (!image.ok) return image
  const careers = stringList(value.careers)
  if (!careers.ok) return careers
  const memberships = stringList(value.memberships)
  if (!memberships.ok) return memberships
  const zoom = optionalNumber(value.teamCardZoom)
  if (!zoom.ok) return zoom
  const shift = optionalNumber(value.teamCardShiftYPercent)
  if (!shift.ok) return shift
  const fit = profileImageFit(value.profileImageFit)
  if (!fit.ok) return fit
  if (typeof value.sortOrder !== 'number' || !Number.isInteger(value.sortOrder)) {
    return { ok: false, error: '노출 순서를 숫자로 입력해 주세요.' }
  }
  if (typeof value.isActive !== 'boolean') {
    return { ok: false, error: '공개 상태가 올바르지 않습니다.' }
  }

  return {
    ok: true,
    value: {
      name: name.value,
      role: role.value,
      title: optionalString(value, 'title'),
      specialty: specialty.value,
      subRole: optionalString(value, 'subRole') ?? specialty.value,
      specialtyDetail:
        optionalString(value, 'specialtyDetail') ?? specialty.value,
      image: image.value,
      careers: careers.value,
      memberships: memberships.value,
      letter: optionalString(value, 'letter'),
      teamCardZoom: zoom.value,
      teamCardShiftYPercent: shift.value,
      profileImageFit: fit.value,
      sortOrder: value.sortOrder,
      isActive: value.isActive,
    },
  }
}

export function clinicianInputToDatabaseValues(input: ClinicianInput) {
  return {
    name: input.name,
    role: input.role,
    title: input.title,
    specialty: input.specialty,
    sub_role: input.subRole,
    specialty_detail: input.specialtyDetail,
    image_url: input.image,
    careers: input.careers,
    memberships: input.memberships,
    letter: input.letter,
    team_card_zoom: input.teamCardZoom,
    team_card_shift_y_percent: input.teamCardShiftYPercent,
    profile_image_fit: input.profileImageFit,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  }
}
