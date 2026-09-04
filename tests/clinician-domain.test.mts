import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  parseClinicianRows,
  resolvePublicClinicians,
  validateClinicianRows,
} from '../lib/clinicians/domain.ts'
import { parseClinicianInput } from '../lib/clinicians/input.ts'

const VALID_ROW = {
  id: 'lee-jaesung',
  name: ' 이재성 ',
  role: ' 대표원장 ',
  title: 'DDS, MSD',
  specialty: ' 임플란트 · 심미보철 ',
  sub_role: '임플란트 · 심미보철 전문가',
  specialty_detail: '고난도진료 · 심미보철',
  image_url: '/images/doctors/doctor-lee.png',
  careers: [' 서울대학교 치의학대학원 졸업 ', ''],
  memberships: ['대한 디지털치의학회 정회원'],
  highlights: [{ icon: 'ShieldCheck', text: '정밀한 진단' }],
  letter: '환자의 이야기를 듣겠습니다.',
  documents: ['/images/doctors/license.png'],
  team_card_zoom: 1.68,
  team_card_shift_y_percent: null,
  profile_image_fit: 'cover',
  sort_order: 0,
  is_active: true,
  created_at: '2026-09-03T00:00:00.000Z',
  updated_at: '2026-09-03T00:00:00.000Z',
} as const

const STATIC_FALLBACK = {
  id: 'static-doctor',
  name: '정적 의료진',
  role: '원장',
  specialty: '보존',
  subRole: '보존 진료',
  specialtyDetail: '보존치료',
  image: '/images/doctors/static.png',
  careers: [],
} as const

test('parseClinicianRows maps persisted clinician fields when the row is valid', () => {
  const rows: unknown = [VALID_ROW]

  const result = parseClinicianRows(rows)

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.deepEqual(result.value[0], {
    id: 'lee-jaesung',
    name: '이재성',
    role: '대표원장',
    title: 'DDS, MSD',
    specialty: '임플란트 · 심미보철',
    subRole: '임플란트 · 심미보철 전문가',
    specialtyDetail: '고난도진료 · 심미보철',
    image: '/images/doctors/doctor-lee.png',
    careers: ['서울대학교 치의학대학원 졸업'],
    memberships: ['대한 디지털치의학회 정회원'],
    highlights: [{ icon: 'ShieldCheck', text: '정밀한 진단' }],
    letter: '환자의 이야기를 듣겠습니다.',
    documents: ['/images/doctors/license.png'],
    presentation: {
      teamCardZoom: 1.68,
      profileImageFit: 'cover',
    },
    sortOrder: 0,
    isActive: true,
    createdAt: '2026-09-03T00:00:00.000Z',
    updatedAt: '2026-09-03T00:00:00.000Z',
  })
})

test('validateClinicianRows preserves the raw row for administrator responses', () => {
  const rows: unknown = [VALID_ROW]

  const result = validateClinicianRows(rows)

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.deepEqual(result.value, rows)
})

test('resolvePublicClinicians preserves an empty successful result', () => {
  const result = resolvePublicClinicians(
    { kind: 'loaded', clinicians: [] },
    [STATIC_FALLBACK],
  )

  assert.deepEqual(result, [])
})

test('resolvePublicClinicians uses static data only when loading fails', () => {
  const result = resolvePublicClinicians(
    { kind: 'failed' },
    [STATIC_FALLBACK],
  )

  assert.equal(result.length, 1)
  assert.equal(result[0]?.id, 'static-doctor')
})

test('parseClinicianInput rejects an incomplete administrator submission', () => {
  const body: unknown = {
    name: ' ',
    role: '원장',
    specialty: '보존',
    image: '/images/doctors/new.png',
    careers: [],
    memberships: [],
    sortOrder: 0,
    isActive: true,
  }

  const result = parseClinicianInput(body)

  assert.deepEqual(result, {
    ok: false,
    error: '의료진 이름을 입력해 주세요.',
  })
})

test('public clinician query explicitly excludes inactive rows', async () => {
  const source = await readFile(
    new URL('../lib/clinicians/server.ts', import.meta.url),
    'utf8',
  )

  assert.match(source, /\.eq\('is_active', true\)/)
})
