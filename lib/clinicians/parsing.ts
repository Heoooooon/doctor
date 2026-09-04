export type ParseResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string }

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function requiredString(
  record: Readonly<Record<string, unknown>>,
  key: string,
  error: string,
): ParseResult<string> {
  const value = record[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ok: false, error }
  }
  return { ok: true, value: value.trim() }
}

export function optionalString(
  record: Readonly<Record<string, unknown>>,
  key: string,
): string | null {
  const value = record[key]
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

export function stringList(value: unknown): ParseResult<readonly string[]> {
  if (!Array.isArray(value)) {
    return { ok: false, error: '목록 데이터 형식이 올바르지 않습니다.' }
  }
  const items: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') {
      return { ok: false, error: '목록 데이터 형식이 올바르지 않습니다.' }
    }
    const trimmed = item.trim()
    if (trimmed.length > 0) items.push(trimmed)
  }
  return { ok: true, value: items }
}

export function optionalNumber(value: unknown): ParseResult<number | null> {
  if (value === null || value === undefined || value === '') {
    return { ok: true, value: null }
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { ok: false, error: '이미지 위치 값이 올바르지 않습니다.' }
  }
  return { ok: true, value }
}

export function profileImageFit(
  value: unknown,
): ParseResult<'cover' | 'contain-natural-ratio' | null> {
  if (value === null || value === undefined || value === '') {
    return { ok: true, value: null }
  }
  if (value === 'cover' || value === 'contain-natural-ratio') {
    return { ok: true, value }
  }
  return { ok: false, error: '프로필 이미지 맞춤 방식이 올바르지 않습니다.' }
}
