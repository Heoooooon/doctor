import type { Doctor } from '@/data/doctors'
import {
  isRecord,
  optionalNumber,
  optionalString,
  profileImageFit,
  requiredString,
  stringList,
  type ParseResult,
} from './parsing.ts'

export type Clinician = Doctor & {
  readonly sortOrder: number
  readonly isActive: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export type ClinicianLoad =
  | { readonly kind: 'loaded'; readonly clinicians: readonly Clinician[] }
  | { readonly kind: 'failed' }

function parseHighlights(
  value: unknown,
): ParseResult<readonly { readonly icon: string; readonly text: string }[]> {
  if (!Array.isArray(value)) {
    return { ok: false, error: '의료진 강조 정보 형식이 올바르지 않습니다.' }
  }
  const highlights: { readonly icon: string; readonly text: string }[] = []
  for (const item of value) {
    if (!isRecord(item)) {
      return { ok: false, error: '의료진 강조 정보 형식이 올바르지 않습니다.' }
    }
    const icon = requiredString(item, 'icon', '강조 정보 아이콘이 없습니다.')
    if (!icon.ok) return icon
    const text = requiredString(item, 'text', '강조 정보 문구가 없습니다.')
    if (!text.ok) return text
    highlights.push({ icon: icon.value, text: text.value })
  }
  return { ok: true, value: highlights }
}

function parseClinicianRow(value: unknown): ParseResult<Clinician> {
  if (!isRecord(value)) {
    return { ok: false, error: '의료진 데이터 형식이 올바르지 않습니다.' }
  }

  const id = requiredString(value, 'id', '의료진 ID가 없습니다.')
  if (!id.ok) return id
  const name = requiredString(value, 'name', '의료진 이름이 없습니다.')
  if (!name.ok) return name
  const role = requiredString(value, 'role', '직책이 없습니다.')
  if (!role.ok) return role
  const specialty = requiredString(value, 'specialty', '진료 분야가 없습니다.')
  if (!specialty.ok) return specialty
  const image = requiredString(value, 'image_url', '프로필 이미지가 없습니다.')
  if (!image.ok) return image
  const createdAt = requiredString(value, 'created_at', '등록일이 없습니다.')
  if (!createdAt.ok) return createdAt
  const updatedAt = requiredString(value, 'updated_at', '수정일이 없습니다.')
  if (!updatedAt.ok) return updatedAt

  const careers = stringList(value.careers)
  if (!careers.ok) return careers
  const memberships = stringList(value.memberships)
  if (!memberships.ok) return memberships
  const highlights = parseHighlights(value.highlights)
  if (!highlights.ok) return highlights
  const documents = stringList(value.documents)
  if (!documents.ok) return documents
  const zoom = optionalNumber(value.team_card_zoom)
  if (!zoom.ok) return zoom
  const shift = optionalNumber(value.team_card_shift_y_percent)
  if (!shift.ok) return shift
  const fit = profileImageFit(value.profile_image_fit)
  if (!fit.ok) return fit
  if (typeof value.sort_order !== 'number' || !Number.isInteger(value.sort_order)) {
    return { ok: false, error: '노출 순서가 올바르지 않습니다.' }
  }
  if (typeof value.is_active !== 'boolean') {
    return { ok: false, error: '공개 상태가 올바르지 않습니다.' }
  }

  const title = optionalString(value, 'title')
  const subRole = optionalString(value, 'sub_role') ?? specialty.value
  const specialtyDetail =
    optionalString(value, 'specialty_detail') ?? specialty.value
  const letter = optionalString(value, 'letter')
  const presentation = {
    ...(zoom.value === null ? {} : { teamCardZoom: zoom.value }),
    ...(shift.value === null ? {} : { teamCardShiftYPercent: shift.value }),
    ...(fit.value === null ? {} : { profileImageFit: fit.value }),
  }

  return {
    ok: true,
    value: {
      id: id.value,
      name: name.value,
      role: role.value,
      ...(title === null ? {} : { title }),
      specialty: specialty.value,
      subRole,
      specialtyDetail,
      image: image.value,
      careers: [...careers.value],
      ...(memberships.value.length === 0
        ? {}
        : { memberships: [...memberships.value] }),
      ...(highlights.value.length === 0
        ? {}
        : { highlights: [...highlights.value] }),
      ...(letter === null ? {} : { letter }),
      ...(documents.value.length === 0
        ? {}
        : { documents: [...documents.value] }),
      ...(Object.keys(presentation).length === 0 ? {} : { presentation }),
      sortOrder: value.sort_order,
      isActive: value.is_active,
      createdAt: createdAt.value,
      updatedAt: updatedAt.value,
    },
  }
}

export function parseClinicianRows(
  value: unknown,
): ParseResult<readonly Clinician[]> {
  if (!Array.isArray(value)) {
    return { ok: false, error: '의료진 목록 형식이 올바르지 않습니다.' }
  }
  const clinicians: Clinician[] = []
  for (const row of value) {
    const parsed = parseClinicianRow(row)
    if (!parsed.ok) return parsed
    clinicians.push(parsed.value)
  }
  return { ok: true, value: clinicians }
}

export function validateClinicianRows(
  value: unknown,
): ParseResult<readonly unknown[]> {
  if (!Array.isArray(value)) {
    return { ok: false, error: '의료진 목록 형식이 올바르지 않습니다.' }
  }
  const parsed = parseClinicianRows(value)
  return parsed.ok ? { ok: true, value } : parsed
}

export function resolvePublicClinicians(
  load: ClinicianLoad,
  staticFallback: readonly Doctor[],
): readonly Doctor[] {
  return load.kind === 'loaded' ? load.clinicians : staticFallback
}
